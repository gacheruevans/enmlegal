import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../../lib/api';
import { useSiteContent } from '../../../context/SiteContentContext';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  ScaleIcon,
  BriefcaseIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
  HomeModernIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  BuildingLibraryIcon,
  PresentationChartBarIcon,
  CubeTransparentIcon,
  BanknotesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

type SectionKey = 'home' | 'about' | 'services' | 'blog' | 'contact';

interface PracticeAreaCard {
  id?: string;
  title: string;
  subtitle?: string;
  subtext?: string;
  icon?: string;
  imageUrl?: string;
}

interface SectionData {
  section: string;
  title: string;
  subtitle: string;
  subtext?: string;
  cards?: PracticeAreaCard[];
  addressDetails?: string;
  status: 'PUBLISHED' | 'DRAFT';
  draftData?: any;
  hasDraft?: boolean;
  updatedAt?: string;
}

const AVAILABLE_ICONS = [
  { name: 'ScaleIcon', label: 'Scales of Justice', icon: ScaleIcon },
  { name: 'HomeModernIcon', label: 'Real Estate / Property', icon: HomeModernIcon },
  { name: 'BriefcaseIcon', label: 'Commercial / Advisory', icon: BriefcaseIcon },
  { name: 'BuildingLibraryIcon', label: 'Probate / Court', icon: BuildingLibraryIcon },
  { name: 'BanknotesIcon', label: 'Banking / Finance', icon: BanknotesIcon },
  { name: 'UserGroupIcon', label: 'Family / Custody', icon: UserGroupIcon },
  { name: 'CheckBadgeIcon', label: 'Audit / Compliance', icon: CheckBadgeIcon },
  { name: 'PresentationChartBarIcon', label: 'Startups / SMEs', icon: PresentationChartBarIcon },
  { name: 'CubeTransparentIcon', label: 'Dispute Resolution', icon: CubeTransparentIcon },
  { name: 'ShieldCheckIcon', label: 'Security / Protection', icon: ShieldCheckIcon },
  { name: 'DocumentTextIcon', label: 'Contracts / Legal', icon: DocumentTextIcon },
];

const DEFAULT_TEMPLATES: Record<SectionKey, any> = {
  home: {
    title: 'A Personal Legal Practice You Can Trust- In Kenya and from Abroad!',
    subtitle: 'Providing high-quality legal services with a focus on exceptional client care.',
  },
  about: {
    title: 'Who we are',
    subtitle: 'E. Nduta Munene & Company Advocates is a boutique law firm specializing in delivering tailored legal solutions with a personal touch.',
    subtext: 'Led by Eva Nduta Munene, an accomplished Advocate of the High Court of Kenya with over 14 years of dedicated legal practice, the firm is committed to providing personalized, reliable, and strategic legal solutions to individuals, businesses, and institutions across Kenya and beyond.',
  },
  services: {
    title: 'Our Practice Areas',
    subtitle: 'We offer legal services across key areas of law tailored to your needs.',
    subtext: 'Comprehensive legal representation across corporate, property, family, and dispute resolution domains.',
    cards: [
      { id: '1', title: 'Real Estate & Conveyancing Law', subtitle: 'Property & Land Transactions', subtext: 'Seamless transactions, from property acquisition to sale.', icon: 'HomeModernIcon' },
      { id: '2', title: 'Commercial & Corporate Law', subtitle: 'Corporate Governance & Contracts', subtext: 'Structuring, compliance, and business advisory.', icon: 'ScaleIcon' },
      { id: '3', title: 'Family Law – Divorce & Child Custody', subtitle: 'Domestic Relations & Custody', subtext: 'Compassionate, strategic representation for sensitive matters.', icon: 'UserGroupIcon' },
      { id: '4', title: 'Legal Audit & Compliance', subtitle: 'Regulatory Risk Mitigation', subtext: 'Ensuring regulatory alignment and risk mitigation.', icon: 'CheckBadgeIcon' },
      { id: '5', title: 'Probate Administration', subtitle: 'Estate Administration & Succession', subtext: 'Expert guidance through estate administration and succession.', icon: 'BuildingLibraryIcon' },
      { id: '6', title: 'Family-Owned Business & Estate Planning Advisory', subtitle: 'Wealth & Succession Advisory', subtext: 'Safeguarding legacy and planning for generational transitions.', icon: 'BriefcaseIcon' },
      { id: '7', title: 'Start-Ups & SMEs', subtitle: 'Venture Formation & Scaling', subtext: 'Supporting entrepreneurs from formation to scale.', icon: 'PresentationChartBarIcon' },
      { id: '8', title: 'Dispute Resolution', subtitle: 'Mediation, Arbitration & Court', subtext: 'Effective advocacy through negotiation, mediation, and litigation.', icon: 'CubeTransparentIcon' },
      { id: '9', title: 'Banking Securities', subtitle: 'Financial Transactions & Collateral', subtext: 'Structuring and securing financial transactions.', icon: 'BanknotesIcon' },
    ],
  },
  blog: {
    title: 'From the Blog',
    subtitle: 'Authoritative legal perspectives, regulatory updates, and commercial guides for Kenya and East Africa.',
  },
  contact: {
    title: 'Office Address & Contacts',
    subtitle: 'Advocate Eva Nduta Munene',
    subtext: 'Advocate Eva Nduta Munene\nBlock B, 3rd Floor, Suite 3.2\nKMA Center, Chyulu Road\nUpper Hill, Nairobi, Kenya\nP.O. Box 40964-00100\n\nPhone: +254 701-857-030\nEmail: info@enmlegal.com',
  },
};

