import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { Invoice, InvoiceItem, Store } from '@/types/database'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, formatDateTime } from '@/lib/utils/date'

// Styles for React PDF Document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
    backgroundColor: '#ffffff',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  storeLegal: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
  },
  storeDetails: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 5,
    lineHeight: 1.3,
  },
  invoiceBadge: {
    backgroundColor: '#f1f5f9',
    padding: '6 12',
    borderRadius: 4,
    marginBottom: 8,
  },
  invoiceTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
  metaText: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 2,
  },
  billSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  customerName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  customerText: {
    fontSize: 8,
    color: '#475569',
    marginTop: 2,
  },
  summaryText: {
    fontSize: 8,
    color: '#475569',
    marginTop: 4,
  },
  table: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
    marginBottom: 6,
  },
  thNum: { width: '5%', color: '#94a3b8', fontSize: 8, fontWeight: 'bold' },
  thDesc: { width: '50%', color: '#94a3b8', fontSize: 8, fontWeight: 'bold' },
  thSku: { width: '15%', color: '#94a3b8', fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
  thPrice: { width: '10%', color: '#94a3b8', fontSize: 8, fontWeight: 'bold', textAlign: 'right' },
  thQty: { width: '8%', color: '#94a3b8', fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
  thTotal: { width: '12%', color: '#94a3b8', fontSize: 8, fontWeight: 'bold', textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 6,
  },
  tdNum: { width: '5%', color: '#64748b' },
  tdDesc: { width: '50%', color: '#1e293b', fontWeight: 'bold' },
  tdSku: { width: '15%', color: '#64748b', fontSize: 8, textAlign: 'center' },
  tdPrice: { width: '10%', color: '#475569', textAlign: 'right' },
  tdQty: { width: '8%', color: '#1e293b', textAlign: 'center' },
  tdTotal: { width: '12%', color: '#0f172a', fontWeight: 'bold', textAlign: 'right' },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  termsCol: {
    width: '50%',
  },
  totalsCol: {
    width: '40%',
  },
  termTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 4,
  },
  termItem: {
    fontSize: 7,
    color: '#94a3b8',
    marginBottom: 2,
  },
  notesBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesText: {
    fontSize: 7,
    color: '#64748b',
    fontStyle: 'italic',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    padding: '6 10',
    borderRadius: 6,
    marginTop: 6,
  },
  grandTotalLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  grandTotalVal: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  signSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 50,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
  },
  signFooter: {
    fontSize: 7,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  signatureBox: {
    width: 150,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
    alignItems: 'center',
  },
  signTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
  },
  signSubtitle: {
    fontSize: 6,
    color: '#94a3b8',
    marginTop: 1,
  }
})

interface InvoicePDFProps {
  invoice: Invoice
  items: InvoiceItem[]
  store: Store | null
}

