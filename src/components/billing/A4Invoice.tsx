'use client'
import React from 'react'
import type { Invoice, InvoiceItem, Store } from '@/types/database'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime, formatDate } from '@/lib/utils/date'

interface A4InvoiceProps {
  invoice: Invoice
  items: InvoiceItem[]
  store: Store | null
}

export function A4Invoice({ invoice, items, store }: A4InvoiceProps) {
  return (
    <div className="print-a4 p-6 bg-white text-slate-800 font-sans border border-slate-200 rounded-2xl shadow-md max-w-[210mm] w-full mx-auto">
      {/* Header Banner */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
        <div className="flex items-start gap-4">
          <img
            src={store?.logo_url || '/thirumala-logo.png'}
            alt="Thirumala Furniture Logo"
            className="h-16 w-auto object-contain flex-shrink-0"
          />
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{store?.name ?? 'Thirumala Furniture'}</h2>
            {store?.legal_name && <p className="text-xs font-semibold text-slate-600 mt-0.5">{store.legal_name}</p>}
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              {store?.address && <p>{store.address}</p>}
              {(store?.city || store?.state) && <p>{[store.city, store.state, store.pincode].filter(Boolean).join(', ')}</p>}
              {store?.phone && <p>📞 Phone: {store.phone}</p>}
              {store?.email && <p>✉️ Email: {store.email}</p>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-slate-100 px-3 py-1.5 rounded-lg inline-block text-left mb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Tax Invoice</span>
            <span className="text-base font-mono font-bold text-slate-800">{invoice.invoice_number}</span>
          </div>
          <div className="text-xs text-slate-500 space-y-0.5">
            <p><strong>Date:</strong> {formatDate(invoice.invoice_date)}</p>
            <p><strong>Time:</strong> {formatDateTime(invoice.created_at).split(' ')[1]} {formatDateTime(invoice.created_at).split(' ')[2] || ''}</p>
            <p><strong>Payment Status:</strong> <span className="uppercase font-bold text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{invoice.payment_status}</span></p>
          </div>
        </div>
      </div>

      {/* Bill To & Details Grid */}
      <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-4 mb-4">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Billed To</h3>
          <p className="text-sm font-bold text-slate-800">{invoice.customer_name}</p>
          {invoice.customer_phone && <p className="text-xs text-slate-600 mt-0.5">📞 {invoice.customer_phone}</p>}
          {invoice.customer_address && (
            <div className="text-xs text-slate-600 mt-1">
              <p className="font-semibold text-[10px] text-slate-400 uppercase tracking-tight">Delivery Address:</p>
              <p className="whitespace-pre-wrap mt-0.5">{invoice.customer_address}</p>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Invoice Summary</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold text-slate-800 uppercase">{invoice.payment_method}</span>
            </div>
            {invoice.payment_method === 'cash' && invoice.amount_tendered !== null && (
              <>
                <div className="flex justify-between">
                  <span>Amount Tendered:</span>
                  <span className="font-mono">{formatCurrency(invoice.amount_tendered)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change Given:</span>
                  <span className="font-mono">{formatCurrency(invoice.change_amount ?? 0)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-1">
              <span>Billed By:</span>
              <span className="font-medium text-slate-700">{invoice.created_by_name ?? 'Staff'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse mb-4">
        <thead>
          <tr className="border-b border-slate-300 text-[10px] font-bold uppercase text-slate-400">
            <th className="py-2 px-1.5 w-8 text-center">#</th>
            <th className="py-2 px-1.5">Item Description</th>
            <th className="py-2 px-1.5 text-center w-24">SKU / Code</th>
            <th className="py-2 px-1.5 text-right w-24">Unit Price</th>
            <th className="py-2 px-1.5 text-center w-14">Qty</th>
            <th className="py-2 px-1.5 text-right w-20">Discount</th>
            <th className="py-2 px-1.5 text-right w-24">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {items.map((item, idx) => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-2 px-1.5 text-center text-slate-400 font-medium">{idx + 1}</td>
              <td className="py-2 px-1.5 font-medium text-slate-800">
                {item.product_name}
              </td>
              <td className="py-2 px-1.5 text-center font-mono text-[11px] text-slate-500">{item.product_sku}</td>
              <td className="py-2 px-1.5 text-right font-mono">{formatCurrency(item.unit_price)}</td>
              <td className="py-2 px-1.5 text-center font-bold text-slate-700">{item.quantity}</td>
              <td className="py-2 px-1.5 text-right text-amber-600 font-mono">
                {item.discount_percent > 0 ? `-${item.discount_percent}%` : '—'}
              </td>
              <td className="py-2 px-1.5 text-right font-bold text-slate-900 font-mono">{formatCurrency(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Calculations Footer Block */}
      <div className="flex justify-between items-start border-t border-slate-200 pt-4">
        {/* Left Terms & Notes */}
        <div className="max-w-xs text-[11px] text-slate-400 space-y-1.5">
          <div>
            <h4 className="font-bold text-slate-500 mb-0.5">Terms &amp; Conditions</h4>
            <ul className="list-disc pl-3.5 space-y-0.5">
              <li>GST is not applicable (Zero GST billing).</li>
              <li>Goods once sold cannot be taken back or exchanged.</li>
              <li>Delivery is subject to availability and transport.</li>
            </ul>
          </div>
          {invoice.notes && (
            <div className="pt-1">
              <h4 className="font-bold text-slate-500 mb-0.5">Invoice Notes:</h4>
              <p className="italic text-slate-500 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Right Calculation list */}
        <div className="w-72 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Total Discount</span>
              <span className="font-mono">-{formatCurrency(invoice.discount_amount)}</span>
            </div>
          )}
          {invoice.delivery_charge > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Delivery Charges</span>
              <span className="font-mono">+{formatCurrency(invoice.delivery_charge)}</span>
            </div>
          )}
          {invoice.installation_charge > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Installation Charges</span>
              <span className="font-mono">+{formatCurrency(invoice.installation_charge)}</span>
            </div>
          )}
          {invoice.round_off !== 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Round Off</span>
              <span className="font-mono">{invoice.round_off > 0 ? '+' : ''}{formatCurrency(invoice.round_off)}</span>
            </div>
          )}
          <div className="flex justify-between items-center bg-slate-900 text-white px-3 py-2 rounded-xl mt-2 shadow-sm">
            <span className="font-extrabold text-xs uppercase tracking-wider">Grand Total</span>
            <span className="text-xl font-black font-mono tracking-tight">{formatCurrency(invoice.grand_total)}</span>
          </div>
        </div>
      </div>

      {/* Signature & Closing */}
      <div className="flex justify-between items-end mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">
        <div>
          <p className="italic">{store?.invoice_footer ?? 'Thank you for your business!'}</p>
        </div>
        <div className="text-center w-44 border-t border-slate-300 pt-1.5">
          <p className="font-bold text-slate-600 text-xs">Authorized Signatory</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{store?.name ?? 'Thirumala Furniture'}</p>
        </div>
      </div>
    </div>
  )
}
