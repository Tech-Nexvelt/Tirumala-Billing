/**
 * FeedbackService
 * Provides cashier-facing audio (Web Audio API) and haptic (vibration) feedback.
 */
export class FeedbackService {
  /**
   * Sound and vibrate for a successful scan connection/event.
   * Plays a high-pitched 1000Hz beep and vibrates the phone for 80ms.
   */
  static triggerSuccess() {
    if (typeof window === 'undefined') return

    // Haptics
    if (navigator.vibrate) {
      navigator.vibrate(80)
    }

    // Audio beep
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return

      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.frequency.value = 1000 // high beep
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      // Exponential decay over 150ms
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch (e) {
      console.warn('[FeedbackService] Autoplay policy blocked audio beep:', e)
    }
  }

  /**
   * Sound and vibrate for an unknown barcode, error, or network disconnect.
   * Plays a low-pitched sawtooth beep and vibrates in a double-pulse pattern.
   */
  static triggerError() {
    if (typeof window === 'undefined') return

    // Haptics double-pulse
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    // Audio alert
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return

      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'sawtooth'
      osc.frequency.value = 220 // low pitch error hum
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)

      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } catch (e) {
      console.warn('[FeedbackService] AudioCtx error beep blocked:', e)
    }
  }
}
