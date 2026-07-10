'use client'
import dynamic from 'next/dynamic'

// Force client-only loading to prevent hydration crashes in mobile webviews
const ScannerClient = dynamic(() => import('./ScannerClient'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'sans-serif', gap: '12px' }}>
      <svg style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="4" opacity="0.25"/>
        <path fill="#22d3ee" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/>
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 14, margin: 0 }}>Initializing hardware scanner...</p>
    </div>
  )
})

export default function ScannerPage() {
  return <ScannerClient />
}
