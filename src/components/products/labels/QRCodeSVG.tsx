'use client'
import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { QRErrorCorrection } from '@/types/label'

interface QRCodeSVGProps {
  value: string
  size?: number
  darkColor?: string
  lightColor?: string
  errorCorrectionLevel?: QRErrorCorrection
  className?: string
}

export const QRCodeSVG = React.memo(function QRCodeSVG({
  value,
  size = 120,
  darkColor = '#000000',
  lightColor = '#FFFFFF',
  errorCorrectionLevel = 'M',
  className = '',
}: QRCodeSVGProps) {
  const [svgHtml, setSvgHtml] = useState<string>('')

  useEffect(() => {
    if (!value) {
      setSvgHtml('')
      return
    }

    let isMounted = true

    // margin: 0 removes all empty white padding around the QR code modules!
    QRCode.toString(value, {
      type: 'svg',
      margin: 0,
      width: size,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel,
    })
      .then(svg => {
        if (isMounted) {
          const responsiveSvg = svg.replace(/<svg /, '<svg style="width:100%;height:100%;max-width:100%;max-height:100%;display:block;" ')
          setSvgHtml(responsiveSvg)
        }
      })
      .catch(err => {
        console.error('Failed to generate QR code SVG:', err)
      })

    return () => {
      isMounted = false
    }
  }, [value, size, darkColor, lightColor, errorCorrectionLevel])

  if (!value) {
    return (
      <div
        style={{ width: size, height: size, maxWidth: '100%', maxHeight: '100%' }}
        className={`flex items-center justify-center text-xs text-gray-400 rounded aspect-square ${className}`}
      >
        No QR
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center justify-center max-w-full max-h-full aspect-square overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  )
})
