import { ReactNode } from 'react';
import { ResplitProvider, useResplit, useResplitContext } from 'resplit';

const SecondPane = ({ children }: { children: ReactNode }) => {
  const { getPaneProps } = useResplitContext();

  return (
    <div
      {...getPaneProps(2, { initialSize: '0.5fr', minSize: '0.1fr' })}
      className="flex items-center justify-center overflow-auto"
    >
      {children}
    </div>
  );
};

export const NestedLayout = () => {
  const resplitMethods = useResplit({ direction: 'vertical' });
  const { getContainerProps, getSplitterProps, getPaneProps } = resplitMethods;

  return (
    <ResplitProvider value={resplitMethods}>
      <div {...getContainerProps()} className="w-full h-full">
        <div
          {...getPaneProps(0, { initialSize: '0.5fr', minSize: '0.1fr' })}
          className="flex items-center justify-center"
        >
          First pane
        </div>
        <div {...getSplitterProps(1, { size: '6px' })} className="w-full h-full bg-zinc-700" />
        <SecondPane>Second pane, nested in first, and using `getPaneProps` from context</SecondPane>
      </div>
    </ResplitProvider>
  );
};

export const ContextExample = () => {
  const resplitMethods = useResplit({ direction: 'horizontal' });
  const { getContainerProps, getSplitterProps, getPaneProps } = resplitMethods;

  return (
    <div className="flex-1 text-center">
      <ResplitProvider value={resplitMethods}>
        <div {...getContainerProps()} className="w-full h-full">
          <div {...getPaneProps(0, { initialSize: '0.5fr', minSize: '0.1fr' })} className="h-full">
            <NestedLayout />
          </div>
          <div {...getSplitterProps(1, { size: '6px' })} className="w-full h-full bg-zinc-700" />
          <SecondPane>Second pane, using `getPaneProps` from context</SecondPane>
        </div>
      </ResplitProvider>
    </div>
  );
};
