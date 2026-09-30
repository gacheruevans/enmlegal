import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLayoutContext } from '../layout/LayoutContext';

interface NavItem {
  name: string;
  href: string;
  path: string;
  sectionId: string;
}

const navigation: NavItem[] = [
  { name: 'home', href: '/home', path: '/home', sectionId: 'home' },
  { name: 'about', href: '/about', path: '/about', sectionId: 'about' },
  { name: 'practice Areas', href: '/practice-areas', path: '/practice-areas', sectionId: 'services' },
  { name: 'blog', href: '/blog', path: '/blog', sectionId: 'blog' },
  { name: 'contacts', href: '/contacts', path: '/contacts', sectionId: 'contacts' },
];

// Enhanced highlight bar with gradient, throttled rAF positioning, resize observer & reduced-motion support.
const HighlightBar: React.FC<{ activeSection: string }> = ({ activeSection }) => {
  const barRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const applyPosition = () => {
    const container = barRef.current?.parentElement;
    if (!container) return;
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[data-nav-link]'));
    const activeLink = links.find(l => {
      const name = l.getAttribute('data-name');
      return name === activeSection || (name === 'practice Areas' && activeSection === 'services');
    });
    if (!activeLink || !barRef.current) {
      if (barRef.current) barRef.current.style.opacity = '0';
      return;
    }
    const rect = activeLink.getBoundingClientRect();
    const parentRect = container.getBoundingClientRect();
    const left = rect.left - parentRect.left;
    const width = rect.width;
    const style = barRef.current.style;
    style.transform = `translateX(${left}px)`;
    style.width = `${width}px`;
    style.opacity = '1';
    if (prefersReducedMotion) style.transition = 'none';
  };

  const schedule = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(applyPosition);
  };

  useEffect(schedule, [activeSection]);

  useEffect(() => {
    const ro = new ResizeObserver(() => schedule());
    if (barRef.current?.parentElement) ro.observe(barRef.current.parentElement);
    window.addEventListener('resize', schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', schedule);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="absolute bottom-0 h-0.5 rounded-full transition-all duration-300 ease-out will-change-transform bg-gradient-to-r from-royal via-greenroyal to-royal"
      style={{ width: 0, opacity: 0, backgroundSize: '200% 100%', animation: prefersReducedMotion ? undefined : 'gradientShift 6s linear infinite' }}
    />
  );
};

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export const NavBar = () => {
  const { activeSection, manualSelected, setManualSelected, hasBlogPosts } = useLayoutContext();
  const navigate = useNavigate();
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleNavItems = navigation.filter(item => item.name !== 'blog' || hasBlogPosts);

  const handleNavClick = (item: NavItem) => {
    const section = document.getElementById(item.sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', item.path);
    } else {
      navigate(item.path);
    }
    setManualSelected(item.name);
    setMobileMenuOpen(false);
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Navigated to ${item.name}`;
    }
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);
  
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav aria-label="Global" className="flex items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <a
            href="/home"
            className="-m-1.5 p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(navigation[0]);
            }}
          >
            <span className="sr-only">ENM Legal Advocates - Advocate Eva Nduta Munene</span>
            <img
              alt="ENM Legal Advocates Logo"
              src={`https://github.com/gacheruevans/enmlegal/blob/main/dist/logo_white_text.png?raw=true`}
              className="w-auto h-10 transition-all duration-300 md:h-14 lg:h-16"
            />
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="p-2.5 rounded-xl text-white bg-slate-900/80 border border-slate-700 backdrop-blur-md transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div
          className="relative hidden lg:flex lg:gap-x-12"
          onKeyDown={(e) => {
            // Keyboard navigation: arrows + Home/End
            if (!(e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End')) return;
            const links = Array.from((e.currentTarget as HTMLElement).querySelectorAll<HTMLAnchorElement>('a[data-nav-link]'));
            if (!links.length) return;
            const currentName = manualSelected || activeSection;
            const idx = links.findIndex(l => l.getAttribute('data-name') === currentName || (l.getAttribute('data-name') === 'practice Areas' && currentName === 'services'));
            let nextIdx = idx;
            if (e.key === 'ArrowRight') nextIdx = idx < links.length - 1 ? idx + 1 : 0;
            if (e.key === 'ArrowLeft') nextIdx = idx > 0 ? idx - 1 : links.length - 1;
            if (e.key === 'Home') nextIdx = 0;
            if (e.key === 'End') nextIdx = links.length - 1;
            const next = links[nextIdx];
            next?.focus();
            const name = next?.getAttribute('data-name');
            const targetItem = visibleNavItems.find(i => i.name === name);
            if (targetItem) handleNavClick(targetItem);
          }}
          role="menubar"
          aria-label="Primary"
        >
          {visibleNavItems.map((item) => {
            const observedActive = activeSection === item.name || (item.name === 'practice Areas' && activeSection === 'services') || (item.name === 'contacts' && activeSection === 'contacts');
            const isActive = manualSelected ? manualSelected === item.name : observedActive;
            return (
              <div className="py-1 space-y-2" key={item.name}>
                <a
                  data-nav-link
                  data-name={item.name}
                  href={item.href}
                  className={`relative capitalize text-lg text-royal font-weight-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-royal transition-colors ${isActive ? 'text-white font-semibold' : 'no-underline'}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item);
                  }}
                >
                  {item.name}
                </a>
              </div>
            );
          })}
          <HighlightBar activeSection={manualSelected ? (manualSelected === 'practice Areas' ? 'services' : manualSelected) : activeSection} />
          <div ref={liveRegionRef} aria-live="polite" className="sr-only" />
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end" />
      </nav>

      {/* Accessible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="lg:hidden fixed inset-x-4 top-20 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex flex-col space-y-3">
            {visibleNavItems.map((item) => {
              const observedActive = activeSection === item.name || (item.name === 'practice Areas' && activeSection === 'services') || (item.name === 'contacts' && activeSection === 'contacts');
              const isActive = manualSelected ? manualSelected === item.name : observedActive;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item);
                  }}
                  className={`capitalize px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                    isActive
                      ? 'bg-royal text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.name}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

