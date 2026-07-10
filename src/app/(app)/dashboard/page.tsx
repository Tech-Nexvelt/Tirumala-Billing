'use client'
import { useTodayStats } from '@/hooks/useInvoices'
import { useInvoices } from '@/hooks/useInvoices'
import { useProducts } from '@/hooks/useProducts'
import { formatCurrency, formatCompact } from '@/lib/utils/currency'
import { formatDateTime, getLast7Days, formatDate } from '@/lib/utils/date'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function StatCard({ label, value, sub, icon, color, href }: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  color: string
  href?: string
}) {
  const content = (
    <div
      className="p-5 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-default"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: color + '18', color }}
        >
          {icon}
        </div>
        {href && (
          <span style={{ color: 'var(--text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        )}
      </div>
      <p className="text-2xl font-bold mb-1 font-number" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}

const PAYMENT_COLORS = {
  cash: '#22C55E',
  upi: '#00D9D9',
  card: '#3B82F6',
  bank: '#8B5CF6',
  split: '#F59E0B',
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { data: stats, isLoading: statsLoading } = useTodayStats()
  const { data: invoicesData, isLoading: billsLoading } = useInvoices({ per_page: 10 })
  const { data: products } = useProducts()
  const [revenueChart, setRevenueChart] = useState<{ date: string; revenue: number; bills: number }[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadChart() {
      const days = getLast7Days()
      const { data } = await supabase
        .from('invoices')
        .select('invoice_date, grand_total')
        .in('invoice_date', days)
        .eq('status', 'active')
        .is('deleted_at', null)

      const rows = (data ?? []) as Array<{ invoice_date: string; grand_total: number }>
      const grouped = days.map(day => ({
        date: formatDate(day, 'dd MMM'),
        revenue: rows.filter(r => r.invoice_date === day).reduce((s, r) => s + r.grand_total, 0),
        bills: rows.filter(r => r.invoice_date === day).length,
      }))
      setRevenueChart(grouped)
    }
    loadChart()
  }, [supabase])

  const pieData = stats
    ? [
        { name: 'Cash', value: stats.cash },
        { name: 'UPI', value: stats.upi },
        { name: 'Card', value: stats.card },
      ].filter(d => d.value > 0)
    : []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span style={{ color: 'var(--primary)' }}>{profile?.full_name?.split(' ')[0] ?? 'there'}</span>!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick action */}
        <Link
          href="/billing/new"
          className="flex items-center gap-2 h-10 px-5 rounded-xl font-semibold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #00D9D9, #35F5FF)', color: '#0F172A' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Bill
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue"
          value={statsLoading ? '...' : formatCompact(stats?.total_revenue ?? 0)}
          sub={`${stats?.bill_count ?? 0} bills today`}
          color="var(--primary)"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard
          label="Today's Bills"
          value={statsLoading ? '...' : String(stats?.bill_count ?? 0)}
          sub="Completed invoices"
          color="var(--success)"
          href="/bills"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>}
        />
        <StatCard
          label="Cash Sales"
          value={statsLoading ? '...' : formatCompact(stats?.cash ?? 0)}
          color="var(--warning)"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L6 7h12l-2-4z"/></svg>}
        />
        <StatCard
          label="Total Products"
          value={products ? String(products.length) : '...'}
          sub="Active in catalog"
          color="var(--info)"
          href="/products"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div
          className="lg:col-span-2 p-5 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Revenue (Last 7 Days)</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily billing totals</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`} />
              <Tooltip
                formatter={(v: unknown) => [formatCurrency(v as number), 'Revenue']}
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="revenue" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D9D9" />
                  <stop offset="100%" stopColor="#35F5FF" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment breakdown */}
        <div
          className="p-5 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Today's Payments</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>By payment method</p>

          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={PAYMENT_COLORS[entry.name.toLowerCase() as keyof typeof PAYMENT_COLORS] ?? '#00D9D9'} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value, entry) => (
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {value}: {formatCompact((entry.payload as {value: number}).value)}
                    </span>
                  )}
                />
                <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: 'var(--secondary-bg)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  style={{ color: 'var(--text-muted)' }}>
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L6 7h12l-2-4z"/>
                </svg>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No sales yet today</p>
              <Link href="/billing/new" className="text-xs mt-1 hover:underline" style={{ color: 'var(--primary)' }}>
                Create first bill →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent bills */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center justify-between p-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Bills</h2>
          <Link href="/bills" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--secondary-bg)' }}>
                {['Invoice #', 'Customer', 'Date & Time', 'Amount', 'Payment', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {billsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="skeleton h-4 rounded" style={{ width: j === 0 ? '80px' : j === 2 ? '120px' : '60px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoicesData?.invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No bills yet. <Link href="/billing/new" style={{ color: 'var(--primary)' }}>Create your first bill →</Link>
                  </td>
                </tr>
              ) : (
                (invoicesData?.invoices ?? []).map(invoice => (
                  <tr key={invoice.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-5 py-3">
                      <span className="font-mono text-sm font-medium" style={{ color: 'var(--primary)' }}>
                        {invoice.invoice_number}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {invoice.customer_name}
                        </p>
                        {invoice.customer_phone && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{invoice.customer_phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatDateTime(invoice.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold font-number" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(invoice.grand_total)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={{
                          background: 'rgba(0,217,217,0.1)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(0,217,217,0.2)',
                        }}
                      >
                        {invoice.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/bills/${invoice.id}`}
                          className="text-xs font-medium hover:underline"
                          style={{ color: 'var(--primary)' }}
                        >
                          View
                        </Link>
                        <Link
                          href={`/billing/new?duplicate=${invoice.id}`}
                          className="text-xs hover:underline"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Duplicate
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
