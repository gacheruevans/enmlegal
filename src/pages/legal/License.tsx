import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeftIcon, CheckBadgeIcon, CodeBracketIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import Footer from '../../components/footer';
import { usePageSEO } from '../../hooks/usePageSEO';
import { SkipToContent } from '../../components/common/SkipToContent';

export const License: React.FC = () => {
  usePageSEO({
    title: 'Legal Practice License & Accreditations',
    description: 'Statutory legal accreditations, Law Society of Kenya (LSK) licensing, and regulatory compliance disclosures for ENM Legal Advocates.',
    canonicalPath: '/license',
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
            <BuildingLibraryIcon className="w-4 h-4" />
            <span>Professional Licensing & Legal Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            License & Professional Credentials
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Law Society of Kenya (LSK) Regulated • Republic of Kenya
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Section 1: Professional Practice Credentials */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <CheckBadgeIcon className="w-6 h-6 text-royal shrink-0" />
              1. Professional Practice Status & Admission
            </h2>
            <p>
              <strong>ENM Legal</strong> operates under the direct leadership of <strong>Advocate Eva Nduta Munene</strong>, who is duly admitted as an Advocate of the High Court of Kenya pursuant to the provisions of the <em>Advocates Act (Cap 16, Laws of Kenya)</em>.
            </p>
            <div className="mt-4 p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-sm text-blue-950">
              <p>
                <strong>Statutory Regulator:</strong> Law Society of Kenya (LSK)
              </p>
              <p>
                <strong>Roll of Advocates:</strong> Duly Enrolled Advocate of the High Court of Kenya
              </p>
              <p>
                <strong>Current Practising Certificate:</strong> Valid and active annual certificate issued in compliance with Section 22 of the Advocates Act.
              </p>
            </div>
          </section>

          {/* Section 2: Website Editorial Content License */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              2. Editorial Content & Publication License
            </h2>
            <p>
              All published articles, legal analysis, case digests, and guides on this website are protected under copyright law.
            </p>
            <p className="mt-3">
              We grant visitors a non-exclusive, non-transferable, revocable license to view, bookmark, and share links to our published articles for educational and informational purposes, provided that:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
              <li>Clear attribution is given to <em>Advocate Eva Nduta Munene / ENM Legal</em>.</li>
              <li>A direct hyperlink back to the original article on this website is included.</li>
              <li>The content is not modified, abridged, or repurposed for commercial gain without explicit written consent.</li>
            </ul>
          </section>

          {/* Section 3: Software & Open Source Notices */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <CodeBracketIcon className="w-6 h-6 text-slate-700 shrink-0" />
              3. Digital Platform & Open Source Attribution
            </h2>
            <p>
              This website and its administrative tools are built using open-source software libraries licensed under permissive terms (such as the MIT, Apache 2.0, and BSD licenses):
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-900">React & React Router:</span> MIT License
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-900">Tailwind CSS:</span> MIT License
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-900">NestJS:</span> MIT License
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-900">Prisma ORM:</span> Apache 2.0 License
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              The proprietary visual styling, custom components, branding, logos, and firm layout remain exclusive intellectual property of ENM Legal and may not be duplicated.
            </p>
          </section>

          {/* Section 4: Verification of Credentials */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              4. Verification of Practising Status
            </h2>
            <p>
              Clients and members of the public are encouraged to verify the professional standing of any practicing advocate in Kenya through the official Law Society of Kenya online advocate search portal at:
            </p>
            <p className="mt-3">
              <a
                href="https://lsk.or.ke"
                target="_blank"
                rel="noopener noreferrer"
                className="text-royal font-semibold hover:underline"
              >
                https://lsk.or.ke → Advocate Search
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default License;
