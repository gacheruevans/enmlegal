import React, { useEffect, useRef, useState } from 'react';
import { useLayoutContext } from '../layout/LayoutContext';

// Simple floating breadcrumb showing current section (manualSelected overrides observer)
// Maps internal ids to user-friendly labels.
const labelMap: Record<string, string> = {
  home: 'Home',
  about: 'About',
  services: 'Services',
  blog: 'Blog',
  contacts: 'Contacts',
  'practice Areas': 'Services', // handle manualSelected original label
};

export const Breadcrumb: React.FC = () => {
  const { activeSection, manualSelected } = useLayoutContext();
  const currentRaw = manualSelected || activeSection;
  const [visible, setVisible] = useState(false);

  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const onScrollImmediate = () => {
      const y = window.scrollY;
      const shouldShow = y > 160 && activeSection !== 'home';
      setVisible(prev => prev !== shouldShow ? shouldShow : prev);
    };
    const onScrollDebounced = () => {
      if (scrollTimeoutRef.current) cancelAnimationFrame(scrollTimeoutRef.current);
      // Use rAF as a lightweight debounce (frame-level)
      scrollTimeoutRef.current = requestAnimationFrame(onScrollImmediate);
    };
    window.addEventListener('scroll', onScrollDebounced, { passive: true });
    onScrollImmediate();
    return () => {
      window.removeEventListener('scroll', onScrollDebounced);
      if (scrollTimeoutRef.current) cancelAnimationFrame(scrollTimeoutRef.current);
    };
  }, [activeSection]);

  if (!currentRaw || activeSection === 'home' || !visible) return null; // hide entirely on home or before threshold
  const current = labelMap[currentRaw] || currentRaw;

  return (
    <nav aria-label="Breadcrumb" className={`fixed z-50 px-3 py-1 text-xs font-medium rounded-md shadow-sm top-4 left-4 backdrop-blur bg-slate-900/70 text-white sm:text-sm transition-opacity duration-300 ease-out ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>  
      <ol className="flex items-center space-x-2">
        <li>
          <button
            onClick={() => {
              document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-royal"
          >Home</button>
        </li>
        <li aria-hidden className="text-slate-400">/</li>
        <li aria-current="page" className="text-royal">{current}</li>
      </ol>
    </nav>
  );
};
