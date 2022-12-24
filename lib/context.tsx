import { createContext, useContext } from 'react';
import { ResplitMethods, ResplitProviderProps } from './types';

const ResplitContext = createContext<ResplitMethods | undefined>(undefined);

export const ResplitProvider = ({ children, ...methods }: ResplitProviderProps) => {
  return <ResplitContext.Provider value={methods}>{children}</ResplitContext.Provider>;
};

export const useResplitContext = () => {
  const context = useContext(ResplitContext);

  if (!context) {
    throw new Error('useResplitContext must be used within a ResplitProvider');
  }

  return context;
};
