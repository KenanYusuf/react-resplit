import { CSSProperties, LegacyRef, ReactNode } from 'react';

export type Direction = 'horizontal' | 'vertical';

export interface PaneOptions {
  initialSize?: `${number}fr`;
  minSize?: `${number}fr`;
}

export interface ContainerProps {
  ref: LegacyRef<HTMLDivElement> | undefined;
  style: CSSProperties;
}

export interface GetContainerProps {
  (): ContainerProps;
}

export interface PaneProps {
  'data-resplit-order': number;
  'data-resplit-collapsed': boolean;
  id: string;
}

export interface GetPaneProps {
  (order: number, options?: PaneOptions): PaneProps;
}

export interface SplitterOptions {
  size?: `${number}px`;
}

export interface SplitterProps {
  role: 'separator';
  tabIndex: 0;
  'aria-orientation': Direction;
  'aria-valuemin': number;
  'aria-valuemax': number;
  'aria-valuenow': number;
  'aria-controls': string;
  'data-resplit-order': number;
  'data-resplit-active': boolean;
  style: CSSProperties;
  onMouseDown: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface GetSplitterProps {
  (order: number, options?: SplitterOptions): SplitterProps;
}

export interface ResplitMethods {
  getContainerProps: GetContainerProps;
  getPaneProps: GetPaneProps;
  getSplitterProps: GetSplitterProps;
}

export interface ResplitOptions {
  direction: Direction;
}

export interface PaneChild extends PaneOptions {
  type: 'pane';
  minSize: `${number}fr`;
}

export interface SplitterChild extends SplitterOptions {
  type: 'splitter';
  size: `${number}px`;
}

export type Order = number | string;

export interface ChildrenState {
  [order: Order]: PaneChild | SplitterChild;
}

export interface ResplitProviderProps {
  value: ResplitMethods;
  children: ReactNode;
}
