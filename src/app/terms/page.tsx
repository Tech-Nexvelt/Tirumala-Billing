import React from 'react'
import type { Metadata } from 'next'
import { LegalLayout, type TocItem } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Terms of Service | Nexvelt Billing Platform',
  description: 'Official Terms & Conditions governing the use of Nexvelt Billing Platform SaaS services.',
}

const TOC: TocItem[] = [
  { id: '1-introduction', label: '1. Introduction & Scope' },
  { id: '2-acceptance', label: '2. Acceptance of Terms' },
  { id: '3-definitions', label: '3. Definitions' },
  { id: '4-about-nexvelt', label: '4. About Nexvelt' },
  { id: '5-services-offered', label: '5. Services Offered' },
  { id: '6-user-accounts', label: '6. User Accounts & Access' },
  { id: '7-acceptable-use', label: '7. Acceptable Use Policy' },
  { id: '8-account-responsibilities', label: '8. Account Responsibilities' },
  { id: '9-subscription-billing', label: '9. Subscription & Billing' },
  { id: '10-free-trial', label: '10. Free Trial Policy' },
  { id: '11-payment-terms', label: '11. Payment Terms' },
  { id: '12-taxes', label: '12. Taxes & Zero GST Compliance' },
  { id: '13-refund-policy', label: '13. Refund Policy Overview' },
  { id: '14-cancellation-policy', label: '14. Cancellation Policy' },
  { id: '15-intellectual-property', label: '15. Intellectual Property Rights' },
  { id: '16-customer-data-ownership', label: '16. Customer Data Ownership' },
  { id: '17-software-license', label: '17. Software License Grant' },
  { id: '18-api-usage', label: '18. API Usage & Rate Limits' },
  { id: '19-service-availability', label: '19. Service Availability & SLA' },
  { id: '20-maintenance-windows', label: '20. Maintenance Windows' },
  { id: '21-security', label: '21. Data Security & Encryption' },
  { id: '22-user-generated-content', label: '22. User Generated Content' },
  { id: '23-third-party-services', label: '23. Third Party Services' },
  { id: '24-limitation-of-liability', label: '24. Limitation of Liability' },
  { id: '25-warranty-disclaimer', label: '25. Warranty Disclaimer' },
  { id: '26-indemnification', label: '26. Indemnification' },
  { id: '27-suspension-termination', label: '27. Suspension & Termination' },
  { id: '28-force-majeure', label: '28. Force Majeure' },
  { id: '29-governing-law', label: '29. Governing Law & Dispute Resolution' },
  { id: '30-changes-to-terms', label: '30. Changes to Terms & Contact' },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service & Commercial Agreement"
      subtitle="Comprehensive legal agreement governing your access to and use of Nexvelt Billing Platform services."
      version="v2.4.0"
      effectiveDate="January 1, 2026"
      lastUpdated="July 22, 2026"
      readTime="14 min read"
      toc={TOC}
    >
      <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-10">
        {/* 1. Introduction */}
        <section id="1-introduction" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            1. Introduction &amp; Scope
          </h2>
          <p className="text-[#6B7280]">
            Welcome to the <strong>Nexvelt Billing Platform</strong> (&quot;Platform&quot;, &quot;Service&quot;, or &quot;SaaS Engine&quot;), an enterprise cloud software platform operated by <strong>Nexvelt Inc.</strong> (&quot;Nexvelt&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;) govern all commercial access, subscription licenses, API calls, web dashboard interactions, and hardware integration tools provided by Nexvelt to business customers (&quot;Customer&quot;, &quot;Merchant&quot;, or &quot;Subscriber&quot;) and authorized users.
          </p>
        </section>

        {/* 2. Acceptance of Terms */}
        <section id="2-acceptance" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            2. Acceptance of Terms
          </h2>
          <p className="text-[#6B7280]">
            By registering a store account, logging into the Platform, executing an order form, or checking the mandatory legal consent box during onboarding, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you are accepting these Terms on behalf of a company or commercial entity, you represent and warrant that you possess full authority to legally bind that entity.
          </p>
        </section>

        {/* 3. Definitions */}
        <section id="3-definitions" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            3. Definitions
          </h2>
          <ul className="list-disc pl-5 text-[#6B7280] space-y-2">
            <li><strong>&quot;Customer Data&quot;:</strong> Means all electronic data, product catalogs, barcode metadata, invoice records, inventory quantities, and customer phone/address details ingested or generated by the Customer through the Service.</li>
            <li><strong>&quot;Store Profile&quot;:</strong> Means the tenant organization created by a Customer inside Nexvelt containing store-specific branding, logos, tax rules, and employee accounts.</li>
            <li><strong>&quot;Authorized User&quot;:</strong> Means an employee, cashier, manager, or administrator designated by the Customer to access the Platform.</li>
            <li><strong>&quot;Service Level SLA&quot;:</strong> Means the service availability commitments provided by Nexvelt under Section 19.</li>
          </ul>
        </section>

        {/* 4. About Nexvelt */}
        <section id="4-about-nexvelt" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            4. About Nexvelt
          </h2>
          <p className="text-[#6B7280]">
            Nexvelt is a commercial multi-tenant Software-as-a-Service (SaaS) provider powering next-generation retail point-of-sale (POS) systems, barcode scanning engines, and real-time inventory management. Nexvelt operates as an independent platform vendor serving furniture retailers, commercial showrooms, and retail businesses globally.
          </p>
        </section>

        {/* 5. Services Offered */}
        <section id="5-services-offered" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            5. Services Offered
          </h2>
          <p className="text-[#6B7280] mb-3">
            Nexvelt provides access to the following core software capabilities:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
              <strong className="text-[#111827] block text-xs">Barcode First POS</strong>
              <span className="text-xs text-[#6B7280]">Sub-second barcode generation, CODE128/EAN tag printing, and camera/hardware scanning.</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
              <strong className="text-[#111827] block text-xs">Real-Time Sync Engine</strong>
              <span className="text-xs text-[#6B7280]">Real-time WebSocket event dispatching between mobile scanners and desktop registers.</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
              <strong className="text-[#111827] block text-xs">Thermal &amp; A4 Receipt Generator</strong>
              <span className="text-xs text-[#6B7280]">ESC/POS 80mm thermal receipt printing and A4 invoice PDF sharing via WhatsApp.</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
              <strong className="text-[#111827] block text-xs">Multi-Tenant Store Isolation</strong>
              <span className="text-xs text-[#6B7280]">Complete cryptographic and database separation between different business tenants.</span>
            </div>
          </div>
        </section>

        {/* 6. User Accounts */}
        <section id="6-user-accounts" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            6. User Accounts &amp; Access
          </h2>
          <p className="text-[#6B7280]">
            To access the Service, Customer must create an administrative account and register a Store Profile. All account credentials must be kept strictly confidential. Customer is solely responsible for all actions conducted under its store credentials and employee accounts.
          </p>
        </section>

        {/* 7. Acceptable Use Policy */}
        <section id="7-acceptable-use" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            7. Acceptable Use Policy
          </h2>
          <p className="text-[#6B7280] mb-2">Customer agrees NOT to:</p>
          <ul className="list-disc pl-5 text-[#6B7280] space-y-1.5">
            <li>Reverse engineer, decompile, or attempt to extract source code from Nexvelt binaries or client libraries.</li>
            <li>Bypass multi-tenant data isolation mechanisms or probe vulnerability of Nexvelt cloud infrastructure.</li>
            <li>Use the Platform to store fraudulent financial records, counterfeit barcodes, or unlawful materials.</li>
            <li>Impersonate other business entities or manipulate thermal receipts to evade statutory tax obligations.</li>
          </ul>
        </section>

        {/* 8. Account Responsibilities */}
        <section id="8-account-responsibilities" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            8. Account Responsibilities
          </h2>
          <p className="text-[#6B7280]">
            Customer is responsible for maintaining accurate business details, employee roles (Admin vs Cashier), and secure password practices. Nexvelt shall not be liable for unauthorized sales transactions resulting from compromised local cashier credentials.
          </p>
        </section>

        {/* 9. Subscription & Billing */}
        <section id="9-subscription-billing" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            9. Subscription &amp; Billing
          </h2>
          <p className="text-[#6B7280]">
            Access to Nexvelt is provided on a subscription basis (Monthly or Annual plans). Subscriptions auto-renew automatically unless cancelled prior to the renewal date. All pricing is displayed in local billing currency (INR / USD) exclusive of applicable statutory taxes unless stated otherwise.
          </p>
        </section>

        {/* 10. Free Trial Policy */}
        <section id="10-free-trial" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            10. Free Trial Policy
          </h2>
          <p className="text-[#6B7280]">
            New Store Profiles may receive a 14-day promotional free trial. Upon expiration of the free trial period, Customer must configure a valid payment method to maintain full operational POS access and barcode scanning capabilities.
          </p>
        </section>

        {/* 11. Payment Terms */}
        <section id="11-payment-terms" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            11. Payment Terms
          </h2>
          <p className="text-[#6B7280]">
            Payments are processed through authorized payment gateway partners (Razorpay / Stripe). Invoices for subscription renewals are generated electronically upon successful charge completion. Unpaid accounts exceeding 7 days grace period are subject to automated account suspension.
          </p>
        </section>

        {/* 12. Taxes */}
        <section id="12-taxes" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            12. Taxes &amp; Zero GST Compliance
          </h2>
          <p className="text-[#6B7280]">
            While Nexvelt supports Zero-GST invoice print presets for composition scheme retailers and small businesses, Customer remains exclusively responsible for ensuring compliance with all local tax authorities, GST filings, and statutory invoice formatting rules.
          </p>
        </section>

        {/* 13. Refund Policy Overview */}
        <section id="13-refund-policy" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            13. Refund Policy Overview
          </h2>
          <p className="text-[#6B7280]">
            Subscription fees are refundable within 14 days of initial plan activation if Customer is dissatisfied with the Platform. Please review our full <a href="/refund-policy" className="text-[#00B8B8] font-semibold hover:underline">Refund Policy</a> for detailed terms and instructions.
          </p>
        </section>

        {/* 14. Cancellation Policy */}
        <section id="14-cancellation-policy" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            14. Cancellation Policy
          </h2>
          <p className="text-[#6B7280]">
            Customer may cancel its subscription at any time via the Settings page. Upon cancellation, Customer will retain store access until the end of the current paid billing cycle.
          </p>
        </section>

        {/* 15. Intellectual Property Rights */}
        <section id="15-intellectual-property" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            15. Intellectual Property Rights
          </h2>
          <p className="text-[#6B7280]">
            All intellectual property rights in the Nexvelt Platform, including software algorithms, barcode scanner sync engines, user interface designs, trademarks, and documentation, remain the exclusive property of Nexvelt Inc.
          </p>
        </section>

        {/* 16. Customer Data Ownership */}
        <section id="16-customer-data-ownership" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            16. Customer Data Ownership
          </h2>
          <p className="text-[#6B7280]">
            Customer retains 100% ownership of all Customer Data, product inventory records, sales ledgers, and customer profiles. Nexvelt asserts no ownership rights over Customer Data ingested into the Service.
          </p>
        </section>

        {/* 17. Software License */}
        <section id="17-software-license" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            17. Software License Grant
          </h2>
          <p className="text-[#6B7280]">
            Subject to these Terms, Nexvelt grants Customer a non-exclusive, non-transferable, revocable license to access and use the Platform solely for Customer&apos;s internal retail business operations.
          </p>
        </section>

        {/* 18. API Usage */}
        <section id="18-api-usage" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            18. API Usage &amp; Rate Limits
          </h2>
          <p className="text-[#6B7280]">
            Access to Nexvelt Webhooks and Barcode Pairing APIs is subject to standard rate limits (100 requests/minute per device). Excessive API calls impacting multi-tenant performance may be throttled automatically.
          </p>
        </section>

        {/* 19. Service Availability */}
        <section id="19-service-availability" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            19. Service Availability &amp; SLA
          </h2>
          <p className="text-[#6B7280]">
            Nexvelt targets a 99.9% uptime availability for cloud API and database routing services, excluding scheduled maintenance windows.
          </p>
        </section>

        {/* 20. Maintenance Windows */}
        <section id="20-maintenance-windows" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            20. Maintenance Windows
          </h2>
          <p className="text-[#6B7280]">
            Scheduled maintenance is conducted during off-peak hours (typically 02:00–04:00 IST). Advanced email notification is provided for major upgrades.
          </p>
        </section>

        {/* 21. Security */}
        <section id="21-security" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            21. Data Security &amp; Encryption
          </h2>
          <p className="text-[#6B7280]">
            Nexvelt implements AES-256 data encryption at rest and TLS 1.3 encryption in transit. Multi-tenant database isolation ensures data confidentiality across all registered stores.
          </p>
        </section>

        {/* 22. User Generated Content */}
        <section id="22-user-generated-content" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            22. User Generated Content
          </h2>
          <p className="text-[#6B7280]">
            Customer represents that it holds all necessary rights to product images, trademarks, and logos uploaded to its Store Profile.
          </p>
        </section>

        {/* 23. Third Party Services */}
        <section id="23-third-party-services" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            23. Third Party Services
          </h2>
          <p className="text-[#6B7280]">
            The Service integrates with third-party thermal printer drivers, WhatsApp Web gateways, and cloud storage providers. Nexvelt is not responsible for performance interruptions originating from external hardware or third-party web APIs.
          </p>
        </section>

        {/* 24. Limitation of Liability */}
        <section id="24-limitation-of-liability" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            24. Limitation of Liability
          </h2>
          <p className="text-[#6B7280]">
            To the maximum extent permitted by applicable law, in no event shall Nexvelt Inc. be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits or revenue, arising out of your use of the Service. Nexvelt&apos;s total aggregate liability shall not exceed the total fees paid by Customer to Nexvelt during the 12 months preceding the claim.
          </p>
        </section>

        {/* 25. Warranty Disclaimer */}
        <section id="25-warranty-disclaimer" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            25. Warranty Disclaimer
          </h2>
          <p className="text-[#6B7280]">
            The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, express or implied, including fitness for a particular purpose or non-infringement.
          </p>
        </section>

        {/* 26. Indemnification */}
        <section id="26-indemnification" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            26. Indemnification
          </h2>
          <p className="text-[#6B7280]">
            Customer agrees to indemnify and hold harmless Nexvelt and its officers, directors, and employees from any third-party claims arising out of Customer&apos;s breach of these Terms or illegal business activities.
          </p>
        </section>

        {/* 27. Suspension & Termination */}
        <section id="27-suspension-termination" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            27. Suspension &amp; Termination
          </h2>
          <p className="text-[#6B7280]">
            Nexvelt reserves the right to suspend or terminate accounts in cases of non-payment, breach of acceptable use, or illegal activities. Upon termination, Customer may request a CSV export of its historical sales data within 30 days.
          </p>
        </section>

        {/* 28. Force Majeure */}
        <section id="28-force-majeure" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            28. Force Majeure
          </h2>
          <p className="text-[#6B7280]">
            Neither party shall be liable for failure to perform obligations caused by acts of God, cyberwarfare, telecommunication failures, or government regulations beyond reasonable control.
          </p>
        </section>

        {/* 29. Governing Law */}
        <section id="29-governing-law" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            29. Governing Law &amp; Dispute Resolution
          </h2>
          <p className="text-[#6B7280]">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the commercial courts in Hyderabad, Telangana.
          </p>
        </section>

        {/* 30. Changes to Terms */}
        <section id="30-changes-to-terms" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            30. Changes to Terms &amp; Contact Information
          </h2>
          <p className="text-[#6B7280] mb-4">
            Nexvelt reserves the right to modify these Terms. Subscribers will be notified of material changes via email or dashboard alert 14 days prior to enforcement.
          </p>
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] text-xs space-y-1">
            <strong className="text-[#111827] block text-sm font-bold">Nexvelt Legal Office</strong>
            <p className="text-[#6B7280]">Email: <a href="mailto:legal@nexvelt.com" className="text-[#00B8B8] font-semibold hover:underline">legal@nexvelt.com</a></p>
            <p className="text-[#6B7280]">Address: Nexvelt Inc., Cyber Towers, Hitec City, Hyderabad, TG 500081</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
