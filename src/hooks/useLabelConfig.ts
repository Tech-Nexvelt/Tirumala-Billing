'use client'
import { useState, useEffect, useCallback } from 'react'
import type { LabelConfig } from '@/types/label'
import { useAuth } from '@/hooks/useAuth'

const STORAGE_KEY = 'tirumala_label_config_v3'

export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  size: '100x150',
  templateId: 'luxury_retail',
  storeName: 'TIRUMALA FURNITURE',
  legalName: 'Tirumala Home & Office Solutions Pvt Ltd',
  address: 'Main Road, Near Bus Station, Anantapur - 515001',
  phone: '+91 98765 43210',
  website: 'www.tirumalafurniture.com',
  logoUrl: '',
  primaryColor: '#0F172A',
  accentColor: '#D97706',
  currencySymbol: '₹',
  mrpLabel: 'M.R.P.',
  offerPriceLabel: 'OFFER PRICE',
  savingsLabel: 'YOU SAVE',
  footerText: 'Certified Premium Quality • Inclusive of All Taxes',
  qrPromptText: 'Scan for Instant POS Billing',
  qrPayloadType: 'sku',
  qrErrorCorrection: 'M',
  warehouseLocation: 'Zone A - Rack 3',
  fontSizeScale: 1.0,
  headerAlignment: 'between',
  elementSpacing: 'normal',
  showProductImage: true,
  showMRP: true,
  showSavingsBadge: true,
  showDimensions: true,
  showMaterial: true,
  showColor: true,
  showBrand: true,
  showWarranty: true,
  showMfgDate: true,
  showCategory: true,
  showWarehouseLoc: true,
  copiesPerProduct: 1,
  a4Cols: 2,
}

export function useLabelConfig() {
  const { store } = useAuth()
  const [config, setConfig] = useState<LabelConfig>(DEFAULT_LABEL_CONFIG)
  const [isLoaded, setIsLoaded] = useState(false)

  // Automatically sync store branding from active Store Settings if store is available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      let initial = { ...DEFAULT_LABEL_CONFIG }
      if (saved) {
        initial = { ...initial, ...JSON.parse(saved) }
      }

      // Auto-pull store details if store profile exists
      if (store) {
        if (store.name) initial.storeName = store.name.toUpperCase()
        if (store.legal_name) initial.legalName = store.legal_name
        if (store.address) initial.address = store.address
        if (store.phone) initial.phone = store.phone
        if (store.website) initial.website = store.website
        if (store.logo_url) initial.logoUrl = store.logo_url
        if (store.currency_symbol) initial.currencySymbol = store.currency_symbol
      }

      setConfig(initial)
    } catch {
      // Ignore parse errors
    } finally {
      setIsLoaded(true)
    }
  }, [store])

  const updateConfig = useCallback((updates: Partial<LabelConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (e) {
        console.error('Failed to save label config:', e)
      }
      return next
    })
  }, [])

  const resetConfig = useCallback(() => {
    let reset = { ...DEFAULT_LABEL_CONFIG }
    if (store) {
      if (store.name) reset.storeName = store.name.toUpperCase()
      if (store.address) reset.address = store.address
      if (store.phone) reset.phone = store.phone
      if (store.website) reset.website = store.website
      if (store.logo_url) reset.logoUrl = store.logo_url
      if (store.currency_symbol) reset.currencySymbol = store.currency_symbol
    }
    setConfig(reset)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [store])

  return {
    config,
    updateConfig,
    resetConfig,
    isLoaded,
  }
}
