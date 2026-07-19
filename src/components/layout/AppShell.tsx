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

  // Listen to mobile scan events globally via Supabase Realtime (No HTTP polling)
  useEffect(() => {
    if (!store?.id) return

    // Don't register duplicate listener if already on /billing/new (which has its own queue handler)
    if (pathname === '/billing/new') return

    const channel = supabase.channel(`store_scans:${store.id}`, {
      config: { broadcast: { self: false, ack: false } }
    })

    channel
      .on('broadcast', { event: 'new_scan' }, async (payload: any) => {
        const { barcode, sku, seqId } = payload.payload || {}
        const code = sku || barcode
        if (!code) return

        console.log('[Global Scan] Mobile scan event received:', code)

        try {
          const cleanCode = code.trim().toUpperCase()
          const { data: products, error } = await supabase
            .from('products')
            .select('*, categories(name)')
            .or(`sku.ilike.${cleanCode},barcode.ilike.${cleanCode},id.eq.${cleanCode}`)
            .eq('status', 'active')
            .is('deleted_at', null)
            .limit(1)

          if (error) throw error

          const product = products?.[0]
          if (product) {
            addItem({
              product_id: product.id,
              product_name: product.name,
              product_sku: product.sku,
              product_barcode: product.barcode,
              quantity: 1,
              unit_price: product.selling_price,
              discount_percent: 0,
            })

            toast.success(`Scanned: ${product.name}`, { duration: 3000 })

            if (pathname !== '/billing/new') {
              router.push('/billing/new')
            }

            if (seqId) {
              channel.send({
                type: 'broadcast',
                event: 'ack',
                payload: { seqId, status: 'success', productName: product.name, sku: product.sku }
              })
            }
          } else {
            toast.error(`Product not found: ${code}`)
          }
        } catch (err) {
          console.error('[Global Scan Error]', err)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
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
      <div className="hidden lg:block no-print">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content area */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300 print:!ml-0 print:!p-0 print:!static print:w-full"
        style={{ marginLeft }}
      >
        {/* Top bar */}
        <div className="no-print">
          <TopBar sidebarCollapsed={sidebarCollapsed} />
        </div>

        {/* Page content */}
        <main
          className="flex-1 overflow-auto print:!p-0 print:!m-0 print:!overflow-visible print:w-full"
          style={{ paddingBottom: '80px' }}
        >
          <div className="animate-fade-in print:!p-0 print:!m-0 print:w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden no-print">
        <MobileNav />
      </div>
    </div>
  )
}
