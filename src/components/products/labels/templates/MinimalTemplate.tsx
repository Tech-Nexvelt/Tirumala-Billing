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

export function MinimalTemplate({ product, config, qrSize = 120 }: TemplateProps) {
  const pricing = calculateLabelPricing(product, config.currencySymbol)
  const qrValue = buildQRPayload(product, config.qrPayloadType)

  return (
    <div
      className="w-full h-full flex flex-col justify-between overflow-hidden bg-white text-slate-900 p-3 rounded-xl border border-slate-300"
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-1 flex justify-between items-center">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{config.storeName}</h3>
        <span className="text-[8.5px] font-mono text-slate-500">SKU: {product.sku}</span>
      </div>

      {/* PRODUCT TITLE */}
      <div className="my-0.5 text-center">
        <span className="text-[8px] font-mono uppercase text-slate-400">{product.category_name || 'COLLECTION'}</span>
        <h1 className="text-sm font-bold text-slate-900 leading-tight mt-0.5">{product.name}</h1>
      </div>

      {/* CENTER SPOTLIGHT FULL WIDTH QR CODE */}
      <div className="my-1 p-1 rounded-xl bg-slate-50 border border-slate-300 flex flex-col items-center justify-center text-center shadow-xs w-full">
        <div className="w-full flex items-center justify-center p-0 m-0">
          <QRCodeSVG value={qrValue} size={qrSize} darkColor="#000000" errorCorrectionLevel={config.qrErrorCorrection} className="w-full h-auto" />
        </div>
        <span className="text-[8.5px] font-mono font-black text-slate-800 mt-0.5 uppercase tracking-wider">
          SCAN FOR POS BILLING
        </span>
      </div>

      {/* PRICE & FOOTER */}
      <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
        <div>
          {pricing.isDiscounted && (
            <p className="text-[8.5px] text-slate-400 line-through">MRP {pricing.formattedMRP}</p>
          )}
          <p className="text-base font-bold text-slate-900 tracking-tight">{pricing.formattedSellingPrice}</p>
        </div>

        {pricing.isDiscounted && (
          <div className="text-[8.5px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            SAVE {pricing.formattedSavings}
          </div>
        )}
      </div>
    </div>
  )
}
