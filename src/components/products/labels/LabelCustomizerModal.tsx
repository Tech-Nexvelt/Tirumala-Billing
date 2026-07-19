'use client'
import React from 'react'
import type { LabelConfig, QRErrorCorrection, HeaderAlignment, ElementSpacing } from '@/types/label'

interface LabelCustomizerModalProps {
  isOpen: boolean
  onClose: () => void
  config: LabelConfig
  onUpdateConfig: (updates: Partial<LabelConfig>) => void
  onResetConfig: () => void
}

export function LabelCustomizerModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onResetConfig,
}: LabelCustomizerModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border shadow-2xl overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              ⚙️ Store Brand &amp; Label Layout Designer
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Customize enterprise brand tags, layout scale, QR error correction &amp; warehouse fields
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* NOTICE: AUTO STORE SYNC */}
          <div
            className="p-3 rounded-xl border text-xs flex items-center gap-2"
            style={{ background: 'rgba(0,217,217,0.1)', borderColor: 'rgba(0,217,217,0.3)', color: 'var(--primary)' }}
          >
            <span className="text-base">ℹ️</span>
            <span>
              Store Name, Address, Phone &amp; Website are automatically synced with active <strong>Store Settings</strong>.
            </span>
          </div>

          {/* SECTION 1: VISUAL LAYOUT DESIGNER */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
              1. Visual Layout &amp; Typography Scale
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Font Size Scale</label>
                <select
                  value={config.fontSizeScale || 1.0}
                  onChange={e => onUpdateConfig({ fontSizeScale: parseFloat(e.target.value) })}
                  className="w-full h-9 px-3 rounded-lg border outline-none text-xs font-medium"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value={0.85}>Small (85% Scale)</option>
                  <option value={1.0}>Standard (100% Scale)</option>
                  <option value={1.15}>Large (115% Scale)</option>
                </select>
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Header Alignment</label>
                <select
                  value={config.headerAlignment || 'between'}
                  onChange={e => onUpdateConfig({ headerAlignment: e.target.value as HeaderAlignment })}
                  className="w-full h-9 px-3 rounded-lg border outline-none text-xs font-medium"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="between">Space Between</option>
                  <option value="left">Left Aligned</option>
                  <option value="center">Centered</option>
                </select>
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Element Spacing</label>
                <select
                  value={config.elementSpacing || 'normal'}
                  onChange={e => onUpdateConfig({ elementSpacing: e.target.value as ElementSpacing })}
                  className="w-full h-9 px-3 rounded-lg border outline-none text-xs font-medium"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="compact">Compact Density</option>
                  <option value="normal">Normal Density</option>
                  <option value="spacious">Spacious Density</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: QR & WAREHOUSE LOCATION */}
          <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
              2. Optical QR Scanner &amp; Warehouse Specs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>QR Encoded Payload</label>
                <input
                  type="text"
                  readOnly
                  value="SKU Code (Enforced for ultra-fast POS scan speed)"
                  className="w-full h-9 px-3 rounded-lg border text-xs cursor-not-allowed font-mono"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                />
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>QR Error Correction Level</label>
                <select
                  value={config.qrErrorCorrection || 'M'}
                  onChange={e => onUpdateConfig({ qrErrorCorrection: e.target.value as QRErrorCorrection })}
                  className="w-full h-9 px-3 rounded-lg border outline-none text-xs font-medium"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="L">Level L (7% Damage Recovery - Smallest QR)</option>
                  <option value="M">Level M (15% Damage Recovery - Standard)</option>
                  <option value="Q">Level Q (25% Damage Recovery - High)</option>
                  <option value="H">Level H (30% Damage Recovery - Ultra Robust)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Default Warehouse Rack / Shelf Location</label>
                <input
                  type="text"
                  value={config.warehouseLocation || ''}
                  onChange={e => onUpdateConfig({ warehouseLocation: e.target.value })}
                  placeholder="e.g. Zone A - Rack 3 - Shelf B"
                  className="w-full h-9 px-3 rounded-lg border outline-none text-xs font-mono"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: COLORS & TERMINOLOGY */}
          <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
              3. Colors &amp; Price Terminology
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={e => onUpdateConfig({ primaryColor: e.target.value })}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={e => onUpdateConfig({ primaryColor: e.target.value })}
                    className="flex-1 h-9 px-3 rounded-lg border text-xs font-mono"
                    style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={e => onUpdateConfig({ accentColor: e.target.value })}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={config.accentColor}
                    onChange={e => onUpdateConfig({ accentColor: e.target.value })}
                    className="flex-1 h-9 px-3 rounded-lg border text-xs font-mono"
                    style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Currency Symbol</label>
                <input
                  type="text"
                  value={config.currencySymbol}
                  onChange={e => onUpdateConfig({ currencySymbol: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border outline-none font-bold"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>MRP Label</label>
                <input
                  type="text"
                  value={config.mrpLabel}
                  onChange={e => onUpdateConfig({ mrpLabel: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border text-xs"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Offer Price Label</label>
                <input
                  type="text"
                  value={config.offerPriceLabel}
                  onChange={e => onUpdateConfig({ offerPriceLabel: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border text-xs"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Savings Label</label>
                <input
                  type="text"
                  value={config.savingsLabel}
                  onChange={e => onUpdateConfig({ savingsLabel: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border text-xs"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: VISIBLE FIELDS TOGGLES */}
          <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
              4. Display Fields &amp; Visibility Toggles
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'showProductImage', label: 'Product Thumbnail' },
                { key: 'showMRP', label: 'MRP Price' },
                { key: 'showSavingsBadge', label: 'Savings Badge' },
                { key: 'showMaterial', label: 'Material Spec' },
                { key: 'showDimensions', label: 'Dimensions' },
                { key: 'showColor', label: 'Color / Finish' },
                { key: 'showBrand', label: 'Brand Name' },
                { key: 'showWarranty', label: 'Warranty Info' },
                { key: 'showMfgDate', label: 'Manufacturing Date' },
                { key: 'showWarehouseLoc', label: 'Warehouse Location' },
                { key: 'showCategory', label: 'Category Tag' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)' }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(config[key as keyof LabelConfig])}
                    onChange={e => onUpdateConfig({ [key]: e.target.checked })}
                    className="rounded border-slate-600 bg-slate-900 text-cyan-500"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--secondary-bg)' }}>
          <button
            onClick={onResetConfig}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #00D9D9, #35F5FF)',
              color: '#0F172A',
            }}
          >
            Save &amp; Apply Layout
          </button>
        </div>
      </div>
    </div>
  )
}
