// ============================================================
// Tirumala Furniture — Label Dynamic Price & Formatting Utilities
// ============================================================

import type { PrintableProduct } from '@/types/label'

export interface LabelPriceDetails {
  mrp: number
  sellingPrice: number
  isDiscounted: boolean
  savingsAmount: number
  discountPercent: number
  formattedMRP: string
  formattedSellingPrice: string
  formattedSavings: string
}

export function calculateLabelPricing(
  product: PrintableProduct,
  currencySymbol = '₹'
): LabelPriceDetails {
  const sellingPrice = Number(product.selling_price || 0)
  const rawMRP = Number(product.mrp && product.mrp > 0 ? product.mrp : sellingPrice)
  const mrp = rawMRP >= sellingPrice ? rawMRP : sellingPrice

  const isDiscounted = mrp > sellingPrice
  const savingsAmount = isDiscounted ? mrp - sellingPrice : 0
  const discountPercent = isDiscounted && mrp > 0 ? Math.round((savingsAmount / mrp) * 100) : 0

  const format = (num: number) =>
    `${currencySymbol}${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return {
    mrp,
    sellingPrice,
    isDiscounted,
    savingsAmount,
    discountPercent,
    formattedMRP: format(mrp),
    formattedSellingPrice: format(sellingPrice),
    formattedSavings: format(savingsAmount),
  }
}

/**
 * Builds clean, fast-scanning SKU payload for optical POS guns.
 */
export function buildQRPayload(
  product: PrintableProduct,
  payloadType: 'sku' | 'barcode' = 'sku'
): string {
  if (payloadType === 'barcode' && product.barcode) {
    return product.barcode
  }
  // Enforce SKU payload for optical scanner speed & low matrix density
  return product.sku || product.barcode || product.id
}
