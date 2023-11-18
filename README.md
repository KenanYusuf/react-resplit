# react-resplit

Resizable split pane layouts for React applications 🖖

- Compound component API that works with any styling method
- Built with modern CSS, a grid-based layout and custom properties
- Works with any amount of panes in a vertical or horizontal layout
- Built following the [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) pattern for accessibility and keyboard controls



https://github.com/KenanYusuf/react-resplit/assets/9557798/d47ef278-bcb1-4c2b-99e6-7a9f99943f96

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

Import `Resplit` from `react-resplit` and render the Root, Pane(s) and Splitter(s).

```tsx
import { Resplit } from 'react-resplit';

function App() {
  return (
    <Resplit.Root direction="horizontal">
      <Resplit.Pane order={0} initialSize="0.5fr">
        Pane 1
      </Resplit.Pane>
      <Resplit.Splitter order={1} size="10px" />
      <Resplit.Pane order={2} initialSize="0.5fr">
        Pane 2
      </Resplit.Pane>
    </Resplit.Root>
  );
}
```

### Styling

The Root, Splitter and Pane elements are all unstyled by default apart from a few styles that are necessary for the layout - this is intentional so that the library remains flexible.

Resplit will apply the correct cursor based on the `direction` provided to the hook.

As a basic example, you could provide a `className` prop to the Splitter elements and style them as a solid 10px divider.

```tsx
<Resplit.Splitter className="splitter" order={0} size="10px" />
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
<Resplit.Pane order={0}>
  <h2 id="pane-1-label">Pane 1</h2>
</Resplit.Pane>
<Resplit.Splitter order={1} aria-labelledby="pane-1-label" />
```

Alternatively, if the pane does not have a visible label, the `aria-label` attribute can be used on the Splitter instead.

```tsx
<Resplit.Splitter order={1} aria-label="Pane 1" />
```

## API

All of the resplit components extend the `React.HTMLAttributes<HTMLDivElement>` interface, so you can pass any valid HTML attribute to them.

### Root `(ResplitRootProps)`

The root component of a resplit layout. Provides context to all child components.

| Prop        | Type                         | Default        | Description            |
| ----------- | ---------------------------- | -------------- | ---------------------- |
| `direction` | `"horizontal" \| "vertical"` | `"horizontal"` | Direction of the panes |
| `children`  | `ReactNode`                  |                | Child elements         |
| `className` | `string`                     |                | Class name             |
| `style`     | `CSSProperties`              |                | Style object           |

### Pane `(ResplitPaneProps)`

A pane is a container that can be resized.

| Prop            | Type                           | Default                               | Description                                                               |
| --------------- | ------------------------------ | ------------------------------------- | ------------------------------------------------------------------------- |
| `initialSize`   | `${number}fr`                  | `[available space]/[number of panes]` | Set the initial size of the pane as a fractional unit (fr)                |
| `minSize`       | `${number}fr` \| `${number}px` | `"0fr"`                               | Set the minimum size of the pane as a fractional (fr) or pixel (px) unit  |
| `onResizeStart` | `() => void`                   |                                       | Callback function that is called when the pane starts being resized.      |
| `onResize`      | `(size: FrValue) => void`      |                                       | Callback function that is called when the pane is actively being resized. |
| `onResizeEnd`   | `(size: FrValue) => void`      |                                       | Callback function that is called when the pane is actively being resized. |
| `children`      | `ReactNode`                    |                                       | Child elements                                                            |
| `className`     | `string`                       |                                       | Class name                                                                |
| `style`         | `CSSProperties`                |                                       | Style object                                                              |

### Splitter `(ResplitSplitterProps)`

A splitter is a draggable element that can be used to resize panes.

| Name        | Type            | Default  | Description                                  |
| ----------- | --------------- | -------- | -------------------------------------------- |
| `size`      | `${number}px`   | `"10px"` | Set the size of the splitter as a pixel unit |
| `children`  | `ReactNode`     |          | Child elements                               |
| `className` | `string`        |          | Class name                                   |
| `style`     | `CSSProperties` |          | Style object                                 |

### useResplitContext `() => ResplitContextValue`

The `useResplitContext` hook provides access to the context of the nearest `Resplit.Root` component.

See the methods below for more information on what is available.

#### setPaneSize `(paneSizes: FrValue[]) => void`

Get the collapsed state of a pane.

Specify the size of each pane as a fractional unit (fr). The number of values should match the number of panes.

```tsx
setPaneSize(['0.6fr', '0.4fr']);
```

#### getPaneCollapsed `(order: number) => boolean`

Get the collapsed state of a pane.

**Note**: The returned value will not update on every render and should be used in a callback e.g. used in combination with a pane's `onResize` callback.

```tsx
import { Resplit, useResplitContext } from 'react-resplit';

function App() {
  const { getPaneCollapsed } = useResplitContext({
    direction: 'horizontal',
  });

  const handleResize = () => {
    if (getPaneCollapsed(2)) {
      // Do something
    }
  };

  return (
    <Resplit.Root>
      <Resplit.Pane order={0} initialSize="0.5fr">
        Pane 1
      </Resplit.Pane>
      <Resplit.Splitter order={1} size="10px" />
      <Resplit.Pane order={2} initialSize="0.5fr" onResize={handleResize}>
        Pane 2
      </Resplit.Pane>
    </Resplit.Root>
  );
}
```
