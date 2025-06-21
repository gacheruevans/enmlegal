import React, { useState, useEffect } from "react";
import { Hero, About, Services, Blog } from "../../pages";
import Footer from "../../components/footer";
import ScrollToTopButton from "../scrolltotop";


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

  return (
    <div className="layout">
      <div className="content">
          <Hero />
          <About />
          <Services />
          <Blog />
          <Footer/>
        <div>{children}</div>
        <ScrollToTopButton show={showScrollTop} onClick={handleScrollToTop} />
      </div>
    </div>
  );
};
