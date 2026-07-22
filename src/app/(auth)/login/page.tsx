'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    if (!agreeTerms) {
      toast.error('You must agree to the Terms & Conditions and Privacy Policy.')
      return
    }

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
    <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
      {/* Mobile Nexvelt Header */}
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
          Welcome Back
        </h2>
        <p className="text-sm text-[#6B7280]">
          Sign in to continue to <strong>Nexvelt Billing Platform</strong>
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide"
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
            placeholder="admin@yourbusiness.com"
            className="w-full h-11 px-3.5 rounded-xl text-sm transition-all duration-200"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E5E7EB',
              color: '#111827',
              outline: 'none',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#00D9D9'
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 217, 217, 0.15)'
            }}
            onBlur={e => {
              e.target.style.borderColor = '#E5E7EB'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#111827] uppercase tracking-wide"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#00B8B8] hover:underline"
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
              className="w-full h-11 px-3.5 pr-10 rounded-xl text-sm transition-all duration-200"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E5E7EB',
                color: '#111827',
                outline: 'none',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#00D9D9'
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 217, 217, 0.15)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#E5E7EB'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]"
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

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#6B7280]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#E5E7EB] text-[#00D9D9] focus:ring-[#00D9D9]"
            />
            <span>Remember me on this device</span>
          </label>
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="flex items-start gap-2 pt-1">
          <input
            id="login-agree-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={e => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-[#E5E7EB] text-[#00D9D9] focus:ring-[#00D9D9] cursor-pointer"
          />
          <label htmlFor="login-agree-terms" className="text-xs text-[#6B7280] leading-tight cursor-pointer">
            I have read and agree to the{' '}
            <Link href="/terms" target="_blank" className="font-bold text-[#00B8B8] hover:underline">
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" target="_blank" className="font-bold text-[#00B8B8] hover:underline">
              Privacy Policy
            </Link>.
          </label>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading || !email || !password || !agreeTerms}
          className="w-full h-11 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-xs"
          style={{
            background: isLoading || !email || !password || !agreeTerms
              ? '#F1F5F9'
              : 'linear-gradient(135deg, #00D9D9 0%, #00B8B8 100%)',
            color: isLoading || !email || !password || !agreeTerms ? '#94A3B8' : '#FFFFFF',
            cursor: isLoading || !email || !password || !agreeTerms ? 'not-allowed' : 'pointer',
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

      {/* Register Link */}
      <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center text-xs text-[#6B7280]">
        New to Nexvelt?{' '}
        <Link href="/register" className="font-bold text-[#00B8B8] hover:underline">
          Register your business
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="animate-spin w-8 h-8 text-[#00D9D9]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
        </svg>
        <span className="text-sm mt-3 text-[#6B7280]">Loading Login...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
