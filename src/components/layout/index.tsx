import React, { useEffect, useRef, useState } from "react";
import Footer from "../../components/footer";
import { About, Blog, Hero, Services } from "../../pages";
import { Breadcrumb } from "../breadcrumb";
import ScrollToTopButton from "../scrolltotop";
import { LayoutProvider } from "./LayoutContext";
import { ScrollProgressBar } from "./ScrollProgressBar";


import { SkipToContent } from "../common/SkipToContent";

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [manualSelected, setManualSelected] = useState<string | null>(null);
  const [hasBlogPosts, setHasBlogPosts] = useState<boolean>(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Map section IDs to clean browser paths (no hash)
  const sectionPathMap: Record<string, string> = {
    home: '/home',
    about: '/about',
    services: '/practice-areas',
    blog: '/blog',
    contacts: '/contacts',
  };

  // On initial mount or URL load, scroll to section matching clean pathname
  useEffect(() => {
    const pathToSection: Record<string, string> = {
      '/': 'home',
      '/home': 'home',
      '/about': 'about',
      '/practice-areas': 'services',
      '/services': 'services',
      '/blog': 'blog',
      '/contacts': 'contacts',
    };
    const targetSection = pathToSection[window.location.pathname];
    if (targetSection && targetSection !== 'home') {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 180);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const sectionIds = ["home", "about", "services", ...(hasBlogPosts ? ["blog"] : []), "contacts"];
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (observerRef.current) {
      sections.forEach(el => observerRef.current?.unobserve(el));
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Determine which entry is most visible
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) {
          const id = visible[0].target.id;
          setActiveSection(id);
          // If user is scrolling and the newly active section differs from manualSelected, clear manualSelected so highlight follows scroll.
          if (manualSelected && manualSelected !== id && window.scrollY > 20) {
            setManualSelected(null);
          }
        }
        // Show scroll-to-top only when not near top and not currently on home fully visible.
        setShowScrollTop(window.scrollY > 120 && activeSection !== 'home');
      },
      {
        root: null,
        threshold: [0.25, 0.5, 0.75], // react to multiple visibility levels
      }
    );
    sections.forEach(el => observerRef.current?.observe(el));

    const onScroll = () => {
      // When scrolled back near top, hide button.
      if (window.scrollY < 80 && activeSection === 'home') {
        setShowScrollTop(false);
        // Clear manualSelected when returning to home so automatic highlight resumes.
        if (manualSelected && manualSelected !== 'home') {
          setManualSelected(null);
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      sections.forEach(el => observerRef.current?.unobserve(el));
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [manualSelected, activeSection, hasBlogPosts]);

  // Sync clean pathname when active section changes (NO `#` hash in URL)
  useEffect(() => {
    if (activeSection) {
      const targetPath = sectionPathMap[activeSection];
      if (targetPath && window.location.pathname !== targetPath && !manualSelected) {
        window.history.replaceState(null, '', targetPath);
      }

      // Sync descriptive page title for SEO and user experience
      const titlesBySection: Record<string, string> = {
        home: "ENM Legal Advocates | Leading Law Firm in Upper Hill, Nairobi, Kenya",
        about: "About the Firm & Advocate Eva Nduta Munene | ENM Legal Advocates",
        services: "Practice Areas & Legal Services | ENM Legal Advocates Nairobi",
        blog: "Legal Insights & Analysis | ENM Legal Advocates",
        contacts: "Contact Our Legal Team & Consultations | ENM Legal Advocates Upper Hill",
      };
      if (titlesBySection[activeSection]) {
        document.title = titlesBySection[activeSection];
      }
    }
  }, [activeSection, manualSelected]);

  const handleScrollToTop = () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    window.history.replaceState(null, '', '/home');
    setManualSelected(null);
  };

  return (
    <LayoutProvider value={{ activeSection, manualSelected, setManualSelected, hasBlogPosts, setHasBlogPosts }}>
      <div className="layout">
        <SkipToContent contentId="main-content" />
        <div className="content">
          <ScrollProgressBar />
          <Breadcrumb />
          <main id="main-content" role="main" tabIndex={-1} className="focus:outline-none">
            <Hero />
            <About />
            <Services />
            {hasBlogPosts && <Blog />}
            <div>{children}</div>
          </main>
          <Footer />
          <ScrollToTopButton show={showScrollTop} onClick={handleScrollToTop} />
          {/* <ChatBot /> */}
        </div>
      </div>
    </LayoutProvider>
  );
};
