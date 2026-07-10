// ============================================================
// SKU Generator — Category prefix + timestamp hash
// ============================================================

const CATEGORY_PREFIXES: Record<string, string> = {
  'sofa':       'SOF',
  'seating':    'SEA',
  'bed':        'BED',
  'mattress':   'MAT',
  'dining':     'DIN',
  'kitchen':    'KIT',
  'wardrobe':   'WAR',
  'office':     'OFF',
  'storage':    'STO',
  'shelf':      'SHF',
  'outdoor':    'OUT',
  'accessory':  'ACC',
  'accessories':'ACC',
}

function getCategoryPrefix(categoryName?: string): string {
  if (!categoryName) return 'PRD'
  const lower = categoryName.toLowerCase()
  for (const [key, prefix] of Object.entries(CATEGORY_PREFIXES)) {
    if (lower.includes(key)) return prefix
  }
  return categoryName.toUpperCase().slice(0, 3).padEnd(3, 'X')
}

function getNameInitials(name: string): string {
  return name
    .split(/[\s-]+/)
    .map(w => w.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3)
    .padEnd(3, 'X')
}

let skuCounter = 0

export function generateSKU(productName: string, categoryName?: string): string {
  const prefix = categoryName ? getCategoryPrefix(categoryName) : getNameInitials(productName)
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
  const counter = (++skuCounter % 100).toString().padStart(2, '0')
  return `${prefix}-${timestamp}${counter}`
}

export function generateBarcode(sku: string): string {
  // Code128 compatible: store prefix + sku
  const clean = sku.replace(/[^A-Z0-9-]/g, '')
  const timestamp = Date.now().toString().slice(-6)
  return `TF${clean}${timestamp}`.slice(0, 20).toUpperCase()
}

export function validateBarcode(barcode: string): boolean {
  return /^[A-Z0-9-]{4,30}$/i.test(barcode)
}

export function validateSKU(sku: string): boolean {
  return /^[A-Z0-9-]{3,20}$/i.test(sku)
}
