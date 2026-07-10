'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBillingStore } from '@/store/billingStore'
import type { Product } from '@/types/database'
import { toast } from 'sonner'

export type ScanState = 'idle' | 'scanning' | 'success' | 'error'

interface UseBarcodeScanOptions {
  onProductFound?: (product: Product) => void
  onProductNotFound?: (barcode: string) => void
  autoFocus?: boolean
}

export function useBarcodeScan(options: UseBarcodeScanOptions = {}) {
  const { onProductFound, onProductNotFound, autoFocus = true } = options

  const [scanValue, setScanValue] = useState('')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { addItem } = useBillingStore()

  // Auto-focus management
  const focus = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  // Refocus when window regains focus
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

  const lookupBarcode = useCallback(async (barcode: string) => {
    if (!barcode.trim()) return

    setIsSearching(true)
    setScanState('scanning')

    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('barcode', barcode.trim().toUpperCase())
        .eq('status', 'active')
        .is('deleted_at', null)
        .limit(1)

      if (error) throw error

      const product = products?.[0] as Product | undefined

      if (product) {
        // Add to bill (handles duplicate: increments qty)
        addItem({
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          product_barcode: product.barcode,
          quantity: 1,
          unit_price: product.selling_price,
          discount_percent: 0,
        })

        setScanState('success')
        onProductFound?.(product)

        // Success flash then back to idle
        setTimeout(() => {
          setScanState('idle')
          setScanValue('')
          focus()
        }, 600)

      } else {
        setScanState('error')
        toast.error(`Product not found: ${barcode}`, { duration: 2000 })
        onProductNotFound?.(barcode)

        setTimeout(() => {
          setScanState('idle')
          setScanValue('')
          focus()
        }, 1500)
      }
    } catch (err) {
      console.error('[Barcode scan error]', err)
      setScanState('error')
      toast.error('Scan failed. Please try again.')
      setTimeout(() => {
        setScanState('idle')
        setScanValue('')
        focus()
      }, 1500)
    } finally {
      setIsSearching(false)
    }
  }, [supabase, addItem, focus, onProductFound, onProductNotFound])

  const handleChange = useCallback((value: string) => {
    setScanValue(value)
    setScanState('idle')
  }, [])

  const handleSubmit = useCallback((value: string) => {
    if (!value.trim()) return
    lookupBarcode(value.trim())
  }, [lookupBarcode])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(scanValue)
    }
    // Prevent Tab from leaving the scanner
    if (e.key === 'Tab') {
      e.preventDefault()
      focus()
    }
  }, [scanValue, handleSubmit, focus])

  return {
    scanValue,
    scanState,
    isSearching,
    inputRef,
    focus,
    handleChange,
    handleKeyDown,
    handleSubmit,
    setScanValue,
  }
}
