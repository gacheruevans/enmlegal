import React, { createContext, useContext } from 'react';

export interface LayoutContextValue {
  activeSection: string;
  manualSelected: string | null;
  setManualSelected: (val: string | null) => void;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export const LayoutProvider: React.FC<React.PropsWithChildren<{ value: LayoutContextValue }>> = ({ value, children }) => {
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export const useLayoutContext = () => {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayoutContext must be used within LayoutProvider');
  return ctx;
};
