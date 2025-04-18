import { HelmetContext, HelmetContextType } from '../context/HelmetContext';

import { useContext } from 'react';

export const useHelmet = (): HelmetContextType => {
  const context = useContext(HelmetContext);
  if (!context) {
    throw new Error('useHead must be used within a HelmetProvider');
  }
  return context;
};