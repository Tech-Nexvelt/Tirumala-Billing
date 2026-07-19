'use client'
import { useBillingStore } from '@/store/billingStore'
import { formatCurrency } from '@/lib/utils/currency'
import { useState, useEffect } from 'react'

interface RowProps {
  item: ReturnType<typeof useBillingStore>['items'][0]
  index: number
}

function InvoiceRow({ item, index }: RowProps) {
  const { updateItemQty, updateItemDiscount, removeItem } = useBillingStore()
  const [highlight, setHighlight] = useState(item.isNew ?? false)
  const [editDiscount, setEditDiscount] = useState(false)
  const [discountInput, setDiscountInput] = useState(String(item.discount_percent))

  // Flash animation when item is new/updated
  useEffect(() => {
    if (item.isNew) {
      setHighlight(true)
      const t = setTimeout(() => setHighlight(false), 1500)
      return () => clearTimeout(t)
    }
  }, [item.isNew, item.quantity])

  return (
    <tr
      className="transition-all duration-300 group"
      style={{
        background: highlight ? 'rgba(0,217,217,0.07)' : 'transparent',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* # */}
      <td className="px-4 py-3 text-center text-sm" style={{ color: 'var(--text-muted)', width: '48px' }}>
        {index + 1}
      </td>

      {/* Product */}
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {item.product_name}
          </p>
          <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {item.product_sku}
            {item.product_barcode && (
              <span className="ml-2 opacity-60">{item.product_barcode}</span>
            )}
          </p>
        </div>
      </td>

      {/* Qty */}
      <td className="px-4 py-3" style={{ width: '110px' }}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => item.quantity > 1 && updateItemQty(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-sm font-bold"
            style={{
              background: 'var(--secondary-bg)',
              color: item.quantity <= 1 ? 'var(--text-disabled)' : 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            −
          </button>
          <span
            className="w-8 text-center text-sm font-semibold font-number"
            style={{ color: 'var(--text-primary)' }}
          >
            {item.quantity}
          </span>
          <button
            onClick={() => updateItemQty(item.id, item.quantity + 1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-sm font-bold"
            style={{
              background: 'var(--secondary-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            +
          </button>
        </div>
      </td>

      {/* Unit Price */}
      <td className="px-4 py-3 text-right" style={{ width: '110px' }}>
        <span className="text-sm font-number" style={{ color: 'var(--text-secondary)' }}>
          {formatCurrency(item.unit_price)}
        </span>
      </td>

      {/* Discount */}
      <td className="px-4 py-3 text-center" style={{ width: '100px' }}>
        {editDiscount ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              value={discountInput}
              autoFocus
              onChange={e => setDiscountInput(e.target.value)}
              onBlur={() => {
                const val = Math.min(100, Math.max(0, parseFloat(discountInput) || 0))
                updateItemDiscount(item.id, val)
                setDiscountInput(String(val))
                setEditDiscount(false)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  const val = Math.min(100, Math.max(0, parseFloat(discountInput) || 0))
                  updateItemDiscount(item.id, val)
                  setEditDiscount(false)
                }
              }}
              className="w-14 h-7 px-2 text-center text-xs rounded font-number outline-none"
              style={{
                background: 'var(--secondary-bg)',
                border: '1.5px solid var(--primary)',
                color: 'var(--text-primary)',
              }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>%</span>
          </div>
        ) : (
          <button
            onClick={() => setEditDiscount(true)}
            className="text-sm font-number hover:underline transition-colors"
            style={{ color: item.discount_percent > 0 ? 'var(--warning)' : 'var(--text-muted)' }}
            title="Click to edit discount"
          >
            {item.discount_percent > 0 ? `${item.discount_percent}%` : '−'}
          </button>
        )}
      </td>

      {/* Line Total */}
      <td className="px-4 py-3 text-right" style={{ width: '120px' }}>
        <span className="text-sm font-semibold font-number" style={{ color: 'var(--text-primary)' }}>
          {formatCurrency(item.line_total)}
        </span>
      </td>

      {/* Remove */}
      <td className="px-4 py-3 text-center" style={{ width: '44px' }}>
        <button
          onClick={() => removeItem(item.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          style={{ color: 'var(--error)', background: 'var(--error-bg)', border: '1px solid rgba(239,68,68,0.2)' }}
          aria-label={`Remove ${item.product_name}`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </td>
    </tr>
  )
}

export function InvoiceTable({ onSearchOpen }: { onSearchOpen: () => void }) {
  const { items } = useBillingStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 px-8 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-cyan-500/20"
          style={{ background: 'rgba(0, 217, 217, 0.08)' }}
        >
          {/* Vector QR Code Icon */}
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
            style={{ color: 'var(--primary)' }}>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
            <rect x="18" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
            <rect x="14" y="18" width="3" height="3" rx="0.5" fill="currentColor" />
            <rect x="18" y="18" width="3" height="3" rx="0.5" fill="currentColor" />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Ready to scan QR Label
        </h3>
        <p className="text-sm max-w-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Point your scanner or mobile phone camera at any product QR label above.
          Items will be added instantly — zero typing needed.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--secondary-bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search Catalog
          </button>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium"
            style={{ background: 'rgba(0,217,217,0.08)', color: 'var(--primary)', border: '1px solid rgba(0,217,217,0.2)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            F2 to focus QR scanner
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth: '640px' }}>
        <thead>
          <tr style={{ background: 'var(--secondary-bg)', borderBottom: '1px solid var(--border)' }}>
            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', width: '48px' }}>#</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Product</th>
            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', width: '110px' }}>Qty</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', width: '110px' }}>Unit Price</th>
            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', width: '100px' }}>Discount</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', width: '120px' }}>Amount</th>
            <th style={{ width: '44px' }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <InvoiceRow key={item.id} item={item} index={i} />
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: 'var(--secondary-bg)' }}>
            <td colSpan={5} className="px-4 py-2.5 text-right text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {items.length} item{items.length !== 1 ? 's' : ''} · {items.reduce((s, i) => s + i.quantity, 0)} unit{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} total
            </td>
            <td className="px-4 py-2.5 text-right text-sm font-bold font-number" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(items.reduce((s, i) => s + i.line_total, 0))}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
