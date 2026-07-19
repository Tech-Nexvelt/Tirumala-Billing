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

export function ThermalTemplate({ product, config, qrSize = 65 }: TemplateProps) {
  const pricing = calculateLabelPricing(product, config.currencySymbol)
  const qrValue = buildQRPayload(product, config.qrPayloadType)

  return (
    <div
      className="w-full h-full flex flex-col justify-between overflow-hidden bg-white text-black p-3 border-2 border-black font-sans"
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* THERMAL HEADER */}
      <div className="border-b-2 border-black pb-1 flex justify-between items-center text-black">
        <span className="font-extrabold text-[10px] uppercase tracking-wider">{config.storeName}</span>
        <span className="font-mono text-[9px] font-bold">SKU: {product.sku}</span>
      </div>

      {/* PRODUCT TITLE & DETAILS */}
      <div className="my-1 flex-1 flex flex-col justify-center">
        <h2 className="text-xs font-black text-black leading-tight uppercase">{product.name}</h2>
        {product.material && (
          <p className="text-[8.5px] font-bold text-black mt-0.5 uppercase truncate">{product.material}</p>
        )}
      </div>

      {/* PRICE & QR CODE */}
      <div className="pt-1.5 border-t-2 border-black flex items-center justify-between">
        <div>
          {pricing.isDiscounted && (
            <div className="text-[8.5px] font-bold line-through">MRP: {pricing.formattedMRP}</div>
          )}
          <div className="text-base font-black text-black leading-tight">{pricing.formattedSellingPrice}</div>
          {pricing.isDiscounted && (
            <div className="text-[8px] font-black uppercase">SAVE {pricing.formattedSavings}</div>
          )}
        </div>

        <div className="flex flex-col items-center max-w-full max-h-full overflow-hidden">
          <QRCodeSVG value={qrValue} size={qrSize} darkColor="#000000" lightColor="#FFFFFF" errorCorrectionLevel={config.qrErrorCorrection} />
          <span className="text-[7.5px] font-mono font-bold mt-0.5">{product.sku}</span>
        </div>
      </div>
    </div>
  )
}
