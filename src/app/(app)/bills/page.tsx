'use client'
import { useState } from 'react'
import { useInvoices, useCancelInvoice } from '@/hooks/useInvoices'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime } from '@/lib/utils/date'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BillsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useInvoices({
    search, date_from: dateFrom, date_to: dateTo, payment_method: paymentFilter, page,
  })
  const cancelInvoice = useCancelInvoice()

  const invoices = data?.invoices ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 25)

  async function handleCancel(id: string, number: string) {
    const reason = prompt(`Enter reason for cancelling ${number}:`)
    if (!reason) return
    await cancelInvoice.mutateAsync({ id, reason })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Bill History</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {total} invoice{total !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link
          href="/billing/new"
          className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #00D9D9, #35F5FF)', color: '#0F172A' }}
        >
          + New Bill
        </Link>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-3 p-4 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Invoice #, customer name, phone..."
            className="flex-1 text-sm outline-none bg-transparent" style={{ color: 'var(--text-primary)' }} />
        </div>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-lg text-sm outline-none"
          style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-lg text-sm outline-none"
          style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-lg text-sm outline-none"
          style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">All Payment Methods</option>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="bank">Bank</option>
          <option value="split">Split</option>
        </select>
        {(search || dateFrom || dateTo || paymentFilter) && (
          <button
            onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setPaymentFilter(''); setPage(1) }}
            className="h-9 px-3 rounded-lg text-sm"
            style={{ color: 'var(--error)', background: 'var(--error-bg)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--secondary-bg)', borderBottom: '1px solid var(--border)' }}>
                {['Invoice #', 'Date & Time', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="skeleton h-4 rounded" style={{ width: j === 0 ? '90px' : '70px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No bills found</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {search || dateFrom || paymentFilter ? 'Try adjusting your filters' : 'Start billing to see history here'}
                    </p>
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="group transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-5 py-3">
                      <span className="font-mono text-sm font-medium" style={{ color: 'var(--primary)' }}>
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatDateTime(inv.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{inv.customer_name}</p>
                        {inv.customer_phone && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{inv.customer_phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {(inv as typeof inv & { item_count?: number }).item_count ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-bold font-number" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(inv.grand_total)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={{ background: 'rgba(0,217,217,0.1)', color: 'var(--primary)', border: '1px solid rgba(0,217,217,0.2)' }}>
                        {inv.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={
                          inv.status === 'active'
                            ? { background: 'var(--success-bg)', color: 'var(--success)' }
                            : inv.status === 'cancelled'
                            ? { background: 'var(--error-bg)', color: 'var(--error)' }
                            : { background: 'var(--secondary-bg)', color: 'var(--text-muted)' }
                        }
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/bills/${inv.id}`} className="text-xs font-medium hover:underline"
                          style={{ color: 'var(--primary)' }}>View</Link>
                        <Link href={`/bills/${inv.id}?autoPrint=true`} className="text-xs hover:underline"
                          style={{ color: 'var(--text-secondary)' }}>Print</Link>
                        {inv.status === 'active' && (
                          <button
                            onClick={() => handleCancel(inv.id, inv.invoice_number)}
                            className="text-xs hover:underline"
                            style={{ color: 'var(--error)' }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--secondary-bg)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-3 rounded-lg text-sm font-medium"
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: page === 1 ? 'var(--text-disabled)' : 'var(--text-primary)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 px-3 rounded-lg text-sm font-medium"
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: page === totalPages ? 'var(--text-disabled)' : 'var(--text-primary)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
