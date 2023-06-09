import { CSSProperties, LegacyRef, ReactNode } from 'react';

export type Direction = 'horizontal' | 'vertical';

export type Order = number;

export type PxValue = `${number}px`;

export type FrValue = `${number}fr`;

/**
 * Configure how the resizable layout should function, e.g. the direction that the panes flow in.
 */
export interface ResplitOptions {
  /**
   * Direction of the panes.
   *
   * @defaultValue 'horizontal'
   *
   */
  direction: Direction;
}

/**
 * The methods needed to register the container, panes and splitters for a resplit instance.
 * Each method returns an object of properties that should be spread to the relevant element.
 */
export interface ResplitMethods {
  /**
   * Returns the ref and styles needed on the container element.
   *
   * @returns ContainerProps object {@link ContainerProps}
   */
  getContainerProps: () => ContainerProps;
  /**
   * Given an order as the first argument, returns the props for the pane element.
   *
   * @param order - The order of the pane. {@link Order}
   *
   * @param options - The options for the pane. {@link PaneOptions}
   *
   * @returns Pane props object {@link PaneProps}
   */
  getPaneProps: (order: number, options?: PaneOptions) => PaneProps;
  /**
   * Given an order as the first argument, returns the props for the splitter element.
   *
   * @param order - The order of the splitter. {@link Order}
   *
   * @param options - The options for the splitter. {@link SplitterOptions}
   *
   * @returns Splitter props object {@link SplitterProps}
   */
  getSplitterProps: (order: number, options?: SplitterOptions) => SplitterProps;
  /**
   * Given an order as the first argument, returns the props for the handle element.
   *
   * @param order - The order of the splitter that this handle controls. {@link Order}
   *
   * @returns Handle props object {@link HandleProps}
   */
  getHandleProps: (order: number) => HandleProps;
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
   * Get the collapsed state of a pane.
   *
   * @param order - The order of the pane. {@link Order}
   *
   * @returns A boolean indicating if the pane is collapsed or not.
   */
  getPaneCollapsed: (order: number) => boolean;
}

/**
 * Properties needed for the container element.
 */
export interface ContainerProps {
  /**
   * Ref for the container element.
   */
  ref: LegacyRef<HTMLDivElement> | undefined;
  /**
   * Style object for the container element.
   */
  style: CSSProperties;
}

/**
 * Used to configure the initial size of the pane as well the minimum size.
 */
export interface PaneOptions {
  /**
   * Set the initial size of the pane as a fractional unit (fr).
   *
   * @example '0.5fr'
   *
   * @defaultValue By default, the initial size is calculated as the available space divided by the number of panes.
   */
  initialSize?: FrValue;
  /**
   * Set the minimum size of the pane as a fractional unit (fr).
   *
   * @example '0.1fr'
   *
   * @defaultValue '0fr'
   */
  minSize?: PxValue | FrValue;
  /**
   * Callback function that is called when the pane starts being resized.
   */
  onResizeStart?: () => void;
  /**
   * Callback function that is called when the pane is finished being resized.
   *
   * @param size - The new size of the pane. {@link FrValue}
   */
  onResizeEnd?: (size: FrValue) => void;
  /**
   * Callback function that is called when the pane is actively being resized.
   *
   * @param size - The new size of the pane. {@link FrValue}
   */
  onResize?: (size: FrValue) => void;
}

/**
 * Properties needed for the pane element.
 */
export interface PaneProps {
  /**
   * A random ID, referenced by the associated splitter's `aria-controls` attribute.
   */
  id: string;
  /**
   * Data attribute set to the order of the pane.
   */
  'data-resplit-order': number;
  /**
   * Data attribute marking if the pane is at the minimum size or not.
   */
  'data-resplit-collapsed': boolean;
}

/**
 * Used to configure the size of the splitter element.
 */
export interface SplitterOptions {
  /**
   * Set the size of the splitter as a pixel unit.
   *
   * @example '4px'
   *
   * @defaultValue '10px'
   */
  size?: PxValue;
}

/**
 * Properties needed for the splitter element.
 */
export interface SplitterProps {
  /**
   * Role attribute for the splitter element.
   */
  role: 'separator';
  /**
   * Makes the splitter element selectable via the tab key.
   */
  tabIndex: 0;
  /**
   * Informs screen readers of the resize orientation.
   */
  'aria-orientation': Direction;
  /**
   * A decimal value representing the minimum size of the pane that the splitter resizes.
   */
  'aria-valuemin': number;
  /**
   * A decimal value representing the maximum size of the pane that the splitter resizes.
   */
  'aria-valuemax': number;
  /**
   * A decimal value representing the current size of the pane that the splitter resizes.
   */
  'aria-valuenow': number;
  /**
   * Informs screen readers which pane element the splitter controls.
   */
  'aria-controls': string;
  /**
   * Data attribute set to the order of the splitter.
   */
  'data-resplit-order': number;
  /**
   * Data attribute marking if splitter is being dragged or not.
   */
  'data-resplit-active': boolean;
  /**
   * Style object for the splitter element.
   */
  style: CSSProperties;
  /**
   * Mousedown event handler.
   */
  onMouseDown: () => void;
  /**
   * Keydown event handler.
   */
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * Properties needed for the handle element.
 */
export interface HandleProps {
  /**
   * Style object for the handle element.
   */
  style: CSSProperties;
  /**
   * Mousedown event handler.
   */
  onMouseDown: () => void;
}

/**
 * The state of an individual pane.
 *
 * @internal For internal use only.
 *
 * @see {@link PaneOptions} for the public API.
 */
export interface PaneChild extends PaneOptions {
  type: 'pane';
  minSize: PxValue | FrValue;
}

/**
 * The state of an individual splitter.
 *
 * @internal For internal use only.
 *
 * @see {@link SplitterOptions} for the public API.
 */
export interface SplitterChild extends SplitterOptions {
  type: 'splitter';
  size: PxValue;
}

/**
 * An object containing panes and splitters. Indexed by order.
 *
 * @internal For internal use only.
 */
export interface ChildrenState {
  [order: Order]: PaneChild | SplitterChild;
}

/**
 * Resplit context provider props.
 *
 * @alpha This API is currently in alpha and may change in the future.
 */
export interface ResplitProviderProps {
  value: ResplitMethods;
  children: ReactNode;
}
