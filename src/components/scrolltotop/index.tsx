import React from "react";

interface ScrollToTopButtonProps {
  show: boolean;
  onClick: () => void;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <button
      onClick={ onClick}
      className="fixed z-50 p-3 text-white transition rounded-full shadow-lg bottom-1/2 right-8 bg-royal hover:bg-slate-900"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton;
