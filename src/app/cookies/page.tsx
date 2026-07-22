import React from 'react'
import type { Metadata } from 'next'
import { LegalLayout, type TocItem } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Cookie Policy | Nexvelt Billing Platform',
  description: 'Understand how Nexvelt uses cookies, local storage, and session tokens to deliver enterprise POS functionality.',
}

const TOC: TocItem[] = [
  { id: '1-what-are-cookies', label: '1. What Are Cookies' },
  { id: '2-essential-cookies', label: '2. Essential & Security Cookies' },
  { id: '3-functional-cookies', label: '3. Functional Cookies' },
  { id: '4-analytics-cookies', label: '4. Analytics & Telemetry' },
  { id: '5-performance-cookies', label: '5. Performance & Offline Cache' },
  { id: '6-managing-cookies', label: '6. Managing & Clearing Cookies' },
]

export default function CookiePage() {
  return (
    <LegalLayout
      title="Cookie &amp; Local Storage Policy"
      subtitle="Complete specification of web storage technologies, session tokens, and functional cookies used by Nexvelt Billing Platform."
      version="v2.4.0"
      effectiveDate="January 1, 2026"
      lastUpdated="July 22, 2026"
      readTime="6 min read"
      toc={TOC}
    >
      <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-10">
        {/* 1. What Are Cookies */}
        <section id="1-what-are-cookies" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            1. What Are Cookies &amp; Web Storage Technologies
          </h2>
          <p className="text-[#6B7280]">
            Cookies and web storage technologies (including <code>localStorage</code>, <code>sessionStorage</code>, and <code>IndexedDB</code>) are small text files and client-side data structures stored on your device when you access the <strong>Nexvelt Billing Platform</strong>. They allow us to recognize your store login session, remember thermal printer preferences, cache product catalogs for offline barcode scanning, and secure your transactions.
          </p>
        </section>

        {/* 2. Essential Cookies */}
        <section id="2-essential-cookies" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            2. Essential &amp; Security Cookies (Strictly Necessary)
          </h2>
          <p className="text-[#6B7280] mb-3">
            These technologies are mandatory for the operation of the Platform and cannot be disabled:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-[#E5E7EB] rounded-xl">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <th className="p-2.5 font-bold text-[#111827]">Cookie / Key Name</th>
                  <th className="p-2.5 font-bold text-[#111827]">Type</th>
                  <th className="p-2.5 font-bold text-[#111827]">Purpose &amp; Description</th>
                  <th className="p-2.5 font-bold text-[#111827]">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                <tr>
                  <td className="p-2.5 font-mono text-[#00B8B8] font-semibold">sb-access-token</td>
                  <td className="p-2.5 text-[#6B7280]">HTTP Cookie</td>
                  <td className="p-2.5 text-[#6B7280]">Encrypted JWT authentication session token for Supabase cloud validation.</td>
                  <td className="p-2.5 text-[#6B7280]">Session / 7 Days</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-[#00B8B8] font-semibold">sb-refresh-token</td>
                  <td className="p-2.5 text-[#6B7280]">HTTP Cookie</td>
                  <td className="p-2.5 text-[#6B7280]">Secure token refresh key allowing cashiers to stay signed in securely.</td>
                  <td className="p-2.5 text-[#6B7280]">30 Days</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-[#00B8B8] font-semibold">csrf-token-nexvelt</td>
                  <td className="p-2.5 text-[#6B7280]">Cookie</td>
                  <td className="p-2.5 text-[#6B7280]">Protects API endpoints against cross-site request forgery attacks.</td>
                  <td className="p-2.5 text-[#6B7280]">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Functional Cookies */}
        <section id="3-functional-cookies" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            3. Functional &amp; Preference Storage
          </h2>
          <p className="text-[#6B7280] mb-3">
            Remembers your store setup and hardware options to streamline daily billing:
          </p>
          <ul className="list-disc pl-5 text-[#6B7280] space-y-2">
            <li><strong>tf-billing-draft (localStorage):</strong> Persists draft invoice items so cashiers don&apos;t lose un-saved cart items during browser refreshes.</li>
            <li><strong>tirumala_auto_print (localStorage):</strong> Stores your receipt printer configuration (Auto Print vs Manual Print).</li>
            <li><strong>tirumala_qr_format (localStorage):</strong> Remembers your barcode label dimensions (80x120mm, 100x150mm).</li>
            <li><strong>theme (localStorage):</strong> Stores dark/light mode UI preferences via next-themes.</li>
          </ul>
        </section>

        {/* 4. Analytics Cookies */}
        <section id="4-analytics-cookies" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            4. Analytics &amp; Usage Telemetry
          </h2>
          <p className="text-[#6B7280]">
            We aggregate anonymous telemetry metrics to measure daily invoice volumes, barcode scan success rates, and WebSocket connection speeds. These analytics help our engineering team optimize POS responsiveness.
          </p>
        </section>

        {/* 5. Performance Cookies */}
        <section id="5-performance-cookies" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            5. Performance &amp; Offline Product Cache
          </h2>
          <p className="text-[#6B7280]">
            Nexvelt uses in-memory and <code>IndexedDB</code> caches to store active product SKUs and barcodes locally. This enables instant barcode validation in under 2ms without requiring server round-trips for every scan.
          </p>
        </section>

        {/* 6. Managing Cookies */}
        <section id="6-managing-cookies" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            6. Managing &amp; Clearing Cookies
          </h2>
          <p className="text-[#6B7280] mb-3">
            You can clear or block cookies at any time through your web browser settings (Chrome: <em>Settings &gt; Privacy &amp; Security &gt; Cookies</em>).
          </p>
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] text-xs">
            <strong className="text-[#111827] block mb-1">Important Note:</strong>
            <p className="text-[#6B7280]">
              Clearing essential cookies will log you out of your active cashier session and reset local draft bill carts.
            </p>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
