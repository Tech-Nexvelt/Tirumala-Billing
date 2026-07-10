'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import { useBillingStore } from '@/store/billingStore'
import { useBarcodeScan } from '@/hooks/useBarcodeScan'
import { useCreateInvoice } from '@/hooks/useInvoices'
import { useAuth } from '@/hooks/useAuth'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { formatCurrency } from '@/lib/utils/currency'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { BarcodeInput } from '@/components/billing/BarcodeInput'
import { InvoiceTable } from '@/components/billing/InvoiceTable'
import { InvoiceSummary } from '@/components/billing/InvoiceSummary'
import { CustomerPanel } from '@/components/billing/CustomerPanel'
import { PaymentPanel } from '@/components/billing/PaymentPanel'
import { SearchProductDialog } from '@/components/billing/SearchProductDialog'
import { SavedInvoiceDialog } from '@/components/billing/SavedInvoiceDialog'
import { createClient } from '@/lib/supabase/client'
import { useProductCacheStore } from '@/store/productCacheStore'
import { FeedbackService } from '@/services/feedbackService'

export default function NewBillPage() {
  const router = useRouter()
  const {
    items,
    customer,
    payment_method,
    split_payments,
    amount_tendered,
    delivery_charge,
    installation_charge,
    additional_discount,
    notes,
    summary,
    isDirty,
    lastSavedAt,
    clearBill,
  } = useBillingStore()

  const { store, user, profile } = useAuth()
  const createInvoice = useCreateInvoice()

  const [showSearch, setShowSearch] = useState(false)
  const [showMobileScan, setShowMobileScan] = useState(false)
  const [mobileScanUrl, setMobileScanUrl] = useState('')
  const [savedInvoice, setSavedInvoice] = useState<{ id: string; number: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { products, fetchProducts, syncProduct } = useProductCacheStore()
  const { addItem } = useBillingStore()
  
  // Realtime scan queue variables
  const scanQueue = useRef<string[]>([])
  const processingQueue = useRef(false)
  const supabase = createClient()

  // Setup mobile scanner PWA url on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMobileScanUrl(`${window.location.origin}/scanner`)
    }
  }, [])

  // Process scans sequentially from FIFO queue to prevent state write-loss races
  const processQueue = async () => {
    if (processingQueue.current || scanQueue.current.length === 0) return
    processingQueue.current = true

    const barcode = scanQueue.current.shift()
    if (barcode) {
      try {
        // 1. Search Zustand Memory Cache (sub-millisecond)
        let product = products.find(p => p.barcode === barcode)

        // 2. Database Fallback lookup if not cached
        if (!product) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('barcode', barcode)
            .is('deleted_at', null)
            .eq('status', 'active')
            .single()

          if (!error && data) {
            product = data
            syncProduct(data) // update cache
          }
        }

        if (product) {
          // 3. Add item / update State
          addItem({
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            quantity: 1,
            unit_price: product.selling_price,
            discount_percent: 0
          })
          FeedbackService.triggerSuccess()
          toast.success(`Scanned: ${product.name}`)
        } else {
          FeedbackService.triggerError()
          toast.error(`Unknown barcode: ${barcode}`)
        }
      } catch (err) {
        console.error('[NewBillPage] Scan processing failed:', err)
      }
    }

    processingQueue.current = false
    processQueue() // execute next in queue
  }

  // Subscribe to Realtime scans using store_id context (implicit session linking)
  useEffect(() => {
    if (!store?.id) return

    // Warm Zustand cache with active products
    fetchProducts(store.id)

    const channel = supabase.channel(`store_scans:${store.id}`, {
      config: { broadcast: { self: false, ack: false } }
    })

    channel
      .on('broadcast', { event: 'new_scan' }, (payload: any) => {
        const { seqId, barcode } = payload.payload
        
        // Enqueue scan processing
        scanQueue.current.push(barcode)
        processQueue()

        // Respond with ACK confirmation back to phone immediately
        channel.send({
          type: 'broadcast',
          event: 'ack',
          payload: { seqId }
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track desktop register online state
          await channel.track({ device: 'desktop', online_at: new Date().toISOString() })
        }
      })

    // Listen for database changes to keep cached products completely in sync
    const dbSub = supabase
      .channel('postgres-product-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.new) {
          syncProduct(payload.new as any)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      dbSub.unsubscribe()
    }
  }, [store?.id, products.length])


  // Draft recovery notification
  useEffect(() => {
    if (isDirty && items.length > 0 && !lastSavedAt) {
      toast.info(`Draft recovered: ${items.length} item(s). Last session's bill restored.`, {
        id: 'draft-recovery',
        duration: 5000,
        action: {
          label: 'Clear',
          onClick: clearBill,
        },
      })
    }
  }, []) // Only on mount

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'p', ctrl: true,
      handler: () => setShowSearch(true),
      description: 'Open product search',
    },
    {
      key: 'n', ctrl: true,
      handler: () => {
        if (items.length > 0) {
          if (confirm('Start a new bill? Current bill will be cleared.')) clearBill()
        } else {
          clearBill()
        }
      },
      description: 'New bill',
    },
    {
      key: 's', ctrl: true,
      handler: () => { if (items.length > 0) handleSave('print') },
      description: 'Save & Print',
    },
  ])

  const handleSave = useCallback(async (action: 'print' | 'pdf' | 'save') => {
    if (!store?.id || !user?.id) {
      toast.error('Please sign in to save bills')
      return
    }
    if (items.length === 0) {
      toast.error('Add at least one product before saving')
      return
    }
    if (!customer.name || customer.name.trim() === '' || customer.name.trim() === 'Guest') {
      toast.error('Customer name is required')
      return
    }
    const cleanPhone = customer.phone ? customer.phone.trim() : ''
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('A valid 10-digit customer phone number is required')
      return
    }

    // Payment validation for split
    if (payment_method === 'split') {
      const splitTotal = split_payments.reduce((s, p) => s + p.amount, 0)
      if (Math.abs(splitTotal - summary.grand_total) > 0.5) {
        toast.error(`Split payment total (${formatCurrency(splitTotal)}) must equal Grand Total (${formatCurrency(summary.grand_total)})`)
        return
      }
    }

    setIsSaving(true)
    try {
      const result = await createInvoice.mutateAsync({
        store_id: store.id,
        customer,
        items,
        payment_method,
        split_payments,
        delivery_charge,
        installation_charge,
        additional_discount,
        amount_tendered,
        notes,
        summary,
        created_by: user.id,
      })

      setSavedInvoice({ id: result.invoice.id, number: result.invoice.invoice_number })
      clearBill()
      toast.success(`Invoice ${result.invoice.invoice_number} saved!`)

      if (action === 'print') {
        // Brief delay to let dialog render, then print
        setTimeout(() => window.print(), 300)
      }
    } catch {
      // Error toast handled in hook
    } finally {
      setIsSaving(false)
    }
  }, [store, user, items, customer, payment_method, split_payments, delivery_charge, installation_charge, additional_discount, amount_tendered, notes, summary, createInvoice, clearBill])

  const handleNewBill = useCallback(() => {
    if (items.length > 0) {
      if (!confirm('Start a new bill? Current bill items will be cleared.')) return
    }
    clearBill()
    setSavedInvoice(null)
  }, [items.length, clearBill])

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Top: Barcode Scanner Bar */}
      <div
        className="flex-shrink-0 px-4 py-3 no-print"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div className="max-w-screen-xl mx-auto flex items-center gap-3">
          {/* Bill title + item count */}
          <div className="hidden sm:block flex-shrink-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>New Bill</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Barcode input — center, dominant */}
          <div className="flex-1">
            <BarcodeInput />
          </div>

          {/* Search product fallback */}
          <button
            id="search-product-btn"
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 h-10 px-3.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
            style={{
              background: 'var(--secondary-bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
            title="Search product (Ctrl+P)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden md:inline text-xs px-1 py-0.5 rounded"
              style={{ background: 'var(--border)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Ctrl+P
            </kbd>
          </button>

          {/* Mobile Scanner trigger */}
          <button
            onClick={() => setShowMobileScan(true)}
            className="flex items-center gap-2 h-10 px-3.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
            style={{
              background: 'var(--secondary-bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
            title="Use phone as scanner"
          >
            📱 <span className="hidden sm:inline">Phone Scan</span>
          </button>

          {/* Clear bill */}
          {items.length > 0 && (
            <button
              onClick={handleNewBill}
              className="h-10 px-3 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
              style={{ color: 'var(--error)', background: 'var(--error-bg)', border: '1px solid rgba(239,68,68,0.2)' }}
              title="Clear bill (Ctrl+N)"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main content: Invoice + Summary */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Invoice table */}
        <div className="flex-1 overflow-auto">
          <InvoiceTable onSearchOpen={() => setShowSearch(true)} />
        </div>

        {/* Right: Customer + Summary + Payment (desktop) */}
        <div
          className="hidden lg:flex flex-col w-96 flex-shrink-0 overflow-y-auto no-print"
          style={{ borderLeft: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          {/* Customer */}
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <CustomerPanel />
          </div>

          {/* Summary */}
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <InvoiceSummary />
          </div>

          {/* Payment */}
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <PaymentPanel />
          </div>

          {/* Actions */}
          <div className="p-4 space-y-2 mt-auto">
            <button
              id="save-print-btn"
              onClick={() => handleSave('print')}
              disabled={isSaving || items.length === 0}
              className="w-full h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: items.length === 0 || isSaving
                  ? 'var(--secondary-bg)'
                  : 'linear-gradient(135deg, #00D9D9, #35F5FF)',
                color: items.length === 0 || isSaving ? 'var(--text-disabled)' : '#0F172A',
                cursor: items.length === 0 || isSaving ? 'not-allowed' : 'pointer',
                boxShadow: items.length > 0 && !isSaving ? '0 4px 14px rgba(0,217,217,0.35)' : 'none',
              }}
            >
              {isSaving ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg> Saving...</>
              ) : (
                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Save &amp; Print</>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSave('pdf')}
                disabled={isSaving || items.length === 0}
                className="h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
                style={{
                  background: 'var(--secondary-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                Download PDF
              </button>
              <button
                onClick={handleNewBill}
                className="h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
                style={{
                  background: 'var(--secondary-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Bill
              </button>
            </div>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Ctrl+S = Save &amp; Print · F2 = Focus Scanner
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: Bottom summary panel */}
      {items.length > 0 && (
        <div
          className="lg:hidden flex-shrink-0 p-4 no-print"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Grand Total</span>
            <span className="text-xl font-bold font-number" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(summary.grand_total)}
            </span>
          </div>
          <button
            onClick={() => handleSave('print')}
            disabled={isSaving}
            className="w-full h-12 rounded-xl font-bold text-base"
            style={{
              background: 'linear-gradient(135deg, #00D9D9, #35F5FF)',
              color: '#0F172A',
            }}
          >
            {isSaving ? 'Saving...' : 'Save & Print'}
          </button>
        </div>
      )}

      {/* Product Search Dialog */}
      <SearchProductDialog open={showSearch} onClose={() => setShowSearch(false)} />

      {/* Saved Invoice Dialog */}
      {savedInvoice && (
        <SavedInvoiceDialog
          invoiceId={savedInvoice.id}
          invoiceNumber={savedInvoice.number}
          onClose={() => {
            setSavedInvoice(null)
          }}
          onNewBill={() => {
            setSavedInvoice(null)
            clearBill()
          }}
        />
      )}

      {/* Mobile Scanner QR Code Dialog */}
      {showMobileScan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in no-print">
          <div
            className="w-full max-w-sm rounded-2xl p-6 relative shadow-2xl border border-slate-700/50"
            style={{ background: 'var(--surface)' }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowMobileScan(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Content */}
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl animate-pulse">
                📱
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Wireless Phone Scanner
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Scan the QR code below on your mobile device to open the dedicated scanner utility.
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-3.5 rounded-xl inline-block shadow-md">
                {mobileScanUrl ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mobileScanUrl)}`}
                    alt="Scanner Link QR Code"
                    className="w-44 h-44 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center bg-slate-100 rounded-lg">
                    <span className="text-xs text-slate-400">Loading URL...</span>
                  </div>
                )}
              </div>

              <div className="text-left bg-slate-900/40 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Instructions:</p>
                <p>1. Scan the QR code to open the scanner page on your phone.</p>
                <p>2. Log in using your cashier credentials (done once).</p>
                <p>3. Point the phone camera at product barcodes to instantly add them to this bill.</p>
                <p className="text-[10px] text-slate-500 mt-1">Direct link: {mobileScanUrl}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
