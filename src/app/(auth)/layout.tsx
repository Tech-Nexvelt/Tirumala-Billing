import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Nexvelt Billing Platform',
  description: 'Enterprise Cloud Billing Software for Furniture Stores — Powered by Nexvelt.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex text-[#111827]" style={{ background: '#F8FAFC' }}>
      {/* Left Panel — Nexvelt SaaS Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-[#E5E7EB]"
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F1F5F9 60%, #F8FAFC 100%)',
        }}
      >
        {/* Subtle mesh background accent */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'rgba(0, 217, 217, 0.12)' }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-[450px] h-[450px] rounded-full blur-3xl"
            style={{ background: 'rgba(53, 245, 255, 0.15)' }}
          />
        </div>

        {/* Top Nexvelt Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl p-2 bg-white shadow-sm border border-[#E5E7EB] flex items-center justify-center">
              <img
                src="/nexvelt-logo.png"
                alt="Nexvelt Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-xl text-[#111827] tracking-tight">Nexvelt</h1>
              <p className="text-xs font-semibold text-[#00B8B8] tracking-wide uppercase">Billing Platform</p>
            </div>
          </div>
        </div>

        {/* Center SaaS Pitch */}
        <div className="relative z-10 my-auto py-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
            style={{
              background: 'rgba(0, 217, 217, 0.08)',
              color: '#00B8B8',
              borderColor: 'rgba(0, 217, 217, 0.2)',
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D9D9' }} />
            Enterprise Furniture POS &amp; Inventory Suite
          </div>

          <h2 className="text-4xl font-extrabold text-[#111827] tracking-tight leading-tight mb-4">
            Build Faster.<br />
            <span style={{
              background: 'linear-gradient(135deg, #00D9D9 0%, #00B8B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Bill Smarter.</span>
          </h2>

          <p className="text-base text-[#6B7280] leading-relaxed mb-8 max-w-lg">
            Modern cloud billing, real-time wireless barcode scanning, and multi-tenant store operations designed specifically for furniture retail businesses.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {[
              { title: '☁️ Cloud Based', desc: 'Instant access anywhere' },
              { title: '📱 Mobile Scanner', desc: 'Zero-hardware barcode POS' },
              { title: '⚡ Realtime Sync', desc: 'Sub-second inventory updates' },
              { title: '📦 Inventory Control', desc: 'Variant & barcode tags' },
              { title: '📄 Zero GST Billing', desc: 'Esc-POS thermal receipts' },
              { title: '📊 Analytics Suite', desc: 'Revenue & sales tracking' },
            ].map(item => (
              <div
                key={item.title}
                className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white/80 backdrop-blur-sm shadow-xs transition-all hover:border-[#00D9D9]/40"
              >
                <p className="text-xs font-bold text-[#111827]">{item.title}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nexvelt Copyright */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#6B7280] pt-6 border-t border-[#E5E7EB]">
          <span>© 2026 Nexvelt. All rights reserved.</span>
          <span className="font-semibold text-[#00B8B8]">Powered by Nexvelt</span>
        </div>
      </div>

      {/* Right Panel — Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: '#F8FAFC' }}>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
