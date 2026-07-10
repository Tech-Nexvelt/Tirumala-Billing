import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left Panel — Brand */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1a2744 50%, #0c1a2e 100%)' }}
      >
        {/* Animated background circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #00D9D9, transparent)' }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #35F5FF, transparent)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #00D9D9, transparent)' }}
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 relative">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight">Thirumala Furniture</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Billing Software</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: 'rgba(0,217,217,0.15)', color: '#35F5FF', border: '1px solid rgba(0,217,217,0.3)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#35F5FF' }} />
            Zero GST Billing
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Bill faster with<br />
            <span style={{
              background: 'linear-gradient(135deg, #00D9D9, #35F5FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>barcode scanning</span>
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Scan barcodes. Generate invoices instantly. Complete a bill in under 30 seconds.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {['⚡ Instant Scan', '📄 Zero GST Invoice', '💳 Split Payment', '🖨️ Thermal Print'].map(f => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © 2024 Thirumala Furniture. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