export const ContentManagement: React.FC<{ isSuperAdmin: boolean }> = ({ isSuperAdmin }) => {
  const { refetch: refetchPublicContent } = useSiteContent();
  const [searchParams, setSearchParams] = useSearchParams();

  const validSections: SectionKey[] = ['home', 'about', 'services', 'blog', 'contact'];
  const rawSection = searchParams.get('section') as SectionKey | null;
  const activeSection: SectionKey = rawSection && validSections.includes(rawSection) ? rawSection : 'home';

  useEffect(() => {
    if (searchParams.get('tab') === 'content' && !searchParams.get('section')) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('section', 'home');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [sectionsData, setSectionsData] = useState<Record<string, SectionData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active section form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formSubtext, setFormSubtext] = useState('');
  const [formCards, setFormCards] = useState<PracticeAreaCard[]>([]);

  // Editing specific card modal state
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [cardTitle, setCardTitle] = useState('');
  const [cardSubtitle, setCardSubtitle] = useState('');
  const [cardSubtext, setCardSubtext] = useState('');
  const [cardIcon, setCardIcon] = useState('ScaleIcon');
  const [cardImageUrl, setCardImageUrl] = useState('');

  // Live preview toggle
  const [showPreview, setShowPreview] = useState(true);

  // Fetch admin content view (includes draft status)
  const fetchAdminContent = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/content');
      if (data && typeof data === 'object') {
        setSectionsData(data);
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load content settings.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminContent();
  }, [fetchAdminContent]);

  // When active section changes, load its working form values
  useEffect(() => {
    const sec = sectionsData[activeSection];
    const def = DEFAULT_TEMPLATES[activeSection];

    // Priority: draftData -> published DB data -> default template
    const workingData = sec?.draftData || sec || def;

    setFormTitle(workingData?.title ?? def.title ?? '');
    setFormSubtitle(workingData?.subtitle ?? def.subtitle ?? '');
    setFormSubtext(workingData?.subtext ?? def.subtext ?? '');
    setFormCards(
      workingData?.cards && Array.isArray(workingData.cards)
        ? workingData.cards
        : def.cards || []
    );
  }, [activeSection, sectionsData]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Handle Save (Draft vs Publish)
  const handleSave = async (action: 'SAVE_DRAFT' | 'PUBLISH') => {
    if (!isSuperAdmin) {
      alert('Security Notice: Only Super Administrators have permission to modify public website content.');
      return;
    }

    setSaving(true);
    setNotification(null);

    const payload: any = {
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      action,
    };

    if (activeSection === 'about' || activeSection === 'services' || activeSection === 'contact') {
      payload.subtext = formSubtext.trim();
    }

    if (activeSection === 'services') {
      payload.cards = formCards;
    }

    try {
      const { data } = await api.put(`/admin/content/${activeSection}`, payload);
      setNotification({
        type: 'success',
        message:
          action === 'PUBLISH'
            ? `Changes for "${activeSection.toUpperCase()}" published live!`
            : `Draft for "${activeSection.toUpperCase()}" saved. Public site remains on published version.`,
      });

      // Refresh admin data and live context
      await fetchAdminContent();
      if (action === 'PUBLISH') {
        await refetchPublicContent();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update section content.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Revert / Discard Draft
  const handleDiscardDraft = async () => {
    if (!window.confirm(`Discard working draft for ${activeSection.toUpperCase()} and revert to the published live version?`)) {
      return;
    }

    setSaving(true);
    try {
      await api.post(`/admin/content/${activeSection}/revert`);
      setNotification({
        type: 'success',
        message: `Draft discarded. Reverted to published version for "${activeSection.toUpperCase()}".`,
      });
      await fetchAdminContent();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to discard draft.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset to default template
  const handleResetToDefault = () => {
    if (!window.confirm(`Reset form fields for ${activeSection.toUpperCase()} to the standard firm template? You will still need to click "Save as Draft" or "Publish Live" to commit.`)) {
      return;
    }

    const def = DEFAULT_TEMPLATES[activeSection];
    setFormTitle(def.title || '');
    setFormSubtitle(def.subtitle || '');
    setFormSubtext(def.subtext || '');
    if (def.cards) setFormCards(def.cards);
  };

  // Card management helpers
  const handleOpenAddCard = () => {
    setEditingCardIndex(-1);
    setCardTitle('');
    setCardSubtitle('');
    setCardSubtext('');
    setCardIcon('ScaleIcon');
    setCardImageUrl('');
  };

  const handleOpenEditCard = (index: number) => {
    const c = formCards[index];
    if (!c) return;
    setEditingCardIndex(index);
    setCardTitle(c.title || '');
    setCardSubtitle(c.subtitle || '');
    setCardSubtext(c.subtext || '');
    setCardIcon(c.icon || 'ScaleIcon');
    setCardImageUrl(c.imageUrl || '');
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;

    const newCard: PracticeAreaCard = {
      id: editingCardIndex !== null && editingCardIndex >= 0 ? formCards[editingCardIndex]?.id : String(Date.now()),
      title: cardTitle.trim(),
      subtitle: cardSubtitle.trim() || undefined,
      subtext: cardSubtext.trim() || undefined,
      icon: cardIcon || 'ScaleIcon',
      imageUrl: cardImageUrl.trim() || undefined,
    };

    if (editingCardIndex === -1) {
      setFormCards((prev) => [...prev, newCard]);
    } else if (editingCardIndex !== null && editingCardIndex >= 0) {
      setFormCards((prev) => {
        const copy = [...prev];
        copy[editingCardIndex] = newCard;
        return copy;
      });
    }

    setEditingCardIndex(null);
  };

  const handleDeleteCard = (index: number) => {
    if (!window.confirm('Are you sure you want to remove this practice area card?')) return;
    setFormCards((prev) => prev.filter((_, i) => i !== index));
  };

  const currentSec = sectionsData[activeSection];
  const isDraftStatus = currentSec?.status === 'DRAFT' || currentSec?.hasDraft;

  return (
    <div className="space-y-6">
      {/* CMS Header & Breadcrumb */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal/10 text-royal text-xs font-bold uppercase tracking-wider mb-2">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Super Admin Content Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Website Content & Copy Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Update headings, descriptions, service cards, and firm address details. Staged drafts remain isolated until you explicitly publish changes live to public visitors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              showPreview
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <EyeIcon className="w-4 h-4" />
            <span>{showPreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-royal/10 text-royal hover:bg-royal/20 transition"
          >
            <span>Visit Site</span>
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Global Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between border animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}



      {/* Main Content Grid: Form Editor (Left) & Real-time Live Preview (Right) */}
      <div className={`grid grid-cols-1 ${showPreview ? 'lg:grid-cols-12' : ''} gap-6`}>
        {/* Editor Form Column */}
        <div className={`${showPreview ? 'lg:col-span-7' : 'w-full'} space-y-6`}>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
            {/* Section Status & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {activeSection === 'home'
                      ? 'Home Hero'
                      : activeSection === 'about'
                      ? 'About Us'
                      : activeSection === 'services'
                      ? 'Practice Areas'
                      : activeSection === 'blog'
                      ? 'Blog Header'
                      : activeSection === 'contact'
                      ? 'Contact & Footer'
                      : `${activeSection} Section`}
                  </h3>
                  {isDraftStatus ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <ClockIcon className="w-3.5 h-3.5" />
                      <span>Draft Staged</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>Live / Published</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isDraftStatus
                    ? 'Working draft exists. Public visitors see the last published live version.'
                    : 'Currently published and displayed on the live public website.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {isDraftStatus && (
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer disabled:opacity-50"
                    title="Discard working draft"
                  >
                    <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                    <span>Discard Draft</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  disabled={saving}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  title="Load standard firm template"
                >
                  Reset Template
                </button>

                <button
                  type="button"
                  onClick={() => handleSave('SAVE_DRAFT')}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-300 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {saving ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <PencilSquareIcon className="w-3.5 h-3.5" />}
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave('PUBLISH')}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-royal hover:bg-royal/90 transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {saving ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                  <span>Publish Live</span>
                </button>
              </div>
            </div>

            {/* Inputs based on section */}
            <div className="space-y-4">
              {/* Title Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Section Heading / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Our Practice Areas"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal/20"
                />
              </div>

              {/* Subtitle / Subtext Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subtitle / Tagline *
                </label>
                <input
                  type="text"
                  required
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. Providing high-quality legal services with exceptional client care."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal/20"
                />
              </div>

              {/* Subtext / Paragraph Field (About, Services, Contact) */}
              {(activeSection === 'about' || activeSection === 'services' || activeSection === 'contact') && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {activeSection === 'contact' ? 'Office Address Details (Multi-line) *' : 'Body Paragraph / Detailed Description'}
                  </label>
                  <textarea
                    rows={activeSection === 'contact' ? 7 : 5}
                    value={formSubtext}
                    onChange={(e) => setFormSubtext(e.target.value)}
                    placeholder={
                      activeSection === 'contact'
                        ? 'Advocate Eva Nduta Munene\nBlock B, 3rd Floor, Suite 3.2\nKMA Center, Chyulu Road\nUpper Hill, Nairobi, Kenya\n\nPhone: +254 701-857-030\nEmail: info@enmlegal.com'
                        : 'Provide rich paragraph text explaining the firm, practice philosophy, or mission...'
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal/20 font-sans"
                  />
                  {activeSection === 'contact' && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tip: Enter full line breaks as you want them to display on the public website footer.
                    </p>
                  )}
                </div>
              )}

              {/* Special Practice Areas Cards Section */}
              {activeSection === 'services' && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Practice Area Cards ({formCards.length})
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Each card features a title, subtitle, descriptive summary, and icon/image.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddCard}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-royal text-white font-bold text-xs hover:bg-royal/90 transition cursor-pointer shadow-xs"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Add Card</span>
                    </button>
                  </div>

                  {/* Cards Grid / List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                    {formCards.map((card, idx) => {
                      const IconComp = AVAILABLE_ICONS.find((i) => i.name === card.icon)?.icon || ScaleIcon;
                      return (
                        <div
                          key={card.id || idx}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 group hover:border-royal/40 transition"
                        >
                          <div className="flex items-start gap-2.5 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-royal/10 text-royal flex items-center justify-center shrink-0 border border-royal/20">
                              {card.imageUrl ? (
                                <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                <IconComp className="w-5 h-5" />
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <h5 className="font-bold text-xs text-slate-900 truncate">{card.title}</h5>
                              {card.subtitle && (
                                <p className="text-[10px] text-royal font-semibold truncate">{card.subtitle}</p>
                              )}
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{card.subtext}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCard(idx)}
                              className="p-1 rounded-lg text-slate-400 hover:text-royal hover:bg-white transition cursor-pointer"
                              title="Edit Card"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCard(idx)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition cursor-pointer"
                              title="Delete Card"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview Column (Right) */}
        {showPreview && (
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6">
              <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
                {/* Preview Badge */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                      Live Visual Preview
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 capitalize">
                    {activeSection} section mockup
                  </span>
                </div>

                {/* Section Specific Visual Mockups */}
                {activeSection === 'home' && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-royal/20 border border-slate-800 text-center space-y-4 relative overflow-hidden">
                    <div className="inline-block px-3 py-1 rounded-full bg-royal/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                      Executive Counsel Portal
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                      {formTitle || 'Home Page Title'}
                    </h3>
                    <p className="text-xs text-royal font-medium max-w-sm mx-auto">
                      {formSubtitle || 'Home page subtitle text will display here.'}
                    </p>
                    <div className="pt-2">
                      <span className="inline-block px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs shadow-md">
                        Book a Consultation
                      </span>
                    </div>
                  </div>
                )}

                {activeSection === 'about' && (
                  <div className="p-5 rounded-2xl bg-white text-slate-900 space-y-3">
                    <span className="text-royal font-bold text-xs uppercase tracking-wider block">
                      Who We Are
                    </span>
                    <h3 className="text-xl font-bold font-serif text-slate-900">
                      {formTitle || 'About Us Title'}
                    </h3>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {formSubtitle || 'About us primary summary.'}
                    </p>
                    {formSubtext && (
                      <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                        {formSubtext}
                      </p>
                    )}
                  </div>
                )}

                {activeSection === 'services' && (
                  <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white space-y-4">
                    <div className="text-center space-y-1">
                      <h3 className="text-lg font-bold text-white">{formTitle || 'Our Practice Areas'}</h3>
                      <p className="text-xs text-amber-300">{formSubtitle || 'Practice areas subtitle.'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {formCards.slice(0, 6).map((c, i) => {
                        const IconComp = AVAILABLE_ICONS.find((icon) => icon.name === c.icon)?.icon || ScaleIcon;
                        return (
                          <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left">
                            <IconComp className="w-4 h-4 text-amber-400 mb-1" />
                            <div className="text-xs font-bold text-white truncate">{c.title}</div>
                            <div className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">{c.subtext}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeSection === 'blog' && (
                  <div className="p-6 rounded-2xl bg-white text-slate-900 space-y-2">
                    <span className="text-[10px] font-bold text-royal uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                      Insights & Legal Analysis
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">{formTitle || 'From the Blog'}</h3>
                    <p className="text-xs text-slate-600">{formSubtitle || 'Blog description and guide updates.'}</p>
                  </div>
                )}

                {activeSection === 'contact' && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {formTitle || 'Office Address'}
                    </h4>
                    <p className="text-xs font-semibold text-white">{formSubtitle}</p>
                    <div className="whitespace-pre-line text-xs text-slate-300 font-light leading-relaxed border-t border-slate-800/80 pt-2">
                      {formSubtext || 'Address lines will appear formatted here.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PRACTICE AREA CARD EDIT/ADD MODAL
          ───────────────────────────────────────────────────────────── */}
      {editingCardIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setEditingCardIndex(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-royal/10 text-royal flex items-center justify-center shrink-0">
                <BriefcaseIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCardIndex === -1 ? 'Add Practice Area Card' : 'Edit Practice Area Card'}
                </h3>
                <p className="text-xs text-slate-500">Configure title, category, description, and icon</p>
              </div>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Card Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial & Corporate Law"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Subtitle / Specialty Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Structuring & Compliance"
                  value={cardSubtitle}
                  onChange={(e) => setCardSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Card Description / Subtext
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Structuring, compliance, and corporate business advisory."
                  value={cardSubtext}
                  onChange={(e) => setCardSubtext(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 font-sans"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Card Icon
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                  {AVAILABLE_ICONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = cardIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setCardIcon(item.name)}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition cursor-pointer border ${
                          isSelected
                            ? 'bg-royal text-white border-royal shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
                        }`}
                        title={item.label}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[9px] truncate w-full">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Custom Icon / Image URL <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/icon.png"
                  value={cardImageUrl}
                  onChange={(e) => setCardImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCardIndex(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-royal hover:bg-royal/90 rounded-xl transition cursor-pointer shadow-sm"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
