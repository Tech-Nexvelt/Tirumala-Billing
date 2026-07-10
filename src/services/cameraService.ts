/**
 * CameraService
 * Handles hardware camera access, video constraints, and orientation changes.
 */
export class CameraService {
  private stream: MediaStream | null = null

  /**
   * Request media devices and acquire user media video track stream.
   * Attaches output to target HTMLVideoElement.
   */
  async startStream(videoElement: HTMLVideoElement): Promise<MediaStream> {
    this.stopStream()

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      videoElement.srcObject = this.stream
      // Play immediately to start streaming
      await videoElement.play().catch(err => {
        console.warn('[CameraService] Video autoplay blocked:', err)
      })

      return this.stream
    } catch (err: any) {
      console.error('[CameraService] Error accessing user camera:', err)
      throw new Error(err.message || 'Permission denied or camera unavailable')
    }
  }

  /**
   * Safely stop all active media stream tracks and clear stream reference.
   */
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
        console.log(`[CameraService] Stopped track: ${track.label}`)
      })
      this.stream = null
    }
  }

  /**
   * Apply advanced constraints to turn video track flashlight/torch on or off.
   */
  async toggleTorch(enable: boolean): Promise<boolean> {
    if (!this.stream) return false

    const track = this.stream.getVideoTracks()[0]
    if (!track) return false

    try {
      const capabilities = track.getCapabilities() as any
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: enable }]
        } as any)
        return true
      }
      return false
    } catch (err) {
      console.warn('[CameraService] Torch toggle failed:', err)
      return false
    }
  }

  /**
   * Check if camera stream is currently active.
   */
  isActive(): boolean {
    return this.stream !== null && this.stream.getVideoTracks().some(t => t.readyState === 'live')
  }
}
