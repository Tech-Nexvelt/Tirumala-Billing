import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: {
    default: 'Thirumala Furniture — Billing Software',
    template: '%s | Thirumala Furniture',
  },
  description: 'Fast, barcode-first Zero GST furniture billing software. Generate invoices in under 30 seconds.',
  keywords: ['furniture billing', 'POS', 'barcode billing', 'invoice', 'zero GST'],
  authors: [{ name: 'Thirumala Furniture' }],
  robots: { index: false, follow: false },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00D9D9',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
              },
              duration: 3000,
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
