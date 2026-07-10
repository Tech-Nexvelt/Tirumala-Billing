'use client'
import { useEffect } from 'react'
import { useBarcodeScan } from '@/hooks/useBarcodeScan'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
export function BarcodeInput() {
  const { scanValue, scanState, isSearching, inputRef, handleChange, handleKeyDown, handleSubmit } = useBarcodeScan()

  const borderColor =
    scanState === 'success' ? 'var(--success)' :
    scanState === 'error'   ? 'var(--error)' :
    'var(--primary)'

  const boxShadow =
    scanState === 'success' ? '0 0 0 3px rgba(34,197,94,0.15)' :
    scanState === 'error'   ? '0 0 0 3px rgba(239,68,68,0.15)' :
    '0 0 0 3px rgba(0,217,217,0.12)'

  return (
    <div
      className={cn(
        'scanner-input flex items-center gap-3 px-4 h-12 w-full',
        scanState === 'error' && 'animate-scanner-error',
      )}
      style={{
        borderColor,
        boxShadow,
        background: 'var(--surface)',
      }}
    >
      {/* Barcode icon */}
      <div className="flex-shrink-0" style={{ color: scanState === 'idle' ? 'var(--primary)' : borderColor }}>
        {isSearching ? (
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
          </svg>
        ) : scanState === 'success' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--success)' }}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : scanState === 'error' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--error)' }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        ) : (
          /* Barcode icon */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9h1v6H3zm4 0h2v6H7zm4 0h1v6h-1zm3 0h1v6h-1zm3 0h2v6h-2z"/>
            <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="1.5"/>
          </svg>
        )}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        id="barcode-scanner-input"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        value={scanValue}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          scanState === 'success' ? 'Product added! Scan next...' :
          scanState === 'error'   ? 'Product not found. Try again...' :
          'Scan barcode or type and press Enter'
        }
        className="flex-1 bg-transparent text-sm font-mono outline-none"
        style={{
          color: scanState === 'success' ? 'var(--success)' :
                 scanState === 'error'   ? 'var(--error)' :
                 'var(--text-primary)',
          caretColor: 'var(--primary)',
        }}
        aria-label="Barcode scanner input. F2 to refocus."
      />

      {/* Status badge */}
      {scanValue.length > 0 && (
        <button
          type="button"
          onClick={() => handleChange('')}
          className="flex-shrink-0 p-1 rounded-full transition-colors"
          style={{ color: 'var(--text-muted)' }}
          tabIndex={-1}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      {/* F2 hint */}
      {scanValue.length === 0 && (
        <kbd
          className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded"
          style={{ background: 'var(--secondary-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: 'monospace' }}
        >
          F2
        </kbd>
      )}
    </div>
  )
}
