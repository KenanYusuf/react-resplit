import { useResplit } from 'resplit';

const PANE_CLASSES = 'relative w-full h-full';

const IMG_CLASSES = 'absolute w-full h-full object-cover pointer-events-none select-none';

const IMG_URL =
  'https://images.unsplash.com/photo-1669837238989-fe14dd4eb7a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3MTAyODg3Mg&ixlib=rb-4.0.3&q=80&w=1080';

const ChevronLeft = () => (
  <svg className="w-6 h-6 fill-white" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-6 h-6 fill-white" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" />
  </svg>
);

export const ImageCompareExample = () => {
  const resplitMethods = useResplit();
  const { getContainerProps, getSplitterProps, getPaneProps } = resplitMethods;

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div {...getContainerProps()} className="max-w-[720px] w-full aspect-[3/2]">
        <div {...getPaneProps(0, { initialSize: '0.5fr' })} className={PANE_CLASSES}>
          <img src={IMG_URL} alt="Sunflowers" className={[IMG_CLASSES, 'object-left'].join(' ')} />
        </div>
        <div {...getSplitterProps(1, { size: '4px' })} className="relative w-full h-full bg-zinc-900">
          <div className="absolute z-10 top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-full">
            <ChevronLeft />
            <ChevronRight />
          </div>
        </div>
        <div {...getPaneProps(2, { initialSize: '0.5fr' })} className={PANE_CLASSES}>
          <img
            src={IMG_URL}
            alt="Sunflowers with grayscale filter applied"
            className={[IMG_CLASSES, 'object-right grayscale'].join(' ')}
          />
        </div>
      </div>
    </div>
  );
};
