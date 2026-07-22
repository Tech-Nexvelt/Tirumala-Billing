'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      })
      if (error) throw error
      setSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-50 text-emerald-600 border border-emerald-200"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0-8 5-8-5"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#111827] mb-2">Check your email</h2>
        <p className="text-sm text-[#6B7280] mb-6">
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <Link href="/login" className="text-sm font-bold text-[#00B8B8] hover:underline">
          ← Back to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight mb-1">Forgot Password</h2>
        <p className="text-sm text-[#6B7280]">
          Enter your email and we&apos;ll send a reset link for your <strong>Nexvelt Billing</strong> account.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase tracking-wide">
            Email Address
          </label>
          <input
            id="email" type="email" autoFocus required value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-3.5 rounded-xl text-sm"
            style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', color: '#111827', outline: 'none' }}
            onFocus={e => { e.target.style.borderColor = '#00D9D9'; e.target.style.boxShadow = '0 0 0 3px rgba(0, 217, 217, 0.15)' }}
            onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
          />
        </div>
        <button
          type="submit" disabled={isLoading || !email}
          className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs"
          style={{
            background: isLoading || !email ? '#F1F5F9' : 'linear-gradient(135deg, #00D9D9 0%, #00B8B8 100%)',
            color: isLoading || !email ? '#94A3B8' : '#FFFFFF',
            cursor: isLoading || !email ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <div className="text-center pt-2">
          <Link href="/login" className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] hover:underline">
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}
