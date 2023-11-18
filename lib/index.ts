import { ResplitRoot } from './Root';
import { ResplitPane } from './Pane';
import { ResplitSplitter } from './Splitter';

export const Resplit = {
  Root: ResplitRoot,
  Pane: ResplitPane,
  Splitter: ResplitSplitter,
};

export { ResplitRoot } from './Root';
export { ResplitPane } from './Pane';
export { ResplitSplitter } from './Splitter';
export { useResplitContext } from './ResplitContext';

export * from './types';
export type { ResplitRootProps } from './Root';
export type { ResplitPaneProps } from './Pane';
export type { ResplitSplitterProps } from './Splitter';
