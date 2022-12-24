import { CSSProperties, LegacyRef, ReactNode } from 'react';

export type DataAttrKeys = 'resizing' | 'collapsed';

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
}

export interface GetPaneProps {
  (order: number, options?: PaneOptions): PaneProps;
}

export interface SplitterOptions {
  size?: `${number}px`;
}

export interface SplitterProps {
  style: CSSProperties;
  'data-resplit-order': number;
  'data-resplit-active': boolean;
  onMouseDown: () => void;
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
  direction: 'horizontal' | 'vertical';
}

export interface PaneChild extends PaneOptions {
  type: 'pane';
  minSize: `${number}fr`;
}

export interface SplitterChild extends SplitterOptions {
  type: 'splitter';
  size: `${number}px`;
}

export interface ChildrenState {
  [name: string]: PaneChild | SplitterChild;
}

export interface ResplitProviderProps {
  value: ResplitMethods;
  children: ReactNode;
}
