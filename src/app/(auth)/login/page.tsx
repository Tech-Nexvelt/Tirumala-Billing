'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      toast.success('Welcome back!')
      window.location.href = redirect
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      if (message.includes('Invalid login')) {
        toast.error('Invalid email or password')
      } else {
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
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
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          Sign in to your account
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{ color: 'var(--primary)', fontWeight: 500 }}
            className="hover:underline"
          >
            Register your store
          </Link>
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-primary)' }}
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-3.5 rounded-lg text-sm transition-all duration-200"
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--primary)'
              e.target.style.boxShadow = '0 0 0 3px rgba(0,217,217,0.15)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-11 px-3.5 pr-10 rounded-lg text-sm transition-all duration-200"
              style={{
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--primary)'
                e.target.style.boxShadow = '0 0 0 3px rgba(0,217,217,0.15)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full h-11 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
          style={{
            background: isLoading || !email || !password
              ? 'var(--secondary-bg)'
              : 'linear-gradient(135deg, #00D9D9, #35F5FF)',
            color: isLoading || !email || !password ? 'var(--text-disabled)' : '#0F172A',
            cursor: isLoading || !email || !password ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
              </svg>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Demo credentials hint */}
      <div
        className="mt-6 p-3.5 rounded-lg text-xs"
        style={{ background: 'var(--secondary-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>First time?</p>
        <p>Create your store account using the <strong>Register</strong> link above. Each store gets its own admin account.</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary)' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
        </svg>
        <span className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>Loading Login Form...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
