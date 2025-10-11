import React, { useEffect, useState } from 'react';

// A thin fixed bar at top displaying scroll progress as a percentage of total page height.
export const ScrollProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calc = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || window.pageYOffset;
      const height = doc.scrollHeight - doc.clientHeight;
      const pct = height > 0 ? (scrollTop / height) * 100 : 0;
      setProgress(pct);
    };
    calc();
    window.addEventListener('scroll', calc, { passive: true });
    window.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('scroll', calc);
      window.removeEventListener('resize', calc);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed top-0 left-0 z-50 w-full h-1 bg-neutral/20">
      <div
        className="h-full transition-all duration-150 ease-out bg-royal"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
