'use client'
import { useBillingStore } from '@/store/billingStore'
import { formatCurrency } from '@/lib/utils/currency'

function SummaryRow({ label, value, isTotal, isMuted, isNegative, isPositive, isInput, inputValue, onInputChange, prefix }: {
  label: string
  value?: string
  isTotal?: boolean
  isMuted?: boolean
  isNegative?: boolean
  isPositive?: boolean
  isInput?: boolean
  inputValue?: number
  onInputChange?: (v: number) => void
  prefix?: string
}) {
  if (isTotal) {
    return (
      <div
        className="grand-total-display mt-2"
        style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-base" style={{ color: '#0F172A' }}>Grand Total</span>
          <span className="font-bold text-2xl font-number" style={{ color: '#0F172A' }}>{value}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm" style={{ color: isMuted ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
        {label}
      </span>
      {isInput ? (
        <div className="flex items-center gap-1">
          {prefix && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{prefix}</span>}
          <input
            type="number"
            min="0"
            value={inputValue ?? 0}
            onChange={e => onInputChange?.(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-20 h-7 px-2 text-right text-sm rounded font-number outline-none"
            style={{
              background: 'var(--secondary-bg)',
              border: '1.5px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          />
        </div>
      ) : (
        <span
          className="text-sm font-number font-medium"
          style={{ color: isNegative ? 'var(--success)' : isPositive ? 'var(--error)' : 'var(--text-primary)' }}
        >
          {value}
        </span>
      )}
    </div>
  )
}

export function InvoiceSummary() {
  const {
    summary,
    delivery_charge,
    installation_charge,
    additional_discount,
    setDeliveryCharge,
    setInstallationCharge,
    setAdditionalDiscount,
  } = useBillingStore()

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Bill Summary</h3>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
        <SummaryRow label="Subtotal" value={formatCurrency(summary.subtotal)} />

        {summary.item_discount > 0 && (
          <SummaryRow label="Item Discounts" value={`− ${formatCurrency(summary.item_discount)}`} isNegative />
        )}

        {/* Additional discount input */}
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Extra Discount</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number" min="0" max="100"
              value={additional_discount || ''}
              onChange={e => setAdditionalDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              placeholder="0"
              className="w-14 h-7 px-2 text-center text-sm rounded font-number outline-none"
              style={{ background: 'var(--secondary-bg)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>%</span>
            {summary.additional_discount > 0 && (
              <span className="text-sm font-number" style={{ color: 'var(--success)' }}>
                − {formatCurrency(summary.additional_discount)}
              </span>
            )}
          </div>
        </div>

        {/* Delivery charge */}
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Delivery</span>
          <div className="flex items-center gap-1">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>₹</span>
            <input
              type="number" min="0"
              value={delivery_charge || ''}
              onChange={e => setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0"
              className="w-20 h-7 px-2 text-right text-sm rounded font-number outline-none"
              style={{ background: 'var(--secondary-bg)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Installation charge */}
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Installation</span>
          <div className="flex items-center gap-1">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>₹</span>
            <input
              type="number" min="0"
              value={installation_charge || ''}
              onChange={e => setInstallationCharge(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0"
              className="w-20 h-7 px-2 text-right text-sm rounded font-number outline-none"
              style={{ background: 'var(--secondary-bg)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {summary.round_off !== 0 && (
          <SummaryRow
            label="Round Off"
            value={`${summary.round_off > 0 ? '+' : ''}${formatCurrency(summary.round_off)}`}
            isMuted
          />
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px' }}>
        <SummaryRow label="" value={formatCurrency(summary.grand_total)} isTotal />
      </div>
    </div>
  )
}
