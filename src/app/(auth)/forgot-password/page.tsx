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
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0-8 5-8-5"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <Link href="/login" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
          ← Back to Login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Forgot Password</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Email Address
          </label>
          <input
            id="email" type="email" autoFocus required value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-3.5 rounded-lg text-sm"
            style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,217,217,0.15)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
        </div>
        <button
          type="submit" disabled={isLoading || !email}
          className="w-full h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
          style={{
            background: isLoading || !email ? 'var(--secondary-bg)' : 'linear-gradient(135deg, #00D9D9, #35F5FF)',
            color: isLoading || !email ? 'var(--text-disabled)' : '#0F172A',
            cursor: isLoading || !email ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <div className="text-center">
          <Link href="/login" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}
