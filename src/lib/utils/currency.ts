// ============================================================
// Utility: Currency Formatting (Indian Number System)
// ============================================================

const INR_FORMAT = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const INR_FORMAT_NO_DECIMALS = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const NUMBER_FORMAT = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number, symbol = '₹'): string {
  if (symbol === '₹') {
    return INR_FORMAT.format(amount)
  }
  return `${symbol}${NUMBER_FORMAT.format(amount)}`
}

export function formatCurrencyShort(amount: number, symbol = '₹'): string {
  if (symbol === '₹') {
    return INR_FORMAT_NO_DECIMALS.format(amount)
  }
  return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`
}

export function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value)
}

export function formatCompact(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)}Cr`
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)}L`
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`
  return formatCurrency(value)
}

export function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

export function roundOff(amount: number): { rounded: number; roundOff: number } {
  const rounded = Math.round(amount)
  const roundOff = rounded - amount
  return { rounded, roundOff: parseFloat(roundOff.toFixed(2)) }
}
