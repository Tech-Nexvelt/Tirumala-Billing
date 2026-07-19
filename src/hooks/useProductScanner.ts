'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBillingStore } from '@/store/billingStore'
import { useAuth } from '@/hooks/useAuth'
import type { Product } from '@/types/database'
import type { ScannerState } from '@/types/scanner'
import { FeedbackService } from '@/services/feedbackService'
import { ProductCodeService } from '@/services/productCodeService'
import { toast } from 'sonner'

const codeService = new ProductCodeService()

interface UseProductScannerOptions {
  onProductFound?: (product: Product) => void
  onProductNotFound?: (code: string) => void
  autoFocus?: boolean
}

export function useProductScanner(options: UseProductScannerOptions = {}) {
  const { onProductFound, onProductNotFound, autoFocus = true } = options
  const { store } = useAuth()

  const [scanValue, setScanValue] = useState('')
  const [scannerState, setScannerState] = useState<ScannerState>('READY')
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // In-memory Product Cache Map to eliminate redundant DB lookups on repeated scans
  const productCacheRef = useRef<Map<string, Product>>(new Map())

  const supabase = createClient()
  const { addItem } = useBillingStore()

  // Auto-focus management
  const focus = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  useEffect(() => {
    if (!autoFocus) return
    focus()
    const handleFocus = () => focus()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [autoFocus, focus])

  // F2 keyboard shortcut to refocus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [focus])

  // High-performance Product Lookup Pipeline (Cache -> DB Fallback)
  const lookupCode = useCallback(async (rawCode: string, seqId?: string, channel?: any) => {
    const cleanCode = codeService.normalize(rawCode)
    if (!cleanCode) return

    setIsSearching(true)
    setScannerState('PROCESSING')

    try {
      let product: Product | undefined

      // Step 1: Check in-memory cache
      if (productCacheRef.current.has(cleanCode)) {
        product = productCacheRef.current.get(cleanCode)
      } else {
        // Step 2: DB Fallback query
        const { data: products, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .or(`sku.ilike.${cleanCode},barcode.ilike.${cleanCode},id.eq.${cleanCode}`)
          .eq('status', 'active')
          .is('deleted_at', null)
          .limit(1)

        if (error) throw error

        product = products?.[0] as Product | undefined
        if (product) {
          productCacheRef.current.set(cleanCode, product)
          if (product.sku) productCacheRef.current.set(product.sku.toUpperCase(), product)
          if (product.barcode) productCacheRef.current.set(product.barcode.toUpperCase(), product)
        }
      }

      if (product) {
        // Add to bill (handles duplicates by auto-incrementing quantity)
        addItem({
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          product_barcode: product.barcode,
          quantity: 1,
          unit_price: product.selling_price,
          discount_percent: 0,
        })

        setScannerState('SUCCESS')
        FeedbackService.triggerSuccess()
        toast.success(`Scanned: ${product.name}`, {
          description: `SKU: ${product.sku} • Price: ₹${product.selling_price.toLocaleString('en-IN')}`,
          duration: 2500,
        })

        onProductFound?.(product)

        // Send ACK back to mobile phone scanner if scan came via Realtime
        if (seqId && channel) {
          channel.send({
            type: 'broadcast',
            event: 'ack',
            payload: { seqId, status: 'success', productName: product.name, sku: product.sku }
          })
        }

        setTimeout(() => {
          setScannerState('READY')
          setScanValue('')
          focus()
        }, 500)

      } else {
        setScannerState('ERROR')
        FeedbackService.triggerError()
        toast.error(`Product not found: ${cleanCode}`, { duration: 2500 })
        onProductNotFound?.(cleanCode)

        if (seqId && channel) {
          channel.send({
            type: 'broadcast',
            event: 'ack',
            payload: { seqId, status: 'not_found', errorMessage: 'Product not found in catalog' }
          })
        }

        setTimeout(() => {
          setScannerState('READY')
          setScanValue('')
          focus()
        }, 1200)
      }
    } catch (err) {
      console.error('[Product Scanner Error]', err)
      setScannerState('ERROR')
      FeedbackService.triggerError()
      toast.error('Product lookup failed')
      setTimeout(() => {
        setScannerState('READY')
        setScanValue('')
        focus()
      }, 1200)
    } finally {
      setIsSearching(false)
    }
  }, [supabase, addItem, focus, onProductFound, onProductNotFound])

  // Supabase Realtime Listener for Mobile Scans
  useEffect(() => {
    if (!store?.id) return

    const storeId = store.id
    const channel = supabase.channel(`store_scans:${storeId}`, {
      config: { broadcast: { self: false, ack: false } }
    })

    channel
      .on('broadcast', { event: 'new_scan' }, (payload: any) => {
        const { barcode, sku, seqId } = payload.payload || {}
        const targetCode = sku || barcode
        if (targetCode) {
          lookupCode(targetCode, seqId, channel)
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ device: 'desktop', online_at: new Date().toISOString() })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [store?.id, supabase, lookupCode])

  const handleChange = useCallback((value: string) => {
    setScanValue(value)
    setScannerState('READY')
  }, [])

  const handleSubmit = useCallback((value: string) => {
    if (!value.trim()) return
    lookupCode(value.trim())
  }, [lookupCode])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(scanValue)
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      focus()
    }
  }, [scanValue, handleSubmit, focus])

  return {
    scanValue,
    scannerState,
    scanState: scannerState === 'SUCCESS' ? 'success' : scannerState === 'ERROR' ? 'error' : scannerState === 'PROCESSING' ? 'scanning' : 'idle',
    isSearching,
    inputRef,
    focus,
    handleChange,
    handleKeyDown,
    handleSubmit,
    setScanValue,
  }
}
