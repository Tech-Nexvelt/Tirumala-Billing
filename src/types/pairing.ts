// ============================================================
// Tirumala Furniture — Enterprise Scanner Pairing V2.2 Types
// ============================================================

export type ScannerDeviceStatus = 'active' | 'revoked' | 'disabled'
export type PresenceStatus = 'ONLINE' | 'IDLE' | 'OFFLINE'

export interface BillingCounter {
  id: string
  store_id: string
  name: string
  code: string
  is_active: boolean
  created_at: string
}

export interface DeviceCapabilities {
  hasTorch: boolean
  hasCameraSwitch: boolean
  hasNativeDetector: boolean
  hasVibration: boolean
  cameraCount: number
  hardwareConcurrency: number
  deviceMemoryGbs?: number
  screenWidth: number
  screenHeight: number
  isPWA: boolean
  facingMode: string
  platform: string
  browser: string
  os: string
}

export interface ScannerDevice {
  id: string
  store_id: string
  counter_id: string
  device_name: string
  pairing_token_hash: string
  platform?: string
  browser?: string
  os?: string
  app_version?: string
  status: ScannerDeviceStatus
  battery_level?: number | null
  capabilities?: DeviceCapabilities
  last_seen_at: string
  created_at: string
}

export interface ScannerPresence {
  device_id: string
  store_id: string
  status: PresenceStatus
  latency_ms: number
  network_type: string
  health_score: number
  connected_since: string
  last_heartbeat_at: string
}

export interface ScannerPairingHistory {
  id: string
  store_id: string
  device_id?: string
  counter_id?: string
  paired_by?: string
  paired_at: string
  revoked_at?: string
  revocation_reason?: string
}

export interface PairingSession {
  id: string
  store_id: string
  counter_id: string
  pairing_code: string
  attempts: number
  expires_at: string
  is_used: boolean
  created_by?: string
  created_at: string
}

export interface PairingPayloadQR {
  v: number
  pairingCode: string
  exp: number
}
