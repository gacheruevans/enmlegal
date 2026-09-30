import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  XMarkIcon,
  ArrowPathIcon,
  CheckIcon,
  EyeIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  CursorArrowRaysIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'xlarge' | 'max';
  contrastMode: 'normal' | 'high-contrast' | 'grayscale';
  dyslexicFont: boolean;
  readingGuide: boolean;
  bigCursor: boolean;
  underlineLinks: boolean;
  highlightHeadings: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'enm_a11y_settings';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 'normal',
  contrastMode: 'normal',
  dyslexicFont: false,
  readingGuide: false,
  bigCursor: false,
  underlineLinks: false,
  highlightHeadings: false,
  reduceMotion: false,
};

interface ProfileConfig {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  apply: (prev: AccessibilitySettings) => AccessibilitySettings;
  isActive: (s: AccessibilitySettings) => boolean;
}

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profiles' | 'display' | 'reading'>('profiles');
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
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    return { ...DEFAULT_SETTINGS, reduceMotion: !!prefersReduced };
  });

  const [announcement, setAnnouncement] = useState('');
  const [guideY, setGuideY] = useState(150);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Announce to screen readers
  const announce = useCallback((msg: string) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(''), 3000);
  }, []);

  // Sync DOM classes whenever settings update
  useEffect(() => {
    const root = document.documentElement;

    // 1. Text scaling
    root.classList.remove('text-size-large', 'text-size-xlarge', 'text-size-max');
    if (settings.textSize === 'large') root.classList.add('text-size-large');
    if (settings.textSize === 'xlarge') root.classList.add('text-size-xlarge');
    if (settings.textSize === 'max') root.classList.add('text-size-max');

    // 2. Contrast & Grayscale
    root.classList.remove('high-contrast', 'grayscale-mode');
    if (settings.contrastMode === 'high-contrast') root.classList.add('high-contrast');
    if (settings.contrastMode === 'grayscale') root.classList.add('grayscale-mode');

    // 3. Dyslexic font
    if (settings.dyslexicFont) {
      root.classList.add('dyslexic-font');
    } else {
      root.classList.remove('dyslexic-font');
    }

    // 4. Big cursor
    if (settings.bigCursor) {
      root.classList.add('big-cursor');
    } else {
      root.classList.remove('big-cursor');
    }

    // 5. Underline links
    if (settings.underlineLinks) {
      root.classList.add('underline-links');
    } else {
      root.classList.remove('underline-links');
    }

    // 6. Highlight headings
    if (settings.highlightHeadings) {
      root.classList.add('highlight-headings');
    } else {
      root.classList.remove('highlight-headings');
    }

    // 7. Reduced motion
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

  // Reading Guide pointer tracking
  useEffect(() => {
    if (!settings.readingGuide) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientY = e.touches[0].clientY;
      } else if ('clientY' in e) {
        clientY = e.clientY;
      }
      setGuideY(clientY);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [settings.readingGuide]);

  // Global Keyboard shortcuts: Alt+A to toggle, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A (or Option + A on Mac)
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          announce(next ? 'Accessibility tools opened' : 'Accessibility tools closed');
          return next;
        });
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        announce('Accessibility tools closed');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, announce]);

  // Focus management when opening
  useEffect(() => {
    if (isOpen) {
      // Focus the close button or first interactive element inside the dialog
      const firstBtn = dialogRef.current?.querySelector<HTMLButtonElement>('button');
      firstBtn?.focus();
    }
  }, [isOpen]);

  // Calculate active customizations count
  const activeCount = Object.entries(settings).reduce((acc, [key, val]) => {
    if (key === 'textSize' && val !== 'normal') return acc + 1;
    if (key === 'contrastMode' && val !== 'normal') return acc + 1;
    if (typeof val === 'boolean' && val) return acc + 1;
    return acc;
  }, 0);

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
    announce('All accessibility adjustments reset to system defaults');
  };

  // Assistive Profiles (1-Click Presets for specific disability personas)
  const PROFILES: ProfileConfig[] = [
    {
      id: 'vision',
      name: 'Vision Impairment',
      badge: 'Low Vision / Cataracts',
      description: 'Increases text size to 130%, activates dark high-contrast mode, enlarges cursor, and underlines links.',
      icon: EyeIcon,
      apply: (prev) => {
        const active = prev.contrastMode === 'high-contrast' && prev.textSize === 'xlarge';
        return active
          ? { ...prev, contrastMode: 'normal', textSize: 'normal', bigCursor: false, underlineLinks: false }
          : { ...prev, contrastMode: 'high-contrast', textSize: 'xlarge', bigCursor: true, underlineLinks: true };
      },
      isActive: (s) => s.contrastMode === 'high-contrast' && s.textSize === 'xlarge' && s.bigCursor,
    },
    {
      id: 'dyslexia',
      name: 'Cognitive & Dyslexia',
      badge: 'Reading Assistance',
      description: 'Applies Atkinson Hyperlegible typography with weighted baselines, line-height 1.85, and line-focus ruler.',
      icon: BookOpenIcon,
      apply: (prev) => {
        const active = prev.dyslexicFont && prev.readingGuide;
        return active
          ? { ...prev, dyslexicFont: false, readingGuide: false, textSize: 'normal' }
          : { ...prev, dyslexicFont: true, readingGuide: true, textSize: 'large', underlineLinks: true };
      },
      isActive: (s) => s.dyslexicFont && s.readingGuide,
    },
    {
      id: 'seizure',
      name: 'Seizure & Sensory Safe',
      badge: 'Photo-sensitive Epilepsy',
      description: 'Instantly stops all transitions, page animations, and switches to calm grayscale tones to eliminate flash risks.',
      icon: ShieldCheckIcon,
      apply: (prev) => {
        const active = prev.reduceMotion && prev.contrastMode === 'grayscale';
        return active
          ? { ...prev, reduceMotion: false, contrastMode: 'normal' }
          : { ...prev, reduceMotion: true, contrastMode: 'grayscale' };
      },
      isActive: (s) => s.reduceMotion && s.contrastMode === 'grayscale',
    },
    {
      id: 'adhd',
      name: 'ADHD & Focus Friendly',
      badge: 'Cognitive Tracking',
      description: 'Activates horizontal reading ruler that dims surrounding content and emphasizes headings for reading focus.',
      icon: SparklesIcon,
      apply: (prev) => {
        const active = prev.readingGuide && prev.highlightHeadings;
        return active
          ? { ...prev, readingGuide: false, highlightHeadings: false, reduceMotion: false }
          : { ...prev, readingGuide: true, highlightHeadings: true, reduceMotion: true };
      },
      isActive: (s) => s.readingGuide && s.highlightHeadings,
    },
    {
      id: 'motor',
      name: 'Motor & Dexterity',
      badge: 'Reduced Fine Motor Control',
      description: 'Provides a 36px high-visibility cursor, underlines links, and increases clickable boundaries.',
      icon: CursorArrowRaysIcon,
      apply: (prev) => {
        const active = prev.bigCursor && prev.underlineLinks;
        return active
          ? { ...prev, bigCursor: false, underlineLinks: false }
          : { ...prev, bigCursor: true, underlineLinks: true, textSize: 'large' };
      },
      isActive: (s) => s.bigCursor && s.underlineLinks,
    },
  ];

  return (
    <>
      {/* Live Region for Screen Readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="a11y-live-announcer"
      >
        {announcement}
      </div>

      {/* Interactive Reading Guide (Ruler & Mask) */}
      {settings.readingGuide && (
        <div
          className="a11y-reading-guide-ruler"
          style={{ top: `${Math.max(0, guideY - 21)}px` }}
          aria-hidden="true"
        />
      )}

      {/* Floating Accessibility Trigger Button */}
      <aside aria-label="Accessibility options trigger" className="a11y-widget-root">
        <div className="fixed bottom-6 left-6 z-[9999]">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => {
              setIsOpen((prev) => {
                const next = !prev;
                announce(next ? 'Accessibility tools opened' : 'Accessibility tools closed');
                return next;
              });
            }}
            aria-expanded={isOpen}
            aria-controls="accessibility-center-dialog"
            aria-haspopup="dialog"
            aria-label={
              isOpen
                ? 'Close accessibility center'
                : `Open accessibility tools and display preferences. ${activeCount} customizations active. Shortcut: Alt + A`
            }
            title="Accessibility Center (Alt + A)"
            className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-offset-2 cursor-pointer ${
              activeCount > 0
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500 shadow-amber-500/20 scale-105'
                : 'bg-[#033f53] hover:bg-[#022b3a] text-white border-2 border-slate-700/60 hover:scale-105 shadow-slate-950/30'
            }`}
          >
            {/* Universal Accessibility Icon (W3C / ISO Human in Circle) */}
            <svg
              className="w-7 h-7 fill-current transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
            </svg>

            {/* Active Settings Counter Pill */}
            {activeCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 bg-emerald-600 text-white text-[11px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-md animate-pulse"
                title={`${activeCount} accessibility aids currently active`}
              >
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Accessibility Center Modal & Backdrop */}
      {isOpen && (
        <div className="a11y-widget-root fixed inset-0 z-[10000] flex items-end sm:items-end sm:justify-start">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => {
              setIsOpen(false);
              triggerRef.current?.focus();
              announce('Accessibility tools closed');
            }}
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <div
            ref={dialogRef}
            id="accessibility-center-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-dialog-title"
            aria-describedby="a11y-dialog-desc"
            className="a11y-center-card relative w-full sm:w-[440px] max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-800 sm:m-6 transition-all duration-200 z-[10001]"
          >
            {/* Header */}
            <div className="bg-[#033f53] text-white px-5 py-4 border-b border-slate-700/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
                  </svg>
                </div>
                <div>
                  <h2 id="a11y-dialog-title" className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    Accessibility Center
                    <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded-full">
                      WCAG 2.1 AA
                    </span>
                  </h2>
                  <p id="a11y-dialog-desc" className="text-xs text-slate-300">
                    Display & assistive aids for diverse visual and motor needs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  Alt+A
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    triggerRef.current?.focus();
                    announce('Accessibility tools closed');
                  }}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                  aria-label="Close accessibility center (Escape)"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('profiles')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                  activeTab === 'profiles'
                    ? 'bg-white text-[#033f53] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                1-Click Profiles
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('display')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                  activeTab === 'display'
                    ? 'bg-white text-[#033f53] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Text & Contrast
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reading')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                  activeTab === 'reading'
                    ? 'bg-white text-[#033f53] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Focus & Motion
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[60vh]">
              {/* TAB 1: 1-Click Assistive Profiles */}
              {activeTab === 'profiles' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Pre-Configured Disability Profiles
                  </div>

                  {PROFILES.map((profile) => {
                    const active = profile.isActive(settings);
                    const IconComponent = profile.icon;
                    return (
                      <div
                        key={profile.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          active
                            ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/50 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                                active ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">{profile.name}</h3>
                                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                  {profile.badge}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {profile.description}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={active}
                            onClick={() => {
                              setSettings(profile.apply);
                              announce(`${profile.name} profile ${active ? 'disabled' : 'activated'}`);
                            }}
                            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                              active ? 'bg-[#033f53]' : 'bg-slate-200'
                            }`}
                            aria-label={`Toggle ${profile.name} profile`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                                active ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: Text Sizing & Contrast Options */}
              {activeTab === 'display' && (
                <div className="space-y-4">
                  {/* Font Scaling */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Font Size Scaling
                      </label>
                      <span className="text-xs font-bold text-[#033f53] bg-slate-100 px-2 py-0.5 rounded-md">
                        {settings.textSize === 'normal' && 'Standard (100%)'}
                        {settings.textSize === 'large' && 'Large (115%)'}
                        {settings.textSize === 'xlarge' && 'X-Large (130%)'}
                        {settings.textSize === 'max' && 'Maximum (150%)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'normal', label: '100%', sub: 'Default' },
                        { id: 'large', label: '115%', sub: 'Large' },
                        { id: 'xlarge', label: '130%', sub: 'X-Large' },
                        { id: 'max', label: '150%', sub: 'Max' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            updateSetting('textSize', t.id as any, `Text size scaled to ${t.label}`)
                          }
                          className={`py-2 px-1 text-center rounded-xl border transition cursor-pointer flex flex-col items-center justify-center ${
                            settings.textSize === t.id
                              ? 'bg-[#033f53] text-white border-[#033f53] font-bold shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{t.label}</span>
                          <span className="text-[10px] opacity-80">{t.sub}</span>
                        </button>
                      ))}
                    </div>

                    {/* Live Preview Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2 text-center">
                      <p
                        className={`text-slate-800 transition-all ${
                          settings.textSize === 'large'
                            ? 'text-base font-medium'
                            : settings.textSize === 'xlarge'
                            ? 'text-lg font-semibold'
                            : settings.textSize === 'max'
                            ? 'text-xl font-bold'
                            : 'text-sm'
                        }`}
                      >
                        Sample Preview: Accessible Kenyan Legal Counsel
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Contrast Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Color & Contrast Modes
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateSetting('contrastMode', 'normal', 'Default colors restored')
                        }
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          settings.contrastMode === 'normal'
                            ? 'bg-[#033f53] text-white border-[#033f53] font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold">Standard</div>
                        <div className="text-[10px] opacity-80">Full Color</div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateSetting('contrastMode', 'high-contrast', 'High contrast dark mode enabled')
                        }
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          settings.contrastMode === 'high-contrast'
                            ? 'bg-[#033f53] text-white border-[#033f53] font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold">High Contrast</div>
                        <div className="text-[10px] opacity-80">WCAG AAA (7:1)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateSetting('contrastMode', 'grayscale', 'Monochrome grayscale enabled')
                        }
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          settings.contrastMode === 'grayscale'
                            ? 'bg-[#033f53] text-white border-[#033f53] font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold">Monochrome</div>
                        <div className="text-[10px] opacity-80">Colorblind aid</div>
                      </button>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Dyslexia Typography Toggle */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Dyslexia-Friendly Typography
                      </div>
                      <div className="text-xs text-slate-500">
                        Atkinson Hyperlegible font with weighted characters.
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
                          settings.dyslexicFont ? 'Dyslexia font disabled' : 'Dyslexia font enabled'
                        )
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        settings.dyslexicFont ? 'bg-[#033f53]' : 'bg-slate-200'
                      }`}
                      aria-label="Toggle dyslexia readable typography"
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          settings.dyslexicFont ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Reading Tools & Motion */}
              {activeTab === 'reading' && (
                <div className="space-y-4">
                  {/* Reading Guide Ruler */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Reading Guide (Focus Ruler)
                      </div>
                      <div className="text-xs text-slate-500">
                        A focused line highlight follows pointer to aid visual tracking.
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.readingGuide}
                      onClick={() =>
                        updateSetting(
                          'readingGuide',
                          !settings.readingGuide,
                          settings.readingGuide ? 'Reading ruler disabled' : 'Reading ruler enabled'
                        )
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        settings.readingGuide ? 'bg-[#033f53]' : 'bg-slate-200'
                      }`}
                      aria-label="Toggle reading guide ruler"
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          settings.readingGuide ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Big Cursor */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Big High-Visibility Cursor
                      </div>
                      <div className="text-xs text-slate-500">
                        Enlarges mouse pointer with high-contrast border.
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.bigCursor}
                      onClick={() =>
                        updateSetting(
                          'bigCursor',
                          !settings.bigCursor,
                          settings.bigCursor ? 'Big cursor disabled' : 'Big cursor enabled'
                        )
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        settings.bigCursor ? 'bg-[#033f53]' : 'bg-slate-200'
                      }`}
                      aria-label="Toggle big cursor"
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          settings.bigCursor ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Underline Links */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Highlight & Underline Links
                      </div>
                      <div className="text-xs text-slate-500">
                        Draws solid underlines on all interactive hyperlinks.
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
                          settings.underlineLinks ? 'Underline links disabled' : 'Underline links enabled'
                        )
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        settings.underlineLinks ? 'bg-[#033f53]' : 'bg-slate-200'
                      }`}
                      aria-label="Toggle underline links"
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          settings.underlineLinks ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Highlight Headings */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Highlight Section Headings
                      </div>
                      <div className="text-xs text-slate-500">
                        Adds high-contrast left accents to titles for cognitive scanning.
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.highlightHeadings}
                      onClick={() =>
                        updateSetting(
                          'highlightHeadings',
                          !settings.highlightHeadings,
                          settings.highlightHeadings
                            ? 'Headings highlight disabled'
                            : 'Headings highlight enabled'
                        )
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        settings.highlightHeadings ? 'bg-[#033f53]' : 'bg-slate-200'
                      }`}
                      aria-label="Toggle highlight section headings"
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          settings.highlightHeadings ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Stop Motion & Animations
                      </div>
                      <div className="text-xs text-slate-500">
                        Eliminates parallax, transitions, and automatic motion.
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
                          settings.reduceMotion ? 'Reduced motion disabled' : 'Reduced motion enabled'
                        )
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        settings.reduceMotion ? 'bg-[#033f53]' : 'bg-slate-200'
                      }`}
                      aria-label="Toggle stop motion and animations"
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          settings.reduceMotion ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleReset}
                disabled={activeCount === 0}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg px-2 py-1"
                aria-label="Reset all accessibility settings to standard defaults"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  triggerRef.current?.focus();
                  announce('Accessibility tools closed. Preferences saved.');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#033f53] hover:bg-[#022b3a] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Done & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityWidget;
