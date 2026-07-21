'use client'
import React from 'react'
import dynamic from 'next/dynamic'

// ─── Error Boundary ──────────────────────────────────────────────────────────
interface ErrorState { hasError: boolean; message: string }

class ScannerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    console.error('[Scanner] Runtime error caught by boundary:', error)
    return { hasError: true, message: error.message || 'Unknown scanner error' }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Scanner] Error details:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            color: '#f1f5f9',
            fontFamily: 'sans-serif',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#f87171' }}>
            Scanner Failed to Load
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 320, margin: 0 }}>
            {this.state.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '10px 24px',
              background: '#00d9d9',
              color: '#0f172a',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            🔄 Reload Scanner
          </button>
          <p style={{ fontSize: 11, color: '#64748b' }}>
            If this persists, open the browser console for details.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Dynamic import — SSR disabled (camera APIs require browser) ─────────────
const ScannerClient = dynamic(() => import('./ScannerClient'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontFamily: 'sans-serif',
        gap: '12px',
      }}
    >
      <svg
        style={{ width: 36, height: 36, animation: 'spin 1s linear infinite' }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="4" opacity="0.25" />
        <path fill="#22d3ee" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 14, margin: 0 }}>Initializing scanner...</p>
    </div>
  ),
})

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ScannerPage() {
  return (
    <ScannerErrorBoundary>
      <ScannerClient />
    </ScannerErrorBoundary>
  )
}
