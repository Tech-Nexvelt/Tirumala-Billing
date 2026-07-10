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
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            {item.highlight ? (
              <div
                className="w-12 h-12 -mt-6 rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
                style={{ background: 'linear-gradient(135deg, #00D9D9, #35F5FF)', color: '#0F172A' }}
              >
                {item.icon}
              </div>
            ) : (
              <span className="text-lg leading-none">{item.icon}</span>
            )}
            {!item.highlight && (
              <span className="text-xs">{item.label}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
