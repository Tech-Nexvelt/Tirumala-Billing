/**
 * HeartbeatService — calls /api/scanner/heartbeat (server-side, service_role)
 * so the phone can update presence without needing a Supabase auth session.
 */
export class HeartbeatService {
  private static intervalId: any = null

  static start(deviceId: string, token: string, storeId?: string) {
    this.stop()

    const sendHeartbeat = async () => {
      try {
        let batteryLevel: number | null = null
        if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
          try {
            const battery = await (navigator as any).getBattery()
            batteryLevel = Math.round((battery.level || 0) * 100)
          } catch {
            // battery API optional
          }
        }

        await fetch('/api/scanner/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId, token, storeId, batteryLevel }),
        })
      } catch (err) {
        console.warn('[HeartbeatService] Heartbeat failed (network):', err)
      }
    }

    sendHeartbeat()
    this.intervalId = setInterval(sendHeartbeat, 15000)
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
