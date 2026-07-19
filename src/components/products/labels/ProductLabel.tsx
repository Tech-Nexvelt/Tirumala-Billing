'use client'
import React from 'react'
import type { PrintableProduct, LabelConfig, LabelSize, TemplateId } from '@/types/label'
import { LuxuryRetailTemplate } from './templates/LuxuryRetailTemplate'
import { WarehouseTemplate } from './templates/WarehouseTemplate'
import { SaleClearanceTemplate } from './templates/SaleClearanceTemplate'
import { MinimalTemplate } from './templates/MinimalTemplate'
import { ThermalTemplate } from './templates/ThermalTemplate'

interface ProductLabelProps {
  product: PrintableProduct
  config: LabelConfig
  sizeOverride?: LabelSize
  templateOverride?: TemplateId
  className?: string
  style?: React.CSSProperties
}

export const SIZE_DIMENSIONS: Record<LabelSize, { width: string; height: string; aspect: string }> = {
  '100x150': { width: '100mm', height: '150mm', aspect: '100/150' },
  '80x120': { width: '80mm', height: '120mm', aspect: '80/120' },
  '70x100': { width: '70mm', height: '100mm', aspect: '70/100' },
  '50x75': { width: '50mm', height: '75mm', aspect: '50/75' },
  'thermal_roll': { width: '100mm', height: '60mm', aspect: '100/60' },
  'a4_grid': { width: '90mm', height: '130mm', aspect: '90/130' },
}

export const SIZE_QR_SIZES: Record<LabelSize, number> = {
  '100x150': 125,
  '80x120': 95,
  '70x100': 75,
  '50x75': 52,
  'thermal_roll': 65,
  'a4_grid': 100,
}

export function ProductLabel({
  product,
  config,
  sizeOverride,
  templateOverride,
  className = '',
  style = {},
}: ProductLabelProps) {
  const activeTemplate = templateOverride || config.templateId
  const activeSize = sizeOverride || config.size
  const dims = SIZE_DIMENSIONS[activeSize] || SIZE_DIMENSIONS['100x150']
  const qrSize = SIZE_QR_SIZES[activeSize] || 125

  const renderTemplate = () => {
    switch (activeTemplate) {
      case 'warehouse':
        return <WarehouseTemplate product={product} config={config} qrSize={qrSize} />
      case 'sale':
        return <SaleClearanceTemplate product={product} config={config} qrSize={qrSize} />
      case 'minimal':
        return <MinimalTemplate product={product} config={config} qrSize={qrSize} />
      case 'thermal':
        return <ThermalTemplate product={product} config={config} qrSize={qrSize} />
      case 'luxury_retail':
      default:
        return <LuxuryRetailTemplate product={product} config={config} qrSize={qrSize} />
    }
  }

  return (
    <div
      className={`label-container select-none print:shadow-none print:border-none ${className}`}
      style={{
        width: dims.width,
        height: dims.height,
        maxWidth: '100%',
        ...style,
      }}
    >
      {renderTemplate()}
    </div>
  )
}
