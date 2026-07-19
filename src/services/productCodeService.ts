/**
 * ProductCodeService
 * Enterprise QR payload normalization, validation, and multi-layer deduplication engine.
 */
export class ProductCodeService {
  private lastPayload = ''
  private lastScanTimestamp = 0
  private readonly temporalWindowMs = 1200 // 1.2s cooldown for identical payload repeats

  /**
   * Normalizes raw scan inputs.
   * Extracts clean SKU from URLs (e.g. http://.../product/TF-BED-001 or ?scan=TF-BED-001) or raw text.
   */
  normalize(rawInput: string): string {
    if (!rawInput) return ''
    let cleaned = rawInput.trim().replace(/[\u0002\u0003\r\n\t]/g, '')

    // Handle URL payloads
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      try {
        const url = new URL(cleaned)
        const pathSegments = url.pathname.split('/').filter(Boolean)
        const lastSegment = pathSegments[pathSegments.length - 1]
        const queryCode = url.searchParams.get('scan') || url.searchParams.get('sku')
        cleaned = queryCode || lastSegment || cleaned
      } catch {
        // use raw if URL parsing fails
      }
    }

    // Handle "SKU:" prefix
    if (cleaned.toUpperCase().startsWith('SKU:')) {
      cleaned = cleaned.substring(4).trim()
    }

    return cleaned.toUpperCase()
  }

  /**
   * Validates SKU format.
   * Rejects empty or invalid strings.
   */
  isValidSKU(sku: string): boolean {
    const clean = this.normalize(sku)
    return clean.length >= 3 && clean.length <= 40
  }

  /**
   * Multi-layer Frame Lock & Temporal Cooldown:
   * - Prevents duplicate triggers while camera stays focused on the same QR label.
   * - Immediately unlocks if a DIFFERENT SKU is detected.
   */
  shouldProcess(rawInput: string): boolean {
    const clean = this.normalize(rawInput)
    if (!this.isValidSKU(clean)) return false

    const now = Date.now()
    const isSamePayload = clean === this.lastPayload
    const elapsed = now - this.lastScanTimestamp

    if (isSamePayload && elapsed < this.temporalWindowMs) {
      return false
    }

    this.lastPayload = clean
    this.lastScanTimestamp = now
    return true
  }

  reset() {
    this.lastPayload = ''
    this.lastScanTimestamp = 0
  }
}
