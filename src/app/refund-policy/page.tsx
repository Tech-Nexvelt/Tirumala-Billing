import React from 'react'
import type { Metadata } from 'next'
import { LegalLayout, type TocItem } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Refund Policy | Nexvelt Billing Platform',
  description: 'Official Refund Policy, 14-day guarantee rules, subscription cancellation guidelines for Nexvelt SaaS.',
}

const TOC: TocItem[] = [
  { id: '1-overview', label: '1. Policy Overview' },
  { id: '2-14-day-guarantee', label: '2. 14-Day Money-Back Guarantee' },
  { id: '3-cancellation', label: '3. Subscription Cancellation' },
  { id: '4-trials', label: '4. Free Trial Accounts' },
  { id: '5-upgrades-downgrades', label: '5. Plan Upgrades & Downgrades' },
  { id: '6-non-refundable', label: '6. Non-Refundable Charges' },
  { id: '7-how-to-request', label: '7. How to Submit a Refund Claim' },
]

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Commercial Refund &amp; Cancellation Policy"
      subtitle="Clear, transparent refund terms, subscription cancellation workflows, and money-back guarantee rules."
      version="v2.4.0"
      effectiveDate="January 1, 2026"
      lastUpdated="July 22, 2026"
      readTime="5 min read"
      toc={TOC}
    >
      <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-10">
        {/* 1. Policy Overview */}
        <section id="1-overview" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            1. Policy Overview
          </h2>
          <p className="text-[#6B7280]">
            At Nexvelt Inc. (&quot;Nexvelt&quot;), we strive to deliver enterprise-grade cloud POS and billing reliability. This Refund Policy details your rights regarding subscription refunds, plan cancellations, free trial transitions, and billing adjustments for the <strong>Nexvelt Billing Platform</strong>.
          </p>
        </section>

        {/* 2. 14-Day Guarantee */}
        <section id="2-14-day-guarantee" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            2. 14-Day Money-Back Guarantee
          </h2>
          <p className="text-[#6B7280] mb-3">
            We offer a full <strong>14-Day Money-Back Guarantee</strong> on all new monthly and annual SaaS subscription plans. If you are not satisfied with the Service during your first 14 days of paid subscription:
          </p>
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] text-xs space-y-2">
            <p className="text-[#111827] font-bold">Guarantee Qualifications:</p>
            <p className="text-[#6B7280]">• Claim must be submitted within 14 calendar days of your initial plan payment.</p>
            <p className="text-[#6B7280]">• Applies to first-time Store Profile activations.</p>
            <p className="text-[#6B7280]">• Approved refunds will be credited back to your original payment method (UPI / Credit Card / Bank Transfer) within 5–7 business days.</p>
          </div>
        </section>

        {/* 3. Cancellation */}
        <section id="3-cancellation" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            3. Subscription Cancellation Terms
          </h2>
          <p className="text-[#6B7280]">
            You may cancel your Nexvelt subscription at any time via <strong>Settings &gt; Billing &amp; Plan</strong>. Upon cancellation, auto-renewal will be disabled immediately. You will retain full operational access to your store POS, product catalog, and historical invoices until the end of your current paid billing period. No further recurring charges will occur.
          </p>
        </section>

        {/* 4. Free Trials */}
        <section id="4-trials" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            4. Free Trial Accounts
          </h2>
          <p className="text-[#6B7280]">
            Store Profiles created during promotional free trials are not charged during the trial period. If you choose not to subscribe at trial end, your store account transitions to a read-only archive state without incurring any financial obligations.
          </p>
        </section>

        {/* 5. Upgrades & Downgrades */}
        <section id="5-upgrades-downgrades" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            5. Plan Upgrades &amp; Downgrades
          </h2>
          <p className="text-[#6B7280]">
            When upgrading your plan mid-cycle, unused days on your previous plan are calculated as pro-rated credit towards your new tier. When downgrading, pro-rated credits are automatically applied toward future billing invoices.
          </p>
        </section>

        {/* 6. Non-Refundable Charges */}
        <section id="6-non-refundable" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            6. Non-Refundable Charges
          </h2>
          <p className="text-[#6B7280] mb-2">The following fees are strictly non-refundable:</p>
          <ul className="list-disc pl-5 text-[#6B7280] space-y-1.5">
            <li>Subscription renewals requested after the 14-day initial guarantee window.</li>
            <li>Custom hardware integration services or custom thermal label template design fees.</li>
            <li>One-time onboarding training packages after service delivery completion.</li>
          </ul>
        </section>

        {/* 7. How to Submit a Refund Claim */}
        <section id="7-how-to-request" className="scroll-mt-28">
          <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-3">
            7. How to Submit a Refund Claim
          </h2>
          <p className="text-[#6B7280] mb-4">
            To submit a refund request, please email our Customer Billing Operations team with your Store ID and registered email:
          </p>
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] text-xs space-y-1">
            <strong className="text-[#111827] block text-sm font-bold">Nexvelt Billing Support</strong>
            <p className="text-[#6B7280]">Email: <a href="mailto:support@nexvelt.com" className="text-[#00B8B8] font-semibold hover:underline">support@nexvelt.com</a></p>
            <p className="text-[#6B7280]">Subject Line: Refund Claim - [Your Store Name]</p>
            <p className="text-[#6B7280]">Response Time: Within 24 hours (Monday – Saturday)</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
