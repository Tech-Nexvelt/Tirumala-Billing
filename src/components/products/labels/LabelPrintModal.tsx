'use client'
import React, { useState, useEffect } from 'react'
import type { PrintableProduct, LabelConfig, LabelSize, TemplateId } from '@/types/label'
import { ProductLabel } from './ProductLabel'
import { logLabelPrintJob } from '@/services/labelAuditService'
import { toast } from 'sonner'

interface LabelPrintModalProps {
  isOpen: boolean
  onClose: () => void
  products: PrintableProduct[]
  config: LabelConfig
  onUpdateConfig: (updates: Partial<LabelConfig>) => void
  onOpenCustomizer: () => void
}

export function LabelPrintModal({
  isOpen,
  onClose,
  products,
  config,
  onUpdateConfig,
  onOpenCustomizer,
}: LabelPrintModalProps) {
  const [copiesMap, setCopiesMap] = useState<Record<string, number>>({})
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(config.templateId)
  const [selectedSize, setSelectedSize] = useState<LabelSize>(config.size)
  const [isPrinting, setIsPrinting] = useState(false)
  const [showConfirmLargeBatch, setShowConfirmLargeBatch] = useState(false)

  useEffect(() => {
    if (products.length > 0) {
      const initial: Record<string, number> = {}
      products.forEach(p => {
        initial[p.id] = config.copiesPerProduct || 1
      })
      setCopiesMap(initial)
    }
  }, [products, config.copiesPerProduct])

  useEffect(() => {
    setSelectedTemplate(config.templateId)
    setSelectedSize(config.size)
  }, [config.templateId, config.size])

  if (!isOpen || products.length === 0) return null

  const totalLabelCount = Object.values(copiesMap).reduce((a, b) => a + b, 0)

  const executePrint = () => {
    setIsPrinting(true)
    setShowConfirmLargeBatch(false)
    try {
      products.forEach(p => {
        const count = copiesMap[p.id] || 1
        logLabelPrintJob({
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          templateId: selectedTemplate,
          size: selectedSize,
          copiesCount: count,
        })
      })

      toast.success(`Sent ${totalLabelCount} label${totalLabelCount !== 1 ? 's' : ''} to printer`, {
        description: 'Opening native print dialog...',
      })

      setTimeout(() => {
        window.print()
        setIsPrinting(false)
      }, 300)
    } catch (e) {
      console.error(e)
      toast.error('Failed to trigger print dialog')
      setIsPrinting(false)
    }
  }

  const handlePrintClick = () => {
    if (totalLabelCount > 20) {
      setShowConfirmLargeBatch(true)
    } else {
      executePrint()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in print:p-0 print:bg-white print:static"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none print:bg-white"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* MODAL HEADER — HIDDEN IN PRINT */}
        <div
          className="p-4 px-6 border-b flex flex-wrap items-center justify-between gap-3 print:hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              🏷️ Product Label Printing Studio
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {products.length} Product{products.length > 1 ? 's' : ''} Selected • {totalLabelCount} Total Copies
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCustomizer}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5"
              style={{
                background: 'var(--secondary-bg)',
                borderColor: 'var(--border)',
                color: 'var(--primary)',
              }}
            >
              ⚙️ Brand Customizer
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* CONTROLS BAR — HIDDEN IN PRINT */}
        <div
          className="p-4 px-6 border-b flex flex-wrap items-center justify-between gap-4 text-xs print:hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--secondary-bg)' }}
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* TEMPLATE SELECTOR */}
            <div className="flex items-center gap-2">
              <span className="font-semibold uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>Template:</span>
              <select
                value={selectedTemplate}
                onChange={e => {
                  const t = e.target.value as TemplateId
                  setSelectedTemplate(t)
                  onUpdateConfig({ templateId: t })
                }}
                className="h-9 px-3 rounded-lg border font-medium outline-none focus:border-cyan-500"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="luxury_retail">Luxury Retail (Showroom)</option>
                <option value="warehouse">Warehouse (Inventory)</option>
                <option value="sale">Festive Sale / Clearance</option>
                <option value="minimal">Minimalist Boutique</option>
                <option value="thermal">Thermal Printer (B&amp;W)</option>
              </select>
            </div>

            {/* SIZE SELECTOR */}
            <div className="flex items-center gap-2">
              <span className="font-semibold uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>Label Size:</span>
              <select
                value={selectedSize}
                onChange={e => {
                  const s = e.target.value as LabelSize
                  setSelectedSize(s)
                  onUpdateConfig({ size: s })
                }}
                className="h-9 px-3 rounded-lg border font-medium outline-none focus:border-cyan-500"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="100x150">100 × 150 mm (Large Furniture Tag)</option>
                <option value="80x120">80 × 120 mm (Medium Appliance Tag)</option>
                <option value="70x100">70 × 100 mm (Compact Chair Tag)</option>
                <option value="50x75">50 × 75 mm (Small Shelf Tag)</option>
                <option value="thermal_roll">Thermal Roll (100 x 60 mm)</option>
                <option value="a4_grid">A4 Sheet Grid</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] font-medium" style={{ color: 'var(--primary)' }}>
            Payload: <span className="font-mono px-2 py-0.5 rounded border font-bold" style={{ background: 'rgba(0,217,217,0.12)', borderColor: 'rgba(0,217,217,0.3)', color: 'var(--primary)' }}>SKU CODE</span>
          </div>
        </div>

        {/* MODAL MAIN CONTENT — LIVE PREVIEW & COPIES CONTROL */}
        <div className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible" style={{ background: 'var(--surface)' }}>
          {/* PRINT ONLY CONTAINER */}
          <div className="hidden print:block space-y-4">
            {products.map(product => {
              const count = copiesMap[product.id] || 1
              return Array.from({ length: count }).map((_, idx) => (
                <div key={`${product.id}_${idx}`} className="page-break-after">
                  <ProductLabel
                    product={product}
                    config={config}
                    sizeOverride={selectedSize}
                    templateOverride={selectedTemplate}
                  />
                </div>
              ))
            })}
          </div>

          {/* ON-SCREEN PREVIEW CONTAINER */}
          <div className="print:hidden space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Live Interactive Print Preview
              </h3>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Optimized for 300 DPI Thermal &amp; Laser Printers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {products.map(product => (
                <div
                  key={product.id}
                  className="p-4 rounded-2xl border flex flex-col items-center gap-3"
                  style={{
                    background: 'var(--secondary-bg)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="w-full flex items-center justify-between text-xs pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-bold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--text-muted)' }}>Copies:</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={copiesMap[product.id] || 1}
                        onChange={e => {
                          const val = Math.max(1, parseInt(e.target.value) || 1)
                          setCopiesMap(prev => ({ ...prev, [product.id]: val }))
                        }}
                        className="w-14 h-7 px-2 text-center rounded border font-bold"
                        style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                  </div>

                  {/* LABEL PREVIEW BOX */}
                  <div className="p-3 rounded-xl border flex items-center justify-center overflow-auto max-w-full" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <ProductLabel
                      product={product}
                      config={config}
                      sizeOverride={selectedSize}
                      templateOverride={selectedTemplate}
                      style={{ transform: 'scale(0.95)', transformOrigin: 'center' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER — HIDDEN IN PRINT */}
        <div
          className="p-4 px-6 border-t flex items-center justify-between print:hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--secondary-bg)' }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintClick}
              disabled={isPrinting}
              className="px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer hover:brightness-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #00D9D9 0%, #35F5FF 100%)',
                color: '#0F172A',
                boxShadow: '0 4px 14px 0 rgba(0, 217, 217, 0.4)',
                border: 'none',
              }}
            >
              {isPrinting ? (
                <>⏳ Preparing Labels...</>
              ) : (
                <>🖨️ Print {totalLabelCount} Label{totalLabelCount !== 1 ? 's' : ''}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
