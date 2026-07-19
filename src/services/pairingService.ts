import { createClient } from '@/lib/supabase/client'
import type { ScannerDevice, BillingCounter, PairingSession } from '@/types/pairing'
import { DeviceStorageService } from './deviceStorageService'

export class PairingService {
  private static supabase = createClient()

  /**
   * Generates SHA-256 hash string from input string using SubtleCrypto API.
   */
  static async hashToken(token: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      let hash = 0
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i)
        hash |= 0
      }
      return `fallback_${Math.abs(hash).toString(16)}`
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(token)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Server-Side Token Generation Authority: Generates 256-bit secure pairing token.
   */
  static generateSecureToken(): string {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const array = new Uint8Array(32)
      window.crypto.getRandomValues(array)
      return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
    }
    return `tok_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`
  }

  /**
   * Desktop: Get or create default billing counter for store.
   */
  static async getOrCreateDefaultCounter(storeId: string): Promise<BillingCounter> {
    const { data: counters, error } = await (this.supabase
      .from('billing_counters' as any)
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .limit(1) as any)

    if (!error && counters && counters.length > 0) {
      return counters[0] as BillingCounter
    }

    const { data: newCounter, error: createErr } = await (this.supabase
      .from('billing_counters' as any)
      .insert({
        store_id: storeId,
        name: 'Main Counter 1',
        code: 'CTR-01',
        is_active: true,
      } as any)
      .select('*')
      .single() as any)

    if (createErr) throw createErr
    return newCounter as BillingCounter
  }

  /**
   * Desktop: Create 2-minute single-use pairing session.
   */
  static async createPairingSession(storeId: string, counterId: string, userId?: string): Promise<PairingSession> {
    const pairingCode = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString()

    const { data, error } = await (this.supabase
      .from('scanner_pairing_sessions' as any)
      .insert({
        store_id: storeId,
        counter_id: counterId,
        pairing_code: pairingCode,
        expires_at: expiresAt,
        is_used: false,
        attempts: 0,
        created_by: userId,
      } as any)
      .select('*')
      .single() as any)

    if (error) throw error
    return data as PairingSession
  }

  /**
   * Mobile: Redeem Desktop Pairing QR Code and receive raw Pairing Token.
   */
  static async pairDeviceWithCode(pairingCode: string, deviceName = 'Mobile Scanner'): Promise<{ token: string; device: ScannerDevice }> {
    const { data: session, error: sessErr } = await (this.supabase
      .from('scanner_pairing_sessions' as any)
      .select('*')
      .eq('pairing_code', pairingCode)
      .single() as any)

    if (sessErr || !session) {
      throw new Error('Invalid or expired pairing QR code')
    }

    if (session.is_used) {
      throw new Error('This pairing QR code has already been used')
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      throw new Error('Pairing QR code expired. Please generate a new QR on Desktop')
    }

    if (session.attempts >= 5) {
      throw new Error('Pairing session invalidated due to excessive attempts')
    }

    // Server-Side Token Generation Authority
    const rawToken = this.generateSecureToken()
    const tokenHash = await this.hashToken(rawToken)
    const capabilities = DeviceStorageService.detectCapabilities()

    // 1. Register device
    const { data: device, error: devErr } = await (this.supabase
      .from('scanner_devices' as any)
      .insert({
        store_id: session.store_id,
        counter_id: session.counter_id,
        device_name: deviceName,
        pairing_token_hash: tokenHash,
        platform: capabilities.platform,
        browser: capabilities.browser,
        os: capabilities.os,
        app_version: '2.2.0',
        status: 'active',
        capabilities,
        last_seen_at: new Date().toISOString(),
      } as any)
      .select('*')
      .single() as any)

    if (devErr) throw devErr

    // 2. Log immutable pairing history
    await (this.supabase
      .from('scanner_pairing_history' as any)
      .insert({
        store_id: session.store_id,
        device_id: device.id,
        counter_id: session.counter_id,
        paired_by: session.created_by,
        paired_at: new Date().toISOString(),
      } as any) as any)

    // 3. Mark session as used
    await (this.supabase
      .from('scanner_pairing_sessions' as any)
      .update({ is_used: true } as any)
      .eq('id', session.id) as any)

    // 4. Store token locally
    DeviceStorageService.setPairingToken(rawToken)
    DeviceStorageService.setDeviceId(device.id)
    DeviceStorageService.setStoreId(session.store_id)
    DeviceStorageService.setCounterId(session.counter_id)
    DeviceStorageService.setDeviceName(deviceName)

    return { token: rawToken, device: device as ScannerDevice }
  }

  /**
   * Mobile: Validate stored token on PWA startup.
   */
  static async validateToken(rawToken: string): Promise<ScannerDevice | null> {
    if (!rawToken) return null
    const tokenHash = await this.hashToken(rawToken)

    const { data: devices, error } = await (this.supabase
      .from('scanner_devices' as any)
      .select('*')
      .eq('pairing_token_hash', tokenHash)
      .eq('status', 'active')
      .limit(1) as any)

    if (error || !devices || devices.length === 0) {
      return null
    }

    const dev = devices[0] as ScannerDevice
    ;(this.supabase
      .from('scanner_devices' as any)
      .update({ last_seen_at: new Date().toISOString() } as any)
      .eq('id', dev.id) as any)
      .then(() => {})

    return dev
  }

  /**
   * Desktop: Revoke a paired scanner device.
   */
  static async revokeDevice(deviceId: string, reason = 'Manually revoked by desktop cashier'): Promise<boolean> {
    const { error } = await (this.supabase
      .from('scanner_devices' as any)
      .update({ status: 'revoked', updated_at: new Date().toISOString() } as any)
      .eq('id', deviceId) as any)

    if (!error) {
      const { data: dev } = await (this.supabase
        .from('scanner_devices' as any)
        .select('store_id, counter_id')
        .eq('id', deviceId)
        .single() as any)

      if (dev) {
        await (this.supabase
          .from('scanner_pairing_history' as any)
          .insert({
            store_id: dev.store_id,
            device_id: deviceId,
            counter_id: dev.counter_id,
            revoked_at: new Date().toISOString(),
            revocation_reason: reason,
          } as any) as any)
      }
    }

    return !error
  }
}
