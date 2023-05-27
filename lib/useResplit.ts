import { useId, useLayoutEffect, useRef, useState } from 'react';
import {
  CURSOR_BY_DIRECTION,
  SPLITTER_DEFAULT_SIZE,
  GRID_TEMPLATE_BY_DIRECTION,
  PANE_DEFAULT_MIN_SIZE,
  DEFAULT_OPTIONS,
} from './const';
import { ResplitOptions, ResplitMethods, ChildrenState, PaneChild, Order, FrValue, PxValue } from './types';
import { convertFrToNumber, convertPxToFr, convertPxToNumber, isPx } from './utils';

/**
 * The `useResplit` hook is how resizable layouts are initialised.
 *
 * @param resplitOptions - {@link ResplitOptions}
 *
 * @returns Methods needed to register the container, panes and splitters. {@link ResplitMethods}
 *
 * @example
 * ```tsx
 * import { useResplit } from 'react-resplit';
 *
 * function App() {
 *   const {
 *     getContainerProps,
 *     getSplitterProps,
 *     getPaneProps
 *   } = useResplit({ direction: 'horizontal' });
 *
 *   return (
 *     <div {...getContainerProps()}>
 *       <div {...getPaneProps(0, { initialSize: '0.5fr' })}>Pane 1</div>
 *       <div {...getSplitterProps(1, { size: '10px' })} />
 *       <div {...getPaneProps(2, { initialSize: '0.5fr' })}>Pane 2</div>
 *     </div>
 *   );
 * };
 * ```
 */
