import React from 'react';

interface SkipToContentProps {
  contentId?: string;
  label?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({
  contentId = 'main-content',
  label = 'Skip to main content',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(contentId);
    if (target) {
      target.setAttribute('tabIndex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${contentId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-5 focus:py-3 focus:bg-amber-400 focus:text-slate-950 focus:font-extrabold focus:text-sm focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/70 transition-all cursor-pointer"
    >
      {label}
    </a>
  );
};

export default SkipToContent;
