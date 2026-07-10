/**
 * ScannerService
 * Integrates native GPU-accelerated BarcodeDetector API with a dynamic fallback
 * to html5-qrcode (ZXing under the hood) for wider browser support.
 */
export class ScannerService {
  private active = false
  private scannerInstance: any = null

  /**
   * Check if native BarcodeDetector API is supported in the browser.
   */
  isNativeSupported(): boolean {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window
  }

  /**
   * Start frame decoding on the video element.
   * If native API is available, runs GPU decoding via requestAnimationFrame loop.
   * Otherwise, lazy-loads html5-qrcode and starts the canvas worker decoder.
   */
  async start(
    videoElement: HTMLVideoElement,
    onBarcodeDetected: (barcode: string) => void,
    onError: (err: any) => void
  ): Promise<void> {
    this.stop()
    this.active = true

    if (this.isNativeSupported()) {
      try {
        const formats = ['code_128', 'code_39', 'ean_13', 'upc_a']
        const detector = new (window as any).BarcodeDetector({ formats })

        const scanFrame = async () => {
          if (!this.active) return

          try {
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
              const barcodes = await detector.detect(videoElement)
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                onBarcodeDetected(barcodes[0].rawValue)
              }
            }
          } catch (err) {
            // Frame detection failure (normal if frame is empty/fuzzy)
          }

          if (this.active) {
            requestAnimationFrame(scanFrame)
          }
        }

        requestAnimationFrame(scanFrame)
        console.log('[ScannerService] Started native GPU BarcodeDetector')
      } catch (err) {
        console.error('[ScannerService] Native detector failed to start:', err)
        onError(err)
      }
    } else {
      // Fallback: dynamic lazy import to prevent bundling overhead
      try {
        console.log('[ScannerService] Native BarcodeDetector missing, loading ZXing fallback...')
        const { Html5Qrcode } = await import('html5-qrcode')
        
        // We reuse the standard HTML5 element ID expected by the library
        // We ensure a target container ID exists or create one dynamically
        let qrReader = document.getElementById('qr-reader-fallback')
        if (!qrReader) {
          qrReader = document.createElement('div')
          qrReader.id = 'qr-reader-fallback'
          qrReader.style.display = 'none'
          document.body.appendChild(qrReader)
        }

        const scanner = new Html5Qrcode('qr-reader-fallback')
        this.scannerInstance = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 260, height: 140 },
            aspectRatio: 1.777778
          },
          (decodedText) => {
            if (this.active) onBarcodeDetected(decodedText)
          },
          () => {} // parse errors (normal, ignore)
        )
        console.log('[ScannerService] Started ZXing fallback decoder')
      } catch (err) {
        console.error('[ScannerService] Fallback scanner failed to start:', err)
        onError(err)
      }
    }
  }

  /**
   * Stop any active frame-decoding loop or fallback scanner instance.
   */
  stop() {
    this.active = false
    if (this.scannerInstance) {
      if (this.scannerInstance.isScanning) {
        this.scannerInstance.stop().catch((e: any) => {
          console.warn('[ScannerService] Error stopping fallback scanner:', e)
        })
      }
      this.scannerInstance = null
    }
  }
}
