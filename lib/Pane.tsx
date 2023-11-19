import { ReactNode, HTMLAttributes, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { useRootContext } from './RootContext';
import { PANE_DEFAULT_MIN_SIZE } from './const';
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
};

export type ResplitPaneProps = HTMLAttributes<HTMLDivElement> &
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

  useIsomorphicLayoutEffect(() => {
    registerPane(String(order), {
      minSize,
      initialSize,
      onResize,
      onResizeStart,
      onResizeEnd,
    });
  }, []);

  return (
    <Comp
      id={`resplit-${id}-${order}`}
      data-resplit-order={order}
      data-resplit-collapsed={false}
      ref={ref}
      {...rest}
    >
      {children}
    </Comp>
  );
});
