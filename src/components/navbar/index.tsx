import React, { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useLink } from '@refinedev/core'

const navigation = [
  { name: 'home', href: '/' },
  { name: 'about', href: '/about' },
  { name: 'practice Areas', href: '/practice-areas' },
  { name: 'blog', href: '/blog' },
  { name: 'contacts', href: '/contacts' },
];

export const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('home');
  const Link = useLink();
  const handleNavClick = (name: string) => {
    setActiveFilter(name);
  
    let sectionId = name;
    if (name === 'practice Areas') {
      sectionId = 'services';
    }
    // Check if an element with the given id exists and is a div
    const section = document.getElementById(sectionId);
    if (section && section.tagName.toLowerCase() === 'div') {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };
  
  const [showScrollTop, setShowScrollTop] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // Show button only if not on 'home' section and scrolled down
      const homeSection = document.getElementById('home');
      const homeRect = homeSection?.getBoundingClientRect();
      const isHomeVisible = homeRect && homeRect.top <= 100 && homeRect.bottom >= 100;
      setShowScrollTop(!isHomeVisible && window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    const homeSection = document.getElementById('home');
    if (homeSection) {
      homeSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">ENM Legal</span>
            <img
              alt="Company logo"
              src="https://github.com/gacheruevans/enmlegal/blob/main/dist/logo_white_text.png?raw=true"
              className="w-auto h-10 lg:h-40 md:h-32 sm:h-20"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
              <div className={`py-1 space-y-2 ${activeFilter === item.name ? 'border-b-2 border-royal' : ''}`} key={item.name}>
                  <Link 
                      key={item.name} 
                      to={item.href} 
                      className={`capitalize text-lg text-royal font-weight-200 hover:text-white ${activeFilter === item.name ? 'item-active, border, text-white' : 'no-underline'}`}
                      onClick={(e) => {
                          e.preventDefault();
                          setActiveFilter(item.name);
                          handleNavClick(item.name);
                      }}
                  >
                      {item.name}
                  </Link>
              </div>
          ))}
        </div>
        <div className="flex py-6">
          <a
            href="/login"
            className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-gray-50"
          >
            Login
          </a>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {/* Scroll to Top Button */}
          <button
            onClick={handleScrollToTop}
            className="fixed p-3 text-white transition rounded-full shadow-lg z-1 bottom-8 right-8 bg-royal hover:bg-greenroyal"
            aria-label="Scroll to top"
            style={{ display: showScrollTop ? 'block' : 'none' }}
          >
            ↑
          </button>
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full px-6 py-6 overflow-y-auto bg-white sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">ENM Legal</span>
              <img
                alt=""
                src="/enmlegal-logo.png"
                className="w-auto h-12"
              />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="flow-root mt-6">
            <div className="-my-6 divide-y divide-gray-500/10">
                {navigation.map((item) => (
                  <div className={`py-6 space-y-2 ${activeFilter === item.name ? 'border-b-2 border-white' : ''}`} key={item.name}>
                      <Link
                      key={item.name}
                      to={item.href}
                      onClick={(e) => {
                          e.preventDefault();
                          setActiveFilter(item.name);
                          handleNavClick(item.name);
                      }}
                      className={`block px-3 py-2 -mx-3 font-semibold text-gray-900 rounded-lg text-base/7 hover:bg-gray-50 ${activeFilter === item.name ? 'item-active, underline' : 'no-underline'}`}
                      >
                      {item.name}
                      </Link>
                  </div>
                ))}
              <div className="py-6">
                <a
                  href="/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
      </header>
  )
};
