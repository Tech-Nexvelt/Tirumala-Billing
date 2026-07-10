'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CameraService } from '@/services/cameraService'
import { ScannerService } from '@/services/scannerService'
import { BarcodeService } from '@/services/barcodeService'
import { FeedbackService } from '@/services/feedbackService'
import { toast, Toaster } from 'sonner'

// Instantiate services
const cameraService = new CameraService()
const scannerService = new ScannerService()
const barcodeService = new BarcodeService()

interface OutboxItem {
  seqId: string
  barcode: string
  timestamp: number
}

export default function ScannerClient() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Login form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Scanner/Realtime states
  const [isDesktopOnline, setIsDesktopOnline] = useState(false)
  const [outbox, setOutbox] = useState<OutboxItem[]>([])
  const [torchActive, setTorchActive] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const channelRef = useRef<any>(null)

  // Handle Authentication Session State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setAuthLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setProfile(null)
        setAuthLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      setProfile(data)
    } catch (err: any) {
      console.error('[Scanner] Failed to load profile:', err)
      toast.error('Failed to load store credentials')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoginLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setUser(data.user)
      toast.success('Signed in successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Incorrect credentials')
    } finally {
      setLoginLoading(false)
    }
  }

  // Realtime Broadcast Channel & Presence
  useEffect(() => {
    if (!profile?.store_id) return

    const storeId = profile.store_id
    const channel = supabase.channel(`store_scans:${storeId}`, {
      config: { broadcast: { self: false, ack: false } }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        // Desktop is online if any client has device: 'desktop' tracked
        const desktopPresent = Object.values(state).some((users: any) =>
          users.some((u: any) => u.device === 'desktop')
        )
        setIsDesktopOnline(desktopPresent)
      })
      .on('broadcast', { event: 'ack' }, (payload: any) => {
        const { seqId } = payload.payload
        setOutbox(prev => prev.filter(item => item.seqId !== seqId))
        FeedbackService.triggerSuccess()
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ device: 'phone', online_at: new Date().toISOString() })
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [profile?.store_id])

  // Camera & Scanner Loop Lifecycle
  useEffect(() => {
    if (!profile?.store_id || !videoRef.current) return

    let active = true

    const startCameraAndScanning = async () => {
      try {
        await cameraService.startStream(videoRef.current!)
        if (!active) return

        await scannerService.start(
          videoRef.current!,
          (barcode) => {
            if (barcodeService.shouldProcess(barcode)) {
              handleBarcodeScanned(barcode)
            }
          },
          (err) => {
            console.error('[Scanner] Frame scanner crash:', err)
            toast.error('Camera scanning failed to start')
          }
        )
      } catch (err: any) {
        console.error('[Scanner] Camera start failed:', err)
        toast.error('Permission denied or camera device locked')
      }
    }

    startCameraAndScanning()

    // Page Visibility API support to suspend camera track when phone is locked or page is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cameraService.stopStream()
        scannerService.stop()
      } else {
        startCameraAndScanning()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      active = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cameraService.stopStream()
      scannerService.stop()
      barcodeService.reset()
    }
  }, [profile?.store_id])

  const handleBarcodeScanned = (barcode: string) => {
    const clean = barcodeService.normalize(barcode)
    const seqId = Math.random().toString(36).substring(2, 11)
    const now = Date.now()

    const scanEvent: OutboxItem = { seqId, barcode: clean, timestamp: now }
    setOutbox(prev => [...prev, scanEvent])

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'new_scan',
        payload: { seqId, barcode: clean, timestamp: now }
      })
    }
  }

  const handleToggleTorch = async () => {
    const nextState = !torchActive
    const success = await cameraService.toggleTorch(nextState)
    if (success) {
      setTorchActive(nextState)
    } else {
      toast.error('Torch not supported on this device')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans">
        <svg className="animate-spin w-8 h-8 text-cyan-400 mb-2" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
        </svg>
        <span>Loading session...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight">📦 Cashier Login</h2>
            <p className="text-xs text-slate-400 mt-1">Authenticate to link this phone with your register</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-cyan-500"
                placeholder="cashier@store.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-cyan-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              {loginLoading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 font-sans select-none">
      <Toaster position="top-center" theme="dark" richColors />

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
        <div>
          <h1 className="font-bold text-base tracking-tight">📦 TF POS Scanner</h1>
          <p className="text-[10px] text-slate-500">Cashier: {user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isDesktopOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs text-slate-400">{isDesktopOnline ? 'Active' : 'Offline'}</span>
        </div>
      </div>

      {/* Camera Panel */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <div className="w-full relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {scannerService.isNativeSupported() ? (
              <video
                ref={videoRef}
                id="scanner-video"
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div id="qr-reader-fallback" className="w-full h-full" />
            )}
            
            {/* Target overlay */}
            <div className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-48 h-12 border-2 border-cyan-400/40 rounded-md relative flex items-center justify-center">
                <span className="text-[10px] text-cyan-400/60 uppercase tracking-widest font-mono">Scan Barcode</span>
                {/* Laser scan line effect */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-cyan-400 opacity-60 pointer-events-none shadow-[0_0_8px_1px_rgba(34,211,238,0.5)]" />
              </div>
            </div>

            {/* Toggle Flashlight button */}
            <button
              onClick={handleToggleTorch}
              className="absolute right-3 bottom-3 p-2 bg-slate-900/80 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors"
            >
              {torchActive ? '💡 On' : '🔦 Off'}
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center">Aim barcode in the middle frame</p>
        </div>
      </div>

      {/* Outbox Queue Monitoring */}
      <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sync Monitor</span>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              toast.success('Logged out successfully')
            }}
            className="text-xs text-rose-400 hover:text-rose-300"
          >
            Logout
          </button>
        </div>
        {outbox.length === 0 ? (
          <p className="text-xs text-slate-600 italic">Connected & Idle. Waiting for scans.</p>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              Syncing scans ({outbox.length} pending)...
            </div>
            <div className="max-h-20 overflow-y-auto text-[10px] font-mono text-slate-400">
              {outbox.map(item => (
                <div key={item.seqId} className="flex justify-between border-b border-slate-950 py-0.5 last:border-0">
                  <span className="font-semibold text-cyan-300">{item.barcode}</span>
                  <span>pending ACK</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
