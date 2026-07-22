import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: {
    default: 'Nexvelt Billing Platform — Cloud POS Software',
    template: '%s | Nexvelt Billing Platform',
  },
  description: 'Enterprise Cloud Billing Software & Barcode POS for Furniture Stores — Powered by Nexvelt.',
  keywords: ['Nexvelt', 'furniture billing', 'POS', 'barcode billing', 'cloud invoice', 'Nexvelt SaaS'],
  authors: [{ name: 'Nexvelt Platform' }],
  robots: { index: false, follow: false },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/nexvelt-logo.png', sizes: '512x512', type: 'image/png' },
      { url: '/nexvelt-logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/nexvelt-logo.png', sizes: '96x96', type: 'image/png' },
      { url: '/nexvelt-logo.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/nexvelt-logo.png',
    apple: [
      { url: '/nexvelt-logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00D9D9',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="512x512" href="/nexvelt-logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/nexvelt-logo.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/nexvelt-logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/nexvelt-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/nexvelt-logo.png" />
        <link rel="shortcut icon" href="/nexvelt-logo.png" type="image/png" />
      </head>
      <body suppressHydrationWarning>
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
