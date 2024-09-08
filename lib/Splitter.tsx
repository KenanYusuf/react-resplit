import { ReactNode, HTMLAttributes, forwardRef, useRef, useEffect } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { useRootContext } from './RootContext';
import { CURSOR_BY_DIRECTION, SPLITTER_DEFAULT_SIZE } from './const';
import { useIsomorphicLayoutEffect } from './utils';

import type { PxValue, Order } from './types';

export type ResplitSplitterOptions = {
  /**
   * Set the size of the splitter as a pixel unit.
   *
   * @example '4px'
   *
   * @defaultValue '10px'
   */
  size?: PxValue;
};

export type ResplitSplitterProps = HTMLAttributes<HTMLDivElement> &
  ResplitSplitterOptions & {
    /**
     * The order of the splitter in the layout. {@link Order}
     */
    order: Order;
    /**
     * The content of the splitter.
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
     * <ResplitSplitter asChild>
     *   <div style={{ backgroundColor: 'red' }}>
     *     ...
     *   </div>
     * </ResplitSplitter>
     * ```
     */
    asChild?: boolean;
  };

/**
 * A splitter is a draggable element that can be used to resize panes.
 *
 * It must be a direct child of a {@link ResplitRoot} component.
 *
 * @example
 * ```tsx
 * <ResplitSplitter order={1} size={4} />
 * ```
 */
export const ResplitSplitter = forwardRef<HTMLDivElement, ResplitSplitterProps>(function Splitter(
  { children, order, size = SPLITTER_DEFAULT_SIZE, asChild = false, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  const { id, direction, registerSplitter, handleSplitterMouseDown, handleSplitterKeyDown } =
    useRootContext();

  const splitterOptionsRef = useRef<ResplitSplitterOptions>({ size });

  useIsomorphicLayoutEffect(() => {
    registerSplitter(String(order), splitterOptionsRef);
  }, []);

  useEffect(() => {
    splitterOptionsRef.current = { size };
  }, [size]);

  return (
    // eslint-disable-next-line jsx-a11y/role-supports-aria-props, jsx-a11y/no-noninteractive-element-interactions
    <Comp
      role="separator"
      tabIndex={0}
      aria-orientation={direction}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={1}
      aria-controls={`resplit-${id}-${order - 1}`}
      data-resplit-order={order}
      data-resplit-active={false}
      style={{ cursor: CURSOR_BY_DIRECTION[direction] }}
      onMouseDown={handleSplitterMouseDown(order)}
      onKeyDown={handleSplitterKeyDown(order)}
      ref={ref}
      {...rest}
    >
      {children}
    </Comp>
  );
});
