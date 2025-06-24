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
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-royal text-white shadow-lg hover:bg-greenroyal transition"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton;
