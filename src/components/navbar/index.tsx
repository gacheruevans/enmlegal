import React, { useEffect, useRef } from 'react';

const navigation = [
  { name: 'home', href: '/#home' },
  { name: 'about', href: '/about' },
  { name: 'practice Areas', href: '/practice-areas' },
  { name: 'blog', href: '/blog' },
  { name: 'contacts', href: '/contacts' },
];

import { useLayoutContext } from '../layout/LayoutContext';

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

export const NavBar = () => {
  const { activeSection, manualSelected, setManualSelected } = useLayoutContext();
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const handleNavClick = (name: string) => {
    let sectionId = name === 'practice Areas' ? 'services' : name;
    // Check if an element with the given id exists and is a div
    const section = document.getElementById(sectionId);
    if (section && section.tagName.toLowerCase() === 'div') {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${sectionId}`;
    }
    setManualSelected(name);
    // Announce manual selection
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Navigated to ${name.replace('practice Areas', 'services')}`;
    }
  };
  
  // Removed duplicate scroll-to-top logic (centralized in Layout)

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav aria-label="Global" className="flex items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">ENM Legal</span>
            <img
              alt="Company logo"
              src="https://github.com/gacheruevans/enmlegal/blob/main/dist/logo_white_text.png?raw=true"
              className="w-auto h-10 md:h-14 lg:h-16 transition-all duration-300"
            />
          </a>
        </div>
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
            if (name) handleNavClick(name);
          }}
          role="menubar"
          aria-label="Primary"
        >
          {navigation.map((item) => {
            const observedActive = activeSection === item.name || (item.name === 'practice Areas' && activeSection === 'services');
            const isActive = manualSelected ? manualSelected === item.name : observedActive;
            return (
              <div className="py-1 space-y-2" key={item.name}>
                <a
                  data-nav-link
                  data-name={item.name}
                  href={item.href}
                  className={`relative capitalize text-lg text-royal font-weight-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-royal transition-colors ${isActive ? 'text-white' : 'no-underline'}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.name);
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
    </header>
  )
};
