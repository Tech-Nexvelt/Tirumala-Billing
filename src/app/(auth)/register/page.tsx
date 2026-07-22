'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [store, setStore] = useState({ name: '', address: '', phone: '', city: '', state: '' })
  const [user, setUser] = useState({ full_name: '', email: '', password: '', confirm_password: '' })

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    
    if (!acceptedTerms) {
      toast.error('You must agree to the Terms & Conditions and Privacy Policy.')
      return
    }

    if (!user.full_name.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!user.email.trim()) {
      toast.error('Please enter your email address')
      return
    }
    if (!user.password) {
      toast.error('Please enter a password')
      return
    }
    if (user.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (user.password !== user.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          full_name: user.full_name,
          store_name: store.name,
          phone: store.phone,
          city: store.city,
          state: store.state,
          address: store.address,
          accepted_terms: true,
          accepted_privacy: true,
          terms_version: 'v2.4.0',
          privacy_version: 'v2.4.0',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Store registered successfully! Logging you in...')

      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      })

      if (loginErr) {
        toast.info('Registration complete! Please sign in manually.')
        router.push('/login')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('Email already')) {
        toast.error('Email already registered. Please sign in.')
      } else {
        toast.error(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full h-11 px-3.5 rounded-xl text-sm transition-all duration-200"
  const inputStyle = {
    background: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    color: '#111827',
    outline: 'none' as const,
  }
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#00D9D9'
    e.target.style.boxShadow = '0 0 0 3px rgba(0, 217, 217, 0.15)'
  }
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#E5E7EB'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
      {/* Mobile Nexvelt Logo */}
      <div className="flex items-center gap-3 mb-6 lg:hidden">
        <div className="w-10 h-10 p-1.5 bg-white rounded-xl border border-[#E5E7EB] shadow-xs flex items-center justify-center">
          <img
            src="/nexvelt-logo.png"
            alt="Nexvelt Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <span className="font-bold text-base text-[#111827] block">Nexvelt</span>
          <span className="text-[10px] font-semibold text-[#00B8B8] uppercase tracking-wider block">Billing Platform</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight mb-1">
          Register Your Business
        </h2>
        <p className="text-sm text-[#6B7280]">
          Create your store account on <strong>Nexvelt Billing Platform</strong>
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
        {[1, 2].map(s => (
          <div key={s} className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold"
            style={{
              background: step >= s ? '#FFFFFF' : 'transparent',
              color: step >= s ? '#111827' : '#94A3B8',
              boxShadow: step >= s ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
            }}>
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
              style={{
                background: step >= s ? 'linear-gradient(135deg, #00D9D9, #00B8B8)' : '#E5E7EB',
                color: step >= s ? '#FFFFFF' : '#6B7280',
              }}
            >
              {step > s ? '✓' : s}
            </span>
            <span>{s === 1 ? '1. Store Info' : '2. Admin Account'}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {step === 1 && (
          <>
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide">
                Store / Business Name *
              </label>
              <input
                type="text" required value={store.name} autoFocus
                onChange={e => setStore(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Thirumala Furniture, Royal Wood POS"
                className={inputClass} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel" value={store.phone}
                onChange={e => setStore(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className={inputClass} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide">City</label>
                <input type="text" value={store.city}
                  onChange={e => setStore(p => ({ ...p, city: e.target.value }))}
                  placeholder="Hyderabad"
                  className={inputClass} style={inputStyle}
                  onFocus={inputFocus} onBlur={inputBlur}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide">State</label>
                <input type="text" value={store.state}
                  onChange={e => setStore(p => ({ ...p, state: e.target.value }))}
                  placeholder="Telangana"
                  className={inputClass} style={inputStyle}
                  onFocus={inputFocus} onBlur={inputBlur}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide">Address</label>
              <input type="text" value={store.address}
                onChange={e => setStore(p => ({ ...p, address: e.target.value }))}
                placeholder="Shop No. 1, Main Road"
                className={inputClass} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!store.name.trim()) {
                  toast.error('Store Name is required')
                  return
                }
                setStep(2)
              }}
              className="w-full h-11 rounded-xl font-bold text-sm mt-2 shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #00D9D9 0%, #00B8B8 100%)',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              Next: Create Admin Account →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide">
                Your Full Name *
              </label>
              <input
                type="text" required autoFocus value={user.full_name}
                onChange={e => setUser(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Ravi Kumar"
                className={inputClass} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide">Email Address *</label>
              <input
                type="email" required value={user.email}
                onChange={e => setUser(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@yourstore.com"
                className={inputClass} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide">Password *</label>
              <input
                type="password" required minLength={8} value={user.password}
                onChange={e => setUser(p => ({ ...p, password: e.target.value }))}
                placeholder="Minimum 8 characters"
                className={inputClass} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide">Confirm Password *</label>
              <input
                type="password" required value={user.confirm_password}
                onChange={e => setUser(p => ({ ...p, confirm_password: e.target.value }))}
                placeholder="Re-enter password"
                className={inputClass}
                style={{
                  ...inputStyle,
                  borderColor: user.confirm_password && user.password !== user.confirm_password ? '#EF4444' : '#E5E7EB',
                }}
                onFocus={inputFocus} onBlur={inputBlur}
              />
              {user.confirm_password && user.password !== user.confirm_password && (
                <p className="mt-1 text-xs text-[#EF4444]">Passwords do not match</p>
              )}
            </div>

            {/* Mandatory Terms & Privacy Checkbox */}
            <div className="space-y-1 pt-1">
              <div className="flex items-start gap-2">
                <input
                  id="register-agree-terms"
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-[#E5E7EB] text-[#00D9D9] focus:ring-[#00D9D9] cursor-pointer"
                />
                <label htmlFor="register-agree-terms" className="text-xs text-[#6B7280] leading-tight cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" className="font-bold text-[#00B8B8] hover:underline">
                    Terms &amp; Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="font-bold text-[#00B8B8] hover:underline">
                    Privacy Policy
                  </Link>.
                </label>
              </div>
              {!acceptedTerms && (
                <p className="text-[11px] text-[#EF4444] font-medium pl-6">
                  You must agree to the Terms &amp; Conditions and Privacy Policy to register.
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button" onClick={() => setStep(1)}
                className="flex-1 h-11 rounded-xl font-semibold text-sm border border-[#E5E7EB] bg-white text-[#111827]"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !acceptedTerms}
                className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs"
                style={{
                  background: isLoading || !acceptedTerms ? '#F1F5F9' : 'linear-gradient(135deg, #00D9D9 0%, #00B8B8 100%)',
                  color: isLoading || !acceptedTerms ? '#94A3B8' : '#FFFFFF',
                  cursor: isLoading || !acceptedTerms ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg> Registering...</>
                ) : 'Create Store Account'}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Back to login */}
      <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center text-xs text-[#6B7280]">
        Already have a store account?{' '}
        <Link href="/login" className="font-bold text-[#00B8B8] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
