import { createContext, useContext } from 'react';

import type { Direction } from './types';
import type { ResplitPaneOptions } from './Pane';
import type { ResplitSplitterOptions } from './Splitter';

export const RootContext = createContext<
  | {
      id: string;
      direction: Direction;
      registerPane: (order: string, options: ResplitPaneOptions) => void;
      registerSplitter: (order: string, options: ResplitSplitterOptions) => void;
      handleSplitterMouseDown: (order: number) => () => void;
      handleSplitterKeyDown: (
        splitterOrder: number,
      ) => (e: React.KeyboardEvent<HTMLDivElement>) => void;
    }
  | undefined
>(undefined);

export const useRootContext = () => {
  const context = useContext(RootContext);

  if (!context) {
    throw new Error('useRootContext must be used within an RootContext.Provider');
  }

  return context;
};
