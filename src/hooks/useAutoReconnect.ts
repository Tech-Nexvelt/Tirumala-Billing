'use client'
import { useState, useEffect } from 'react'
import { DeviceStorageService } from '@/services/deviceStorageService'
import { PairingService } from '@/services/pairingService'
import { HeartbeatService } from '@/services/heartbeatService'
import type { ScannerDevice } from '@/types/pairing'

export type AutoReconnectState =
  | 'INITIALIZING'
  | 'VALIDATING'
  | 'CONNECTED'
  | 'UNPAIRED'
  | 'REVOKED'
  | 'ERROR'

export function useAutoReconnect() {
  const [state, setState] = useState<AutoReconnectState>('INITIALIZING')
  const [device, setDevice] = useState<ScannerDevice | null>(null)

  useEffect(() => {
    let active = true

    const validateSavedPairing = async () => {
      const storedToken = DeviceStorageService.getPairingToken()
      const cachedDevice = DeviceStorageService.getSavedDevice()

      if (!storedToken) {
        if (active) setState('UNPAIRED')
        return
      }

      // Pre-fill from local cache for instant pairing connection
      if (cachedDevice) {
        setDevice(cachedDevice)
        setState('CONNECTED')
        HeartbeatService.start(cachedDevice.id, storedToken)
      } else {
        setState('VALIDATING')
      }

      try {
        const validDevice = await PairingService.validateToken(storedToken)
        if (!active) return

        if (validDevice) {
          setDevice(validDevice)
          setState('CONNECTED')
          HeartbeatService.start(validDevice.id, storedToken)
        } else {
          // Token explicitly revoked by Desktop POS
          DeviceStorageService.clearPairing()
          HeartbeatService.stop()
          setDevice(null)
          setState('REVOKED')
        }
      } catch (err) {
        console.warn('[useAutoReconnect] Background validation network hiccup (retaining cached pairing):', err)
        // Network error/offline — KEEP paired! Do not unpair phone!
        if (cachedDevice && active) {
          setDevice(cachedDevice)
          setState('CONNECTED')
        }
      }
    }

    validateSavedPairing()

    return () => {
      active = false
      HeartbeatService.stop()
    }
  }, [])

  return {
    state,
    device,
    isPaired: state === 'CONNECTED',
    resetPairing: () => {
      DeviceStorageService.clearPairing()
      HeartbeatService.stop()
      setState('UNPAIRED')
      setDevice(null)
    },
  }
}
