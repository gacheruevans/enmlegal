import React, { createContext, useContext } from 'react';

export interface LayoutContextValue {
  activeSection: string;
  manualSelected: string | null;
  setManualSelected: (val: string | null) => void;
  hasBlogPosts: boolean;
  setHasBlogPosts: (val: boolean) => void;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export const LayoutProvider: React.FC<React.PropsWithChildren<{ value: LayoutContextValue }>> = ({ value, children }) => {
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export const useLayoutContext = (): LayoutContextValue => {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    return {
      activeSection: '',
      manualSelected: null,
      setManualSelected: () => {},
      hasBlogPosts: true,
      setHasBlogPosts: () => {},
    };
  }
  return ctx;
};
