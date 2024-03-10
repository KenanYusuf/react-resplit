import { useState } from 'react';
import { FrValue, Resplit, ResplitPaneProps, useResplitContext } from 'resplit';

export const SizeAwarePane = (props: ResplitPaneProps) => {
  const { isPaneCollapsed, isPaneMinSize } = useResplitContext();
  const [size, setSize] = useState('0.5fr');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinSize, setIsMinSize] = useState(false);

  const handleResize = (size: FrValue) => {
    setSize(size);
    setIsCollapsed(isPaneCollapsed(props.order));
    setIsMinSize(isPaneMinSize(props.order));
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
      </ul>
    </Resplit.Pane>
  );
};

export const ContextExample = () => {
  return (
    <Resplit.Root className="h-full">
      <SizeAwarePane order={0} />
      <Resplit.Splitter order={1} size="5px" className="bg-white" />
      <SizeAwarePane order={2} />
    </Resplit.Root>
  );
};
