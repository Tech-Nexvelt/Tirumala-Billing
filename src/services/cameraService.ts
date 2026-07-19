/**
 * CameraService
 * Handles hardware camera media streams, camera switching, torch, and focus constraints.
 */
export class CameraService {
  private stream: MediaStream | null = null
  private currentFacingMode: 'environment' | 'user' = 'environment'

  /**
   * Request user media video stream with optimal constraints.
   */
  async startStream(
    videoElement: HTMLVideoElement,
    facingMode: 'environment' | 'user' = 'environment'
  ): Promise<MediaStream> {
    this.stopStream()
    this.currentFacingMode = facingMode

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      })

      videoElement.srcObject = this.stream
      await videoElement.play().catch(err => {
        console.warn('[CameraService] Video autoplay play() blocked:', err)
      })

      // Attempt applying continuous focus mode if supported
      const track = this.stream.getVideoTracks()[0]
      if (track && 'applyConstraints' in track) {
        try {
          const caps = (track.getCapabilities?.() as any) || {}
          if (caps.focusMode?.includes('continuous')) {
            await track.applyConstraints({
              advanced: [{ focusMode: 'continuous' } as any]
            })
          }
        } catch {
          // Focus constraint optional
        }
      }

      return this.stream
    } catch (err: any) {
      console.error('[CameraService] Error accessing video media stream:', err)
      throw new Error(err.message || 'Permission denied or camera unavailable')
    }
  }

  /**
   * Toggle between back (environment) and front (user) cameras.
   */
  async switchCamera(videoElement: HTMLVideoElement): Promise<'environment' | 'user'> {
    const nextFacing = this.currentFacingMode === 'environment' ? 'user' : 'environment'
    await this.startStream(videoElement, nextFacing)
    return nextFacing
  }

  /**
   * Stop all active stream tracks.
   */
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
      })
      this.stream = null
    }
  }

  /**
   * Toggle camera torch flashlight.
   */
  async toggleTorch(enable: boolean): Promise<boolean> {
    if (!this.stream) return false
    const track = this.stream.getVideoTracks()[0]
    if (!track) return false

    try {
      const capabilities = (track.getCapabilities?.() as any) || {}
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: enable }]
        } as any)
        return true
      }
      return false
    } catch (err) {
      console.warn('[CameraService] Torch constraint failed:', err)
      return false
    }
  }

  isActive(): boolean {
    return this.stream !== null && this.stream.getVideoTracks().some(t => t.readyState === 'live')
  }

  getFacingMode() {
    return this.currentFacingMode
  }
}