export function InvoicePDF({ invoice, items, store }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              src={store?.logo_url || '/thirumala-logo.png'}
              style={{ width: 45, height: 45, marginRight: 10, objectFit: 'contain' }}
            />
            <View>
              <Text style={styles.storeName}>{store?.name ?? 'Thirumala Furniture'}</Text>
              {store?.legal_name && <Text style={styles.storeLegal}>{store.legal_name}</Text>}
              <View style={styles.storeDetails}>
                {store?.address && <Text>{store.address}</Text>}
                {(store?.city || store?.state) && (
                  <Text>{[store.city, store.state, store.pincode].filter(Boolean).join(', ')}</Text>
                )}
                {store?.phone && <Text>Phone: {store.phone}</Text>}
                {store?.email && <Text>Email: {store.email}</Text>}
              </View>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={styles.invoiceBadge}>
              <Text style={styles.invoiceTitle}>Tax Invoice</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            </View>
            <Text style={styles.metaText}>Date: {formatDate(invoice.invoice_date)}</Text>
            <Text style={styles.metaText}>
              Time: {formatDateTime(invoice.created_at).split(' ')[1]} {formatDateTime(invoice.created_at).split(' ')[2] || ''}
            </Text>
            <Text style={styles.metaText}>Status: {invoice.payment_status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Billed To & Summary */}
        <View style={styles.billSection}>
          <View style={{ width: '50%' }}>
            <Text style={styles.sectionTitle}>Billed To</Text>
            <Text style={styles.customerName}>{invoice.customer_name}</Text>
            {invoice.customer_phone && <Text style={styles.customerText}>Phone: {invoice.customer_phone}</Text>}
            {invoice.customer_address && (
              <View style={{ marginTop: 5 }}>
                <Text style={{ fontSize: 7, color: '#94a3b8', textTransform: 'uppercase' }}>Delivery Address:</Text>
                <Text style={[styles.customerText, { lineHeight: 1.2 }]}>{invoice.customer_address}</Text>
              </View>
            )}
          </View>
          <View style={{ width: '40%', alignItems: 'flex-end' }}>
            <Text style={styles.sectionTitle}>Invoice Summary</Text>
            <Text style={styles.summaryText}>Payment Mode: {invoice.payment_method.toUpperCase()}</Text>
            {invoice.payment_method === 'cash' && invoice.amount_tendered !== null && (
              <>
                <Text style={styles.summaryText}>Tendered: {formatCurrency(invoice.amount_tendered)}</Text>
                <Text style={styles.summaryText}>Change: {formatCurrency(invoice.change_amount ?? 0)}</Text>
              </>
            )}
            <Text style={styles.summaryText}>Billed By: {invoice.created_by_name ?? 'Staff'}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.thNum}>#</Text>
            <Text style={styles.thDesc}>Item Description</Text>
            <Text style={styles.thSku}>SKU</Text>
            <Text style={styles.thPrice}>Unit Price</Text>
            <Text style={styles.thQty}>Qty</Text>
            <Text style={styles.thTotal}>Total</Text>
          </View>
          {items.map((item, idx) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.tdNum}>{idx + 1}</Text>
              <Text style={styles.tdDesc}>{item.product_name}</Text>
              <Text style={styles.tdSku}>{item.product_sku}</Text>
              <Text style={styles.tdPrice}>{formatCurrency(item.unit_price)}</Text>
              <Text style={styles.tdQty}>{item.quantity}</Text>
              <Text style={styles.tdTotal}>{formatCurrency(item.line_total)}</Text>
            </View>
          ))}
        </View>

        {/* Calculations Footer */}
        <View style={styles.footerSection}>
          <View style={styles.termsCol}>
            <Text style={styles.termTitle}>Terms & Conditions</Text>
            <Text style={styles.termItem}>• GST is not applicable (Zero GST billing).</Text>
            <Text style={styles.termItem}>• Goods once sold cannot be taken back or exchanged.</Text>
            <Text style={styles.termItem}>• Delivery is subject to availability and transport.</Text>
            {invoice.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.termTitle}>Notes:</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </View>
            )}
          </View>

          <View style={styles.totalsCol}>
            <View style={styles.totalsRow}>
              <Text style={{ color: '#64748b' }}>Subtotal</Text>
              <Text style={{ fontWeight: 'bold' }}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            {invoice.discount_amount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={{ color: '#16a34a' }}>Discount</Text>
                <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>-{formatCurrency(invoice.discount_amount)}</Text>
              </View>
            )}
            {invoice.delivery_charge > 0 && (
              <View style={styles.totalsRow}>
                <Text style={{ color: '#64748b' }}>Delivery</Text>
                <Text style={{ fontWeight: 'bold' }}>+{formatCurrency(invoice.delivery_charge)}</Text>
              </View>
            )}
            {invoice.installation_charge > 0 && (
              <View style={styles.totalsRow}>
                <Text style={{ color: '#64748b' }}>Installation</Text>
                <Text style={{ fontWeight: 'bold' }}>+{formatCurrency(invoice.installation_charge)}</Text>
              </View>
            )}
            {invoice.round_off !== 0 && (
              <View style={styles.totalsRow}>
                <Text style={{ color: '#94a3b8' }}>Round Off</Text>
                <Text style={{ color: '#64748b' }}>{invoice.round_off > 0 ? '+' : ''}{formatCurrency(invoice.round_off)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalVal}>{formatCurrency(invoice.grand_total)}</Text>
            </View>
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signSection}>
          <Text style={styles.signFooter}>{store?.invoice_footer ?? 'Thank you for your business!'}</Text>
          <View style={styles.signatureBox}>
            <Text style={styles.signTitle}>Authorized Signatory</Text>
            <Text style={styles.signSubtitle}>{store?.name ?? 'Tirumala Furniture'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
