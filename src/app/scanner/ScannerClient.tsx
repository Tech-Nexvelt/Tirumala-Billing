'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CameraService } from '@/services/cameraService'
import { CodeScannerService } from '@/services/codeScannerService'
import { ProductCodeService } from '@/services/productCodeService'
import { FeedbackService } from '@/services/feedbackService'
import { PairingService } from '@/services/pairingService'
import { useAutoReconnect } from '@/hooks/useAutoReconnect'
import type { ScannerState } from '@/types/scanner'
import { toast } from 'sonner'

const cameraService = new CameraService()
const codeScannerService = new CodeScannerService()
const productCodeService = new ProductCodeService()

interface OutboxItem {
  seqId: string
  sku: string
  timestamp: number
  status: 'sending' | 'synced' | 'failed'
  attempts: number
}

export default function ProductScannerClient() {
  const supabase = createClient()
  const { state: autoState, device, isPaired, resetPairing } = useAutoReconnect()

  const [scannerState, setScannerState] = useState<ScannerState>('INITIALIZING')
  const [isDesktopOnline, setIsDesktopOnline] = useState(false)
  const [torchActive, setTorchActive] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [lastScannedSku, setLastScannedSku] = useState<string>('')
  const [lastScanTime, setLastScanTime] = useState<string>('')
  const [outbox, setOutbox] = useState<OutboxItem[]>([])
  const [scanFlash, setScanFlash] = useState(false)
  const [isPairing, setIsPairing] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const channelRef = useRef<any>(null)

  const storeId = device?.store_id

  // Auto-detect URL parameter pairing e.g. /scanner?pair=9n3pfj6iqv8i2rpm
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const pairCode = params.get('pair')
    if (pairCode) {
      handlePairingCodeScanned(pairCode)
    }
  }, [])

  // Supabase Realtime Channel & Presence Sync
  useEffect(() => {
    if (!storeId) return

    console.log(`[Phone Scanner] Subscribing to store_scans:${storeId}`)

    const channel = supabase.channel(`store_scans:${storeId}`, {
      config: { broadcast: { self: true, ack: true } }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const desktopPresent = Object.values(state).some((users: any) =>
          users.some((u: any) => u.device === 'desktop')
        )
        setIsDesktopOnline(desktopPresent)
      })
      .on('broadcast', { event: 'ack' }, (payload: any) => {
        const { seqId, event_id, status } = payload?.payload || {}
        const targetId = seqId || event_id
        if (!targetId) return

        console.log(`[Phone Scanner] ACK Received for seqId: "${targetId}", status: "${status}"`)

        setOutbox(prev =>
          prev.map(item => {
            if (item.seqId === targetId) {
              const newStatus = status === 'not_found' ? 'failed' : 'synced'
              if (newStatus === 'synced' && item.status !== 'synced') {
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  navigator.vibrate?.([50, 50, 50])
                }
              }
              return { ...item, status: newStatus }
            }
            return item
          })
        )
      })
      .on('broadcast', { event: 'scanner_revoked' }, (payload: any) => {
        if (payload.payload?.deviceId === device?.id) {
          toast.error('This mobile scanner was revoked by Desktop POS')
          resetPairing()
        }
      })
      .subscribe(async (status) => {
        console.log(`[Phone Scanner Channel Status] store_scans:${storeId} -> ${status}`)
        if (status === 'SUBSCRIBED') {
          await channel.track({
            device: 'phone',
            deviceId: device?.id,
            online_at: new Date().toISOString(),
          })
          setScannerState('READY')
        }
      })

    channelRef.current = channel
    return () => {
      channel.unsubscribe()
    }
  }, [storeId, device?.id, resetPairing, supabase])

  // Camera & Code Scanning Loop
  useEffect(() => {
    if (!videoRef.current || autoState === 'INITIALIZING' || autoState === 'VALIDATING') return
    let active = true

    const startScanner = async () => {
      try {
        setScannerState('SCANNING')
        await cameraService.startStream(videoRef.current!, facingMode)
        if (!active) return

        await codeScannerService.start(
          videoRef.current!,
          (code) => {
            handleAnyCodeScanned(code)
          },
          (err) => {
            console.error('[Product Scanner] Decoder failure:', err)
            setScannerState('ERROR')
          }
        )
      } catch (err: any) {
        console.error('[Product Scanner] Camera launch failed:', err)
        setScannerState('ERROR')
        toast.error('Camera lock or permission error')
      }
    }

    startScanner()

    const handleVisibility = () => {
      if (document.hidden) {
        cameraService.stopStream()
        codeScannerService.stop()
      } else {
        startScanner()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      active = false
      document.removeEventListener('visibilitychange', handleVisibility)
      cameraService.stopStream()
      codeScannerService.stop()
      productCodeService.reset()
    }
  }, [autoState, facingMode])

  // Broadcast helper to transmit scan payload to Desktop POS
  const transmitScanPayload = useCallback(async (item: OutboxItem) => {
    if (!channelRef.current || !storeId) return

    const payload = {
      event_id: item.seqId,
      seqId: item.seqId,
      store_id: storeId,
      counter_id: device?.counter_id || null,
      scanner_id: device?.id || null,
      product_code: item.sku,
      barcode: item.sku,
      sku: item.sku,
      timestamp: item.timestamp,
    }

    try {
      console.log(`[Phone Scanner Transmit] Sending payload for SKU: "${item.sku}" (seqId: ${item.seqId})`)
      const res = await channelRef.current.send({
        type: 'broadcast',
        event: 'new_scan',
        payload,
      })
      console.log(`[Phone Scanner Transmit] Broadcast send result:`, res)
    } catch (err) {
      console.error(`[Phone Scanner Transmit Error] Failed to broadcast:`, err)
    }
  }, [storeId, device?.counter_id, device?.id])

  // Auto-Retry Engine for Outbox items pending ACK
  useEffect(() => {
    if (!isPaired) return

    const timer = setInterval(() => {
      setOutbox(prev => {
        const pending = prev.filter(i => i.status === 'sending' && i.attempts < 10)
        pending.forEach(item => {
          console.log(`[Phone Outbox Retry] Re-transmitting seqId: "${item.seqId}" (Attempt #${item.attempts + 1})`)
          transmitScanPayload(item)
        })
        if (pending.length === 0) return prev
        return prev.map(item =>
          item.status === 'sending' && item.attempts < 10
            ? { ...item, attempts: item.attempts + 1 }
            : item
        )
      })
    }, 1500)

    return () => clearInterval(timer)
  }, [isPaired, transmitScanPayload])

  // Smart Auto-Detector for Desktop Pairing QR vs Product Code QR
  const handleAnyCodeScanned = (rawCode: string) => {
    const isPairingQR =
      rawCode.includes('pair=') ||
      rawCode.includes('pairingCode') ||
      rawCode.includes('pairingId') ||
      (rawCode.startsWith('{') && rawCode.includes('"v"'))

    if (isPairingQR || !isPaired) {
      if (isPairingQR) {
        handlePairingCodeScanned(rawCode)
      } else if (!isPaired) {
        toast.error('Please scan Desktop Pairing QR code first')
      }
    } else {
      if (productCodeService.shouldProcess(rawCode)) {
        handleProductCodeScanned(rawCode)
      }
    }
  }

  // Process Desktop Pairing QR Code
  const handlePairingCodeScanned = async (rawCode: string) => {
    if (isPairing) return
    setIsPairing(true)

    try {
      let pairingCode = rawCode
      if (rawCode.includes('pair=')) {
        try {
          const url = new URL(rawCode)
          pairingCode = url.searchParams.get('pair') || rawCode
        } catch {
          const match = rawCode.match(/pair=([^&]+)/)
          if (match) pairingCode = match[1]
        }
      } else if (rawCode.startsWith('{')) {
        const parsed = JSON.parse(rawCode)
        pairingCode = parsed.pairingCode || parsed.pairingId || rawCode
      }

      toast.loading('Pairing with Desktop POS...')
      const { device: pairedDev } = await PairingService.pairDeviceWithCode(pairingCode, 'Cashier Phone')

      FeedbackService.triggerSuccess()
      toast.dismiss()
      toast.success(`Paired successfully with ${pairedDev.device_name}!`)

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname)
      }

      setTimeout(() => {
        window.location.reload()
      }, 600)
    } catch (err: any) {
      FeedbackService.triggerError()
      toast.dismiss()
      toast.error(err.message || 'Pairing failed. Scan a fresh Desktop QR.')
      setTimeout(() => setIsPairing(false), 2000)
    }
  }

  // Process Scanned Product QR / SKU
  const handleProductCodeScanned = (rawCode: string) => {
    const sku = productCodeService.normalize(rawCode)
    if (!sku) return

    setScannerState('PROCESSING')
    FeedbackService.triggerSuccess()

    setScanFlash(true)
    setTimeout(() => setScanFlash(false), 250)

    const seqId = Math.random().toString(36).substring(2, 11)
    const now = Date.now()
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    setLastScannedSku(sku)
    setLastScanTime(formattedTime)

    const scanEvent: OutboxItem = {
      seqId,
      sku,
      timestamp: now,
      status: 'sending',
      attempts: 1,
    }

    setOutbox(prev => [scanEvent, ...prev].slice(0, 20))
    transmitScanPayload(scanEvent)

    setTimeout(() => {
      setScannerState('READY')
    }, 300)
  }

  const handleToggleTorch = async () => {
    const next = !torchActive
    const ok = await cameraService.toggleTorch(next)
    if (ok) setTorchActive(next)
    else toast.error('Torch unavailable')
  }

  const handleSwitchCamera = async () => {
    if (!videoRef.current) return
    const nextFacing = await cameraService.switchCamera(videoRef.current)
    setFacingMode(nextFacing)
    setTorchActive(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-8">
      <Toaster position="top-center" richColors />

      {/* TOP HEADER STATUS */}
      <header className="p-3 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isPaired ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <h1 className="text-xs font-bold tracking-tight">
            {isPaired ? `📱 ${device?.device_name || 'Mobile Scanner'}` : 'Pair Mobile Scanner'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
              isPaired
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
            }`}
          >
            {isPaired ? '● Connected' : 'Unpaired'}
          </span>
        </div>
      </header>

      {/* VIEWFINDER CAMERA */}
      <div className="p-3 flex-1 flex flex-col items-center justify-center">
        <div
          className={`relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden border-2 shadow-2xl transition-all duration-150 ${
            scanFlash
              ? 'border-cyan-400 shadow-cyan-500/50 scale-[1.02]'
              : isPaired
              ? 'border-cyan-500/40 shadow-slate-900/80'
              : 'border-amber-500/60 shadow-amber-950/50'
          }`}
          style={{ background: '#000' }}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Viewfinder Target Framing */}
          <div className="absolute inset-0 border-[32px] border-slate-950/60 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-cyan-400/80 rounded-2xl relative shadow-inner">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-400 -mt-1 -ml-1 rounded-tl" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-400 -mt-1 -mr-1 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-400 -mb-1 -ml-1 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-400 -mb-1 -mr-1 rounded-br" />

              {/* Scanning laser animation */}
              {scannerState === 'SCANNING' && (
                <div className="w-full h-0.5 bg-cyan-400 shadow-[0_0_12px_#00D9D9] animate-scan-laser absolute top-1/2" />
              )}
            </div>
          </div>

          {/* Status Label Banner */}
          <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 bg-slate-950/80 border border-slate-700/80 rounded-full text-cyan-300 backdrop-blur">
              {!isPaired ? 'SCAN DESKTOP PAIRING QR' : scannerState === 'PROCESSING' ? 'Processing...' : 'POINT AT PRODUCT QR'}
            </span>
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center gap-2">
            <button
              onClick={handleSwitchCamera}
              className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold rounded-xl border border-slate-700 text-slate-200 backdrop-blur active:scale-95 transition-transform"
            >
              🔄 Flip Camera
            </button>

            <button
              onClick={handleToggleTorch}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border backdrop-blur active:scale-95 transition-transform ${
                torchActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {torchActive ? '💡 Flash On' : '🔦 Flash Off'}
            </button>
          </div>
        </div>
      </div>

      {/* UNPAIRED BANNER */}
      {!isPaired && (
        <div className="mx-3 mb-3 p-3 bg-amber-950/60 border border-amber-500/40 rounded-2xl text-center space-y-1">
          <p className="text-xs font-bold text-amber-300">⚡ Scanner Unpaired</p>
          <p className="text-[10.5px] text-amber-200/80">
            Scan the Desktop Pairing QR with your phone camera or point this scanner at it!
          </p>
        </div>
      )}

      {/* LAST SCANNED ITEM CARD */}
      {lastScannedSku && isPaired && (() => {
        const lastItem = outbox[0]
        const isSynced = lastItem?.status === 'synced'
        const isFailed = lastItem?.status === 'failed'

        return (
          <div
            className={`mx-3 mb-3 p-3 rounded-xl flex items-center justify-between transition-all border ${
              isSynced
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : isFailed
                ? 'bg-rose-950/40 border-rose-500/40'
                : 'bg-amber-950/40 border-amber-500/40'
            }`}
          >
            <div>
              <span className={`text-[9px] uppercase font-bold tracking-wider ${
                isSynced ? 'text-emerald-400' : isFailed ? 'text-rose-400' : 'text-amber-400'
              }`}>
                LAST SCANNED QR
              </span>
              <p className="text-base font-black text-white font-mono leading-tight">{lastScannedSku}</p>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isSynced
                    ? 'text-emerald-300 bg-emerald-900/60'
                    : isFailed
                    ? 'text-rose-300 bg-rose-900/60'
                    : 'text-amber-300 bg-amber-900/60 animate-pulse'
                }`}
              >
                {isSynced ? 'Added to Bill ✓' : isFailed ? 'Not Found ❌' : 'Transmitting to POS ⚡'}
              </span>
              <p className="text-[9px] text-slate-400 mt-0.5">{lastScanTime}</p>
            </div>
          </div>
        )
      })()}

      {/* QUEUE & AUDIT MONITOR */}
      {isPaired && (
        <div className="mx-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">POS REALTIME QUEUE</span>
            <button
              onClick={() => {
                if (confirm('Unpair this mobile scanner from Desktop POS?')) {
                  resetPairing()
                }
              }}
              className="text-[10px] text-rose-400 hover:underline"
            >
              Unpair Device
            </button>
          </div>

          {outbox.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic py-1">No items scanned in current session.</p>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {outbox.map(item => (
                <div key={item.seqId} className="flex justify-between items-center text-[11px] font-mono py-1 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-200 font-bold">{item.sku}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9.5px] px-1.5 py-0.5 rounded ${
                        item.status === 'synced'
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : item.status === 'failed'
                          ? 'text-rose-400 bg-rose-950/60'
                          : 'text-amber-400 bg-amber-950/60 animate-pulse'
                      }`}
                    >
                      {item.status === 'synced' ? 'Synced ✓' : item.status === 'failed' ? 'Failed ❌' : 'Transmitting...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
