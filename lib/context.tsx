import { createContext, useContext } from 'react';
import { ResplitMethods, ResplitProviderProps } from './types';

const ResplitContext = createContext<ResplitMethods | undefined>(undefined);

export const ResplitProvider = ({ value, children }: ResplitProviderProps) => {
  return <ResplitContext.Provider value={value}>{children}</ResplitContext.Provider>;
};

export const useResplitContext = () => {
  const context = useContext(ResplitContext);

  if (!context) {
    throw new Error('useResplitContext must be used within a ResplitProvider');
  }

  return context;
};
