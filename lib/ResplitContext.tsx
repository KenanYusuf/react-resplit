import { createContext, useContext } from 'react';

import type { FrValue } from './types';

export type ResplitContextValue = {
  /**
   * Specify the size of each pane as a fractional unit (fr).
   * The number of values should match the number of panes.
   *
   * @param paneSizes - An array of fractional unit (fr) values. {@link FrValue}
   *
   * @example ['0.25fr', '0.25fr', '0.5fr']
   */
  setPaneSizes: (paneSizes: FrValue[]) => void;
  /**
   * Get the min size state of a pane.
   *
   * @param order - The order of the pane. {@link Order}
   *
   * @returns A boolean indicating if the pane is at its min size or not.
   */
  isPaneMinSize: (order: number) => boolean;
  /**
   * Get the collapsed state of a pane.
   *
   * @param order - The order of the pane. {@link Order}
   *
   * @returns A boolean indicating if the pane is collapsed or not.
   */
  isPaneCollapsed: (order: number) => boolean;
};

export const ResplitContext = createContext<ResplitContextValue | undefined>(undefined);

/**
 * Get the value from ResplitContext, set in the ResplitRoot component.
 *
 * @returns The ResplitContext value. {@link ResplitContextValue}
 */
export const useResplitContext = () => {
  const context = useContext(ResplitContext);

  if (!context) {
    throw new Error('useResplitContext must be used within a ResplitRoot');
  }

  return context;
};
