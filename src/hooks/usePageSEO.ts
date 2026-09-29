import { useEffect } from 'react';

interface PageSEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = 'ENM Legal Advocates | Leading Law Firm in Upper Hill, Nairobi, Kenya';
const DEFAULT_DESCRIPTION =
  'ENM Legal is a premier Kenyan law firm based in Upper Hill, Nairobi. Led by Advocate Eva Nduta Munene, we specialize in Commercial Law, Conveyancing & Real Estate, Banking & Financial Securities, Probate & Estate Administration, and Dispute Resolution.';
const BASE_URL = 'https://enmlegal.com';

/**
 * Custom React Hook for dynamically synchronizing document title,
 * meta description, canonical link, and crawler directives (e.g. noindex for auth/admin).
 */
export function usePageSEO({ title, description, canonicalPath, noindex = false }: PageSEOProps) {
  useEffect(() => {
    // 1. Sync Document Title
    const prevTitle = document.title;
    if (title) {
      document.title = title.includes('ENM Legal') ? title : `${title} | ENM Legal Advocates`;
    }

    // 2. Sync Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : null;
    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // 3. Shield Private Routes with robots noindex, nofollow
    let metaRobots = document.querySelector('meta[name="robots"]');
    const prevRobots = metaRobots ? metaRobots.getAttribute('content') : null;
    if (noindex) {
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', 'noindex, nofollow, noarchive');
    } else if (metaRobots) {
      metaRobots.setAttribute('content', 'index, follow, max-image-preview:large');
    }

    // 4. Update Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    const prevCanonical = linkCanonical ? linkCanonical.getAttribute('href') : null;
    if (canonicalPath) {
      const canonicalUrl = `${BASE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonicalUrl);
    }

    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc);
      if (metaRobots && prevRobots) metaRobots.setAttribute('content', prevRobots);
      if (linkCanonical && prevCanonical) linkCanonical.setAttribute('href', prevCanonical);
    };
  }, [title, description, canonicalPath, noindex]);
}
