'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export function TopBar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const pathname = usePathname()
  const { store } = useAuth()

  // Generate breadcrumb from pathname
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumb = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }))

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 no-print"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span style={{ color: 'var(--text-muted)' }}>
          {store?.name ?? 'Store POS'}
        </span>
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--divider)' }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            {i === breadcrumb.length - 1 ? (
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2">
        {/* New Bill CTA */}
        {pathname !== '/billing/new' && (
          <Link
            href="/billing/new"
            className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #00D9D9, #35F5FF)',
              color: '#0F172A',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Bill
          </Link>
        )}

        {/* Keyboard shortcut hint */}
        <div
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded text-xs"
          style={{ background: 'var(--secondary-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          <kbd className="font-mono">F2</kbd>
          <span>scanner</span>
        </div>
      </div>
    </header>
  )
}
