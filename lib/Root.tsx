import { HTMLAttributes, ReactNode, forwardRef, useId, useRef, useState } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { ResplitContext } from './ResplitContext';
import { RootContext } from './RootContext';
import { CURSOR_BY_DIRECTION, GRID_TEMPLATE_BY_DIRECTION } from './const';
import {
  convertFrToNumber,
  convertPxToNumber,
  convertSizeToFr,
  isPx,
  mergeRefs,
  useIsomorphicLayoutEffect,
} from './utils';

import type { FrValue, Order, PxValue, Direction } from './types';
import type { ResplitPaneOptions } from './Pane';
import type { ResplitSplitterOptions } from './Splitter';

/**
 * The state of an individual pane.
 *
 * @internal For internal use only.
 *
 * @see {@link PaneOptions} for the public API.
 */
export interface PaneChild extends ResplitPaneOptions {
  type: 'pane';
  minSize: PxValue | FrValue;
  collapsedSize: PxValue | FrValue;
}

/**
 * The state of an individual splitter.
 *
 * @internal For internal use only.
 *
 * @see {@link SplitterOptions} for the public API.
 */
export interface SplitterChild extends ResplitSplitterOptions {
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

export interface ResplitOptions {
  /**
   * Direction of the panes.
   *
   * @defaultValue 'horizontal'
   *
   */
  direction?: Direction;
}

export type ResplitRootProps = ResplitOptions &
  HTMLAttributes<HTMLDivElement> & {
    /**
     * The children of the ResplitRoot component.
     */
    children: ReactNode;
    /**
     * Merges props onto the immediate child.
     *
     * @defaultValue false
     *
     * @example
     *
     * ```tsx
     * <ResplitRoot asChild>
     *   <main style={{ backgroundColor: 'red' }}>
     *     ...
     *   </main>
     * </ResplitRoot>
     * ```
     */
    asChild?: boolean;
  };

/**
 * The root component of a resplit layout. Provides context to all child components.
 *
 * @example
 * ```tsx
 * <ResplitRoot direction="horizontal">
 *   <ResplitPane order={0} />
 *   <ResplitSplitter order={1} />
 *   <ResplitPane order={2} />
 * </ResplitRoot>
 * ```
 */
export const ResplitRoot = forwardRef<HTMLDivElement, ResplitRootProps>(function Root(
  { direction = 'horizontal', children: reactChildren, style, asChild = false, ...rest },
  forwardedRef,
) {
  const id = useId();
  const Comp = asChild ? Slot : 'div';
  const activeSplitterOrder = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [children, setChildren] = useState<ChildrenState>({});

  const getChildElement = (order: Order) =>
    rootRef.current?.querySelector(`:scope > [data-resplit-order="${order}"]`);

  const getChildSize = (order: Order) =>
    rootRef.current?.style.getPropertyValue(`--resplit-${order}`);

  const getChildSizeAsNumber = (order: Order) => {
    const childSize = getChildSize(order);
    if (!childSize) return 0;
    return isPx(childSize as PxValue | FrValue)
      ? convertPxToNumber(childSize as PxValue)
      : convertFrToNumber(childSize as FrValue);
  };

  const setChildSize = (order: Order, size: FrValue | PxValue) => {
    rootRef.current?.style.setProperty(`--resplit-${order}`, size);
    const child = children[order];

    if (child.type === 'pane') {
      const paneSplitter = getChildElement(order + 1);
      paneSplitter?.setAttribute(
        'aria-valuenow',
        String(convertFrToNumber(size as FrValue).toFixed(2)),
      );
    }
  };

  const isPaneMinSize = (order: Order) =>
    getChildElement(order)?.getAttribute('data-resplit-is-min') === 'true';

  const setIsPaneMinSize = (order: Order, value: boolean) =>
    getChildElement(order)?.setAttribute('data-resplit-is-min', String(value));

  const isPaneCollapsed = (order: Order) =>
    getChildElement(order)?.getAttribute('data-resplit-is-collapsed') === 'true';

  const setIsPaneCollapsed = (order: Order, value: boolean) =>
    getChildElement(order)?.setAttribute('data-resplit-is-collapsed', String(value));

  const getRootSize = () =>
    (direction === 'horizontal' ? rootRef.current?.offsetWidth : rootRef.current?.offsetHeight) ||
    0;

  const findResizablePane = (start: number, direction: number) => {
    let index = start;
    let pane: PaneChild | null = children[index] as PaneChild;

    while (index >= 0 && index < Object.values(children).length) {
      const child = children[index];

      if (
        child.type === 'splitter' ||
        (isPaneMinSize(index) && !child.collapsible) ||
        (isPaneMinSize(index) && child.collapsible && isPaneCollapsed(index))
      ) {
        index += direction;
        pane = null;
      } else {
        pane = child;
        break;
      }
    }

    return { index, pane };
  };

  const resizeByDelta = (splitterOrder: Order, delta: number) => {
    const isGrowing = delta > 0;
    const isShrinking = delta < 0;

    // Find the previous and next resizable panes
    const { index: prevPaneIndex, pane: prevPane } = isShrinking
      ? findResizablePane(splitterOrder - 1, -1)
      : { index: splitterOrder - 1, pane: children[splitterOrder - 1] as PaneChild };

    const { index: nextPaneIndex, pane: nextPane } = isGrowing
      ? findResizablePane(splitterOrder + 1, 1)
      : { index: splitterOrder + 1, pane: children[splitterOrder + 1] as PaneChild };

    // Return if no panes are resizable
    if (!prevPane || !nextPane) return;

    const rootSize = getRootSize();

    let prevPaneSize = getChildSizeAsNumber(prevPaneIndex) + delta;
    const prevPaneMinSize = convertFrToNumber(convertSizeToFr(prevPane.minSize, rootSize));
    const prevPaneisPaneMinSize = prevPaneSize <= prevPaneMinSize;
    const prevPaneisPaneCollapsed = !!prevPane.collapsible && prevPaneSize <= prevPaneMinSize / 2;

    let nextPaneSize = getChildSizeAsNumber(nextPaneIndex) - delta;
    const nextPaneMinSize = convertFrToNumber(convertSizeToFr(nextPane.minSize, rootSize));
    const nextPaneisPaneMinSize = nextPaneSize <= nextPaneMinSize;
    const nextPaneisPaneCollapsed = !!nextPane.collapsible && nextPaneSize <= nextPaneMinSize / 2;

    if (prevPaneisPaneCollapsed || nextPaneisPaneCollapsed) {
      if (prevPaneisPaneCollapsed) {
        const prevPaneCollapsedSize = convertFrToNumber(
          convertSizeToFr(prevPane.collapsedSize, rootSize),
        );
        nextPaneSize = nextPaneSize + prevPaneSize - prevPaneCollapsedSize;
        prevPaneSize = prevPaneCollapsedSize;
      }

      if (nextPaneisPaneCollapsed) {
        const nextPaneCollapsedSize = convertFrToNumber(
          convertSizeToFr(nextPane.collapsedSize, rootSize),
        );
        prevPaneSize = prevPaneSize + nextPaneSize - nextPaneCollapsedSize;
        nextPaneSize = nextPaneCollapsedSize;
      }
    } else {
      if (prevPaneisPaneMinSize) {
        nextPaneSize = nextPaneSize + (prevPaneSize - prevPaneMinSize);
        prevPaneSize = prevPaneMinSize;
      }

      if (nextPaneisPaneMinSize) {
        prevPaneSize = prevPaneSize + (nextPaneSize - nextPaneMinSize);
        nextPaneSize = nextPaneMinSize;
      }
    }

    setChildSize(prevPaneIndex, `${prevPaneSize}fr`);
    setIsPaneMinSize(prevPaneIndex, prevPaneisPaneMinSize);
    setIsPaneCollapsed(prevPaneIndex, prevPaneisPaneCollapsed);
    prevPane?.onResize?.(`${prevPaneSize}fr`);

    setChildSize(nextPaneIndex, `${nextPaneSize}fr`);
    setIsPaneMinSize(nextPaneIndex, nextPaneisPaneMinSize);
    setIsPaneCollapsed(nextPaneIndex, nextPaneisPaneCollapsed);
    nextPane?.onResize?.(`${nextPaneSize}fr`);
  };

  /**
   * Mouse move handler
   * - Fire when user is interacting with splitter
   * - Handle resizing of panes
   */
  const handleMouseMove = (e: MouseEvent) => {
    // Return if no active splitter
    if (activeSplitterOrder.current === null) return;

    // Get the splitter element
    const splitter = getChildElement(activeSplitterOrder.current);

    // Return if no splitter element could be found
    if (!splitter) return;

    // Calculate available space
    const combinedSplitterSize = Object.entries(children).reduce(
      (total, [order, child]) =>
        total + (child.type === 'splitter' ? getChildSizeAsNumber(Number(order)) : 0),
      0,
    );

    const availableSpace = getRootSize() - combinedSplitterSize;

    // Calculate delta
    const splitterRect = splitter.getBoundingClientRect();
    const movement =
      direction === 'horizontal' ? e.clientX - splitterRect.left : e.clientY - splitterRect.top;
    const delta = movement / availableSpace;

    // Return if no change in the direction of movement
    if (!delta) return;

    resizeByDelta(activeSplitterOrder.current, delta);
  };

  /**
   * Mouse up handler
   * - Fire when user stops interacting with splitter
   */
  const handleMouseUp = () => {
    const order = activeSplitterOrder.current;

    if (order === null) return;

    // Set data attributes
    rootRef.current?.setAttribute('data-resplit-resizing', 'false');

    if (order !== null) {
      getChildElement(order)?.setAttribute('data-resplit-active', 'false');
    }

    const prevPane = children[order - 1];
    if (prevPane.type === 'pane') prevPane.onResizeEnd?.(getChildSize(order - 1) as FrValue);

    const nextPane = children[order + 1];
    if (nextPane.type === 'pane') nextPane.onResizeEnd?.(getChildSize(order + 1) as FrValue);

    // Unset refs
    activeSplitterOrder.current = null;

    // Re-enable text selection and cursor
    document.documentElement.style.cursor = '';
    document.documentElement.style.pointerEvents = '';
    document.documentElement.style.userSelect = '';

    // Remove mouse event listeners
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mousemove', handleMouseMove);
  };

  /**
   * Mouse down handler
   * - Fire when user begins interacting with splitter
   * - Handle resizing of panes using cursor
   */
  const handleSplitterMouseDown = (order: number) => () => {
    // Set active splitter
    activeSplitterOrder.current = order;

    // Set data attributes
    rootRef.current?.setAttribute('data-resplit-resizing', 'true');

    if (activeSplitterOrder.current !== null) {
      getChildElement(activeSplitterOrder.current)?.setAttribute('data-resplit-active', 'true');
    }

    const prevPane = children[order - 1];
    if (prevPane.type === 'pane') prevPane.onResizeStart?.();

    const nextPane = children[order + 1];
    if (nextPane.type === 'pane') nextPane.onResizeStart?.();

    // Disable text selection and cursor
    document.documentElement.style.cursor = CURSOR_BY_DIRECTION[direction];
    document.documentElement.style.pointerEvents = 'none';
    document.documentElement.style.userSelect = 'none';

    // Add mouse event listeners
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
  };

  /**
   * Key down handler
   * - Fire when user presses a key whilst focused on a splitter
   * - Handle resizing of panes using keyboard
   * - Refer to: https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/
   */
  const handleSplitterKeyDown =
    (splitterOrder: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      const isHorizontal = direction === 'horizontal';
      const isVertical = direction === 'vertical';

      if ((e.key === 'ArrowLeft' && isHorizontal) || (e.key === 'ArrowUp' && isVertical)) {
        resizeByDelta(splitterOrder, -0.01);
      } else if (
        (e.key === 'ArrowRight' && isHorizontal) ||
        (e.key === 'ArrowDown' && isVertical)
      ) {
        resizeByDelta(splitterOrder, 0.01);
      } else if (e.key === 'Home') {
        resizeByDelta(splitterOrder, -1);
      } else if (e.key === 'End') {
        resizeByDelta(splitterOrder, 1);
      } else if (e.key === 'Enter') {
        if (isPaneMinSize(splitterOrder - 1)) {
          const initialSize = (children[splitterOrder - 1] as PaneChild).initialSize || '1fr';
          resizeByDelta(splitterOrder, convertFrToNumber(initialSize));
        } else {
          resizeByDelta(splitterOrder, -1);
        }
      }
    };

  const registerPane = (order: string, options: ResplitPaneOptions) => {
    setChildren((children) => ({
      ...children,
      [order]: {
        type: 'pane',
        ...options,
      },
    }));
  };

  const registerSplitter = (order: string, options: ResplitSplitterOptions) => {
    setChildren((children) => ({
      ...children,
      [order]: {
        type: 'splitter',
        ...options,
      },
    }));
  };

  const setPaneSizes = (paneSizes: FrValue[]) => {
    paneSizes.forEach((paneSize, index) => {
      const order = index * 2;
      setChildSize(order, paneSize);
      setIsPaneMinSize(order, (children[order] as PaneChild).minSize === paneSize);
      setIsPaneCollapsed(order, (children[order] as PaneChild).collapsedSize === paneSize);

      const pane = children[order] as PaneChild;
      if (pane.type === 'pane') {
        pane.onResize?.(paneSize);
      }
    });
  };

  /**
   * Recalculate pane sizes when children are added or removed
   */
  const childrenLength = Object.keys(children).length;

  useIsomorphicLayoutEffect(() => {
    const paneCount = Object.values(children).filter((child) => child.type === 'pane').length;

    Object.keys(children).forEach((key) => {
      const order = Number(key);
      const child = children[order];

      if (child.type === 'pane') {
        const paneSize = isPaneMinSize(order) ? '0fr' : child.initialSize || `${1 / paneCount}fr`;
        setChildSize(order, paneSize);
      } else {
        setChildSize(order, child.size);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenLength]);

  return (
    <RootContext.Provider
      value={{
        id,
        direction,
        registerPane,
        registerSplitter,
        handleSplitterMouseDown,
        handleSplitterKeyDown,
      }}
    >
      <ResplitContext.Provider
        value={{
          isPaneMinSize,
          isPaneCollapsed,
          setPaneSizes,
        }}
      >
        <Comp
          ref={mergeRefs([rootRef, forwardedRef])}
          data-resplit-direction={direction}
          data-resplit-resizing={false}
          style={{
            display: 'grid',
            overflow: 'hidden',
            [GRID_TEMPLATE_BY_DIRECTION[direction]]: Object.keys(children).reduce(
              (value, order) => {
                const childVar = `minmax(0, var(--resplit-${order}))`;
                return value ? `${value} ${childVar}` : `${childVar}`;
              },
              '',
            ),
            ...style,
          }}
          {...rest}
        >
          {reactChildren}
        </Comp>
      </ResplitContext.Provider>
    </RootContext.Provider>
  );
});
