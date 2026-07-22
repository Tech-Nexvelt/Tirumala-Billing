'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface TocItem {
  id: string
  label: string
}

interface LegalLayoutProps {
  title: string
  subtitle: string
  version: string
  effectiveDate: string
  lastUpdated: string
  readTime: string
  toc: TocItem[]
  children: React.ReactNode
}

export function LegalLayout({
  title,
  subtitle,
  version,
  effectiveDate,
  lastUpdated,
  readTime,
  toc,
  children,
}: LegalLayoutProps) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string>(toc[0]?.id || '')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Track scroll progress and active TOC item
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0
      setScrollProgress(progress)
      setShowBackToTop(window.scrollY > 300)

      // Determine active section
      const sections = toc.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[]
      const scrollPos = window.scrollY + 180

      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= scrollPos) {
          setActiveId(sections[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [toc])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrint = () => {
    window.print()
  }

  const legalNavItems = [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/cookies', label: 'Cookie Policy' },
    { href: '/refund-policy', label: 'Refund Policy' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-[#00D9D9]/30">
      {/* Reading Progress Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#E5E7EB] z-50 no-print">
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, #00D9D9, #00B8B8, #35F5FF)',
          }}
        />
      </div>

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 p-1 bg-white rounded-xl border border-[#E5E7EB] shadow-xs flex items-center justify-center transition-transform group-hover:scale-105">
              <img src="/nexvelt-logo.png" alt="Nexvelt Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-base text-[#111827] tracking-tight block">Nexvelt</span>
              <span className="text-[10px] font-semibold text-[#00B8B8] uppercase tracking-wider block">Legal &amp; Trust Center</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E5E7EB]">
            {legalNavItems.map(nav => {
              const isActive = pathname === nav.href || pathname === `/pages${nav.href}`
              return (
                <Link
                  key={nav.href}
                  href={nav.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-[#111827] shadow-xs border border-[#E5E7EB]'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {nav.label}
                </Link>
              )
            })}
          </nav>

          {/* Back to App CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFC]"
            >
              <span>Back to App</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-white border-b border-[#E5E7EB] py-10 px-4 sm:px-6 lg:px-8 no-print">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#00D9D9]/10 text-[#00B8B8] border border-[#00D9D9]/20 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00D9D9]" />
                Nexvelt Legal Framework
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">{title}</h1>
              <p className="text-sm text-[#6B7280] mt-1.5 max-w-2xl">{subtitle}</p>
            </div>

            {/* Document Metadata Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E5E7EB] text-xs">
              <div className="p-2 bg-white rounded-xl border border-[#E5E7EB]">
                <span className="text-[10px] text-[#6B7280] block font-medium">Version</span>
                <span className="font-mono font-bold text-[#111827]">{version}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#E5E7EB]">
                <span className="text-[10px] text-[#6B7280] block font-medium">Effective</span>
                <span className="font-semibold text-[#111827]">{effectiveDate}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#E5E7EB]">
                <span className="text-[10px] text-[#6B7280] block font-medium">Last Updated</span>
                <span className="font-semibold text-[#111827]">{lastUpdated}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#E5E7EB]">
                <span className="text-[10px] text-[#6B7280] block font-medium">Read Time</span>
                <span className="font-semibold text-[#00B8B8]">{readTime}</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#E5E7EB]">
            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search within this document..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl text-xs bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] placeholder-[#6B7280] outline-none focus:border-[#00D9D9] focus:ring-2 focus:ring-[#00D9D9]/20 transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Print & Download Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="h-10 px-4 rounded-xl text-xs font-semibold bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] flex items-center gap-2 shadow-xs transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Print Document</span>
              </button>
              <button
                onClick={handlePrint}
                className="h-10 px-4 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-2 transition-all hover:opacity-95"
                style={{ background: 'linear-gradient(135deg, #00D9D9 0%, #00B8B8 100%)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Sidebar TOC + Legal Document Text */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sticky Table of Contents */}
          <aside className="lg:col-span-4 sticky top-24 no-print bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">Table of Contents</h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F8FAFC] text-[#6B7280] border border-[#E5E7EB]">
                {toc.length} Sections
              </span>
            </div>

            <nav className="space-y-0.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
              {toc.map(item => {
                const isActive = activeId === item.id
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                      setActiveId(item.id)
                    }}
                    className={`block px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#00D9D9]/10 text-[#00B8B8] font-bold border-l-3 border-[#00D9D9] pl-2.5'
                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {item.label}
                  </a>
                )
              })}
            </nav>

            <div className="pt-3 border-t border-[#E5E7EB] text-center">
              <p className="text-[11px] text-[#6B7280]">
                Questions about this document?{' '}
                <a href="mailto:legal@nexvelt.com" className="font-bold text-[#00B8B8] hover:underline">
                  Contact Legal Team
                </a>
              </p>
            </div>
          </aside>

          {/* Right Column: Document Content */}
          <article className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-10">
            {children}
          </article>
        </div>
      </main>

      {/* Floating Back To Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-2xl bg-white border border-[#E5E7EB] text-[#111827] shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:border-[#00D9D9] no-print"
          aria-label="Back to top"
          title="Back to top"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-10 px-4 sm:px-6 lg:px-8 mt-12 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#6B7280]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 p-1 bg-white rounded-lg border border-[#E5E7EB] flex items-center justify-center">
              <img src="/nexvelt-logo.png" alt="Nexvelt" className="w-full h-full object-contain" />
            </div>
            <span>© 2026 Nexvelt Inc. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-semibold">
            <Link href="/terms" className="hover:text-[#111827]">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#111827]">Privacy Policy</Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-[#111827]">Cookie Policy</Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-[#111827]">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
