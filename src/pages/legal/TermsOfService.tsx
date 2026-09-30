import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeftIcon, ShieldCheckIcon, DocumentTextIcon, ScaleIcon } from '@heroicons/react/24/outline';
import Footer from '../../components/footer';
import { usePageSEO } from '../../hooks/usePageSEO';
import { SkipToContent } from '../../components/common/SkipToContent';

export const TermsOfService: React.FC = () => {
  usePageSEO({
    title: 'Terms of Service',
    description: 'Terms of Service governing legal engagement and client counsel with ENM Legal Advocates in Kenya.',
    canonicalPath: '/terms',
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-royal text-xs font-semibold uppercase tracking-wider mb-4">
            <ScaleIcon className="w-4 h-4" />
            <span>Legal Practice Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Last Updated: September 2026 • Governed by the Laws of the Republic of Kenya
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <DocumentTextIcon className="w-6 h-6 text-royal shrink-0" />
              1. Acceptance of Terms
            </h2>
            <p>
              Welcome to the website of <strong>ENM Legal</strong> (Advocate Eva Nduta Munene). By accessing or using this website, scheduling a consultation, or submitting inquiries through our digital channels, you agree to be bound by these Terms of Service, our Privacy Policy, and all applicable statutory provisions in Kenya.
            </p>
            <p className="mt-3">
              If you do not agree with any part of these terms, you should discontinue use of this site immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <ShieldCheckIcon className="w-6 h-6 text-amber-600 shrink-0" />
              2. Advocate-Client Relationship Disclaimer
            </h2>
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-amber-900 text-sm sm:text-base mb-4">
              <strong>Important Notice:</strong> Browsing this website, submitting an inquiry through our contact form, or reading our legal insight publications does <em>not</em> by itself create an advocate-client relationship between you and ENM Legal.
            </div>
            <p>
              An advocate-client relationship is strictly established only upon the formal execution of an <strong>Engagement Agreement</strong> or Letter of Instruction signed by Advocate Eva Nduta Munene, accompanied by the completion of statutory conflict-of-interest checks and client onboarding procedures.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              3. Informational Content & Non-Reliance
            </h2>
            <p>
              The articles, legal insights, blog commentaries, FAQs, and guides published on this platform are provided solely for general informational, educational, and public orientation purposes.
            </p>
            <p className="mt-3">
              Kenyan jurisprudence and statutory law evolve continuously. The content on this website should not be construed as definitive legal advice tailored to your specific circumstances. You must consult a qualified advocate of the High Court of Kenya prior to taking or refraining from any legal or commercial action.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              4. Consultations & Professional Fees
            </h2>
            <p>
              Initial consultations booked through our online booking tool or phone lines may be subject to a preliminary consultation fee as communicated prior to confirmation.
            </p>
            <p className="mt-3">
              All professional legal fees, retainers, and disbursements are governed by the <strong>Advocates Act (Cap 16, Laws of Kenya)</strong> and the <strong>Advocates (Remuneration) Order</strong>, or as expressly agreed in writing under a valid Section 45 Agreement between the client and ENM Legal.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              5. Confidentiality & Privileged Communications
            </h2>
            <p>
              We treat all client communications with utmost fidelity and in accordance with the Law Society of Kenya (LSK) Code of Ethics and Conduct.
            </p>
            <p className="mt-3">
              While we maintain strict administrative and electronic safeguards, internet communications are never entirely immune to technical interception. For highly sensitive, classified, or proprietary matters, clients are encouraged to request encrypted channels or schedule an in-person conference at our Upper Hill offices.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              6. Intellectual Property Rights
            </h2>
            <p>
              All trademarks, logos, texts, graphics, code, and editorial materials published on this website are the intellectual property of <strong>ENM Legal</strong> and its licensors, protected under the <em>Copyright Act (Cap 130, Laws of Kenya)</em> and international intellectual property conventions.
            </p>
            <p className="mt-3">
              You may read, bookmark, and share links to our articles with clear attribution to ENM Legal. Any unauthorized reproduction, commercial exploitation, or scraping without written consent is strictly prohibited.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              7. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms of Service and any non-contractual obligations arising out of or in connection with them shall be governed by and construed in accordance with the <strong>laws of the Republic of Kenya</strong>.
            </p>
            <p className="mt-3">
              The High Court of Kenya at Nairobi shall have exclusive jurisdiction to hear and determine any disputes arising out of the interpretation or application of these terms.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              8. Contact & Formal Inquiries
            </h2>
            <p>
              For legal inquiries, professional appointments, or clarification regarding these terms, please contact:
            </p>
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed">
              <p className="font-semibold text-slate-900">ENM Legal (Advocate Eva Nduta Munene)</p>
              <p>Block B, 3rd Floor, Suite 3.2, KMA Center, Chyulu Road</p>
              <p>Upper Hill, P.O. Box 40964-00100, Nairobi, Kenya</p>
              <p className="mt-2">
                <strong>Phone:</strong> +254 701-857-030 • <strong>Email:</strong> info@enmlegal.com
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

export default TermsOfService;
