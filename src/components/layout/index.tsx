import React, { useState, useEffect } from "react";
import { Hero, About, Services, Blog } from "../../pages";
import Footer from "../../components/footer";
import ScrollToTopButton from "../scrolltotop";
import ChatBot from "../chat";


export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const [activeSection, setActiveSection] = useState<string>("");
  useEffect(() => {
    const sectionIds = ["hero", "about", "services", "blog", "practice Areas"];
    const handleScroll = () => {
      let currentSection = "";
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        let sectionId = id;
        if (id === "practice Areas" && section) {
          sectionId = "services";
        }
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 80 && rect.bottom >= 80) {
            currentSection = sectionId;
          }
        }
      }
      setActiveSection(currentSection);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const sectionIds = ["hero", "about", "services", "blog"];
    const handleScroll = () => {
      let currentSection = "";
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 80 && rect.bottom >= 80) {
            currentSection = id;
          }
        }
      }
      setActiveSection(currentSection);
      setShowScrollTop(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="layout">
      <div className="content">
        <Hero />
        <About />
        <Services />
        <Blog />
        <Footer />
        <div>{children}</div>
        <ScrollToTopButton show={showScrollTop} onClick={handleScrollToTop} />
        <ChatBot />
      </div>
    </div>
  );
};
