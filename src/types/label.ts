// ============================================================
// Tirumala Furniture — Label Printing & Templates Types
// ============================================================

export type LabelSize = '100x150' | '80x120' | '70x100' | '50x75' | 'thermal_roll' | 'a4_grid'

export type TemplateId = 'luxury_retail' | 'warehouse' | 'sale' | 'minimal' | 'thermal'

export type QRPayloadType = 'sku' | 'barcode'

export type QRErrorCorrection = 'L' | 'M' | 'Q' | 'H'

export type HeaderAlignment = 'left' | 'center' | 'between'

export type ElementSpacing = 'compact' | 'normal' | 'spacious'

export interface LabelConfig {
  size: LabelSize
  templateId: TemplateId
  // Store branding (auto-synced with store settings or overridable)
  storeName: string
  legalName: string
  address: string
  phone: string
  website: string
  logoUrl: string
  primaryColor: string
  accentColor: string
  currencySymbol: string
  mrpLabel: string
  offerPriceLabel: string
  savingsLabel: string
  footerText: string
  qrPromptText: string
  qrPayloadType: QRPayloadType
  qrErrorCorrection: QRErrorCorrection
  warehouseLocation: string
  // Visual layout designer controls
  fontSizeScale: number // e.g. 0.85, 1.0, 1.15
  headerAlignment: HeaderAlignment
  elementSpacing: ElementSpacing
  // Toggles for visible fields
  showProductImage: boolean
  showMRP: boolean
  showSavingsBadge: boolean
  showDimensions: boolean
  showMaterial: boolean
  showColor: boolean
  showBrand: boolean
  showWarranty: boolean
  showMfgDate: boolean
  showCategory: boolean
  showWarehouseLoc: boolean
  copiesPerProduct: number
  a4Cols: number
}

export interface PrintableProduct {
  id: string
  name: string
  sku: string
  barcode?: string | null
  selling_price: number
  mrp?: number | null
  category_name?: string | null
  brand?: string | null
  color?: string | null
  material?: string | null
  dimensions?: string | null
  warranty?: string | null
  mfg_date?: string | null
  warehouse_location?: string | null
  description?: string | null
  image_url?: string | null
  stock_qty?: number
}

export interface PrintQueueItem {
  product: PrintableProduct
  copies: number
}

export interface PrintAuditLogItem {
  id: string
  productId: string
  productName: string
  sku: string
  printedBy: string
  printedAt: string
  templateId: TemplateId
  size: LabelSize
  copiesCount: number
}
