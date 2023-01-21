import { ResplitOptions } from './types';

export const DEFAULT_OPTIONS: ResplitOptions = {
  direction: 'horizontal',
};

export const GRID_TEMPLATE_BY_DIRECTION = {
  horizontal: 'gridTemplateColumns',
  vertical: 'gridTemplateRows',
};

export const CURSOR_BY_DIRECTION = {
  horizontal: 'col-resize',
  vertical: 'row-resize',
};

export const SPLITTER_DEFAULT_SIZE = '10px';

export const PANE_DEFAULT_MIN_SIZE = '0fr';