export const useResplit = (resplitOptions?: ResplitOptions): ResplitMethods => {
  const options: ResplitOptions = { ...DEFAULT_OPTIONS, ...resplitOptions };
  const { direction } = options;
  const [children, setChildren] = useState<ChildrenState>({});
  const containerRef = useRef<HTMLDivElement>();
  const activeSplitterOrder = useRef<number | null>(null);
  const id = useId();

  const getChildElement = (order: Order) =>
    containerRef.current?.querySelector(`:scope > [data-resplit-order="${order}"]`);

  const getChildSize = (order: Order) => {
    const childSize = containerRef.current?.style.getPropertyValue(`--resplit-${order}`);
    if (!childSize) return 0;
    return isPx(childSize as PxValue | FrValue)
      ? convertPxToNumber(childSize as PxValue)
      : convertFrToNumber(childSize as FrValue);
  };

  const setChildSize = (order: Order, size: FrValue | PxValue) => {
    containerRef.current?.style.setProperty(`--resplit-${order}`, size);
    const child = children[order];

    if (child.type === 'pane') {
      const paneSplitter = getChildElement(Number(order) + 1);
      paneSplitter?.setAttribute('aria-valuenow', String(convertFrToNumber(size as FrValue).toFixed(2)));
    }
  };

  const getPaneCollapsed = (order: Order) => getChildElement(order)?.getAttribute('data-resplit-collapsed') === 'true';

  const setPaneCollapsed = (order: Order, isCollapsed: boolean) =>
    getChildElement(order)?.setAttribute('data-resplit-collapsed', String(isCollapsed));

  const getContainerSize = () =>
    (direction === 'horizontal' ? containerRef.current?.offsetWidth : containerRef.current?.offsetHeight) || 0;

  const resizeByDelta = (splitterOrder: Order, delta: number) => {
    const isGrowing = delta > 0;
    const isShrinking = delta < 0;

    // Get the previous resizable pane (to left or above)
    let prevPaneIndex = Number(splitterOrder) - 1;
    let prevPane: PaneChild | null = children[prevPaneIndex] as PaneChild;

    if (isShrinking) {
      while (prevPaneIndex >= 0) {
        const pane = children[prevPaneIndex];

        if (pane.type === 'splitter' || getPaneCollapsed(prevPaneIndex)) {
          prevPaneIndex--;
          prevPane = null;
        } else {
          prevPane = pane;
          break;
        }
      }
    }

    // Get the next resizable pane (to right or below)
    let nextPaneIndex = Number(splitterOrder) + 1;
    let nextPane: PaneChild | null = children[nextPaneIndex] as PaneChild;

    if (isGrowing) {
      while (nextPaneIndex < Object.values(children).length) {
        const pane = children[nextPaneIndex];

        if (pane.type === 'splitter' || getPaneCollapsed(nextPaneIndex)) {
          nextPaneIndex++;
          nextPane = null;
        } else {
          nextPane = pane;
          break;
        }
      }
    }

    // Return if no panes are resizable
    if (!prevPane || !nextPane) return;

    const containerSize = getContainerSize();

    let prevPaneSize = getChildSize(prevPaneIndex) + delta;
    const prevPaneMinSize = convertFrToNumber(
      isPx(prevPane.minSize) ? convertPxToFr(convertPxToNumber(prevPane.minSize), containerSize) : prevPane.minSize,
    );
    const prevPaneIsCollapsed = prevPaneSize <= prevPaneMinSize;

    let nextPaneSize = getChildSize(nextPaneIndex) - delta;
    const nextPaneMinSize = convertFrToNumber(
      isPx(nextPane.minSize) ? convertPxToFr(convertPxToNumber(nextPane.minSize), containerSize) : nextPane.minSize,
    );
    const nextPaneIsCollapsed = nextPaneSize <= nextPaneMinSize;

    if (prevPaneIsCollapsed) {
      nextPaneSize = nextPaneSize + (prevPaneSize - prevPaneMinSize);
      prevPaneSize = prevPaneMinSize;
    }

    if (nextPaneIsCollapsed) {
      prevPaneSize = prevPaneSize + (nextPaneSize - nextPaneMinSize);
      nextPaneSize = nextPaneMinSize;
    }

    setChildSize(prevPaneIndex, `${prevPaneSize}fr`);
    setPaneCollapsed(prevPaneIndex, prevPaneIsCollapsed);

    setChildSize(nextPaneIndex, `${nextPaneSize}fr`);
    setPaneCollapsed(nextPaneIndex, nextPaneIsCollapsed);
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
      (total, [order, child]) => total + (child.type === 'splitter' ? getChildSize(order) : 0),
      0,
    );

    const availableSpace = getContainerSize() - combinedSplitterSize;

    // Calculate delta
    const splitterRect = splitter.getBoundingClientRect();
    const movement = direction === 'horizontal' ? e.clientX - splitterRect.left : e.clientY - splitterRect.top;
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
    // Set data attributes
    containerRef.current?.setAttribute('data-resplit-resizing', 'false');

    if (activeSplitterOrder.current !== null) {
      getChildElement(activeSplitterOrder.current)?.setAttribute('data-resplit-active', 'false');
    }

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
  const handleMouseDown = (order: number) => () => {
    // Set active splitter
    activeSplitterOrder.current = order;

    // Set data attributes
    containerRef.current?.setAttribute('data-resplit-resizing', 'true');

    if (activeSplitterOrder.current !== null) {
      getChildElement(activeSplitterOrder.current)?.setAttribute('data-resplit-active', 'true');
    }

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
  const handleKeyDown = (splitterOrder: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isHorizontal = direction === 'horizontal';
    const isVertical = direction === 'vertical';

    if ((e.key === 'ArrowLeft' && isHorizontal) || (e.key === 'ArrowUp' && isVertical)) {
      resizeByDelta(splitterOrder, -0.01);
    } else if ((e.key === 'ArrowRight' && isHorizontal) || (e.key === 'ArrowDown' && isVertical)) {
      resizeByDelta(splitterOrder, 0.01);
    } else if (e.key === 'Home') {
      resizeByDelta(splitterOrder, -1);
    } else if (e.key === 'End') {
      resizeByDelta(splitterOrder, 1);
    } else if (e.key === 'Enter') {
      if (getPaneCollapsed(splitterOrder - 1)) {
        const initialSize = (children[splitterOrder - 1] as PaneChild).initialSize || '1fr';
        resizeByDelta(splitterOrder, convertFrToNumber(initialSize));
      } else {
        resizeByDelta(splitterOrder, -1);
      }
    }
  };

  /**
   * Recalculate pane sizes when children are added or removed
   * TODO: Should we use a ref for the children object? Would this allow us to trigger this useLayoutEffect still?
   * TODO: Should we split children into panes and splitters? Would make accessing them easier
   */
  const childrenLength = Object.keys(children).length;

  useLayoutEffect(() => {
    const paneCount = Object.values(children).filter((child) => child.type === 'pane').length;

    Object.keys(children).forEach((order) => {
      const child = children[order];

      if (child.type === 'pane') {
        const paneSize = getPaneCollapsed(order) ? '0fr' : child.initialSize || `${1 / paneCount}fr`;
        setChildSize(order, paneSize);
      } else {
        setChildSize(order, child.size);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenLength]);

  /**
   * Public API
   * - Everything below is returned by the hook
   * - Each function returns a set of props to be spread onto the relevant element
   * - Each function also registers the element with the hook
   */
  const getPaneProps: ResplitMethods['getPaneProps'] = (order, options = {}) => {
    // Register pane
    if (!children[order]) {
      setChildren((currentChildren) => ({
        ...currentChildren,
        [order]: {
          ...options,
          type: 'pane',
          minSize: options.minSize || PANE_DEFAULT_MIN_SIZE,
        },
      }));
    }

    // Return pane props
    return {
      'data-resplit-order': order,
      'data-resplit-collapsed': false,
      id: `resplit-${id}-${order}`,
    };
  };

  const getSplitterProps: ResplitMethods['getSplitterProps'] = (order, options = {}) => {
    // Register splitter
    if (!children[order]) {
      setChildren((currentChildren) => ({
        ...currentChildren,
        [order]: {
          ...options,
          type: 'splitter',
          size: options.size || SPLITTER_DEFAULT_SIZE,
        },
      }));
    }

    // Return splitter props
    return {
      role: 'separator',
      tabIndex: 0,
      'aria-orientation': direction,
      'aria-valuemin': 0,
      'aria-valuemax': 1,
      'aria-valuenow': 1,
      'aria-controls': `resplit-${id}-${order - 1}`,
      'data-resplit-order': order,
      'data-resplit-active': false,
      style: { cursor: CURSOR_BY_DIRECTION[direction] },
      onMouseDown: handleMouseDown(order),
      onKeyDown: handleKeyDown(order),
    };
  };

  const getContainerProps: ResplitMethods['getContainerProps'] = () => {
    // Return container props
    return {
      'data-resplit-direction': direction,
      'data-resplit-resizing': false,
      style: {
        display: 'grid',
        overflow: 'hidden',
        [GRID_TEMPLATE_BY_DIRECTION[direction]]: Object.keys(children).reduce((value, order) => {
          const childVar = `minmax(0, var(--resplit-${order}))`;
          return value ? `${value} ${childVar}` : `${childVar}`;
        }, ''),
      },
      ref: (element: HTMLDivElement) => {
        containerRef.current = element;
      },
    };
  };

  return {
    getContainerProps,
    getPaneProps,
    getSplitterProps,
  };
};
