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

export function WarehouseTemplate({ product, config, qrSize = 95 }: TemplateProps) {
  const pricing = calculateLabelPricing(product, config.currencySymbol)
  const qrValue = buildQRPayload(product, config.qrPayloadType)

  return (
    <div
      className="w-full h-full flex flex-col justify-between overflow-hidden bg-slate-900 text-white p-3.5 rounded-xl border border-slate-700 shadow-md font-mono"
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* WAREHOUSE HEADER */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
        <div>
          <span className="text-[8.5px] uppercase font-bold text-amber-400 tracking-wider">WAREHOUSE STOCK TAG</span>
          <h3 className="text-[11px] font-bold text-slate-200">{config.storeName}</h3>
        </div>
        <div className="bg-amber-400 text-slate-950 font-black text-[9.5px] px-2 py-0.5 rounded uppercase">
          QTY: {product.stock_qty ?? 1}
        </div>
      </div>

      {/* SKU & PRODUCT TITLE */}
      <div className="my-1">
        <span className="text-[9px] text-slate-400 uppercase">ITEM SKU</span>
        <h1 className="text-base font-black tracking-wider text-amber-400 leading-tight">{product.sku}</h1>
        <h2 className="text-xs font-bold text-slate-100 mt-0.5 line-clamp-1">{product.name}</h2>
      </div>

      {/* CENTER RESPONSIVE QR CODE */}
      <div className="flex items-center justify-between bg-white text-slate-950 p-2 rounded-lg border border-slate-200 my-1 max-w-full overflow-hidden">
        <div>
          <p className="text-[8.5px] font-bold text-slate-500 uppercase">POS SCANNER PAYLOAD</p>
          <p className="text-xs font-black text-slate-900 tracking-tight">{product.sku}</p>
          <p className="text-[8px] text-slate-600 mt-0.5">Scan with handheld POS gun</p>
        </div>
        <div className="max-w-full max-h-full overflow-hidden flex-shrink-0">
          <QRCodeSVG value={qrValue} size={qrSize} darkColor="#0F172A" errorCorrectionLevel={config.qrErrorCorrection} />
        </div>
      </div>

      {/* PRICE & FOOTER */}
      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[8.5px] text-slate-400 uppercase block">{config.offerPriceLabel}</span>
          <span className="text-sm font-black text-white">{pricing.formattedSellingPrice}</span>
        </div>
        <div className="text-right text-[7.5px] text-slate-400">
          <p>LOC: {product.warehouse_location || config.warehouseLocation || 'ZONE-A / SHELF-3'}</p>
          <p>TIRUMALA LOGISTICS</p>
        </div>
      </div>
    </div>
  )
}
