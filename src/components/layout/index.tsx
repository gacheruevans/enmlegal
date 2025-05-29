import type { PropsWithChildren } from "react";
import { Hero } from "../../pages/home";
import { About } from "../../pages/about";
import { Services } from "../../pages/services";
import { Blog }  from "../../pages/blog";
import Footer from "../../components/footer";


export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="layout">
      <div className="content">
          <Hero />
          <About />
          <Services />
          <Blog />
          <Footer/>
        <div>{children}</div>
      </div>
    </div>
  );
};
