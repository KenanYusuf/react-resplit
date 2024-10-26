import { useState } from 'react';
import { FrValue, Resplit, ResplitPaneProps, useResplitContext } from 'resplit';

export const SizeAwarePane = (props: ResplitPaneProps) => {
  const { isPaneCollapsed, isPaneMinSize, setPaneSizes } = useResplitContext();
  const [size, setSize] = useState('0.5fr');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinSize, setIsMinSize] = useState(false);

  const handleResize = (newSize: FrValue) => {
    setSize(newSize);
    setIsCollapsed(isPaneCollapsed(props.order));
    setIsMinSize(isPaneMinSize(props.order));
  };

  const resetPanes = () => {
    setPaneSizes(['0.5fr', '0.5fr']);
  };

  return (
    <Resplit.Pane
      {...props}
      className="p-6"
      initialSize="0.5fr"
      minSize="0.3fr"
      collapsedSize="0.2fr"
      collapsible
      onResize={handleResize}
    >
      <ul>
        <li>size: {size}</li>
        <li>isMinSize: {isMinSize.toString()}</li>
        <li>isCollapsed: {isCollapsed.toString()}</li>
        <li>
          <button
            className="py-1 px-2 mt-2 bg-neutral-600 hover:bg-neutral-700"
            onClick={resetPanes}
          >
            Reset
          </button>
        </li>
      </ul>
    </Resplit.Pane>
  );
};

export const ContextExample = () => {
  return (
    <Resplit.Root className="h-full">
      <SizeAwarePane order={0} />
      <Resplit.Splitter order={1} size="10px" className="bg-neutral-600" />
      <SizeAwarePane order={2} />
    </Resplit.Root>
  );
};
