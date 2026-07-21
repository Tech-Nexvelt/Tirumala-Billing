'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { PairingService } from '@/services/pairingService'
import type { PairingSession, BillingCounter } from '@/types/pairing'
import { QRCodeSVG } from '../products/labels/QRCodeSVG'
import { toast } from 'sonner'

interface PairingQRModalProps {
  storeId: string
  userId?: string
  onClose: () => void
}

/**
 * Determine the production-safe app origin.
 *
 * Priority:
 *   1. NEXT_PUBLIC_APP_URL  (set in Vercel dashboard)
 *   2. window.location.origin  (always correct in browser)
 *
 * NEVER falls back to localhost in production — if origin is localhost
 * and no env var is set, we surface an explicit warning.
 */
function getAppOrigin(): { origin: string; warning: string | null } {
  // 1. Env var — highest priority (set in Vercel)
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return { origin: envUrl.replace(/\/$/, ''), warning: null }
  }

  // 2. window.location.origin — always accurate in the browser
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      // Local dev: warn but still work (phone on same LAN won't work, but dev is OK)
      return {
        origin,
        warning: '⚠️ Running on localhost — QR only works on same device. In production set NEXT_PUBLIC_APP_URL in Vercel.',
      }
    }
    return { origin, warning: null }
  }

  // SSR fallback (shouldn't be reached — modal is client-only)
  return { origin: 'https://tirumala-billing.vercel.app', warning: null }
}

export function PairingQRModal({ storeId, userId, onClose }: PairingQRModalProps) {
  const [loading, setLoading] = useState(true)
  const [counter, setCounter] = useState<BillingCounter | null>(null)
  const [session, setSession] = useState<PairingSession | null>(null)
  const [timeLeft, setTimeLeft] = useState(120)
  const [error, setError] = useState<string | null>(null)

  // Compute origin once — synchronous, no async race
  const { origin: appOrigin, warning: originWarning } = useMemo(() => getAppOrigin(), [])

  // Build the full QR URL using URL constructor (safe — no string concat bugs)
  const qrUrl = useMemo(() => {
    if (!session?.pairing_code) return ''
    const url = new URL('/scanner', appOrigin)
    url.searchParams.set('pair', session.pairing_code)
    const finalUrl = url.toString()
    console.log('[PairingQRModal] Generated QR URL:', finalUrl)
    return finalUrl
  }, [session?.pairing_code, appOrigin])

  // Create pairing session
  useEffect(() => {
    let active = true

    const initSession = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('[PairingQRModal] Creating pairing session for store:', storeId)

        const ctr = await PairingService.getOrCreateDefaultCounter(storeId)
        if (!active) return
        setCounter(ctr)
        console.log('[PairingQRModal] Counter:', ctr.name, ctr.id)

        const sess = await PairingService.createPairingSession(storeId, ctr.id, userId)
        if (!active) return
        setSession(sess)
        setTimeLeft(120)
        console.log('[PairingQRModal] Session created. Pairing code:', sess.pairing_code)
      } catch (err: any) {
        console.error('[PairingQRModal] Failed:', err)
        if (active) setError(err.message || 'Failed to generate pairing QR.')
      } finally {
        if (active) setLoading(false)
      }
    }

    initSession()
    return () => { active = false }
  }, [storeId, userId])

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0 || !session) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, session])

  const handleRefresh = () => {
    if (!counter) return
    setLoading(true)
    setError(null)
    PairingService.createPairingSession(storeId, counter.id, userId)
      .then(s => { setSession(s); setTimeLeft(120) })
      .catch(e => setError(e.message || 'Failed to refresh QR.'))
      .finally(() => setLoading(false))
  }

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 hover:opacity-70 text-lg" style={{ color: 'var(--text-muted)' }}>✕</button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 border"
          style={{ background: 'rgba(0,217,217,0.1)', borderColor: 'rgba(0,217,217,0.3)' }}>
          📱
        </div>

        <h2 className="text-lg font-bold tracking-tight">Pair Mobile Scanner</h2>
        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
          Counter: <span className="font-bold" style={{ color: 'var(--primary)' }}>{counter?.name || '—'}</span>
        </p>

        {/* Origin warning (only in local dev) */}
        {originWarning && (
          <div className="w-full mt-2 p-2 rounded-xl border text-[10px] text-left"
            style={{ background: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.3)', color: '#fbbf24' }}>
            {originWarning}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="my-8 flex flex-col items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary)' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
            </svg>
            <span>Generating secure pairing QR...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="my-4 w-full p-4 rounded-2xl border space-y-3"
            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <p className="text-xs font-semibold text-red-400">❌ {error}</p>
            <button onClick={handleRefresh}
              className="px-4 py-2 rounded-xl font-bold text-xs"
              style={{ background: 'linear-gradient(135deg,#00D9D9,#35F5FF)', color: '#0F172A' }}>
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Expired */}
        {!loading && !error && timeLeft <= 0 && (
          <div className="my-4 w-full p-4 rounded-2xl border space-y-3"
            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <p className="text-xs font-semibold text-red-400">⚠️ QR Expired</p>
            <button onClick={handleRefresh}
              className="px-4 py-2 rounded-xl font-bold text-xs"
              style={{ background: 'linear-gradient(135deg,#00D9D9,#35F5FF)', color: '#0F172A' }}>
              🔄 Refresh QR
            </button>
          </div>
        )}

        {/* Active QR */}
        {!loading && !error && timeLeft > 0 && qrUrl && (
          <div className="my-4 space-y-3 w-full flex flex-col items-center">
            {/* QR Code */}
            <div className="p-3 rounded-2xl border-2 shadow-xl inline-flex items-center justify-center"
              style={{ background: '#FFFFFF', borderColor: 'var(--primary)' }}>
              <QRCodeSVG value={qrUrl} size={180} darkColor="#0F172A" />
            </div>

            {/* URL preview — click to copy, helps verify no localhost in QR */}
            <div className="w-full p-2.5 rounded-xl border text-left"
              style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)' }}>
              <p className="text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                🔗 Encoded URL (tap to copy):
              </p>
              <p
                className="text-[11px] font-mono break-all cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: 'var(--primary)' }}
                onClick={() => {
                  navigator.clipboard?.writeText(qrUrl)
                    .then(() => toast.success('URL copied!'))
                    .catch(() => {})
                }}
              >
                {qrUrl}
              </p>
            </div>

            {/* Timer */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono"
              style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)' }}>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span style={{ color: 'var(--text-muted)' }}>Expires in:</span>
              <span className="font-bold" style={{ color: timeLeft <= 30 ? '#f87171' : 'var(--primary)' }}>
                {formatTimer(timeLeft)}
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-left p-3 rounded-xl border text-[11px] space-y-1.5 w-full mt-2"
          style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>How to pair:</p>
          <p>1. Open your phone camera or browser.</p>
          <p>2. Scan this QR code — scanner opens automatically.</p>
          <p>3. Allow camera access → scan furniture labels.</p>
        </div>
      </div>
    </div>
  )
}
