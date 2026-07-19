'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CameraService } from '@/services/cameraService'
import { CodeScannerService } from '@/services/codeScannerService'
import { ProductCodeService } from '@/services/productCodeService'
import { FeedbackService } from '@/services/feedbackService'
import { PairingService } from '@/services/pairingService'
import { useAutoReconnect } from '@/hooks/useAutoReconnect'
import type { ScannerState } from '@/types/scanner'
import { toast, Toaster } from 'sonner'

const cameraService = new CameraService()
const codeScannerService = new CodeScannerService()
const productCodeService = new ProductCodeService()

interface OutboxItem {
  seqId: string
  sku: string
  timestamp: number
  status: 'sending' | 'synced' | 'failed'
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

    const channel = supabase.channel(`store_scans:${storeId}`, {
      config: { broadcast: { self: false, ack: false } }
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
        const { seqId } = payload.payload || {}
        setOutbox(prev =>
          prev.map(item => item.seqId === seqId ? { ...item, status: 'synced' } : item)
        )
      })
      .on('broadcast', { event: 'scanner_revoked' }, (payload: any) => {
        if (payload.payload?.deviceId === device?.id) {
          toast.error('This mobile scanner was revoked by Desktop POS')
          resetPairing()
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ device: 'phone', deviceId: device?.id, online_at: new Date().toISOString() })
          setScannerState('READY')
        }
      })

    channelRef.current = channel
    return () => { channel.unsubscribe() }
  }, [storeId, device?.id, resetPairing])

  // Camera & Code Scanning Loop (Runs immediately on load)
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

      // Clean URL query parameter
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

    // Flash trigger
    setScanFlash(true)
    setTimeout(() => setScanFlash(false), 250)

    const seqId = Math.random().toString(36).substring(2, 11)
    const now = Date.now()
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    setLastScannedSku(sku)
    setLastScanTime(formattedTime)

    const scanEvent: OutboxItem = { seqId, sku, timestamp: now, status: 'sending' }
    setOutbox(prev => [scanEvent, ...prev].slice(0, 20))

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'new_scan',
        payload: { seqId, barcode: sku, sku, timestamp: now }
      })
    }

    setTimeout(() => {
      setScannerState('READY')
    }, 400)
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
  }

  if (autoState === 'INITIALIZING' || autoState === 'VALIDATING') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans">
        <svg className="animate-spin w-8 h-8 text-cyan-400 mb-2" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
        </svg>
        <span>Validating Scanner Session...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 font-sans select-none relative overflow-hidden">
      <Toaster position="top-center" theme="dark" richColors />

      {/* FLASH OVERLAY ON SCAN */}
      {scanFlash && (
        <div className="absolute inset-0 z-50 bg-cyan-400/20 pointer-events-none animate-fade-in" />
      )}

      {/* HEADER BAR */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
        <div>
          <h1 className="font-bold text-base tracking-tight flex items-center gap-2">
            {!isPaired ? '📱 Pair Scanner with Desktop' : '📷 Commercial QR Scanner'}
          </h1>
          <p className="text-[10px] text-slate-400 font-mono">
            {!isPaired ? 'Scan Desktop QR code to connect' : device?.device_name || 'Tirumala Wireless POS'}
          </p>
        </div>

        {/* STATE & DESKTOP LINK STATUS */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
          <span className={`w-2.5 h-2.5 rounded-full ${isPaired && isDesktopOnline ? 'bg-emerald-400 animate-pulse' : isPaired ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'}`} />
          <span className="text-xs font-semibold text-slate-300">
            {!isPaired ? 'Unpaired' : isDesktopOnline ? 'POS Linked' : 'Standby'}
          </span>
        </div>
      </div>

      {/* CAMERA VIEWPORT WITH SPOTLIGHT FRAME */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="w-full max-w-md relative aspect-square bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl">
          <video
            ref={videoRef}
            id="scanner-video"
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* TARGET OVERLAY & CORNER BRACKETS */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
            <div className={`w-64 h-64 border-2 ${!isPaired ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]' : 'border-cyan-400/50 shadow-[0_0_30px_rgba(0,217,217,0.2)]'} rounded-2xl relative flex items-center justify-center`}>
              <div className={`absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 ${!isPaired ? 'border-amber-400' : 'border-cyan-400'} rounded-tl-lg`} />
              <div className={`absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 ${!isPaired ? 'border-amber-400' : 'border-cyan-400'} rounded-tr-lg`} />
              <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 ${!isPaired ? 'border-amber-400' : 'border-cyan-400'} rounded-bl-lg`} />
              <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 ${!isPaired ? 'border-amber-400' : 'border-cyan-400'} rounded-br-lg`} />

              {/* Laser Line */}
              <div className={`absolute left-3 right-3 h-0.5 ${!isPaired ? 'bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.8)]' : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_2px_rgba(53,245,255,0.8)]'} animate-pulse`} />

              <span className={`text-[10px] font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${!isPaired ? 'bg-amber-950/80 text-amber-300 border-amber-500/50' : 'bg-slate-950/60 text-cyan-300/80 border-cyan-500/30'}`}>
                {!isPaired ? 'Scan Desktop Pairing QR' : 'Point at Product QR'}
              </span>
            </div>
          </div>

          {/* FLOATING CAMERA CONTROLS */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
            <button
              onClick={handleSwitchCamera}
              className="px-3.5 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-full text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              🔄 Flip Camera
            </button>

            <button
              onClick={handleToggleTorch}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-colors flex items-center gap-1.5 ${
                torchActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {torchActive ? '💡 Flash On' : '🔦 Flash Off'}
            </button>
          </div>
        </div>
      </div>

      {/* UNPAIRED BANNER */}
      {!isPaired && (
        <div className="mb-3 p-3 bg-amber-950/60 border border-amber-500/40 rounded-2xl text-center space-y-1">
          <p className="text-xs font-bold text-amber-300">⚡ Scanner Unpaired</p>
          <p className="text-[10.5px] text-amber-200/80">
            Scan the Desktop Pairing QR with your phone camera or point this scanner at it!
          </p>
        </div>
      )}

      {/* LAST SCANNED ITEM CARD */}
      {lastScannedSku && isPaired && (
        <div className="mb-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between animate-slide-in-up">
          <div>
            <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">LAST SCANNED QR</span>
            <p className="text-base font-black text-white font-mono leading-tight">{lastScannedSku}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-900/60 px-2 py-0.5 rounded">
              Added to Bill ✓
            </span>
            <p className="text-[9px] text-slate-400 mt-0.5">{lastScanTime}</p>
          </div>
        </div>
      )}

      {/* QUEUE & AUDIT MONITOR */}
      {isPaired && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs">
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
            <p className="text-[11px] text-slate-500 italic">Ready for next furniture label scan...</p>
          ) : (
            <div className="space-y-1 max-h-16 overflow-y-auto font-mono text-[10px]">
              {outbox.map(item => (
                <div key={item.seqId} className="flex justify-between items-center border-b border-slate-800/60 py-0.5">
                  <span className="font-bold text-cyan-300">{item.sku}</span>
                  <span className={item.status === 'synced' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {item.status === 'synced' ? '✓ Synced to Cart' : '⚡ Transmitting...'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
