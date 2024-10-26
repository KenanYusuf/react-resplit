import { ReactNode, HTMLAttributes, forwardRef, useRef, useEffect } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { useRootContext } from './RootContext';
import { PANE_DEFAULT_COLLAPSED_SIZE, PANE_DEFAULT_MIN_SIZE } from './const';
import { useIsomorphicLayoutEffect } from './utils';

import type { FrValue, Order, PxValue } from './types';

export type ResplitPaneOptions = {
  /**
   * Set the initial size of the pane as a fractional unit (fr).
   *
   * @example '0.5fr'
   *
   * @defaultValue By default, the initial size is calculated as the available space divided by the number of panes.
   */
  initialSize?: FrValue;
  /**
   * Set the minimum size of the pane as a pixel unit (px) or fractional unit (fr).
   *
   * @example '0.1fr'
   *
   * @defaultValue '0fr'
   */
  minSize?: PxValue | FrValue;
  /**
   * Whether the pane can be collapsed below its minimum size.
   *
   * The pane will be collapsed if the user drags the splitter past 50% of the minimum size.
   *
   * @defaultValue false
   */
  collapsible?: boolean;
  /**
   * Set the collapsed size of the pane as a pixel unit (px) or fractional unit (fr).
   *
   * @example '50px'
   *
   * @defaultValue '0fr'
   */
  collapsedSize?: PxValue | FrValue;
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
};

export type ResplitPaneProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onResize' | 'onResizeEnd' | 'onResizeStart'
> &
  ResplitPaneOptions & {
    /**
     * The order of the pane in the layout. {@link Order}
     */
    order: Order;
    /**
     * The content of the pane.
     */
    children?: ReactNode;
    /**
     * Merges props onto the immediate child.
     *
     * @defaultValue false
     *
     * @example
     *
     * ```tsx
     * <ResplitPane order={0} asChild>
     *   <aside style={{ backgroundColor: 'red' }}>
     *     ...
     *   </aside>
     * </ResplitPane>
     * ```
     */
    asChild?: boolean;
  };

/**
 * A pane is a container that can be resized.
 *
 * It must be a direct child of a {@link ResplitRoot} component.
 *
 * @example
 * ```tsx
 * <ResplitPane order={0} minSize="0.1fr" initialSize="0.5fr">
 *   <div>Pane 1</div>
 * </ResplitPane>
 * ```
 */
export const ResplitPane = forwardRef<HTMLDivElement, ResplitPaneProps>(function Pane(
  {
    children,
    order,
    minSize = PANE_DEFAULT_MIN_SIZE,
    collapsible = false,
    collapsedSize = PANE_DEFAULT_COLLAPSED_SIZE,
    initialSize,
    asChild = false,
    onResize,
    onResizeStart,
    onResizeEnd,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  const { id, registerPane } = useRootContext();

  const paneOptionsRef = useRef<ResplitPaneOptions>({
    minSize,
    initialSize,
    collapsedSize,
    collapsible,
    onResize,
    onResizeStart,
    onResizeEnd,
  });

  useIsomorphicLayoutEffect(() => {
    registerPane(String(order), paneOptionsRef);
  }, []);

  useEffect(() => {
    paneOptionsRef.current = {
      minSize,
      initialSize,
      collapsedSize,
      collapsible,
      onResize,
      onResizeStart,
      onResizeEnd,
    };
  }, [minSize, initialSize, collapsedSize, collapsible, onResize, onResizeStart, onResizeEnd]);

  return (
    <Comp
      id={`resplit-${id}-${order}`}
      data-resplit-order={order}
      data-resplit-is-min={false}
      data-resplit-is-collapsed={false}
      ref={ref}
      {...rest}
    >
      {children}
    </Comp>
  );
});
