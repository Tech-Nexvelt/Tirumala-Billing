'use client'
import { useBillingStore } from '@/store/billingStore'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Invoice } from '@/types/database'

export function CustomerPanel() {
  const { customer, setCustomer } = useBillingStore()
  const [showAddress, setShowAddress] = useState(!!customer.address)
  const [searchPhone, setSearchPhone] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<Invoice | null>(null)
  const supabase = createClient()

  const handlePhoneBlur = useCallback(async () => {
    if (customer.phone.length >= 10) {
      setIsSearching(true)
      try {
        const { data } = await supabase
          .from('invoices')
          .select('customer_name, customer_phone, customer_address')
          .eq('customer_phone', customer.phone)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (data) {
          setSearchResult(data as Invoice)
        }
      } catch { /* no match */ } finally {
        setIsSearching(false)
      }
    }
  }, [customer.phone, supabase])

  const applySearchResult = useCallback(() => {
    if (searchResult) {
      setCustomer({
        name: searchResult.customer_name,
        phone: searchResult.customer_phone ?? customer.phone,
        address: searchResult.customer_address ?? '',
      })
      setSearchResult(null)
      if (searchResult.customer_address) setShowAddress(true)
    }
  }, [searchResult, customer.phone, setCustomer])

  const inputClass = "w-full h-9 px-3 rounded-lg text-sm outline-none transition-all"
  const inputStyle = {
    background: 'var(--secondary-bg)',
    border: '1.5px solid var(--border)',
    color: 'var(--text-primary)',
  }
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--primary)'
    e.target.style.boxShadow = '0 0 0 2px rgba(0,217,217,0.1)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Customer</h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--error)' }}
        >
          Required
        </span>
      </div>

      <div className="space-y-2">
        {/* Customer Name */}
        <input
          type="text"
          id="customer-name"
          value={customer.name === 'Guest' ? '' : customer.name}
          onChange={e => setCustomer({ name: e.target.value })}
          placeholder="Customer name *"
          className={inputClass}
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
        />

        {/* Phone */}
        <div className="relative">
          <input
            type="tel"
            id="customer-phone"
            value={customer.phone}
            onChange={e => setCustomer({ phone: e.target.value })}
            onBlur={handlePhoneBlur}
            placeholder="Phone number *"
            className={inputClass}
            style={inputStyle}
            onFocus={onFocus}
            autoComplete="tel"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary)' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
              </svg>
            </div>
          )}
        </div>

        {/* Returning customer suggestion */}
        {searchResult && (
          <div
            className="p-2.5 rounded-lg flex items-center justify-between text-xs animate-slide-in-up"
            style={{
              background: 'rgba(0,217,217,0.07)',
              border: '1px solid rgba(0,217,217,0.2)',
            }}
          >
            <div>
              <p className="font-medium" style={{ color: 'var(--primary)' }}>Returning customer found!</p>
              <p style={{ color: 'var(--text-secondary)' }}>{searchResult.customer_name}</p>
            </div>
            <button
              onClick={applySearchResult}
              className="px-2.5 py-1 rounded-md font-medium transition-colors"
              style={{ background: 'var(--primary)', color: '#0F172A', fontSize: '11px' }}
            >
              Apply
            </button>
          </div>
        )}

        {/* Address toggle */}
        <button
          type="button"
          onClick={() => setShowAddress(!showAddress)}
          className="flex items-center gap-1.5 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform ${showAddress ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {showAddress ? 'Hide' : 'Add'} delivery address
        </button>

        {showAddress && (
          <textarea
            id="customer-address"
            value={customer.address}
            onChange={e => setCustomer({ address: e.target.value })}
            placeholder="Delivery address (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none transition-all"
            style={{ ...inputStyle, height: 'auto' }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        )}
      </div>
    </div>
  )
}
