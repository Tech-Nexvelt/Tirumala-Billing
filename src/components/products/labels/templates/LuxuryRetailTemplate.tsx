'use client'
import React from 'react'
import type { PrintableProduct, LabelConfig } from '@/types/label'
import { calculateLabelPricing, buildQRPayload } from '@/lib/labels/labelCalculations'
import { QRCodeSVG } from '../QRCodeSVG'

interface TemplateProps {
  product: PrintableProduct
  config: LabelConfig
  qrSize?: number
}

export function LuxuryRetailTemplate({ product, config, qrSize = 135 }: TemplateProps) {
  const pricing = calculateLabelPricing(product, config.currencySymbol)
  const qrValue = buildQRPayload(product, config.qrPayloadType)

  const brand = product.brand || 'TIRUMALA LUXURY'
  const material = product.material || 'Solid Teak Wood & HD Foam'
  const color = product.color || 'Royal Walnut / Espresso'
  const dimensions = product.dimensions || '75" L x 72" W x 8" H'
  const warranty = product.warranty || '10 Years Warranty'
  const mfgDate = product.mfg_date || 'May 2026'
  const warehouseLoc = product.warehouse_location || config.warehouseLocation || 'Zone-A / Rack-3'
  const category = product.category_name || 'Furniture'

  const fontScale = config.fontSizeScale || 1.0
  const headerJustify =
    config.headerAlignment === 'center' ? 'justify-center text-center' :
    config.headerAlignment === 'left' ? 'justify-start text-left' :
    'justify-between'

  return (
    <div
      className="w-full h-full flex flex-col justify-between overflow-hidden bg-white text-slate-900 border border-slate-200 rounded-xl shadow-sm p-3 relative"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        fontSize: `${100 * fontScale}%`,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* 1. BRAND HEADER */}
      <div className={`flex items-center gap-2 border-b pb-1.5 ${headerJustify}`} style={{ borderColor: `${config.accentColor}40` }}>
        <div className="flex items-center gap-2">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Store Logo" className="w-5.5 h-5.5 object-contain rounded" />
          ) : (
            <div
              className="w-5.5 h-5.5 rounded-md flex items-center justify-center font-black text-white text-[9.5px]"
              style={{ background: config.primaryColor }}
            >
              TF
            </div>
          )}
          <div>
            <h3 className="text-[9.5px] font-black tracking-widest uppercase leading-none" style={{ color: config.primaryColor }}>
              {config.storeName}
            </h3>
            <p className="text-[7.5px] text-slate-500 font-medium tracking-tight mt-0.5">
              {config.phone} • {config.website.replace(/^https?:\/\//, '')}
            </p>
          </div>
        </div>

        {config.showBrand && (
          <div
            className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase"
            style={{ background: `${config.accentColor}15`, color: config.accentColor }}
          >
            {brand}
          </div>
        )}
      </div>

      {/* 2. PRODUCT NAME & DETAILS */}
      <div className="my-1 flex items-start justify-between gap-2">
        <div className="flex-1">
          {config.showCategory && (
            <span className="text-[7.5px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
              {category}
            </span>
          )}
          <h2 className="text-xs font-black text-slate-900 leading-tight tracking-tight">
            {product.name}
          </h2>
          <p className="text-[8.5px] font-mono font-semibold text-slate-500 mt-0.5">
            SKU: <span className="text-slate-900 font-bold">{product.sku}</span>
          </p>
        </div>

        {config.showProductImage && product.image_url && (
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 shadow-xs">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* 3. CENTER SPOTLIGHT (EDGE-TO-EDGE FULL-WIDTH QR CODE CONTAINER) */}
      <div className="my-1 p-1 rounded-xl bg-slate-50 border border-slate-900/15 flex flex-col items-center justify-center text-center shadow-xs w-full">
        {/* Spotlight top callout badge */}
        <div className="bg-slate-900 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-0.5 flex items-center gap-1 shadow-xs">
          <span>📷</span> {config.qrPromptText || 'SCAN FOR POS BILLING & SPECS'}
        </div>

        {/* Full Width Vector QR Code (Zero Side Padding) */}
        <div className="w-full flex items-center justify-center p-0 m-0">
          <QRCodeSVG
            value={qrValue}
            size={qrSize}
            darkColor={config.primaryColor}
            errorCorrectionLevel={config.qrErrorCorrection}
            className="w-full h-auto"
          />
        </div>

        <span className="text-[8.5px] font-mono font-black text-slate-900 tracking-widest mt-0.5 bg-white px-2 py-0.5 rounded border border-slate-300">
          {product.sku}
        </span>
      </div>

      {/* 4. PRODUCT SPECIFICATIONS GRID */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100 text-[8px] my-0.5">
        {config.showMaterial && (
          <div>
            <span className="text-slate-400 font-medium block">Material</span>
            <span className="font-semibold text-slate-800 truncate block">{material}</span>
          </div>
        )}

        {config.showDimensions && (
          <div>
            <span className="text-slate-400 font-medium block">Dimensions</span>
            <span className="font-semibold text-slate-800 truncate block">{dimensions}</span>
          </div>
        )}

        {config.showColor && (
          <div>
            <span className="text-slate-400 font-medium block">Finish / Color</span>
            <span className="font-semibold text-slate-800 truncate block">{color}</span>
          </div>
        )}

        {config.showWarranty && (
          <div>
            <span className="text-slate-400 font-medium block">Warranty</span>
            <span className="font-semibold text-emerald-700 truncate block">{warranty}</span>
          </div>
        )}

        {(config.showMfgDate || config.showWarehouseLoc) && (
          <div className="col-span-2 pt-0.5 border-t border-slate-200/60 flex justify-between text-[7.5px]">
            {config.showMfgDate && <span className="text-slate-400">DOM: {mfgDate}</span>}
            {config.showWarehouseLoc && <span className="text-slate-500 font-mono font-semibold">LOC: {warehouseLoc}</span>}
          </div>
        )}
      </div>

      {/* 5. PRICING HERO SECTION */}
      <div
        className="mt-0.5 p-1.5 rounded-xl flex items-center justify-between text-white shadow-xs"
        style={{ background: `linear-gradient(135deg, ${config.primaryColor}, #1E293B)` }}
      >
        <div>
          {pricing.isDiscounted && config.showMRP && (
            <div className="flex items-center gap-1.5 text-[8px]">
              <span className="text-slate-400 uppercase font-medium">{config.mrpLabel}</span>
              <span className="text-slate-300 line-through font-semibold">{pricing.formattedMRP}</span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wider">{config.offerPriceLabel}</span>
            <span className="text-base font-black text-white tracking-tight">{pricing.formattedSellingPrice}</span>
          </div>
        </div>

        {pricing.isDiscounted && config.showSavingsBadge && (
          <div className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg text-center font-black">
            <p className="text-[7px] uppercase tracking-wider leading-none">SAVE</p>
            <p className="text-[10.5px] leading-tight">{pricing.formattedSavings}</p>
          </div>
        )}
      </div>

      {/* 6. FOOTER */}
      <div className="pt-0.5 text-center text-[7.5px] text-slate-400 border-t border-slate-100 mt-0.5">
        {config.footerText}
      </div>
    </div>
  )
}
