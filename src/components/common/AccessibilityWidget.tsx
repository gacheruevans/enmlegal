import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  dyslexicFont: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'enm_a11y_settings';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 'normal',
  highContrast: false,
  dyslexicFont: false,
  underlineLinks: false,
  reduceMotion: false,
};

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to parse accessibility settings from localStorage', e);
    }
    // Detect prefers-reduced-motion as default if user has system preference
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    return { ...DEFAULT_SETTINGS, reduceMotion: !!prefersReduced };
  });

  const [announcement, setAnnouncement] = useState('');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Apply settings to document element
  useEffect(() => {
    const root = document.documentElement;

    // 1. Text scale
    root.classList.remove('text-size-large', 'text-size-xlarge');
    if (settings.textSize === 'large') root.classList.add('text-size-large');
    if (settings.textSize === 'xlarge') root.classList.add('text-size-xlarge');

    // 2. High Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Dyslexic font
    if (settings.dyslexicFont) {
      root.classList.add('dyslexic-font');
    } else {
      root.classList.remove('dyslexic-font');
    }

    // 4. Underline links
    if (settings.underlineLinks) {
      root.classList.add('underline-links');
    } else {
      root.classList.remove('underline-links');
    }

    // 5. Reduced motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save accessibility settings to localStorage', e);
    }
  }, [settings]);

  // Handle escape key and outside click to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const announce = (msg: string) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(''), 3000);
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
    announcementText: string
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    announce(announcementText);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    announce('Accessibility settings reset to default values.');
  };

  const togglePanel = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        announce('Accessibility menu opened.');
      } else {
        triggerRef.current?.focus();
      }
      return next;
    });
  };

  const hasCustomSettings =
    settings.textSize !== 'normal' ||
    settings.highContrast ||
    settings.dyslexicFont ||
    settings.underlineLinks ||
    settings.reduceMotion;

  return (
    <>
      {/* Live Region for Screen Readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="a11y-live-region"
      >
        {announcement}
      </div>

      {/* Floating Accessibility Trigger Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          ref={triggerRef}
          type="button"
          onClick={togglePanel}
          aria-expanded={isOpen}
          aria-controls="accessibility-panel"
          aria-haspopup="dialog"
          aria-label={
            isOpen
              ? 'Close accessibility options panel'
              : 'Open accessibility tools and display preferences'
          }
          title="Accessibility Preferences (WCAG AA)"
          className={`flex items-center justify-center p-3.5 rounded-full shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-offset-2 cursor-pointer ${
            hasCustomSettings
              ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500 scale-105'
              : 'bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md border border-slate-700 hover:scale-105'
          }`}
        >
          {/* Universal Accessibility Icon */}
          <svg
            className="w-6 h-6 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
          </svg>
          <span className="sr-only">Accessibility Preferences</span>
          {hasCustomSettings && (
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"
              title="Active accessibility customizations"
            />
          )}
        </button>
      </div>

      {/* Accessible Popover Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          id="accessibility-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-panel-title"
          className="fixed bottom-22 left-6 z-50 w-[340px] sm:w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
                </svg>
              </div>
              <div>
                <h2
                  id="a11y-panel-title"
                  className="text-base font-extrabold text-white tracking-tight"
                >
                  Accessibility Tools
                </h2>
                <p className="text-[11px] text-slate-300">
                  WCAG 2.1 AA Display Preferences
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              aria-label="Close accessibility options"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body Options */}
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* 1. Text Sizing */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Text Size
                </span>
                <span className="text-xs font-semibold text-royal">
                  {settings.textSize === 'normal'
                    ? 'Default (100%)'
                    : settings.textSize === 'large'
                    ? 'Large (+15%)'
                    : 'Extra Large (+30%)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateSetting('textSize', 'normal', 'Text size set to Default')
                  }
                  className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                    settings.textSize === 'normal'
                      ? 'bg-royal text-white border-royal shadow-xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 text-sm'
                  }`}
                >
                  <span className="text-xs">Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSetting('textSize', 'large', 'Text size set to Large')
                  }
                  className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                    settings.textSize === 'large'
                      ? 'bg-royal text-white border-royal shadow-xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 text-sm'
                  }`}
                >
                  <span className="text-sm font-semibold">Large</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSetting('textSize', 'xlarge', 'Text size set to Extra Large')
                  }
                  className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                    settings.textSize === 'xlarge'
                      ? 'bg-royal text-white border-royal shadow-xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 text-sm'
                  }`}
                >
                  <span className="text-base font-bold">X-Large</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 2. High Contrast Mode */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900">
                  High Contrast
                </div>
                <div className="text-xs text-slate-500">
                  Enhances color separation and border outlines.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.highContrast}
                onClick={() =>
                  updateSetting(
                    'highContrast',
                    !settings.highContrast,
                    settings.highContrast
                      ? 'High contrast mode disabled'
                      : 'High contrast mode enabled'
                  )
                }
                className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.highContrast ? 'bg-royal' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                    settings.highContrast ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* 3. Dyslexia-Friendly Font */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Readable Dyslexia Font
                </div>
                <div className="text-xs text-slate-500">
                  High legibility font with enhanced letter spacing.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.dyslexicFont}
                onClick={() =>
                  updateSetting(
                    'dyslexicFont',
                    !settings.dyslexicFont,
                    settings.dyslexicFont
                      ? 'Dyslexia readable font disabled'
                      : 'Dyslexia readable font enabled'
                  )
                }
                className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.dyslexicFont ? 'bg-royal' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                    settings.dyslexicFont ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* 4. Underline Links */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Underline Links
                </div>
                <div className="text-xs text-slate-500">
                  Draws distinct underlines under all hyperlinks.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.underlineLinks}
                onClick={() =>
                  updateSetting(
                    'underlineLinks',
                    !settings.underlineLinks,
                    settings.underlineLinks
                      ? 'Underline links disabled'
                      : 'Underline links enabled'
                  )
                }
                className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.underlineLinks ? 'bg-royal' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                    settings.underlineLinks ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* 5. Reduced Motion */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Reduce Motion
                </div>
                <div className="text-xs text-slate-500">
                  Suppresses animations and smooth scrolling.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.reduceMotion}
                onClick={() =>
                  updateSetting(
                    'reduceMotion',
                    !settings.reduceMotion,
                    settings.reduceMotion
                      ? 'Reduced motion disabled'
                      : 'Reduced motion enabled'
                  )
                }
                className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.reduceMotion ? 'bg-royal' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                    settings.reduceMotion ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasCustomSettings}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityWidget;
