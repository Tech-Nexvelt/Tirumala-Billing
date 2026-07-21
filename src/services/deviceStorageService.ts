import type { DeviceCapabilities } from '@/types/pairing'

const STORAGE_KEYS = {
  TOKEN: 'tf_scanner_pairing_token',
  DEVICE_ID: 'tf_scanner_device_id',
  STORE_ID: 'tf_scanner_store_id',
  COUNTER_ID: 'tf_scanner_counter_id',
  DEVICE_NAME: 'tf_scanner_device_name',
}

export class DeviceStorageService {
  static getPairingToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  static setPairingToken(token: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  }

  static getDeviceId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.DEVICE_ID)
  }

  static setDeviceId(id: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id)
  }

  static getStoreId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.STORE_ID)
  }

  static setStoreId(storeId: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.STORE_ID, storeId)
  }

  static getCounterId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.COUNTER_ID)
  }

  static setCounterId(counterId: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.COUNTER_ID, counterId)
  }

  static getDeviceName(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.DEVICE_NAME)
  }

  static setDeviceName(name: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.DEVICE_NAME, name)
  }

  static getSavedDevice(): any | null {
    if (typeof window === 'undefined') return null
    const id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID)
    const store_id = localStorage.getItem(STORAGE_KEYS.STORE_ID)
    const counter_id = localStorage.getItem(STORAGE_KEYS.COUNTER_ID)
    const device_name = localStorage.getItem(STORAGE_KEYS.DEVICE_NAME) || 'Mobile Scanner'

    if (!id || !store_id) return null

    return {
      id,
      store_id,
      counter_id,
      device_name,
      status: 'active',
      app_version: '2.2.0',
      last_seen_at: new Date().toISOString(),
    }
  }

  static clearPairing() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.DEVICE_ID)
    localStorage.removeItem(STORAGE_KEYS.STORE_ID)
    localStorage.removeItem(STORAGE_KEYS.COUNTER_ID)
    localStorage.removeItem(STORAGE_KEYS.DEVICE_NAME)
  }

  static detectCapabilities(): DeviceCapabilities {
    if (typeof window === 'undefined') {
      return {
        hasTorch: false,
        hasCameraSwitch: false,
        hasNativeDetector: false,
        hasVibration: false,
        cameraCount: 1,
        hardwareConcurrency: 2,
        deviceMemoryGbs: 4,
        screenWidth: 390,
        screenHeight: 844,
        isPWA: false,
        facingMode: 'environment',
        platform: 'Unknown',
        browser: 'Unknown',
        os: 'Unknown',
      }
    }

    const ua = navigator.userAgent
    const platform = (navigator as any).userAgentData?.platform || navigator.platform || 'Mobile'
    const browser =
      ua.includes('Chrome') ? 'Chrome' :
      ua.includes('Safari') ? 'Safari' :
      ua.includes('Firefox') ? 'Firefox' : 'Mobile Browser'

    const os =
      ua.includes('Android') ? 'Android' :
      ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'Mobile OS'

    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true

    return {
      hasTorch: true,
      hasCameraSwitch: true,
      hasNativeDetector: 'BarcodeDetector' in window,
      hasVibration: typeof navigator !== 'undefined' && 'vibrate' in navigator,
      cameraCount: 2,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      deviceMemoryGbs: (navigator as any).deviceMemory || 4,
      screenWidth: window.screen?.width || window.innerWidth,
      screenHeight: window.screen?.height || window.innerHeight,
      isPWA,
      facingMode: 'environment',
      platform,
      browser,
      os,
    }
  }
}
