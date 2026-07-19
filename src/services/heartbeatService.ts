import { createClient } from '@/lib/supabase/client'
import { PairingService } from './pairingService'

export class HeartbeatService {
  private static intervalId: any = null
  private static supabase = createClient()

  static start(deviceId: string, token: string, storeId?: string) {
    this.stop()

    const sendHeartbeat = async () => {
      const startTime = performance.now()
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

        const tokenHash = await PairingService.hashToken(token)

        const { error } = await (this.supabase
          .from('scanner_devices' as any)
          .update({
            last_seen_at: new Date().toISOString(),
            battery_level: batteryLevel,
          } as any)
          .eq('id', deviceId)
          .eq('pairing_token_hash', tokenHash)
          .eq('status', 'active') as any)

        const endTime = performance.now()
        const latencyMs = Math.round(endTime - startTime)
        const healthScore = Math.max(10, 100 - Math.floor(latencyMs / 10))

        if (!error && storeId) {
          await (this.supabase
            .from('scanner_presence' as any)
            .upsert({
              device_id: deviceId,
              store_id: storeId,
              status: 'ONLINE',
              latency_ms: latencyMs,
              health_score: healthScore,
              last_heartbeat_at: new Date().toISOString(),
            } as any) as any)
        }
      } catch (err) {
        console.error('[HeartbeatService] Loop error:', err)
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
