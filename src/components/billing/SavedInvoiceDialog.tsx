'use client'
import { useInvoice } from '@/hooks/useInvoices'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime } from '@/lib/utils/date'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { shareInvoiceViaWhatsApp } from '@/lib/utils/pdfShare'

interface SavedInvoiceDialogProps {
  invoiceId: string
  invoiceNumber: string
  onClose: () => void
  onNewBill: () => void
}

export function SavedInvoiceDialog({ invoiceId, invoiceNumber, onClose, onNewBill }: SavedInvoiceDialogProps) {
  const { data } = useInvoice(invoiceId)
  const { store } = useAuth()

  const handleWhatsApp = () => {
    if (!data) return
    const { invoice, items } = data
    toast.promise(shareInvoiceViaWhatsApp(invoice, items, store), {
      loading: 'Generating and uploading invoice PDF...',
      success: 'WhatsApp link prepared!',
      error: 'Failed to generate PDF invoice.'
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden animate-slide-in-up"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}
      >
        {/* Success header */}
        <div
          className="p-6 text-center"
          style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-0.5">Bill Saved!</h2>
          <p className="text-white/80 text-sm font-mono">{invoiceNumber}</p>
        </div>

        {/* Invoice summary */}
        {data && (
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Customer</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{data.invoice.customer_name}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Items</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{data.items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Grand Total</span>
              <span className="font-bold text-base font-number" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(data.invoice.grand_total)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.print()}
              className="h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5"
              style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print Receipt
            </button>
            <button
              onClick={handleWhatsApp}
              className="h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5"
              style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
          </div>

          <Link
            href={`/bills/${invoiceId}`}
            className="flex items-center justify-center gap-1.5 w-full h-10 rounded-lg font-medium text-sm"
            style={{ background: 'var(--secondary-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            View Invoice →
          </Link>

          <button
            onClick={onNewBill}
            className="w-full h-12 rounded-xl font-bold text-base"
            style={{ background: 'linear-gradient(135deg, #00D9D9, #35F5FF)', color: '#0F172A' }}
          >
            + New Bill
          </button>
        </div>
      </div>
    </div>
  )
}
