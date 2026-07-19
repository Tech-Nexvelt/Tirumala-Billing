'use client'
import React from 'react'
import { QRCodeSVG } from './QRCodeSVG'
import { DEFAULT_LABEL_CONFIG } from '@/hooks/useLabelConfig'

interface ProductLabelPreviewProps {
  name: string
  sku: string
  barcode: string
  sellingPrice: string
  purchasePrice: string
  categoryName?: string
}

export function ProductLabelPreview({
  name,
  sku,
  barcode,
  sellingPrice,
  purchasePrice,
  categoryName,
}: ProductLabelPreviewProps) {
  const cfg = DEFAULT_LABEL_CONFIG
  const qrValue = barcode || sku || name || 'PREVIEW'
  const displayPrice = sellingPrice ? `₹${parseFloat(sellingPrice).toLocaleString('en-IN')}` : '₹ —'
  const displayMRP = purchasePrice ? `₹${parseFloat(purchasePrice).toLocaleString('en-IN')}` : ''
  const hasSavings =
    sellingPrice && purchasePrice &&
    parseFloat(purchasePrice) > parseFloat(sellingPrice)

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Label Preview
      </p>

      {/* Scaled label card — fixed width, white background always (it's a print label) */}
      <div
        className="w-full max-w-[260px] rounded-xl shadow-lg overflow-hidden border"
        style={{ borderColor: 'rgba(0,0,0,0.12)' }}
      >
        <div
          className="w-full flex flex-col bg-white text-slate-900 p-3 gap-1.5"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          {/* ── Header: Store name ── */}
          <div
            className="flex items-center gap-1.5 pb-1.5 border-b"
            style={{ borderColor: `${cfg.accentColor}40` }}
          >
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-white font-black text-[8px] flex-shrink-0"
              style={{ background: cfg.primaryColor }}
            >
              TF
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black tracking-widest uppercase leading-none" style={{ color: cfg.primaryColor }}>
                {cfg.storeName}
              </p>
              <p className="text-[7px] text-slate-400 truncate mt-0.5">{cfg.phone}</p>
            </div>
            {categoryName && (
              <span
                className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded"
                style={{ background: `${cfg.accentColor}18`, color: cfg.accentColor }}
              >
                {categoryName}
              </span>
            )}
          </div>

          {/* ── Product name + SKU ── */}
          <div>
            <p className="text-[10px] font-black text-slate-900 leading-tight line-clamp-2">
              {name || 'Product Name'}
            </p>
            {sku && (
              <p className="text-[7.5px] font-mono text-slate-500 mt-0.5">
                SKU: <span className="font-bold text-slate-800">{sku}</span>
              </p>
            )}
          </div>

          {/* ── QR Code block ── */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center py-1.5 px-2 gap-1">
            <div
              className="text-[7px] font-black uppercase tracking-wider text-white px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: cfg.primaryColor }}
            >
              <span>📷</span> {cfg.qrPromptText}
            </div>
            <QRCodeSVG
              value={qrValue}
              size={90}
              darkColor={cfg.primaryColor}
              errorCorrectionLevel={cfg.qrErrorCorrection}
            />
            <span
              className="text-[7.5px] font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded tracking-widest"
            >
              {barcode || sku || '—'}
            </span>
          </div>

          {/* ── Pricing ── */}
          <div
            className="rounded-lg px-2.5 py-1.5 flex items-center justify-between text-white"
            style={{ background: `linear-gradient(135deg, ${cfg.primaryColor}, #1E293B)` }}
          >
            <div>
              {displayMRP && (
                <div className="flex items-center gap-1 text-[7px]">
                  <span className="text-slate-400 uppercase">MRP</span>
                  <span className="text-slate-300 line-through">{displayMRP}</span>
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-[7px] text-amber-400 font-bold uppercase tracking-wider">Price</span>
                <span className="text-sm font-black tracking-tight">{displayPrice}</span>
              </div>
            </div>
            {hasSavings && (
              <div className="bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded text-center font-black">
                <p className="text-[6px] uppercase leading-none">SAVE</p>
                <p className="text-[9px] leading-tight">
                  ₹{(parseFloat(purchasePrice) - parseFloat(sellingPrice)).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <p className="text-center text-[6.5px] text-slate-400 border-t border-slate-100 pt-1">
            {cfg.footerText}
          </p>
        </div>
      </div>
    </div>
  )
}
