'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: '⊞' },
  { href: '/billing/new', label: 'Bill', icon: '+', highlight: true },
  { href: '/bills', label: 'History', icon: '≡' },
  { href: '/products', label: 'Products', icon: '◈', adminOnly: true },
  { href: '/settings', label: 'Settings', icon: '⚙', adminOnly: true },
]

export function MobileNav() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  const items = NAV_ITEMS.filter(i => !i.adminOnly || isAdmin)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center no-print z-40"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -1px 8px rgba(0,0,0,0.08)',
      }}
    >
      {items.map(item => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors"
            style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            {item.highlight ? (
              <div
                className="w-10 h-10 -mt-5 rounded-full flex items-center justify-center text-lg font-bold transition-all"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #00D9D9, #35F5FF)'
                    : 'var(--secondary-bg)',
                  color: isActive ? '#0F172A' : 'var(--text-secondary)',
                  border: isActive ? 'none' : '1px solid var(--border)',
                  boxShadow: isActive ? '0 4px 12px rgba(0,217,217,0.35)' : 'none',
                }}
              >
                {item.icon}
              </div>
            ) : (
              <span className="text-lg leading-none">{item.icon}</span>
            )}
            <span className="text-[10px] font-medium leading-none" style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
