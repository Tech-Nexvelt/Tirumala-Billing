'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useProducts, useDeleteProduct, useCategories } from '@/hooks/useProducts'
import { formatCurrency } from '@/lib/utils/currency'
import { useLabelConfig } from '@/hooks/useLabelConfig'
import { LabelPrintModal } from '@/components/products/labels/LabelPrintModal'
import { LabelCustomizerModal } from '@/components/products/labels/LabelCustomizerModal'
import { LabelHistoryModal } from '@/components/products/labels/LabelHistoryModal'
import type { PrintableProduct } from '@/types/label'
import { toast } from 'sonner'

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modal controls
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedProductsForPrint, setSelectedProductsForPrint] = useState<PrintableProduct[]>([])

  const { config, updateConfig, resetConfig } = useLabelConfig()

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

  // Label Printing Handlers
  const handlePrintSingle = (product: PrintableProduct) => {
    setSelectedProductsForPrint([product])
    setPrintModalOpen(true)
  }

  const handlePrintBatchSelected = () => {
    const list = products.filter(p => selectedIds.has(p.id))
    if (list.length === 0) {
      toast.error('Select at least one product to print labels')
      return
    }
    setSelectedProductsForPrint(list)
    setPrintModalOpen(true)
  }

  const handlePrintLowStock = () => {
    const lowStockList = products.filter(p => p.stock_qty < 5)
    if (lowStockList.length === 0) {
      toast.info('No low stock products found (< 5 qty)')
      return
    }
    setSelectedProductsForPrint(lowStockList)
    setPrintModalOpen(true)
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Products Catalog</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {products.length} product{products.length !== 1 ? 's' : ''} in catalog
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handlePrintBatchSelected}
              className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold shadow-sm transition-all"
              style={{ background: 'var(--primary)', color: '#0F172A' }}
            >
              🏷️ Print {selectedIds.size} Selected Label{selectedIds.size > 1 ? 's' : ''}
            </button>
          )}

          <button
            onClick={handlePrintLowStock}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--secondary-bg)', color: 'var(--warning)', border: '1px solid var(--border)' }}
          >
            ⚠️ Low Stock Labels
          </button>

          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium"
            style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            📜 History
          </button>

          <button
            onClick={() => setCustomizerOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium"
            style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            ⚙️ Label Customizer
          </button>

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
          <table className="w-full" style={{ minWidth: '820px' }}>
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
                        <button
                          onClick={() => handlePrintSingle(product)}
                          className="px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all"
                          style={{ background: 'rgba(0,217,217,0.12)', color: 'var(--primary)' }}
                        >
                          🏷️ Label
                        </button>
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="text-xs font-medium hover:underline"
                          style={{ color: 'var(--text-secondary)' }}
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

      {/* PRINT MODAL */}
      <LabelPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        products={selectedProductsForPrint}
        config={config}
        onUpdateConfig={updateConfig}
        onOpenCustomizer={() => setCustomizerOpen(true)}
      />

      {/* CUSTOMIZER MODAL */}
      <LabelCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        config={config}
        onUpdateConfig={updateConfig}
        onResetConfig={resetConfig}
      />

      {/* AUDIT LOG HISTORY MODAL */}
      <LabelHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  )
}
