'use client'
import React from 'react'
import type { Invoice, InvoiceItem, Store } from '@/types/database'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime, formatDate } from '@/lib/utils/date'

interface ThermalReceiptProps {
  invoice: Invoice
  items: InvoiceItem[]
  store: Store | null
}

export function ThermalReceipt({ invoice, items, store }: ThermalReceiptProps) {
  return (
    <div className="print-thermal p-4 bg-white text-black font-mono text-xs w-[80mm] border border-dashed border-slate-300 rounded-lg shadow-sm mx-auto select-text">
      {/* Store Info */}
      <div className="text-center space-y-1 mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wide">{store?.name ?? 'Thirumala Furniture'}</h2>
        {store?.legal_name && <p className="text-[10px] leading-tight opacity-75">{store.legal_name}</p>}
        {store?.address && <p className="text-[10px] leading-tight">{store.address}</p>}
        {(store?.city || store?.state) && (
          <p className="text-[10px] leading-tight">
            {[store.city, store.state, store.pincode].filter(Boolean).join(', ')}
          </p>
        )}
        {store?.phone && <p className="text-[10px]">Ph: {store.phone}</p>}
      </div>

      {/* Dashed Separator */}
      <div className="border-t border-dashed border-slate-400 my-2" />

      {/* Invoice Details */}
      <div className="space-y-0.5 text-[11px] leading-relaxed">
        <p><strong>INVOICE:</strong> {invoice.invoice_number}</p>
        <p><strong>DATE:</strong> {formatDate(invoice.invoice_date)}</p>
        <p><strong>TIME:</strong> {formatDateTime(invoice.created_at).split(' ')[1]} {formatDateTime(invoice.created_at).split(' ')[2] || ''}</p>
        <p><strong>CASHIER:</strong> {invoice.created_by_name ?? 'Staff'}</p>
        <p><strong>CUSTOMER:</strong> {invoice.customer_name}</p>
        {invoice.customer_phone && <p><strong>PHONE:</strong> {invoice.customer_phone}</p>}
        {invoice.customer_address && (
          <p className="line-clamp-2"><strong>DELIVERY:</strong> {invoice.customer_address}</p>
        )}
      </div>

      {/* Dashed Separator */}
      <div className="border-t border-dashed border-slate-400 my-2" />

      {/* Items Table Headers */}
      <div className="grid grid-cols-12 gap-1 font-bold text-[11px] mb-1">
        <span className="col-span-6">ITEM</span>
        <span className="col-span-2 text-center">QTY</span>
        <span className="col-span-4 text-right">AMOUNT</span>
      </div>

      {/* Dashed Separator */}
      <div className="border-t border-dashed border-slate-400 my-1" />

      {/* Line Items */}
      <div className="space-y-2 text-[11px]">
        {items.map((item, idx) => (
          <div key={item.id} className="space-y-0.5">
            <div className="grid grid-cols-12 gap-1 font-medium">
              <span className="col-span-6 break-words uppercase">{idx + 1}. {item.product_name}</span>
              <span className="col-span-2 text-center">{item.quantity}</span>
              <span className="col-span-4 text-right font-semibold">{formatCurrency(item.line_total)}</span>
            </div>
            <div className="pl-3 text-[10px] text-slate-600 flex justify-between">
              <span>{item.quantity} × {formatCurrency(item.unit_price)}</span>
              {item.discount_percent > 0 && (
                <span className="text-emerald-700 font-bold">(-{item.discount_percent}% Disc)</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dashed Separator */}
      <div className="border-t border-dashed border-slate-400 my-2" />

      {/* Calculations */}
      <div className="space-y-1 text-[11px] leading-relaxed">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        {invoice.discount_amount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>TOTAL DISCOUNT:</span>
            <span>-{formatCurrency(invoice.discount_amount)}</span>
          </div>
        )}
        {invoice.delivery_charge > 0 && (
          <div className="flex justify-between">
            <span>DELIVERY:</span>
            <span>+{formatCurrency(invoice.delivery_charge)}</span>
          </div>
        )}
        {invoice.installation_charge > 0 && (
          <div className="flex justify-between">
            <span>INSTALLATION:</span>
            <span>+{formatCurrency(invoice.installation_charge)}</span>
          </div>
        )}
        {invoice.round_off !== 0 && (
          <div className="flex justify-between">
            <span>ROUND OFF:</span>
            <span>{invoice.round_off > 0 ? '+' : ''}{formatCurrency(invoice.round_off)}</span>
          </div>
        )}

        {/* Double Dashed Separator */}
        <div className="border-t border-double border-slate-800 my-2" />

        <div className="flex justify-between font-bold text-sm">
          <span>GRAND TOTAL:</span>
          <span>{formatCurrency(invoice.grand_total)}</span>
        </div>

        {/* Double Dashed Separator */}
        <div className="border-t border-double border-slate-800 my-2" />

        <div className="flex justify-between uppercase font-bold text-[10px]">
          <span>PAYMENT METHOD:</span>
          <span>{invoice.payment_method}</span>
        </div>

        {invoice.payment_method === 'cash' && invoice.amount_tendered !== null && (
          <div className="text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>CASH RECEIVED:</span>
              <span>{formatCurrency(invoice.amount_tendered)}</span>
            </div>
            <div className="flex justify-between">
              <span>CHANGE RETURNED:</span>
              <span>{formatCurrency(invoice.change_amount ?? 0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Dashed Separator */}
      <div className="border-t border-dashed border-slate-400 my-2" />

      {/* Invoice Footer */}
      <div className="text-center text-[10px] space-y-1 py-1">
        <p className="uppercase font-bold tracking-wide">Zero GST Invoice</p>
        <p className="italic">{store?.invoice_footer ?? 'Thank you for shopping with us!'}</p>
        <p className="opacity-50 text-[8px] mt-2">Powered by Thirumala Furniture POS</p>
      </div>
    </div>
  )
}
