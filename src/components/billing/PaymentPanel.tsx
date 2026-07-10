'use client'
import { useBillingStore } from '@/store/billingStore'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/currency'
import type { PaymentMethod } from '@/types/database'

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'card', label: 'Card', icon: '💳' },
  { id: 'bank', label: 'Bank', icon: '🏦' },
  { id: 'split', label: 'Split', icon: '✂️' },
]

const QUICK_AMOUNTS = [500, 1000, 2000, 5000]

export function PaymentPanel() {
  const {
    payment_method,
    split_payments,
    amount_tendered,
    summary,
    setPaymentMethod,
    setSplitPayment,
    addSplitPayment,
    removeSplitPayment,
    setAmountTendered,
    getChange,
  } = useBillingStore()

  const change = getChange()

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Payment Method</h3>

      {/* Method selector */}
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {PAYMENT_METHODS.map(m => (
          <button
            key={m.id}
            id={`payment-${m.id}`}
            onClick={() => setPaymentMethod(m.id)}
            className="flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: payment_method === m.id
                ? 'linear-gradient(135deg, rgba(0,217,217,0.15), rgba(53,245,255,0.1))'
                : 'var(--secondary-bg)',
              border: payment_method === m.id ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
              color: payment_method === m.id ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            <span className="text-lg leading-none">{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Cash: Amount tendered + change calculator */}
      {payment_method === 'cash' && (
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
              Amount Tendered
            </label>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>₹</span>
              <input
                type="number"
                min="0"
                value={amount_tendered || ''}
                onChange={e => setAmountTendered(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder={String(summary.grand_total)}
                className="flex-1 h-9 px-2 rounded-lg text-sm font-number outline-none"
                style={{
                  background: 'var(--secondary-bg)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Quick amount buttons */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <button
                onClick={() => setAmountTendered(summary.grand_total)}
                className="px-2 py-1 rounded text-xs font-medium transition-colors"
                style={{ background: 'rgba(0,217,217,0.1)', color: 'var(--primary)', border: '1px solid rgba(0,217,217,0.2)' }}
              >
                Exact
              </button>
              {QUICK_AMOUNTS.filter(a => a >= summary.grand_total * 0.8).slice(0, 3).map(a => (
                <button
                  key={a}
                  onClick={() => setAmountTendered(a)}
                  className="px-2 py-1 rounded text-xs transition-colors"
                  style={{ background: 'var(--secondary-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  ₹{(a / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>

          {/* Change display */}
          {amount_tendered > 0 && (
            <div
              className="p-3 rounded-lg flex items-center justify-between"
              style={{
                background: change >= 0 ? 'var(--success-bg)' : 'var(--error-bg)',
                border: `1px solid ${change >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              <span className="text-xs font-medium" style={{ color: change >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {change >= 0 ? '💰 Change to Return' : '⚠️ Amount Short'}
              </span>
              <span className="font-bold text-sm font-number" style={{ color: change >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {formatCurrency(Math.abs(change))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* UPI / Card / Bank: Reference */}
      {(payment_method === 'upi' || payment_method === 'card' || payment_method === 'bank') && (
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
            {payment_method === 'upi' ? 'UPI Reference / Transaction ID (optional)' :
             payment_method === 'card' ? 'Last 4 digits (optional)' :
             'Transaction / NEFT Reference (optional)'}
          </label>
          <input
            type="text"
            placeholder={
              payment_method === 'upi' ? 'e.g. 4526XXXXXX' :
              payment_method === 'card' ? 'e.g. 4321' :
              'e.g. NEFT2024XXXXXX'
            }
            className="w-full h-9 px-3 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--secondary-bg)',
              border: '1.5px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      )}

      {/* Split payment */}
      {payment_method === 'split' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Total: {formatCurrency(summary.grand_total)}
            </span>
            <span
              className="text-xs font-medium"
              style={{
                color: Math.abs(split_payments.reduce((s, p) => s + p.amount, 0) - summary.grand_total) < 0.5
                  ? 'var(--success)' : 'var(--warning)',
              }}
            >
              Allocated: {formatCurrency(split_payments.reduce((s, p) => s + p.amount, 0))}
            </span>
          </div>

          {split_payments.map((sp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={sp.method}
                onChange={e => setSplitPayment(idx, { ...sp, method: e.target.value as Exclude<PaymentMethod, 'split'> })}
                className="h-8 px-2 rounded text-xs outline-none"
                style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank">Bank</option>
              </select>
              <div className="flex items-center gap-1 flex-1">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>₹</span>
                <input
                  type="number" min="0" value={sp.amount || ''}
                  onChange={e => setSplitPayment(idx, { ...sp, amount: Math.max(0, parseFloat(e.target.value) || 0) })}
                  placeholder="0"
                  className="flex-1 h-8 px-2 text-sm rounded font-number outline-none"
                  style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              {split_payments.length > 1 && (
                <button onClick={() => removeSplitPayment(idx)} style={{ color: 'var(--error)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          ))}

          {split_payments.length < 4 && (
            <button
              onClick={addSplitPayment}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: 'var(--primary)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add payment method
            </button>
          )}
        </div>
      )}
    </div>
  )
}
