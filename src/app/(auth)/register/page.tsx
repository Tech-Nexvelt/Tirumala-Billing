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

  const [store, setStore] = useState({ name: 'Thirumala Furniture', address: '', phone: '', city: '', state: '' })
  const [user, setUser] = useState({ full_name: '', email: '', password: '', confirm_password: '' })

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    
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
      // Call the secure server-side API endpoint
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
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Store registered successfully! Logging you in...')

      // Perform auto-login for immediate session start
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      })

      if (loginErr) {
        toast.info('Onboarding complete! Please sign in manually.')
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

  const inputClass = "w-full h-11 px-3.5 rounded-lg text-sm transition-all duration-200"
  const inputStyle = {
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    color: 'var(--text-primary)',
    outline: 'none' as const,
  }
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--primary)'
    e.target.style.boxShadow = '0 0 0 3px rgba(0,217,217,0.15)'
  }
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div>
      {/* Mobile logo */}
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 relative">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full h-full object-contain rounded-xl"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const el = e.currentTarget.nextSibling as HTMLDivElement;
              if (el) el.classList.remove('hidden');
              if (el) el.classList.add('flex');
            }}
          />
          <div
            className="hidden w-full h-full rounded-xl items-center justify-center font-bold"
            style={{ background: 'linear-gradient(135deg, #00D9D9, #35F5FF)', color: '#0F172A' }}
          >
            TF
          </div>
        </div>
        <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
          Thirumala Furniture
        </span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Register Your Store
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 500 }} className="hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: step >= s ? 'linear-gradient(135deg, #00D9D9, #35F5FF)' : 'var(--secondary-bg)',
                color: step >= s ? '#0F172A' : 'var(--text-muted)',
                border: step >= s ? 'none' : '1.5px solid var(--border)',
              }}
            >
              {step > s ? '✓' : s}
            </div>
            <span className="text-xs" style={{ color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {s === 1 ? 'Store Info' : 'Admin Account'}
            </span>
            {s < 2 && <div className="w-8 h-px mx-1" style={{ background: step > s ? 'var(--primary)' : 'var(--border)' }} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Store Name *
              </label>
              <input
                type="text" required value={store.name} autoFocus
                onChange={e => setStore(p => ({ ...p, name: e.target.value }))}
                placeholder="Thirumala Furniture"
                className={inputClass} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
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
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>City</label>
                <input type="text" value={store.city}
                  onChange={e => setStore(p => ({ ...p, city: e.target.value }))}
                  placeholder="Hyderabad"
                  className={inputClass} style={inputStyle}
                  onFocus={inputFocus} onBlur={inputBlur}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>State</label>
                <input type="text" value={store.state}
                  onChange={e => setStore(p => ({ ...p, state: e.target.value }))}
                  placeholder="Telangana"
                  className={inputClass} style={inputStyle}
                  onFocus={inputFocus} onBlur={inputBlur}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Address</label>
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
              className="w-full h-11 rounded-lg font-semibold text-sm mt-2"
              style={{
                background: 'linear-gradient(135deg, #00D9D9, #35F5FF)',
                color: '#0F172A',
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
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
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
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Email Address *</label>
              <input
                type="email" required value={user.email}
                onChange={e => setUser(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@thirumala.com"
                className={inputClass} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Password *</label>
              <input
                type="password" required minLength={8} value={user.password}
                onChange={e => setUser(p => ({ ...p, password: e.target.value }))}
                placeholder="Minimum 8 characters"
                className={inputClass} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Confirm Password *</label>
              <input
                type="password" required value={user.confirm_password}
                onChange={e => setUser(p => ({ ...p, confirm_password: e.target.value }))}
                placeholder="Re-enter password"
                className={inputClass}
                style={{
                  ...inputStyle,
                  borderColor: user.confirm_password && user.password !== user.confirm_password ? 'var(--error)' : 'var(--border)',
                }}
                onFocus={inputFocus} onBlur={inputBlur}
              />
              {user.confirm_password && user.password !== user.confirm_password && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>Passwords do not match</p>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button" onClick={() => setStep(1)}
                className="flex-1 h-11 rounded-lg font-medium text-sm"
                style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                style={{
                  background: isLoading ? 'var(--secondary-bg)' : 'linear-gradient(135deg, #00D9D9, #35F5FF)',
                  color: isLoading ? 'var(--text-disabled)' : '#0F172A',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg> Creating store...</>
                ) : 'Create Store & Account'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
