'use client'
import { useEffect, useCallback } from 'react'

type KeyCombo = {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

type Shortcut = KeyCombo & {
  handler: () => void
  description?: string
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = !!shortcut.ctrl === e.ctrlKey
      const shiftMatch = !!shortcut.shift === e.shiftKey
      const altMatch = !!shortcut.alt === e.altKey
      const metaMatch = !!shortcut.meta === e.metaKey

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        if (shortcut.preventDefault !== false) e.preventDefault()
        shortcut.handler()
        return
      }
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Billing-specific shortcuts
export const BILLING_SHORTCUTS = {
  NEW_BILL:        { key: 'n', ctrl: true, description: 'New Bill' },
  SAVE_PRINT:      { key: 's', ctrl: true, description: 'Save & Print' },
  FOCUS_SCANNER:   { key: 'F2', description: 'Focus Barcode Scanner' },
  SEARCH_PRODUCT:  { key: 'p', ctrl: true, description: 'Search Product' },
  CLEAR_BILL:      { key: 'Delete', ctrl: true, shift: true, description: 'Clear Bill' },
}
