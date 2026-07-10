import type { Invoice, InvoiceItem, Store } from '@/types/database'
import { formatCurrency } from './currency'

export async function shareInvoiceViaWhatsApp(invoice: Invoice, items: InvoiceItem[], store: Store | null) {
  // 1. Trigger server-side PDF compilation and upload
  const res = await fetch('/api/share-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId: invoice.id })
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to generate PDF')
  }

  const { publicUrl } = await res.json()

  // 2. Construct branded file-like download URL
  const downloadUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/download/bill-invoice-${invoice.invoice_number}.pdf`
    : publicUrl

  // 3. Format clean WhatsApp Message
  const textLines = [
    `*${store?.name ?? 'Tirumala Furniture'}*`,
    `Dear ${invoice.customer_name !== 'Guest Customer' && invoice.customer_name !== 'Guest' ? invoice.customer_name : 'Customer'},`,
    `Thank you for shopping with us!`,
    ``,
    `*Invoice:* ${invoice.invoice_number}`,
    `*Grand Total:* ${formatCurrency(invoice.grand_total)}`,
    ``,
    `*Download Invoice PDF:*`,
    downloadUrl,
    ``,
    store?.invoice_footer ?? 'Thank you for your business!'
  ].join('\n')

  // 4. Open WhatsApp API
  const phone = invoice.customer_phone ?? ''
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textLines)}`
  window.open(whatsappUrl, '_blank')
}
