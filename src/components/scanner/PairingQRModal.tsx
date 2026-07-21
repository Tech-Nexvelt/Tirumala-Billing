'use client'
import React, { useState, useEffect } from 'react'
import { PairingService } from '@/services/pairingService'
import type { PairingSession, BillingCounter } from '@/types/pairing'
import { QRCodeSVG } from '../products/labels/QRCodeSVG'
import { toast } from 'sonner'

interface PairingQRModalProps {
  storeId: string
  userId?: string
  onClose: () => void
}

export function PairingQRModal({ storeId, userId, onClose }: PairingQRModalProps) {
  const [loading, setLoading] = useState(true)
  const [counter, setCounter] = useState<BillingCounter | null>(null)
  const [session, setSession] = useState<PairingSession | null>(null)
  const [timeLeft, setTimeLeft] = useState(120) // 120 seconds (2 minutes)
  const [localIp, setLocalIp] = useState('192.168.1.4')
  const [port, setPort] = useState('3000')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const p = window.location.port
      setPort(p)
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        setLocalIp(hostname)
      }
    }
  }, [])

  useEffect(() => {
    let active = true

    const initSession = async () => {
      try {
        setLoading(true)
        const ctr = await PairingService.getOrCreateDefaultCounter(storeId)
        if (!active) return
        setCounter(ctr)

        const sess = await PairingService.createPairingSession(storeId, ctr.id, userId)
        if (!active) return
        setSession(sess)
        setTimeLeft(120)
      } catch (err: any) {
        console.error('[PairingQRModal] Failed to create pairing session:', err)
        toast.error('Failed to generate pairing QR')
      } finally {
        if (active) setLoading(false)
      }
    }

    initSession()

    return () => {
      active = false
    }
  }, [storeId, userId])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || !session) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, session])

  // Calculate Base URL for scanner pairing
  const isCloudHost = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1'

  const baseUrl = isCloudHost
    ? (typeof window !== 'undefined' ? window.location.origin : '')
    : `http://${localIp}${port ? `:${port}` : ':3000'}`

  const qrPayload = session
    ? `${baseUrl}/scanner?pair=${session.pairing_code}`
    : ''

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          ✕
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 border"
          style={{
            background: 'rgba(0,217,217,0.1)',
            borderColor: 'rgba(0,217,217,0.3)',
            color: 'var(--primary)',
          }}
        >
          📱
        </div>

        <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Pair Mobile Scanner
        </h2>
        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
          Counter: <span className="font-bold" style={{ color: 'var(--primary)' }}>{counter?.name || 'Main Counter 1'}</span>
        </p>

        {loading ? (
          <div className="my-8 flex flex-col items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary)' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
            </svg>
            <span>Generating secure pairing QR...</span>
          </div>
        ) : timeLeft <= 0 ? (
          <div
            className="my-8 p-4 rounded-2xl space-y-3 border"
            style={{
              background: 'var(--error-bg)',
              borderColor: 'rgba(239,68,68,0.3)',
            }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--error)' }}>⚠️ Pairing QR Expired</p>
            <button
              onClick={() => {
                if (counter) {
                  setLoading(true)
                  PairingService.createPairingSession(storeId, counter.id, userId)
                    .then(s => {
                      setSession(s)
                      setTimeLeft(120)
                    })
                    .finally(() => setLoading(false))
                }
              }}
              className="px-4 py-2 rounded-xl font-bold text-xs transition-colors"
              style={{
                background: 'linear-gradient(135deg, #00D9D9, #35F5FF)',
                color: '#0F172A',
              }}
            >
              🔄 Refresh QR Code
            </button>
          </div>
        ) : (
          <div className="my-4 space-y-3 w-full">
            {/* Vector QR Code */}
            <div
              className="p-3 rounded-2xl border-2 shadow-xl inline-flex items-center justify-center"
              style={{
                background: '#FFFFFF',
                borderColor: 'var(--primary)',
              }}
            >
              <QRCodeSVG value={qrPayload} size={180} darkColor="#0F172A" />
            </div>

            {/* Wi-Fi / Cloud Configurator */}
            <div
              className="p-2.5 rounded-xl border text-left"
              style={{
                background: 'var(--secondary-bg)',
                borderColor: 'var(--border)',
              }}
            >
              <label className="block text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                {isCloudHost ? '☁️ Cloud Domain Access:' : '🌐 Store Wi-Fi Desktop IP Address:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly={isCloudHost}
                  value={isCloudHost ? baseUrl : localIp}
                  onChange={e => !isCloudHost && setLocalIp(e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded text-xs font-mono outline-none border focus:border-cyan-500"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--primary)',
                  }}
                  placeholder="192.168.1.4"
                />
              </div>
            </div>

            {/* Timer Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono"
              style={{
                background: 'var(--secondary-bg)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span style={{ color: 'var(--text-muted)' }}>Expires in:</span>
              <span className="font-bold" style={{ color: 'var(--primary)' }}>{formatTimer(timeLeft)}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div
          className="text-left p-3 rounded-xl border text-[11px] space-y-1.5 w-full"
          style={{
            background: 'var(--secondary-bg)',
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Mobile Scanner Pairing:</p>
          <p>1. {isCloudHost ? 'Open camera app on your phone.' : 'Connect your phone to the store Wi-Fi network.'}</p>
          <p>2. Scan this QR code or open <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>{baseUrl}/scanner</span> on your phone.</p>
          <p>3. Tap to pair phone as wireless scanner!</p>
        </div>
      </div>
    </div>
  )
}
