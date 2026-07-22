import React from 'react'
import type { Metadata } from 'next'
import { LegalLayout, type TocItem } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy | Nexvelt Billing Platform',
  description: 'Learn how Nexvelt collects, protects, encrypts, and processes business and personal data.',
}

const TOC: TocItem[] = [
  { id: '1-introduction', label: '1. Introduction & Overview' },
  { id: '2-information-collected', label: '2. Information We Collect' },
  { id: '3-[#111827]-permissions', label: '3. Device & Hardware Permissions' },
  { id: '4-why-we-collect', label: '4. Why We Collect Information' },
  { id: '5-data-storage', label: '5. Data Storage & Hosting' },
  { id: '6-data-security', label: '6. Data Security & Encryption' },
  { id: '7-third-parties', label: '7. Third-Party Integrations' },
  { id: '8-data-sharing', label: '8. Data Sharing & Non-Sale' },
  { id: '9-international-transfers', label: '9. International Data Transfers' },
  { id: '10-data-retention', label: '10. Data Retention Policy' },
  { id: '11-user-rights', label: '11. Your Data Rights' },
  { id: '12-account-deletion', label: '12. Account Deletion & Wipe' },
  { id: '13-data-export', label: '13. Data Export Rights' },
  { id: '14-childrens-privacy', label: '14. Children\'s Privacy' },
  { id: '15-[#6B7280]-communications', label: '15. Communications Preferences' },
  { id: '16-policy-updates', label: '16. Policy Updates & Contact' },
]

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy & Data Protection Policy"
      subtitle="Detailed privacy disclosures explaining how Nexvelt protects your store data, customer records, and device permissions."
      version="v2.4.0"
      effectiveDate="January 1, 2026"
      lastUpdated="July 22, 2026"
      readTime="11 min read"
      toc={TOC}
    >
      <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-10">
        {/* 1. Introduction */}
        <section id="1-introduction" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            1. Introduction &amp; Overview
          </h2>
          <p className="text-[#6B7280]">
            Nexvelt Inc. (&quot;Nexvelt&quot;, &quot;we&quot;, or &quot;our&quot;) is committed to maintaining strict data privacy, enterprise security, and confidential data handling for all businesses operating on the <strong>Nexvelt Billing Platform</strong>. This Privacy Policy discloses our information practices, data retention cycles, hardware permission requests, and user privacy rights.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section id="2-information-collected" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            2. Information We Collect
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-[#111827] text-sm">A. Personal Information</h3>
              <p className="text-[#6B7280]">Full name, business email address, phone number, and account password hashes for authentication.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#111827] text-sm">B. Business &amp; Store Information</h3>
              <p className="text-[#6B7280]">Store name, legal name, business address, GSTIN/Tax ID, store logo images, and employee profiles.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#111827] text-sm">C. Product &amp; Transaction Information</h3>
              <p className="text-[#6B7280]">Product titles, SKUs, barcode values, purchase/selling prices, inventory quantities, customer names, phone numbers, delivery addresses, and invoice ledgers.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#111827] text-sm">D. Device &amp; Network Telemetry</h3>
              <p className="text-[#6B7280]">IP address, browser type, operating system version, mobile device model, WebSocket connection latency, and audit timestamps.</p>
            </div>
          </div>
        </section>

        {/* 3. Hardware Permissions */}
        <section id="3-device-permissions" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            3. Camera &amp; Device Permissions
          </h2>
          <p className="text-[#6B7280] mb-3">
            The Nexvelt POS and mobile scanner web interfaces request specific device permissions strictly required for commercial operations:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
              <strong className="text-[#111827] block text-xs">📷 Camera Permission</strong>
              <span className="text-xs text-[#6B7280]">Used exclusively to scan 1D/2D product barcodes and pairing QR codes in the browser via html5-qrcode. Camera frames are processed locally in RAM and are never recorded or transmitted to external servers.</span>
            </div>
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
              <strong className="text-[#111827] block text-xs">🔳 QR &amp; Scanner Hardware</strong>
              <span className="text-xs text-[#6B7280]">Accesses USB barcode gun input and Bluetooth HID scanners to parse fast keyboard emulation scans directly into active billing carts.</span>
            </div>
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
              <strong className="text-[#111827] block text-xs">🌐 Location Telemetry</strong>
              <span className="text-xs text-[#6B7280]">Coarse IP-based geo-location is logged during login for fraud prevention and audit security verification. We do not request high-precision GPS coordinates.</span>
            </div>
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
              <strong className="text-[#111827] block text-xs">💾 Local Storage &amp; Cache</strong>
              <span className="text-xs text-[#6B7280]">Uses IndexedDB and localStorage to store offline product catalog snapshots for instant barcode lookup speeds under 2ms.</span>
            </div>
          </div>
        </section>

        {/* 4. Why We Collect Information */}
        <section id="4-why-we-collect" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            4. Why We Collect Information
          </h2>
          <ul className="list-disc pl-5 text-[#6B7280] space-y-1.5">
            <li>To operate and maintain the Nexvelt cloud billing software and multi-tenant database.</li>
            <li>To facilitate real-time WebSocket barcode scan pairing between mobile scanners and desktop registers.</li>
            <li>To generate PDF tax invoices, ESC/POS thermal receipts, and WhatsApp share links.</li>
            <li>To compute store revenue analytics, daily cash/UPI sales summaries, and product inventory reports.</li>
            <li>To enforce legal agreements, audit compliance, and security threat mitigation.</li>
          </ul>
        </section>

        {/* 5. Data Storage */}
        <section id="5-data-storage" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            5. Data Storage &amp; Hosting Architecture
          </h2>
          <p className="text-[#6B7280]">
            Customer Data is hosted in enterprise ISO-27001 certified cloud data centers provided by Supabase and AWS (AWS Mumbai / ap-south-1 region). High-availability PostgreSQL database clusters ensure fault tolerance and continuous database replication.
          </p>
        </section>

        {/* 6. Data Security */}
        <section id="6-data-security" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            6. Data Security &amp; Encryption Protocols
          </h2>
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] text-xs space-y-2">
            <p className="text-[#111827] font-bold">Comprehensive Security Controls:</p>
            <p className="text-[#6B7280]">• <strong>Encryption at Rest:</strong> All database volumes and backup snapshots are encrypted using AES-256 standards.</p>
            <p className="text-[#6B7280]">• <strong>Encryption in Transit:</strong> All HTTP and WebSocket connections strictly require TLS 1.3 encryption.</p>
            <p className="text-[#6B7280]">• <strong>Row Level Security (RLS):</strong> Cryptographic database policies ensure complete multi-tenant store data isolation.</p>
          </div>
        </section>

        {/* 7. Third-Party Integrations */}
        <section id="7-third-parties" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            7. Third-Party Integrations
          </h2>
          <p className="text-[#6B7280]">
            Nexvelt integrates with verified third-party infrastructure providers including Supabase (Database/Auth), Vercel (Edge Application Hosting), Razorpay/Stripe (Payment Processing), and WhatsApp Business API (Invoice Delivery). All partners comply with SOC 2 Type II data safety standards.
          </p>
        </section>

        {/* 8. Data Sharing */}
        <section id="8-data-sharing" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            8. Data Sharing &amp; Non-Sale Declaration
          </h2>
          <p className="text-[#6B7280] font-medium">
            Nexvelt NEVER sells, rents, or monetizes Customer Data, product inventory prices, or customer purchase histories to advertisers or third-party data brokers.
          </p>
        </section>

        {/* 9. International Data Transfers */}
        <section id="9-international-transfers" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            9. International Data Transfers
          </h2>
          <p className="text-[#6B7280]">
            Where cross-border data routing occurs for global CDN caching, Nexvelt enforces Standard Contractual Clauses (SCCs) to guarantee equivalent data protection levels.
          </p>
        </section>

        {/* 10. Data Retention */}
        <section id="10-data-retention" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            10. Data Retention Policy
          </h2>
          <p className="text-[#6B7280]">
            Active account data is retained for the duration of Customer&apos;s subscription. Following account termination, inactive store data is archived for 30 days before permanent deletion from active database servers.
          </p>
        </section>

        {/* 11. User Rights */}
        <section id="11-user-rights" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            11. Your Data Rights
          </h2>
          <p className="text-[#6B7280]">
            Customers possess full rights to access, inspect, modify, export, or request deletion of their personal and store data under applicable data protection laws.
          </p>
        </section>

        {/* 12. Account Deletion */}
        <section id="12-account-deletion" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            12. Account Deletion &amp; Data Wipe
          </h2>
          <p className="text-[#6B7280]">
            Store Administrators may request permanent store account deletion by contacting <a href="mailto:privacy@nexvelt.com" className="text-[#00B8B8] font-semibold hover:underline">privacy@nexvelt.com</a>. Once executed, all store products, customer lists, and invoice ledgers are permanently wiped.
          </p>
        </section>

        {/* 13. Data Export */}
        <section id="13-data-export" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            13. Data Export Rights
          </h2>
          <p className="text-[#6B7280]">
            Customers may export complete product catalogs and billing records to standard CSV files at any time via <strong>Settings &gt; Backup &amp; Export</strong>.
          </p>
        </section>

        {/* 14. Children's Privacy */}
        <section id="14-childrens-privacy" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            14. Children&apos;s Privacy Notice
          </h2>
          <p className="text-[#6B7280]">
            Nexvelt is a commercial B2B SaaS platform intended exclusively for adult business owners and employees aged 18 and older. We do not knowingly collect information from children under 16.
          </p>
        </section>

        {/* 15. Communications */}
        <section id="15-communications" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            15. Communications Preferences
          </h2>
          <p className="text-[#6B7280]">
            Customers will receive essential service notices (security alerts, payment receipts, SLA maintenance notifications). Marketing emails include an instant one-click unsubscribe link.
          </p>
        </section>

        {/* 16. Policy Updates */}
        <section id="16-policy-updates" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            16. Policy Updates &amp; Contact
          </h2>
          <p className="text-[#6B7280] mb-4">
            We review and update this Privacy Policy periodically. Material amendments will be highlighted on the Platform dashboard 14 days before taking effect.
          </p>
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] text-xs space-y-1">
            <strong className="text-[#111827] block text-sm font-bold">Data Privacy Office</strong>
            <p className="text-[#6B7280]">Email: <a href="mailto:privacy@nexvelt.com" className="text-[#00B8B8] font-semibold hover:underline">privacy@nexvelt.com</a></p>
            <p className="text-[#6B7280]">Address: Nexvelt Inc., Cyber Towers, Hitec City, Hyderabad, TG 500081</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
