/**
 * BarcodeService (Payload Validation & Deduplication Engine)
 * Handles QR payload extraction, normalization, and Frame Lock deduplication.
 */
export class BarcodeService {
  private lastScanTime = 0
  private lastPayload = ''
  private readonly cooldownWindow = 1200 // ms window for identical payload repeat lockout

  /**
   * Normalizes raw scan payloads.
   * Extracts clean SKU from URLs, JSON strings, or raw SKU text.
   */
  normalize(rawInput: string): string {
    if (!rawInput) return ''
    let cleaned = rawInput.trim().replace(/[\u0002\u0003\r\n\t]/g, '')

    // Handle scanned URLs: e.g. https://domain.com/product/TF-MAT-001 or ?scan=TF-MAT-001
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      try {
        const url = new URL(cleaned)
        const pathSegments = url.pathname.split('/').filter(Boolean)
        const lastSegment = pathSegments[pathSegments.length - 1]
        const scanParam = url.searchParams.get('scan') || url.searchParams.get('sku')
        cleaned = scanParam || lastSegment || cleaned
      } catch {
        // use raw if URL parsing fails
      }
    }

    // Handle prefixed SKUs e.g. "SKU:TF-MAT-001"
    if (cleaned.toUpperCase().startsWith('SKU:')) {
      cleaned = cleaned.substring(4).trim()
    }

    return cleaned.toUpperCase()
  }

  /**
   * Enforces scanning deduplication policy:
   * - Ignores identical QR scans within 1200ms cooldown window.
   * - Allows DIFFERENT SKUs to bypass lock instantly for ultra-fast multi-product scanning.
   */
  shouldProcess(rawPayload: string): boolean {
    const payload = this.normalize(rawPayload)
    if (!payload) return false

    const now = Date.now()
    const isSamePayload = payload === this.lastPayload
    const timeDelta = now - this.lastScanTime

    if (isSamePayload && timeDelta < this.cooldownWindow) {
      return false
    }

    this.lastPayload = payload
    this.lastScanTime = now
    return true
  }

  /**
   * Resets internal lock pointers.
   */
  reset() {
    this.lastPayload = ''
    this.lastScanTime = 0
  }
}
