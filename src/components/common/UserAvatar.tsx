import React, { useState, useEffect, useMemo } from 'react';

export const normalizeAvatarUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

// Deterministic aesthetic gradient palettes based on name
const GRADIENTS = [
  'from-amber-600 to-amber-800 text-amber-100',
  'from-blue-600 to-indigo-800 text-blue-100',
  'from-emerald-600 to-teal-800 text-emerald-100',
  'from-purple-600 to-violet-800 text-purple-100',
  'from-rose-600 to-pink-800 text-rose-100',
  'from-cyan-600 to-sky-800 text-cyan-100',
];

const getInitials = (name?: string | null): string => {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.trim().replace(/^(Advocate|Adv\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  indicator?: 'online' | 'offline' | null;
  alt?: string;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl font-bold',
};

const INDICATOR_SIZES = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  indicator,
  alt,
}) => {
  const [imgError, setImgError] = useState(false);
  const normalizedSrc = useMemo(() => normalizeAvatarUrl(src), [src]);

  // Reset error state if image src changes
  useEffect(() => {
    setImgError(false);
  }, [normalizedSrc]);

  const initials = useMemo(() => getInitials(name), [name]);
  const gradient = useMemo(() => {
    const idx = hashString(name || 'User') % GRADIENTS.length;
    return GRADIENTS[idx];
  }, [name]);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const indicatorSize = INDICATOR_SIZES[size] || INDICATOR_SIZES.md;

  const showImage = Boolean(normalizedSrc && !imgError);

  return (
    <div className={`relative inline-block shrink-0 ${sizeClass} ${className}`}>
      <div
        className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center select-none shadow-sm ring-1 ring-white/10 ${
          showImage ? 'bg-slate-800' : `bg-gradient-to-br ${gradient}`
        }`}
      >
        {showImage ? (
          <img
            src={normalizedSrc}
            alt={alt || name || 'User profile'}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <span className="font-semibold tracking-wider">{initials}</span>
        )}
      </div>

      {indicator && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-slate-900 ${indicatorSize} ${
            indicator === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
          title={indicator === 'online' ? 'Active now' : 'Offline'}
        />
      )}
    </div>
  );
};

export default UserAvatar;
