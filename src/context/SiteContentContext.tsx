import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export interface PracticeAreaCard {
  id?: string;
  title: string;
  subtitle?: string;
  subtext?: string;
  icon?: string;
  imageUrl?: string;
}

export interface SectionContent {
  section: string;
  title: string;
  subtitle: string;
  subtext?: string;
  cards?: PracticeAreaCard[];
  status?: 'PUBLISHED' | 'DRAFT';
  draftData?: any;
  hasDraft?: boolean;
  updatedAt?: string;
}

export interface SiteContentMap {
  home: SectionContent;
  about: SectionContent;
  services: SectionContent;
  blog: SectionContent;
  contact: SectionContent;
}

export const DEFAULT_SITE_CONTENT: SiteContentMap = {
  home: {
    section: 'home',
    title: 'A Personal Legal Practice You Can Trust- In Kenya and from Abroad!',
    subtitle: 'Providing high-quality legal services with a focus on exceptional client care.',
    status: 'PUBLISHED',
  },
  about: {
    section: 'about',
    title: 'Who we are',
    subtitle:
      'E. Nduta Munene & Company Advocates is a boutique law firm specializing in delivering tailored legal solutions with a personal touch.',
    subtext:
      'Led by Eva Nduta Munene, an accomplished Advocate of the High Court of Kenya with over 14 years of dedicated legal practice, the firm is committed to providing personalized, reliable, and strategic legal solutions to individuals, businesses, and institutions across Kenya and beyond.',
    status: 'PUBLISHED',
  },
  services: {
    section: 'services',
    title: 'Our Practice Areas',
    subtitle: 'We offer legal services across key areas of law tailored to your needs.',
    subtext:
      'Comprehensive legal representation across corporate, property, family, and dispute resolution domains.',
    status: 'PUBLISHED',
    cards: [
      {
        id: '1',
        title: 'Real Estate & Conveyancing Law',
        subtitle: 'Property & Land Transactions',
        subtext: 'Seamless transactions, from property acquisition to sale.',
        icon: 'HomeModernIcon',
      },
      {
        id: '2',
        title: 'Commercial & Corporate Law',
        subtitle: 'Corporate Governance & Contracts',
        subtext: 'Structuring, compliance, and business advisory.',
        icon: 'ScaleIcon',
      },
      {
        id: '3',
        title: 'Family Law – Divorce & Child Custody',
        subtitle: 'Domestic Relations & Custody',
        subtext: 'Compassionate, strategic representation for sensitive matters.',
        icon: 'UserGroupIcon',
      },
      {
        id: '4',
        title: 'Legal Audit & Compliance',
        subtitle: 'Regulatory Risk Mitigation',
        subtext: 'Ensuring regulatory alignment and risk mitigation.',
        icon: 'CheckBadgeIcon',
      },
      {
        id: '5',
        title: 'Probate Administration',
        subtitle: 'Estate Administration & Succession',
        subtext: 'Expert guidance through estate administration and succession.',
        icon: 'BuildingLibraryIcon',
      },
      {
        id: '6',
        title: 'Family-Owned Business & Estate Planning Advisory',
        subtitle: 'Wealth & Succession Advisory',
        subtext: 'Safeguarding legacy and planning for generational transitions.',
        icon: 'BriefcaseIcon',
      },
      {
        id: '7',
        title: 'Start-Ups & SMEs',
        subtitle: 'Venture Formation & Scaling',
        subtext: 'Supporting entrepreneurs from formation to scale.',
        icon: 'PresentationChartBarIcon',
      },
      {
        id: '8',
        title: 'Dispute Resolution',
        subtitle: 'Mediation, Arbitration & Court',
        subtext: 'Effective advocacy through negotiation, mediation, and litigation.',
        icon: 'CubeTransparentIcon',
      },
      {
        id: '9',
        title: 'Banking Securities',
        subtitle: 'Financial Transactions & Collateral',
        subtext: 'Structuring and securing financial transactions.',
        icon: 'BanknotesIcon',
      },
    ],
  },
  blog: {
    section: 'blog',
    title: 'From the Blog',
    subtitle:
      'Authoritative legal perspectives, regulatory updates, and commercial guides for Kenya and East Africa.',
    status: 'PUBLISHED',
  },
  contact: {
    section: 'contact',
    title: 'Office Address & Contacts',
    subtitle: 'Advocate Eva Nduta Munene',
    subtext:
      'Block B, 3rd Floor, Suite 3.2, KMA Center, Chyulu Road, Upper Hill, Nairobi, Kenya. P.O. Box 40964-00100. Phone: +254 701-857-030. Email: info@enmlegal.com',
    status: 'PUBLISHED',
  },
};

interface SiteContentContextType {
  content: SiteContentMap;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType>({
  content: DEFAULT_SITE_CONTENT,
  isLoading: false,
  refetch: async () => {},
});

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContentMap>(DEFAULT_SITE_CONTENT);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchContent = useCallback(async () => {
    try {
      const { data } = await api.get('/content');
      if (data && typeof data === 'object') {
        setContent((prev) => ({
          home: data.home ? data.home : prev.home,
          about: data.about ? data.about : prev.about,
          services: data.services ? data.services : prev.services,
          blog: data.blog ? data.blog : prev.blog,
          contact: data.contact ? data.contact : prev.contact,
        }));
      }
    } catch (err) {
      console.warn('Could not fetch remote site content, using defaults:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <SiteContentContext.Provider value={{ content, isLoading, refetch: fetchContent }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
