'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useProducts, useDeleteProduct, useCategories } from '@/hooks/useProducts'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { BarcodePreview } from '@/components/products/BarcodePreview'
import { toast } from 'sonner'

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkPrint, setShowBulkPrint] = useState(false)

  const { data: products = [], isLoading } = useProducts({
    search, category_id: categoryFilter, status: statusFilter,
  })
  const { data: categories = [] } = useCategories()
  const deleteProduct = useDeleteProduct()

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === products.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(products.map(p => p.id)))
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return
    await deleteProduct.mutateAsync(id)
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Products</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {products.length} product{products.length !== 1 ? 's' : ''} in catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkPrint(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium"
              style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              🖨️ Print {selectedIds.size} Barcodes
            </button>
          )}
          <Link
            href="/products/new"
            id="add-product-btn"
            className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #00D9D9, #35F5FF)', color: '#0F172A' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-3 p-4 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, SKU, barcode..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="h-9 px-3 rounded-lg text-sm outline-none"
          style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg text-sm outline-none"
          style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '780px' }}>
            <thead>
              <tr style={{ background: 'var(--secondary-bg)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" checked={selectedIds.size === products.length && products.length > 0}
                    onChange={toggleAll} className="rounded" />
                </th>
                {['Product', 'SKU', 'Category', 'Selling Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-4 rounded" style={{ width: j === 1 ? '140px' : '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      {search ? 'No products match your search' : 'No products yet'}
                    </p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      {search ? 'Try a different search term' : 'Add your first product to start billing'}
                    </p>
                    {!search && (
                      <Link
                        href="/products/new"
                        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg, #00D9D9, #35F5FF)', color: '#0F172A' }}
                      >
                        + Add First Product
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr
                    key={product.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="group transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: 'rgba(0,217,217,0.1)', color: 'var(--primary)' }}
                        >
                          {product.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{product.barcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{product.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {product.category_name ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold font-number" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(product.selling_price)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-medium"
                        style={{ color: product.stock_qty === 0 ? 'var(--error)' : product.stock_qty < 5 ? 'var(--warning)' : 'var(--success)' }}
                      >
                        {product.stock_qty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={product.status === 'active'
                          ? { background: 'var(--success-bg)', color: 'var(--success)' }
                          : { background: 'var(--secondary-bg)', color: 'var(--text-muted)' }
                        }
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="text-xs font-medium hover:underline"
                          style={{ color: 'var(--primary)' }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-xs hover:underline"
                          style={{ color: 'var(--error)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk print dialog placeholder */}
      {showBulkPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Print {selectedIds.size} Barcode{selectedIds.size > 1 ? 's' : ''}
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Selected products barcode labels will be printed.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { window.print(); setShowBulkPrint(false) }}
                className="flex-1 h-10 rounded-lg font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #00D9D9, #35F5FF)', color: '#0F172A' }}
              >
                Print Now
              </button>
              <button onClick={() => setShowBulkPrint(false)}
                className="flex-1 h-10 rounded-lg font-medium text-sm"
                style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
