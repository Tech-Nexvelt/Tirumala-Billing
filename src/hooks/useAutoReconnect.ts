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

      if (!storedToken) {
        if (active) setState('UNPAIRED')
        return
      }

      if (active) setState('VALIDATING')

      try {
        const validDevice = await PairingService.validateToken(storedToken)
        if (!active) return

        if (validDevice) {
          setDevice(validDevice)
          setState('CONNECTED')
          // Launch Telemetry Heartbeat (15s loop)
          HeartbeatService.start(validDevice.id, storedToken)
        } else {
          // Token revoked or deleted
          DeviceStorageService.clearPairing()
          setState('REVOKED')
        }
      } catch (err) {
        console.error('[useAutoReconnect] Validation error:', err)
        if (active) setState('ERROR')
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
