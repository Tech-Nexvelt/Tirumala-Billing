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

export function SaleClearanceTemplate({ product, config, qrSize = 120 }: TemplateProps) {
  const pricing = calculateLabelPricing(product, config.currencySymbol)
  const qrValue = buildQRPayload(product, config.qrPayloadType)

  return (
    <div
      className="w-full h-full flex flex-col justify-between overflow-hidden bg-white text-slate-900 border-2 border-red-600 rounded-xl shadow-md p-3 relative"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* SALE HEADER */}
      <div className="bg-red-600 text-white font-black px-3 py-1 -mx-3 -mt-3 mb-1.5 flex items-center justify-between text-[11px] tracking-wider uppercase">
        <span>🔥 SPECIAL OFFER / SALE</span>
        <span>{config.storeName}</span>
      </div>

      {/* PRODUCT TITLE */}
      <div className="my-0.5 text-center">
        <h2 className="text-xs font-black text-slate-900 leading-tight">{product.name}</h2>
        <p className="text-[8.5px] font-mono text-slate-500">SKU: {product.sku}</p>
      </div>

      {/* CENTER SPOTLIGHT FULL WIDTH QR CODE */}
      <div className="my-1 p-1 rounded-xl bg-red-50/60 border border-red-200 flex flex-col items-center justify-center text-center shadow-xs w-full">
        <span className="text-[8px] font-black uppercase tracking-wider text-red-600 mb-0.5">
          ⚡ INSTANT POS CHECKOUT QR
        </span>
        <div className="w-full flex items-center justify-center p-0 m-0">
          <QRCodeSVG value={qrValue} size={qrSize} darkColor="#DC2626" errorCorrectionLevel={config.qrErrorCorrection} className="w-full h-auto" />
        </div>
        <span className="text-[8.5px] font-mono font-bold text-slate-700 mt-0.5">
          {product.sku}
        </span>
      </div>

      {/* HERO PRICE & DISCOUNT BADGE */}
      <div className="my-0.5 p-2 rounded-xl bg-red-600 text-white flex items-center justify-between shadow-xs">
        <div>
          {pricing.isDiscounted && (
            <div className="text-[8px] text-red-200 font-semibold line-through">
              MRP {pricing.formattedMRP}
            </div>
          )}
          <div className="text-lg font-black text-white tracking-tight leading-none">
            {pricing.formattedSellingPrice}
          </div>
          <span className="text-[7.5px] font-bold text-red-100 uppercase tracking-wide">SPECIAL SALE PRICE</span>
        </div>

        {pricing.isDiscounted ? (
          <div className="bg-white text-red-600 p-1.5 rounded-lg text-center font-black shadow-xs">
            <span className="text-sm font-black block leading-none">{pricing.discountPercent}%</span>
            <span className="text-[7px] uppercase font-extrabold tracking-wider">OFF</span>
          </div>
        ) : (
          <div className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-center font-bold text-[10px]">
            HOT DEAL
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-0.5 text-center text-[7.5px] text-slate-400 border-t border-slate-100 mt-0.5">
        {config.footerText}
      </div>
    </div>
  )
}
