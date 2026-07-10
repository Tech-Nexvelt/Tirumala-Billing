/**
 * BarcodeService
 * Handles barcode verification, normalization, and de-duplication policies.
 */
export class BarcodeService {
  private lastScanTime = 0
  private lastBarcode = ''
  private readonly cooldownWindow = 800 // milliseconds

  /**
   * Cleans raw scans to remove hidden control codes, carriage returns, or whitespaces.
   */
  normalize(rawBarcode: string): string {
    return rawBarcode.trim().replace(/[\u0002\u0003\r\n\t]/g, '')
  }

  /**
   * Enforces scanning policies:
   * - Prevents duplicate scans of the SAME barcode within the cooldown window (800ms).
   * - Allows DIFFERENT barcodes to bypass the cooldown instantly to support fast cashier workflow.
   */
  shouldProcess(barcode: string): boolean {
    const cleanBarcode = this.normalize(barcode)
    if (!cleanBarcode) return false

    const now = Date.now()
    const isSameBarcode = cleanBarcode === this.lastBarcode
    const timeDelta = now - this.lastScanTime

    if (isSameBarcode && timeDelta < this.cooldownWindow) {
      // Ignore scan
      return false
    }

    // Accept scan and update pointers
    this.lastBarcode = cleanBarcode
    this.lastScanTime = now
    return true
  }

  /**
   * Resets the de-duplication state manually (e.g. on route change or scanner pause).
   */
  reset() {
    this.lastBarcode = ''
    this.lastScanTime = 0
  }
}
