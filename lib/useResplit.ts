import { useLayoutEffect, useRef, useState } from 'react';
import { CURSOR_BY_DIRECTION, SPLITTER_DEFAULT_SIZE, GRID_TEMPLATE_BY_DIRECTION, PANE_DEFAULT_MIN_SIZE } from './const';
import {
  ResplitOptions,
  ResplitMethods,
  GetContainerProps,
  GetPaneProps,
  GetSplitterProps,
  ChildrenState,
  PaneChild,
} from './types';
import { convertFrToNumber, convertPxToNumber } from './utils';

export const useResplit = ({ direction }: ResplitOptions): ResplitMethods => {
  const [children, setChildren] = useState<ChildrenState>({});
  const containerRef = useRef<HTMLDivElement>();
  const activeSplitterIndex = useRef<number | null>(null);

  const getChildSize = (order: number | string) => {
    const childSize = containerRef.current?.style.getPropertyValue(`--resplit-${order}`);
    if (!childSize) return 0;
    return childSize?.includes('fr') ? convertFrToNumber(childSize) : convertPxToNumber(childSize);
  };

  const setChildSize = (order: number, size: string) =>
    containerRef.current?.style.setProperty(`--resplit-${order}`, size);

  const getChildDataAttribute = (order: number, attribute: string) => {
    const pane = containerRef.current?.querySelector(`[data-resplit-order="${order}"]`);

    if (pane) {
      return pane.getAttribute(attribute);
    }

    return null;
  };

  const setChildDataAttribute = (order: number, attribute: string, value: string) => {
    const pane = containerRef.current?.querySelector(`[data-resplit-order="${order}"]`);

    if (pane) {
      pane.setAttribute(attribute, value);
    }
  };

  const getPaneCollapsed = (order: number) => getChildDataAttribute(order, 'data-resplit-collapsed') === 'true';

  const setPaneCollapsed = (order: number, collapsed: boolean) =>
    setChildDataAttribute(order, 'data-resplit-collapsed', collapsed ? 'true' : 'false');

  /**
   * Mouse move handler
   * - Fire when user is interacting with splitter
   * - Handle resizing of panes
   */
  const handleMouseMove = (e: MouseEvent) => {
    if (activeSplitterIndex.current === null) return;

    const combinedSplitterSize = Object.entries(children).reduce(
      (total, [order, child]) => total + (child.type === 'splitter' ? getChildSize(order) : 0),
      0,
    );
    const containerSize =
      direction === 'horizontal' ? containerRef.current?.offsetWidth : containerRef.current?.offsetHeight;
    const availableSpace = (containerSize || 0) - combinedSplitterSize;
    const movement = direction === 'horizontal' ? e.movementX : e.movementY;
    const delta = movement / availableSpace;

    if (delta) {
      const isGrowing = delta > 0;
      const isShrinking = delta < 0;

      // Prev pane
      let prevPaneIndex = activeSplitterIndex.current! - 1;
      let prevPane: PaneChild | null = children[prevPaneIndex] as PaneChild;

      if (isShrinking) {
        while (prevPaneIndex >= 0) {
          const pane = children[prevPaneIndex];
          const paneIsCollapsed = getPaneCollapsed(prevPaneIndex);

          if (pane.type === 'splitter' || paneIsCollapsed) {
            prevPaneIndex--;
            prevPane = null;
          } else {
            prevPane = pane;
            break;
          }
        }
      }

      // Next pane
      let nextPaneIndex = activeSplitterIndex.current! + 1;
      let nextPane: PaneChild | null = children[nextPaneIndex] as PaneChild;

      if (isGrowing) {
        while (nextPaneIndex < Object.values(children).length) {
          const pane = children[nextPaneIndex];
          const paneIsCollapsed = getPaneCollapsed(nextPaneIndex);

          if (pane.type === 'splitter' || paneIsCollapsed) {
            nextPaneIndex++;
            nextPane = null;
          } else {
            nextPane = pane;
            break;
          }
        }
      }

      if (prevPane && nextPane) {
        let prevPaneSize = getChildSize(prevPaneIndex) + delta;
        const prevPaneMinSize = convertFrToNumber(prevPane.minSize);
        const prevPaneIsCollapsed = prevPaneSize <= prevPaneMinSize;

        let nextPaneSize = getChildSize(nextPaneIndex) - delta;
        const nextPaneMinSize = convertFrToNumber(nextPane.minSize);
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
      }
    }
  };

  /**
   * Mouse up handler
   * - Fire when user stops interacting with splitter
   */
  const handleMouseUp = () => {
    // Set data attributes
    containerRef.current?.setAttribute('data-resplit-resizing', 'false');
    setChildDataAttribute(activeSplitterIndex.current!, 'data-resplit-active', 'false');

    // Unset refs
    activeSplitterIndex.current = null;

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
   */
  const handleMouseDown = (order: number) => () => {
    // Set active splitter
    activeSplitterIndex.current = order;

    // Set data attributes
    containerRef.current?.setAttribute('data-resplit-resizing', 'true');
    setChildDataAttribute(order, 'data-resplit-active', 'true');

    // Disable text selection and cursor
    document.documentElement.style.cursor = CURSOR_BY_DIRECTION[direction];
    document.documentElement.style.pointerEvents = 'none';
    document.documentElement.style.userSelect = 'none';

    // Add mouse event listeners
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
  };

  /**
   * Recalculate pane sizes when children are added or removed
   * TODO: Is it ok to use the length of the object keys as a dependency?
   * TODO: Should we use a ref for the children object? Would this allow us to trigger this useLayoutEffect still?
   * TODO: Should we split children into panes and splitters? Would make accessing them easier
   */
  useLayoutEffect(() => {
    const paneCount = Object.values(children).filter((child) => child.type === 'pane').length;

    Object.keys(children).forEach((order) => {
      const child = children[order];

      if (child.type === 'pane') {
        const paneSize = getPaneCollapsed(Number(order)) ? '0fr' : child.initialSize || `${1 / paneCount}fr`;
        setChildSize(Number(order), paneSize);
      } else {
        setChildSize(Number(order), child.size);
      }
    });
  }, [Object.keys(children).length]);

  /**
   * Public API
   * - Everything below is returned by the hook
   * - Each function returns a set of props to be spread onto the relevant element
   * - Each function also registers the element with the hook
   */
  const getPaneProps: GetPaneProps = (order, options = {}) => {
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
    };
  };

  const getSplitterProps: GetSplitterProps = (order, options = {}) => {
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
      onMouseDown: handleMouseDown(order),
      style: { cursor: CURSOR_BY_DIRECTION[direction] },
      'data-resplit-order': order,
      'data-resplit-active': false,
    };
  };

  const getContainerProps: GetContainerProps = () => {
    // Return container props
    return {
      ref: (element: HTMLDivElement) => {
        containerRef.current = element;
      },
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
    };
  };

  return {
    getContainerProps,
    getPaneProps,
    getSplitterProps,
  };
};
