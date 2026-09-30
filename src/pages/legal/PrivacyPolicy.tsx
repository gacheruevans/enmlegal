import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeftIcon, LockClosedIcon, ShieldCheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import Footer from '../../components/footer';
import { usePageSEO } from '../../hooks/usePageSEO';
import { SkipToContent } from '../../components/common/SkipToContent';

export const PrivacyPolicy: React.FC = () => {
  usePageSEO({
    title: 'Privacy Policy & Data Protection',
    description: 'Privacy Policy and client data protection practices at ENM Legal Advocates in compliance with the Kenya Data Protection Act, 2019.',
    canonicalPath: '/privacy',
  });

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <SkipToContent contentId="main-content" />
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3 group">
            <img
              alt="ENM Legal Logo"
              src="https://github.com/gacheruevans/enmlegal/blob/main/dist/logo_white_text.png?raw=true"
              className="h-10 md:h-12 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} role="main" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 focus:outline-none">
        {/* Header Banner */}
        <div className="mb-10 text-center sm:text-left border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Kenya Data Protection Act, 2019 Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Last Updated: September 2026 • Office of the Data Protection Commissioner (ODPC) Standards
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <LockClosedIcon className="w-6 h-6 text-emerald-600 shrink-0" />
              1. Our Privacy Commitment
            </h2>
            <p>
              At <strong>ENM Legal</strong> (Advocate Eva Nduta Munene), protecting your privacy and upholding confidentiality is integral to our practice. This Privacy Policy details how we collect, store, process, and safeguard personal data when you interact with our website, book consultations, or engage our legal services.
            </p>
            <p className="mt-3">
              We process personal data in strict compliance with the <strong>Data Protection Act, No. 24 of 2019 (Laws of Kenya)</strong> and the guidance issued by the Office of the Data Protection Commissioner (ODPC).
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              2. Personal Data We Collect
            </h2>
            <p>We may collect and process the following categories of personal information:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>
                <strong>Identity & Contact Information:</strong> Full names, email addresses, phone numbers, postal addresses, and government-issued identification where required for statutory KYC compliance.
              </li>
              <li>
                <strong>Consultation Inquiries:</strong> Details regarding your legal situation, matter description, dispute background, or corporate details provided in consultation booking forms.
              </li>
              <li>
                <strong>Technical Information:</strong> IP address, browser type, device information, and browsing patterns collected via standard analytics to maintain site security.
              </li>
              <li>
                <strong>Billing Information:</strong> Payment transaction confirmations, bank transfer references, or M-Pesa receipts (we do not store raw credit card numbers).
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              3. Purpose & Legal Basis for Processing
            </h2>
            <p>Under Section 30 of the Kenya Data Protection Act, we collect and process your personal information under the following legal bases:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-1">Pre-Contractual & Legal Services</h3>
                <p className="text-xs text-slate-600">
                  To evaluate consultation inquiries, conduct statutory conflict-of-interest checks, and draft formal client engagement agreements.
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-1">Statutory Compliance</h3>
                <p className="text-xs text-slate-600">
                  To comply with anti-money laundering (AML/CFT) regulations, Advocates Act provisions, and court filing mandates.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <EyeIcon className="w-6 h-6 text-royal shrink-0" />
              4. Advocate-Client Privilege & Confidentiality
            </h2>
            <p>
              As a professional legal practice admitted to the Bar of Kenya, all confidential communications between ENM Legal and our retained clients enjoy <strong>Advocate-Client Privilege</strong> under the Evidence Act (Cap 80, Laws of Kenya).
            </p>
            <p className="mt-3">
              We never sell, rent, or disclose your personal data to third parties for marketing purposes. Disclosures are limited solely to authorized judicial or regulatory bodies where required by law, or to expert witnesses and counterparties with your informed consent.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              5. Your Rights as a Data Subject
            </h2>
            <p>
              Under Section 26 of the Kenya Data Protection Act, 2019, you possess explicit rights regarding your personal data:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Right to be informed:</strong> You are entitled to know how your data is used.</li>
              <li><strong>Right of access:</strong> You may request a copy of personal information we hold about you.</li>
              <li><strong>Right to rectification:</strong> You may request correction of inaccurate or incomplete records.</li>
              <li><strong>Right to erasure:</strong> You may request deletion of data subject to mandatory statutory retention rules.</li>
              <li><strong>Right to object:</strong> You may object to the processing of personal data for direct communications.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              6. Data Security & Storage
            </h2>
            <p>
              We implement industry-grade technical and organizational safeguards, including SSL/TLS encrypted data transmission, restricted access controls, and secure database hosting to protect your personal information against unauthorized disclosure or loss.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              7. Contact Our Privacy Officer
            </h2>
            <p>
              To exercise your data protection rights or request information regarding our data practices, please reach out to our designated Data Protection Officer:
            </p>
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed">
              <p className="font-semibold text-slate-900">ENM Legal • Data Privacy Officer</p>
              <p>Advocate Eva Nduta Munene</p>
              <p>KMA Center, Chyulu Road, Upper Hill, Nairobi</p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@enmlegal.com • <strong>Direct Phone:</strong> +254 701-857-030
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
