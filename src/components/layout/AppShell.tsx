'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useBillingStore } from '@/store/billingStore'
import { useProductCacheStore } from '@/store/productCacheStore'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FeedbackService } from '@/services/feedbackService'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLg, setIsLg] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const { store, profile, user, isLoading } = useAuth()
  const { addItem } = useBillingStore()
  const { products, fetchProducts, syncProduct } = useProductCacheStore()
  const supabase = createClient()

  // ── Auth Guard for Client-Side Navigation ────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !user) {
      const publicRoutes = ['/login', '/forgot-password', '/register', '/scanner']
      if (!publicRoutes.some(r => pathname.startsWith(r))) {
        router.replace('/login')
      }
    }
  }, [isLoading, user, pathname, router])

  // ── Dynamic Customer Brand Browser Title Switch ──────────────────────────────
  useEffect(() => {
    if (store?.name) {
      const pageTitle = pathname.startsWith('/billing/new')
        ? 'New Bill'
        : pathname.startsWith('/bills')
        ? 'Bill History'
        : pathname.startsWith('/products')
        ? 'Products'
        : pathname.startsWith('/settings')
        ? 'Settings'
        : 'Dashboard'
      document.title = `${pageTitle} | ${store.name}`
    }
  }, [store?.name, pathname])

  const storeId = store?.id || profile?.store_id

  // ── Prefetch Product Cache ──────────────────────────────────────────────────
  useEffect(() => {
    if (storeId) {
      fetchProducts(storeId)
    }
  }, [storeId, fetchProducts])

  // ── Unified Commercial POS Global Mobile Scanner Listener ───────────────────
  useEffect(() => {
    if (!storeId) return

    console.log(`[POS Realtime] Subscribing desktop to store_scans:${storeId}`)

    const channel = supabase.channel(`store_scans:${storeId}`, {
      config: { broadcast: { self: true, ack: true } }
    })

    channel
      .on('broadcast', { event: 'new_scan' }, async (payload: any) => {
        const pData = payload?.payload || {}
        const code = pData.product_code || pData.barcode || pData.sku
        const seqId = pData.event_id || pData.seqId

        if (!code) return

        console.log(`[POS Realtime Event] Received scan code: "${code}", Event ID: "${seqId}"`)

        try {
          const cleanCode = code.trim().toUpperCase()

          // 1. Fast Memory Cache Lookup (<2ms)
          let product = products.find(p =>
            p.sku?.toUpperCase() === cleanCode ||
            (p.barcode && p.barcode.toUpperCase() === cleanCode) ||
            p.id === cleanCode
          )

          // 2. DB Query Fallback if not in memory cache
          if (!product) {
            console.log(`[POS Realtime] Cache miss for "${cleanCode}", querying Supabase DB...`)
            const { data: dbProducts, error } = await supabase
              .from('products')
              .select('*, categories(name)')
              .or(`sku.ilike.${cleanCode},barcode.ilike.${cleanCode},id.eq.${cleanCode}`)
              .eq('status', 'active')
              .is('deleted_at', null)
              .limit(1)

            if (!error && dbProducts && dbProducts.length > 0) {
              product = dbProducts[0]
              syncProduct(dbProducts[0])
            }
          }

          if (product) {
            console.log(`[POS Realtime Success] Adding "${product.name}" to cart`)

            // Add product to bill cart (automatically increments qty if already present)
            addItem({
              product_id: product.id,
              product_name: product.name,
              product_sku: product.sku,
              product_barcode: product.barcode || null,
              quantity: 1,
              unit_price: product.selling_price,
              discount_percent: 0,
            })

            FeedbackService.triggerSuccess()
            toast.success(`Scanned: ${product.name} — Added to Bill`, { duration: 3000 })

            // Auto-navigate to New Bill page if cashier is currently on another screen
            if (pathname !== '/billing/new') {
              router.push('/billing/new')
            }

            // Send ACK broadcast back to mobile phone to mark outbox item as 'synced'
            if (seqId) {
              await channel.send({
                type: 'broadcast',
                event: 'ack',
                payload: {
                  seqId,
                  event_id: seqId,
                  status: 'success',
                  productName: product.name,
                  sku: product.sku,
                }
              })
            }
          } else {
            console.warn(`[POS Realtime Warning] Product not found for code: "${code}"`)
            FeedbackService.triggerError()
            toast.error(`Scanned product not found: ${code}`)

            if (seqId) {
              await channel.send({
                type: 'broadcast',
                event: 'ack',
                payload: {
                  seqId,
                  event_id: seqId,
                  status: 'not_found',
                  errorMessage: `Product not found: ${code}`,
                }
              })
            }
          }
        } catch (err) {
          console.error('[POS Realtime Error] Exception handling scan payload:', err)
        }
      })
      .subscribe(async (status) => {
        console.log(`[POS Realtime Channel Status] store_scans:${storeId} -> ${status}`)
        if (status === 'SUBSCRIBED') {
          await channel.track({ device: 'desktop', online_at: new Date().toISOString() })
        }
      })

    return () => {
      console.log(`[POS Realtime] Unsubscribing desktop from store_scans:${storeId}`)
      channel.unsubscribe()
    }
  }, [storeId, pathname, router, addItem, supabase, products, syncProduct])

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
