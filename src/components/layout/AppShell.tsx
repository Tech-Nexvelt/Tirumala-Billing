'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useBillingStore } from '@/store/billingStore'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLg, setIsLg] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const { store } = useAuth()
  const { addItem } = useBillingStore()
  const supabase = createClient()

  // Poll the local offline-friendly mobile scan queue globally
  useEffect(() => {
    if (!store?.id) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mobile-scan?store_id=${store.id}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.barcodes && data.barcodes.length > 0) {
          for (const barcode of data.barcodes) {
            console.log('[Global Scan] Mobile scan resolved:', barcode)
            
            // Perform barcode lookup
            const { data: products, error } = await supabase
              .from('products')
              .select('*, categories(name)')
              .eq('barcode', barcode.trim().toUpperCase())
              .eq('status', 'active')
              .is('deleted_at', null)
              .limit(1)

            if (error) throw error

            const product = products?.[0]
            if (product) {
              // Add to global Zustand billing store
              addItem({
                product_id: product.id,
                product_name: product.name,
                product_sku: product.sku,
                product_barcode: product.barcode,
                quantity: 1,
                unit_price: product.selling_price,
                discount_percent: 0,
              })

              toast.success(`Added ${product.name} to bill`, { duration: 3000 })

              // Navigate to the billing page if not already there
              if (pathname !== '/billing/new') {
                router.push('/billing/new')
              }
            } else {
              toast.error(`Scanned product not found: ${barcode}`)
            }
          }
        }
      } catch (err) {
        console.error('[Global Scan Error]', err)
      }
    }, 1000) // Poll every 1 second for instant response

    return () => clearInterval(interval)
  }, [store?.id, pathname, router, addItem, supabase])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsLg(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const marginLeft = isLg ? (sidebarCollapsed ? '64px' : '240px') : '0'

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content area */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft }}
      >
        {/* Top bar */}
        <TopBar sidebarCollapsed={sidebarCollapsed} />

        {/* Page content */}
        <main
          className="flex-1 overflow-auto"
          style={{ paddingBottom: '80px' }}
        >
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
