import React from "react";

interface ScrollToTopButtonProps {
  show: boolean;
  onClick: () => void;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ show, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed z-50 p-3 text-white rounded-full shadow-lg bottom-1/2 right-8 bg-royal hover:bg-slate-900 transition-all duration-300 ease-out ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton;
