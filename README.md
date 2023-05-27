# react-resplit

Resizable split pane layouts for React applications 🖖

- Flexible hook-based API that works with any styling method
- Built with modern CSS, a grid-based layout and custom properties
- Works with any amount of panes in a vertical or horizontal layout
- Built following the [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) pattern for accessibility and keyboard controls

![react-resplit](https://user-images.githubusercontent.com/9557798/209449017-e648a053-f0de-49b1-bc8f-d56b4ddcf5db.gif)
_Example of a code editor built with `react-resplit`_

## Development

Run the development server:

```
yarn dev
```

The files for the development app can be found in `src`, and the library files in `lib`.

---

## Usage

Install the package using your package manager of choice.

```
npm install react-resplit
```

Import the `useResplit` hook and register the container, panes and splitters.

```tsx
import { useResplit } from 'react-resplit';

function App() {
  const { getContainerProps, getSplitterProps, getPaneProps } = useResplit({ direction: 'horizontal' });

  return (
    <div {...getContainerProps()}>
      <div {...getPaneProps(0, { initialSize: '0.5fr' })}>Pane 1</div>
      <div {...getSplitterProps(1, { size: '10px' })} />
      <div {...getPaneProps(2, { initialSize: '0.5fr' })}>Pane 2</div>
    </div>
  );
}
```

### Styling

The container, splitter and pane elements are all unstyled by default apart from a few styles that are necessary for the layout - this is intentional so that the library remains flexible.

Resplit will apply the correct cursor based on the `direction` provided to the hook.

As a basic example, you could provide a `className` prop to the splitter elements and style them as a solid 10px divider.

```tsx
<div className="splitter" {...getSplitterProps(1, { size: '10px' })} />
```

```css
.splitter {
  width: 100%;
  height: 100%;
  background: #ccc;
}
```

### Accessibility

Resplit has been implemented using guidence from the [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) pattern.

In addition to built-in accessibility considerations, you should also ensure that splitters are correctly labelled.

If the primary pane has a visible label, the `aria-labelledby` attribute can be used.

```tsx
<div {...getPaneProps(0)}>
  <h2 id="pane-1-label">Pane 1</h2>
</div>
<div aria-labelledby="pane-1-label" {...getSplitterProps(1)} />
```

Alternatively, if the pane does not have a visible label, the `aria-label` attribute can be used.

```tsx
<div aria-label="Pane 1" {...getSplitterProps(1)} />
```

## API

### useResplit `(options: ResplitOptions) => ResplitMethods`

The `useResplit` hook is how resizable layouts are initialised, configured with an options object as the first argument.

#### ResplitOptions `object`

Configure how the resizable layout should function, e.g. the direction that the panes flow in.

| Name        | Type                         | Default        | Description            |
| ----------- | ---------------------------- | -------------- | ---------------------- |
| `direction` | `"horizontal" \| "vertical"` | `"horizontal"` | Direction of the panes |

#### ResplitMethods `object`

The `useResplit` hook returns the methods needed to register the container, panes and splitters. Each method returns an object of properties that should be spread to the relevant element.

| Name                | Type                                                          | Description                            |
| ------------------- | ------------------------------------------------------------- | -------------------------------------- |
| `getContainerProps` | `() => ContainerProps`                                        | Used to register the container element |
| `getPaneProps`      | `(order: number, options?: PaneOptions) => PaneProps`         | Used to register pane elements         |
| `getSplitterProps`  | `(order: number, options?: SplitterOptions) => SplitterProps` | Used to register splitter elements     |

### getContainerProps `() => ContainerProps`

Returns the ref and styles needed on the container element.

#### ContainerProps `object`

Properties needed for the container element.

| Name    | Type                                           | Description                            |
| ------- | ---------------------------------------------- | -------------------------------------- |
| `ref`   | `React.LegacyRef<HTMLDivElement> \| undefined` | Ref for the container element          |
| `style` | `React.CSSProperties`                          | Style object for the container element |

### getPaneProps `(order: number, options?: PaneOptions) => PaneProps`

Given an order as the first argument, returns the props for the pane element.

#### PaneOptions `object`

An optional second argument, used to configure the initial size of the pane as well the minimum size.

| Name          | Type          | Default                               | Description                                                              |
| ------------- | ------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `initialSize` | `${number}fr` | `[available space]/[number of panes]` | Set the initial size of the pane as a fractional unit (fr)               |
| `minSize`     | `${number}fr` | `"0fr"`                               | Set the minimum size of the pane as a fractional (fr) or pixel (px) unit |

#### PaneProps `object`

Properties needed for the pane element.

| Name                     | Type      | Description                                                                    |
| ------------------------ | --------- | ------------------------------------------------------------------------------ |
| `id`                     | `string`  | A random ID, referenced by the associated splitter's `aria-controls` attribute |
| `data-resplit-order`     | `number`  | Data attribute set to the order of the pane                                    |
| `data-resplit-collapsed` | `boolean` | Data attribute marking if the pane is collapsed or not                         |

### getSplitterProps `(order: number, options?: SplitterOptions) => SplitterProps`

Given an order as the first argument, returns the props for the splitter element.

#### SplitterOptions `object`

An optional second argument, used to configure the size of the splitter element

| Name   | Type          | Default  | Description                                  |
| ------ | ------------- | -------- | -------------------------------------------- |
| `size` | `${number}px` | `"10px"` | Set the size of the splitter as a pixel unit |

#### SplitterProps `object`

Properties needed for the splitter element.

| Name                  | Type                                                   | Description                                                                         |
| --------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `role`                | `"separator"`                                          | Role attribute for the splitter element                                             |
| `tabIndex`            | `0`                                                    | Makes the splitter element selectable via the tab key                               |
| `aria-orientation`    | `"horizontal" \| "vertical"`                           | Informs screen readers of the resize orientation                                    |
| `aria-valuemin`       | `number`                                               | A decimal value representing the minimum size of the pane that the splitter resizes |
| `aria-valuemax`       | `number`                                               | A decimal value representing the maximum size of the pane that the splitter resizes |
| `aria-valuenow`       | `number`                                               | A decimal value representing the current size of the pane that the splitter resizes |
| `aria-controls`       | `string`                                               | Informs screen readers which pane element the splitter controls                     |
| `data-resplit-order`  | `number`                                               | Data attribute set to the order of the splitter                                     |
| `data-resplit-active` | `boolean`                                              | Data attribute marking if splitter is being dragged or not                          |
| `style`               | `React.CSSProperties`                                  | Style object for the splitter element                                               |
| `onMouseDown`         | `() => void`                                           | Mousedown event handler                                                             |
| `onKeyDown`           | `(event: React.KeyboardEvent<HTMLDivElement>) => void` | Keydown event handler                                                               |
