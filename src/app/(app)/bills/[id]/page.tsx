'use client'
import { use, useState, useEffect } from 'react'
import { useInvoice, useCancelInvoice } from '@/hooks/useInvoices'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime, formatDate } from '@/lib/utils/date'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { A4Invoice } from '@/components/billing/A4Invoice'
import { ThermalReceipt } from '@/components/billing/ThermalReceipt'
import { toast } from 'sonner'
import { shareInvoiceViaWhatsApp } from '@/lib/utils/pdfShare'

export default function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, isLoading } = useInvoice(id)
  const { store } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const autoPrint = searchParams.get('autoPrint') === 'true'
  const cancelInvoice = useCancelInvoice()
  const [printMode, setPrintMode] = useState<'a4' | 'thermal'>('a4')

  useEffect(() => {
    if (store?.receipt_width) {
      setPrintMode(store.receipt_width === 'A4' ? 'a4' : 'thermal')
    }
  }, [store])

  useEffect(() => {
    if (data && autoPrint) {
      const timer = setTimeout(() => {
        window.print()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [data, autoPrint])

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-12 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Invoice not found</p>
        <Link href="/bills" style={{ color: 'var(--primary)' }}>← Back to Bills</Link>
      </div>
    )
  }

  const { invoice, items } = data

  const handleCancel = async () => {
    const reason = prompt('Reason for cancellation:')
    if (!reason) return
    await cancelInvoice.mutateAsync({ id: invoice.id, reason })
    router.push('/bills')
  }

  const handleWhatsApp = () => {
    toast.promise(shareInvoiceViaWhatsApp(invoice, items, store), {
      loading: 'Generating and uploading invoice PDF...',
      success: 'WhatsApp link prepared!',
      error: 'Failed to generate PDF invoice.'
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 print:!p-0 print:!m-0 print:!max-w-none print:w-full">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} style={{ color: 'var(--text-secondary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
              {invoice.invoice_number}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {formatDateTime(invoice.created_at)}
            </p>
          </div>
        </div>

        {/* Status */}
        <span
          className="px-3 py-1 rounded-full text-sm font-medium capitalize"
          style={
            invoice.status === 'active'
              ? { background: 'var(--success-bg)', color: 'var(--success)' }
              : invoice.status === 'cancelled'
              ? { background: 'var(--error-bg)', color: 'var(--error)' }
              : { background: 'var(--secondary-bg)', color: 'var(--text-muted)' }
          }
        >
          {invoice.status}
        </span>
      </div>

      {/* Action Controls & Format Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl no-print"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        
        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold transition-all hover:opacity-95"
            style={{ background: 'linear-gradient(135deg, #00D9D9, #35F5FF)', color: '#0F172A' }}
          >
            🖨️ Print Invoice
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' }}
          >
            📱 WhatsApp
          </button>
          <Link
            href={`/billing/new?duplicate=${invoice.id}`}
            className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            📋 Duplicate Bill
          </Link>
          {invoice.status === 'active' && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Format Selector Toggle */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setPrintMode('a4')}
            className="h-8 px-3 rounded text-xs font-semibold transition-all"
            style={{
              background: printMode === 'a4' ? 'var(--surface)' : 'transparent',
              color: printMode === 'a4' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: printMode === 'a4' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            📄 A4 Layout
          </button>
          <button
            onClick={() => setPrintMode('thermal')}
            className="h-8 px-3 rounded text-xs font-semibold transition-all"
            style={{
              background: printMode === 'thermal' ? 'var(--surface)' : 'transparent',
              color: printMode === 'thermal' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: printMode === 'thermal' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            🖨️ Thermal 80mm
          </button>
        </div>
      </div>

      {/* Invoice/Receipt Preview Wrapper */}
      <div className="flex justify-center w-full">
        {printMode === 'a4' ? (
          <A4Invoice invoice={invoice} items={items} store={store} />
        ) : (
          <ThermalReceipt invoice={invoice} items={items} store={store} />
        )}
      </div>
    </div>
  )
}
