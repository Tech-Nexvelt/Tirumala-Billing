'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBillingStore } from '@/store/billingStore'
import type { Product } from '@/types/database'
import { formatCurrency } from '@/lib/utils/currency'
import { debounce } from '@/lib/utils'

interface SearchProductDialogProps {
  open: boolean
  onClose: () => void
}

export function SearchProductDialog({ open, onClose }: SearchProductDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { addItem } = useBillingStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const search = debounce(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setIsSearching(true)
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .is('deleted_at', null)
        .or(`name.ilike.%${q}%,sku.ilike.%${q}%,barcode.ilike.%${q}%`)
        .limit(20)
      setResults((data ?? []) as Product[])
    } catch { setResults([]) } finally { setIsSearching(false) }
  }, 200)

  useEffect(() => { search(query) }, [query])

  function addProduct(product: Product) {
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      product_barcode: product.barcode,
      quantity: 1,
      unit_price: product.selling_price,
      discount_percent: 0,
    })
    onClose()
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-in-up"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 p-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search by product name, SKU, or barcode..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />
          {isSearching ? (
            <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary)' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
            </svg>
          ) : (
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {query.length < 2 ? (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Type at least 2 characters to search</p>
            </div>
          ) : results.length === 0 && !isSearching ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No products found</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Try searching by a different name, SKU, or barcode</p>
            </div>
          ) : (
            results.map(product => (
              <button
                key={product.id}
                onClick={() => addProduct(product)}
                className="w-full flex items-center gap-3 p-4 transition-colors text-left"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* Icon placeholder */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{ background: 'rgba(0,217,217,0.1)', color: 'var(--primary)' }}
                >
                  {product.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {product.name}
                  </p>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    SKU: {product.sku} · {product.barcode}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold font-number" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(product.selling_price)}
                  </p>
                  <p className="text-xs" style={{ color: product.stock_qty > 0 ? 'var(--success)' : 'var(--error)' }}>
                    {product.stock_qty > 0 ? `${product.stock_qty} in stock` : 'Out of stock'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-between text-xs"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--secondary-bg)', color: 'var(--text-muted)' }}
        >
          <span>Click product to add to bill · ESC to close</span>
          {results.length > 0 && <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>}
        </div>
      </div>
    </div>
  )
}
