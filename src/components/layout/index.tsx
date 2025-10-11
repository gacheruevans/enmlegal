import React, { useEffect, useRef, useState } from "react";
import Footer from "../../components/footer";
import { About, Blog, Hero, Services } from "../../pages";
import { Breadcrumb } from "../breadcrumb";
import ScrollToTopButton from "../scrolltotop";
import { LayoutProvider } from "./LayoutContext";
import { ScrollProgressBar } from "./ScrollProgressBar";


export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [manualSelected, setManualSelected] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sectionIds = ["home", "about", "services", "blog"]; // align with nav (renamed hero->home)
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
          // If user is scrolling (not a manual click) and the newly active section differs from manualSelected, clear manualSelected so highlight follows scroll.
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
  }, [manualSelected, activeSection]);

  // Sync hash when active section changes (avoid jump by using history API)
  useEffect(() => {
    if (activeSection) {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash !== activeSection) {
        history.replaceState(null, '', `#${activeSection}`);
      }
    }
  }, [activeSection]);

  const handleScrollToTop = () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    // Reset manual selection so observer drives highlight.
    setManualSelected(null);
  };
  // activeSection state is currently not rendered; expose via context or props if nav highlighting is needed.
  return (
    <LayoutProvider value={{ activeSection, manualSelected, setManualSelected }}>
      <div className="layout">
        <div className="content">
          <ScrollProgressBar />
          <Breadcrumb />
          <Hero />
          <About />
          <Services />
          <Blog />
          <Footer />
          <div>{children}</div>
          <ScrollToTopButton show={showScrollTop} onClick={handleScrollToTop} />
          {/* <ChatBot /> */}
        </div>
      </div>
    </LayoutProvider>
  );
};
