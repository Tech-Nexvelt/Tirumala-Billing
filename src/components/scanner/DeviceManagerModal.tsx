'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PairingService } from '@/services/pairingService'
import type { ScannerDevice, ScannerPresence } from '@/types/pairing'
import { toast } from 'sonner'

interface DeviceManagerModalProps {
  storeId: string
  onClose: () => void
  onOpenPairingQR: () => void
}

interface CombinedDevice extends ScannerDevice {
  presence?: ScannerPresence
}

export function DeviceManagerModal({ storeId, onClose, onOpenPairingQR }: DeviceManagerModalProps) {
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState<CombinedDevice[]>([])
  const supabase = createClient()

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const { data: devData, error: devErr } = await (supabase
        .from('scanner_devices' as any)
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'active')
        .order('created_at', { ascending: false }) as any)

      if (devErr) throw devErr

      const { data: presData } = await (supabase
        .from('scanner_presence' as any)
        .select('*')
        .eq('store_id', storeId) as any)

      const presMap = new Map<string, ScannerPresence>()
      if (presData) {
        presData.forEach((p: ScannerPresence) => presMap.set(p.device_id, p))
      }

      const combined = (devData || []).map((d: ScannerDevice) => ({
        ...d,
        presence: presMap.get(d.id),
      }))

      setDevices(combined)
    } catch (err: any) {
      console.error('[DeviceManagerModal] Failed to load devices:', err)
      toast.error('Failed to load scanner fleet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [storeId])

  const handleRevoke = async (deviceId: string, deviceName: string) => {
    if (!confirm(`Revoke pairing for "${deviceName}"? The phone will be disconnected immediately.`)) return
    try {
      const ok = await PairingService.revokeDevice(deviceId, 'Revoked from Desktop Fleet Manager')
      if (ok) {
        toast.success(`Revoked "${deviceName}"`)
        // Immediately remove revoked device from state so it disappears from UI
        setDevices(prev => prev.filter(d => d.id !== deviceId))
        fetchDevices()
      } else {
        toast.error('Failed to revoke scanner')
      }
    } catch (err: any) {
      toast.error(err.message || 'Revocation error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-6 shadow-2xl relative border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center pb-4 border-b mb-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              📱 Mobile Scanner Fleet
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Enterprise Device Management &amp; Presence Telemetry
            </p>
          </div>
          <button
            onClick={onClose}
            className="transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Paired Fleet ({devices.filter(d => d.status === 'active').length} Active)
          </span>

          <button
            onClick={() => {
              onClose()
              onOpenPairingQR()
            }}
            className="px-3.5 py-1.5 rounded-xl font-bold text-xs transition-transform active:scale-95 flex items-center gap-1.5 shadow-md"
            style={{
              background: 'linear-gradient(135deg, #00D9D9, #35F5FF)',
              color: '#0F172A',
            }}
          >
            <span>➕ Pair New Scanner</span>
          </button>
        </div>

        {/* Device List */}
        {loading ? (
          <div className="py-12 flex justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary)' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
            </svg>
          </div>
        ) : devices.length === 0 ? (
          <div
            className="py-12 text-center text-xs italic rounded-2xl border"
            style={{
              background: 'var(--secondary-bg)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            No mobile scanners paired yet. Click "Pair New Scanner" to pair a cashier phone.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {devices.map(dev => {
              const isActive = dev.status === 'active'
              const isRecent = new Date().getTime() - new Date(dev.last_seen_at).getTime() < 60000
              const healthScore = dev.presence?.health_score || 95
              const latencyMs = dev.presence?.latency_ms || 42

              return (
                <div
                  key={dev.id}
                  className="p-3 rounded-2xl border flex items-center justify-between transition-colors"
                  style={{
                    background: 'var(--secondary-bg)',
                    borderColor: 'var(--border)',
                    opacity: isActive ? 1 : 0.6,
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive && isRecent
                            ? 'bg-emerald-500 animate-pulse'
                            : isActive
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        {dev.device_name}
                      </h4>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                        style={{
                          background: 'rgba(0,217,217,0.1)',
                          borderColor: 'rgba(0,217,217,0.3)',
                          color: 'var(--primary)',
                        }}
                      >
                        v{dev.app_version || '2.2.0'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      <span>{dev.platform || 'Mobile'}</span>
                      {dev.battery_level !== undefined && dev.battery_level !== null && (
                        <span style={{ color: 'var(--success)' }}>🔋 {dev.battery_level}%</span>
                      )}
                      <span style={{ color: 'var(--text-secondary)' }}>⚡ {latencyMs}ms</span>
                      <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Health: {healthScore}%</span>
                    </div>
                  </div>

                  {isActive && (
                    <button
                      onClick={() => handleRevoke(dev.id, dev.device_name)}
                      className="px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors border"
                      style={{
                        background: 'var(--error-bg)',
                        borderColor: 'rgba(239,68,68,0.3)',
                        color: 'var(--error)',
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
