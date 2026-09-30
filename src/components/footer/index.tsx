import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useLayoutContext } from '../layout/LayoutContext';

import { useSiteContent } from '../../context/SiteContentContext';

const Footer: React.FC = () => {
  const { hasBlogPosts, setManualSelected } = useLayoutContext();
  const { content } = useSiteContent();
  const contact = content.contact;
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleQuickLink = (name: string, sectionId: string, path: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', path);
    } else {
      navigate(path);
    }
    setManualSelected(name);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setFormSubmitted(false);
    }, 4000);
  };

  return (
    <footer id="contacts" className="relative px-8 py-16 text-white bg-slate-900 border-t border-slate-800 md:px-16 lg:px-28">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Office Address */}
        <div>
          {contact?.title && (
            <h2 className="mb-4 text-lg font-semibold tracking-wide text-white">
              {contact.title}
            </h2>
          )}
          {contact?.subtext && (
            <div className="whitespace-pre-line text-sm text-gray-300 font-light leading-relaxed">
              {contact.subtext}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="mb-4 text-lg font-semibold tracking-wide text-white">Quick Links</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <button
                type="button"
                onClick={() => handleQuickLink('home', 'home', '/home')}
                className="text-left text-gray-300 hover:text-white hover:translate-x-1 transition-all cursor-pointer font-light"
              >
                Home
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleQuickLink('about', 'about', '/about')}
                className="text-left text-gray-300 hover:text-white hover:translate-x-1 transition-all cursor-pointer font-light"
              >
                About
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleQuickLink('practice Areas', 'services', '/practice-areas')}
                className="text-left text-gray-300 hover:text-white hover:translate-x-1 transition-all cursor-pointer font-light"
              >
                Practice Areas
              </button>
            </li>
            {hasBlogPosts && (
              <li>
                <button
                  type="button"
                  onClick={() => handleQuickLink('blog', 'blog', '/blog')}
                  className="text-left text-gray-300 hover:text-white hover:translate-x-1 transition-all cursor-pointer font-light"
                >
                  Blog
                </button>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => handleQuickLink('contacts', 'contacts', '/contacts')}
                className="text-left text-gray-300 hover:text-white hover:translate-x-1 transition-all cursor-pointer font-light"
              >
                Contacts
              </button>
            </li>
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h2 className="mb-4 text-lg font-semibold tracking-wide text-white">Legal</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link
                to="/terms"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all font-light"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all font-light"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/license"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all font-light"
              >
                License & Credentials
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="mb-4 text-lg font-semibold tracking-wide text-white">Contact Us</h2>
          <p className="text-xs text-gray-300 font-light leading-relaxed mb-4">
            We are here to help you with your legal needs. Reach out to our advocates anytime.
          </p>
          {formSubmitted ? (
            <div className="p-3 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 rounded-lg">
              ✓ Thank you for reaching out! We have received your message and will respond promptly.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-2.5">
              <input
                type="text"
                required
                aria-label="Your Name"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal transition"
              />
              <input
                type="email"
                required
                aria-label="Your Email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal transition"
              />
              <textarea
                required
                rows={3}
                aria-label="Your Legal Inquiry"
                placeholder="Your Legal Inquiry"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 text-sm text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal transition"
              />
              <button
                type="submit"
                aria-label="Send contact message to ENM Legal"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-royal hover:bg-royal/80 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Bar & Social Links */}
      <div className="pt-10 mt-12 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <p>© 2026 ENM Legal • Advocate Eva Nduta Munene. All rights reserved.</p>
        <div className="flex items-center space-x-6">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit ENM Legal on Facebook (opens in a new tab)"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
          >
            Facebook
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit ENM Legal on Twitter / X (opens in a new tab)"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
          >
            Twitter / X
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit ENM Legal on LinkedIn (opens in a new tab)"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
          >
            LinkedIn
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit ENM Legal on Instagram (opens in a new tab)"
            className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;