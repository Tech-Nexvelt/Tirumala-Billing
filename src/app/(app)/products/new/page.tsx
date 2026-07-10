'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateProduct, useCategories } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { generateSKU, generateBarcode, validateBarcode, validateSKU } from '@/lib/utils/sku'
import { BarcodePreview } from '@/components/products/BarcodePreview'
import { toast } from 'sonner'

export default function NewProductPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const createProduct = useCreateProduct()
  const { data: categories = [] } = useCategories()

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    purchase_price: '',
    selling_price: '',
    stock_qty: '0',
    sku: '',
    barcode: '',
    status: 'active',
  })
  const [skuManual, setSkuManual] = useState(false)
  const [barcodeManual, setBarcodeManual] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-generate SKU when name/category changes
  useEffect(() => {
    if (!skuManual && form.name.length >= 3) {
      const catName = categories.find(c => c.id === form.category_id)?.name
      const sku = generateSKU(form.name, catName)
      setForm(p => ({ ...p, sku }))
    }
  }, [form.name, form.category_id, skuManual, categories])

  // Auto-generate barcode when SKU changes
  useEffect(() => {
    if (!barcodeManual && form.sku.length >= 3) {
      const bc = generateBarcode(form.sku)
      setForm(p => ({ ...p, barcode: bc }))
    }
  }, [form.sku, barcodeManual])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (!form.selling_price || isNaN(parseFloat(form.selling_price))) errs.selling_price = 'Valid selling price required'
    if (parseFloat(form.selling_price) < 0) errs.selling_price = 'Price cannot be negative'
    if (!form.sku.trim()) errs.sku = 'SKU is required'
    if (!validateSKU(form.sku)) errs.sku = 'SKU can only contain letters, numbers, and hyphens'
    if (!form.barcode.trim()) errs.barcode = 'Barcode is required'
    if (!validateBarcode(form.barcode)) errs.barcode = 'Invalid barcode format'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    await createProduct.mutateAsync({
      store_id: profile?.store_id || '',
      name: form.name.trim(),
      category_id: form.category_id || undefined,
      description: form.description || null,
      purchase_price: parseFloat(form.purchase_price) || 0,
      selling_price: parseFloat(form.selling_price),
      stock_qty: parseInt(form.stock_qty) || 0,
      sku: form.sku.trim().toUpperCase(),
      barcode: form.barcode.trim().toUpperCase(),
      status: form.status as 'active' | 'inactive',
      created_by: user?.id,
    })

    router.push('/products')
  }

  const inputClass = "w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
  const inputStyle = {
    background: 'var(--secondary-bg)',
    border: '1.5px solid var(--border)',
    color: 'var(--text-primary)',
  }
  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--primary)'
    e.target.style.boxShadow = '0 0 0 3px rgba(0,217,217,0.1)'
  }
  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm mb-3"
          style={{ color: 'var(--text-secondary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Products
        </button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Add New Product</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          SKU and barcode are auto-generated. You can customise them if needed.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Product details */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className="p-5 rounded-xl space-y-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Product Information</h2>

              <Field label="Product Name *" error={errors.name}>
                <input
                  type="text" autoFocus required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. 3-Seater Fabric Sofa"
                  className={inputClass} style={{ ...inputStyle, borderColor: errors.name ? 'var(--error)' : 'var(--border)' }}
                  onFocus={inputFocus} onBlur={inputBlur}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                    className={inputClass} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="">No Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className={inputClass} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Optional product description"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
                />
              </Field>
            </div>

            {/* Pricing & Stock */}
            <div
              className="p-5 rounded-xl space-y-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Pricing & Stock</h2>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Purchase Price">
                  <div className="flex items-center gap-1">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>₹</span>
                    <input type="number" min="0" value={form.purchase_price}
                      onChange={e => setForm(p => ({ ...p, purchase_price: e.target.value }))}
                      placeholder="0" className={inputClass} style={inputStyle}
                      onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                </Field>
                <Field label="Selling Price *" error={errors.selling_price}>
                  <div className="flex items-center gap-1">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>₹</span>
                    <input type="number" min="0" required value={form.selling_price}
                      onChange={e => setForm(p => ({ ...p, selling_price: e.target.value }))}
                      placeholder="0"
                      className={inputClass}
                      style={{ ...inputStyle, borderColor: errors.selling_price ? 'var(--error)' : 'var(--border)' }}
                      onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                </Field>
                <Field label="Stock Qty">
                  <input type="number" min="0" value={form.stock_qty}
                    onChange={e => setForm(p => ({ ...p, stock_qty: e.target.value }))}
                    placeholder="0" className={inputClass} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </Field>
              </div>
            </div>

            {/* SKU & Barcode */}
            <div
              className="p-5 rounded-xl space-y-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>SKU & Barcode</h2>

              <Field label="SKU *" error={errors.sku} hint="Auto-generated from product name. Must be unique.">
                <div className="flex gap-2">
                  <input type="text" required value={form.sku}
                    onChange={e => { setSkuManual(true); setForm(p => ({ ...p, sku: e.target.value.toUpperCase() })) }}
                    placeholder="e.g. SOF-ABC123"
                    className={`${inputClass} flex-1 font-mono`}
                    style={{ ...inputStyle, borderColor: errors.sku ? 'var(--error)' : 'var(--border)' }}
                    onFocus={inputFocus} onBlur={inputBlur} />
                  <button type="button" onClick={() => { setSkuManual(false); setForm(p => ({ ...p, sku: '' })) }}
                    className="h-10 px-3 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Regenerate
                  </button>
                </div>
              </Field>

              <Field label="Barcode *" error={errors.barcode} hint="Code128 format. Auto-generated from SKU. Must be unique.">
                <div className="flex gap-2">
                  <input type="text" required value={form.barcode}
                    onChange={e => { setBarcodeManual(true); setForm(p => ({ ...p, barcode: e.target.value.toUpperCase() })) }}
                    placeholder="e.g. TFSOF-ABC12301"
                    className={`${inputClass} flex-1 font-mono`}
                    style={{ ...inputStyle, borderColor: errors.barcode ? 'var(--error)' : 'var(--border)' }}
                    onFocus={inputFocus} onBlur={inputBlur} />
                  <button type="button" onClick={() => { setBarcodeManual(false); setForm(p => ({ ...p, barcode: '' })) }}
                    className="h-10 px-3 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Regenerate
                  </button>
                </div>
              </Field>
            </div>
          </div>

          {/* Right: Barcode preview + actions */}
          <div className="space-y-4">
            <div
              className="p-5 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Barcode Preview</h2>
              <BarcodePreview value={form.barcode} height={70} />
              {form.barcode && (
                <div className="mt-3 text-center">
                  <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>{form.barcode}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Code128</p>
                </div>
              )}
            </div>

            {/* Price summary */}
            {form.selling_price && (
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(0,217,217,0.06)', border: '1px solid rgba(0,217,217,0.15)' }}
              >
                <p className="text-xs mb-2" style={{ color: 'var(--primary)' }}>Price Summary</p>
                {form.purchase_price && (
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>Purchase</span>
                    <span style={{ color: 'var(--text-primary)' }}>₹{parseFloat(form.purchase_price).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Selling</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>₹{parseFloat(form.selling_price).toLocaleString('en-IN')}</span>
                </div>
                {form.purchase_price && parseFloat(form.selling_price) > parseFloat(form.purchase_price) && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Margin</span>
                    <span style={{ color: 'var(--success)' }}>
                      {(((parseFloat(form.selling_price) - parseFloat(form.purchase_price)) / parseFloat(form.purchase_price)) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={createProduct.isPending}
              className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{
                background: createProduct.isPending ? 'var(--secondary-bg)' : 'linear-gradient(135deg, #00D9D9, #35F5FF)',
                color: createProduct.isPending ? 'var(--text-disabled)' : '#0F172A',
                cursor: createProduct.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {createProduct.isPending ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg> Saving...</>
              ) : '✓ Create Product'}
            </button>
            <button type="button" onClick={() => router.back()}
              className="w-full h-10 rounded-xl font-medium text-sm"
              style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
  hint?: string
}

function Field({ label, error, children, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      {error && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{error}</p>}
    </div>
  )
}
