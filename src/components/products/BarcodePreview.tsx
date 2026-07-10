'use client'
import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodePreviewProps {
  value: string
  format?: string
  width?: number
  height?: number
  displayValue?: boolean
  fontSize?: number
}

export function BarcodePreview({
  value,
  format = 'CODE128',
  width = 2,
  height = 60,
  displayValue = true,
  fontSize = 12,
}: BarcodePreviewProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !value) return
    try {
      JsBarcode(svgRef.current, value, {
        format,
        width,
        height,
        displayValue,
        fontSize,
        margin: 8,
        background: '#FFFFFF',
        lineColor: '#000000',
        fontOptions: 'bold',
        font: 'monospace',
      })
    } catch {
      // Invalid barcode value — ignore silently
    }
  }, [value, format, width, height, displayValue, fontSize])

  if (!value) {
    return (
      <div
        className="flex items-center justify-center rounded-lg"
        style={{ height: height + 40, background: 'var(--secondary-bg)', border: '1px dashed var(--border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Barcode preview</p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center p-3 rounded-lg w-full overflow-hidden"
      style={{ background: '#FFFFFF', border: '1px solid var(--border)' }}
    >
      <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  )
}

// Downloadable barcode
export function BarcodeDownloadButton({ value, filename }: { value: string; filename: string }) {
  const download = () => {
    const svg = document.getElementById('barcode-download-svg') as unknown as SVGSVGElement
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={download}
      className="flex items-center gap-1.5 text-sm font-medium"
      style={{ color: 'var(--primary)' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download SVG
    </button>
  )
}
