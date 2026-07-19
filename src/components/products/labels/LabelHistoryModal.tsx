'use client'
import React, { useState, useEffect } from 'react'
import { getLabelAuditHistory, clearLabelAuditHistory } from '@/services/labelAuditService'
import type { PrintAuditLogItem } from '@/types/label'

interface LabelHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LabelHistoryModal({ isOpen, onClose }: LabelHistoryModalProps) {
  const [history, setHistory] = useState<PrintAuditLogItem[]>([])

  useEffect(() => {
    if (isOpen) {
      setHistory(getLabelAuditHistory())
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClear = () => {
    if (confirm('Clear all print audit history?')) {
      clearLabelAuditHistory()
      setHistory([])
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border shadow-2xl overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* HEADER */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              📜 Label Print Audit &amp; History Log
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Audit trail of all label print jobs executed in Tirumala Furniture POS
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No print jobs logged yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Printed product labels will appear here automatically</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--secondary-bg)' }}>
              <table className="w-full text-left">
                <thead>
                  <tr className="uppercase text-[10px] tracking-wider border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--secondary-bg)' }}>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Template</th>
                    <th className="p-3">Size</th>
                    <th className="p-3 text-center">Copies</th>
                    <th className="p-3 text-right">Printed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {history.map(item => (
                    <tr key={item.id} className="transition-colors" style={{ color: 'var(--text-primary)' }}>
                      <td className="p-3 font-semibold">{item.productName}</td>
                      <td className="p-3 font-mono" style={{ color: 'var(--primary)' }}>{item.sku}</td>
                      <td className="p-3 capitalize">{item.templateId.replace('_', ' ')}</td>
                      <td className="p-3 font-mono" style={{ color: 'var(--text-muted)' }}>{item.size}</td>
                      <td className="p-3 text-center font-bold text-emerald-500">{item.copiesCount}</td>
                      <td className="p-3 text-right" style={{ color: 'var(--text-muted)' }}>
                        {new Date(item.printedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(item.printedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="p-4 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border)', background: 'var(--secondary-bg)' }}
        >
          {history.length > 0 ? (
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ color: 'var(--error)', background: 'var(--error-bg)' }}
            >
              Clear Log History
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
