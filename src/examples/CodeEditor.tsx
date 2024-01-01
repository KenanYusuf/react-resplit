import React, { useState } from 'react';
import { Resplit, useResplitContext } from 'resplit';
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  SandpackFileExplorer,
} from '@codesandbox/sandpack-react';

const SPLITTER_CLASSES =
  'relative w-full h-full bg-zinc-600 before:absolute before:inset-0 before:bg-blue-600 before:z-10 before:bg-blue-700 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-100 before:ease-in-out data-[resplit-active=true]:before:opacity-100 focus-visible:before:opacity-100 outline-none';

const HORIZONTAL_SPLITTER_CLASSES = 'before:w-[7px] before:-left-[3px]';

// const VERTICAL_SPLITTER_CLASSES = 'before:h-[7px] before:-top-[3px]';

const appCode = `import { Resplit } from 'react-resplit';
import './style.css';

function App() {
  return (
    <Resplit.Root direction="horizontal">
      <Resplit.Pane
        className="pane"
        order="0"
        initialSize="0.5fr"
      >
        Pane 1
      </Resplit.Pane>
      <Resplit.Splitter
        className="splitter"
        order={1}
        size="10px"
      />
      <Resplit.Pane
        className="pane"
        order={2}
        initialSize="0.5fr"
      >
        Pane 2
      </Resplit.Pane>
    </Resplit.Root>
  );
};

export default App;
`;

const styleCode = `body {
  padding: 40px;
}

.pane {
  background: #eee;
  padding: 20px;
  height: 200px;
}

.splitter {
  background: #ccc;
  width: 10px;
  height: 100%;
}
`;

const PaneHeader = ({ children, id }: { children: React.ReactNode; id?: string }) => (
  <h3 className="flex gap-4 px-4 py-3" id={id}>
    {children}
  </h3>
);

const ProblemsPane = () => {
  const { isPaneMinSize, setPaneSizes } = useResplitContext();
  const [tab, setTab] = React.useState<'console' | 'problems'>('console');
  const [isMinSize, setIsMinSize] = useState(false);

  const handleResize = () => {
    if (isPaneMinSize(2)) {
      setIsMinSize(true);
    } else {
      setIsMinSize(false);
    }
  };

  return (
    <>
      <Resplit.Splitter order={1} size="48px">
        <PaneHeader>
          <button
            className={tab === 'console' ? 'underline' : ''}
            onClick={() => setTab('console')}
            onMouseDown={(e) => e.stopPropagation()}
          >
            Console
          </button>
          <button
            className={tab === 'problems' ? 'underline' : ''}
            onClick={() => setTab('problems')}
            onMouseDown={(e) => e.stopPropagation()}
          >
            Problems
          </button>
          <button
            className={`flex items-center justify-center h-6 w-6 ml-auto hover:bg-zinc-700 ${
              isMinSize ? 'transform rotate-180' : ''
            }`}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={() => {
              setPaneSizes(isMinSize ? ['0.4fr', '0.6fr'] : ['1fr', '0fr']);
              setIsMinSize(!isMinSize);
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </PaneHeader>
      </Resplit.Splitter>

      <Resplit.Pane
        order={2}
        initialSize="0.3fr"
        onResize={handleResize}
        className="relative z-10 flex flex-col bg-zinc-800"
      >
        <SandpackConsole showHeader={false} className="flex-1 overflow-auto px-2" />
      </Resplit.Pane>
    </>
  );
};

const PreviewPane = () => {
  return (
    <Resplit.Root direction="vertical" className="h-full">
      <Resplit.Pane order={0} initialSize="0.7fr" className="relative flex flex-col bg-zinc-800">
        <PaneHeader>Preview</PaneHeader>
        <SandpackPreview className="flex-1" />
      </Resplit.Pane>

      <ProblemsPane />
    </Resplit.Root>
  );
};

export const CodeEditorExample = () => {
  return (
    <SandpackProvider
      template="react-ts"
      files={{
        '/App.tsx': appCode,
        '/style.css': styleCode,
      }}
      customSetup={{
        dependencies: {
          'react-resplit': 'latest',
        },
      }}
      theme="dark"
      className="flex flex-col h-full flex-1 overflow-hidden"
      style={{
        colorScheme: 'dark', // Fixes incorrect color overrides
        pointerEvents: 'inherit', // Allows splitters to be dragged over preview iframe
      }}
    >
      <div className="flex flex-1 overflow-hidden">
        <div className="bg-zinc-800 border-r border-zinc-600">
          <button className="p-3 border-0 border-l-2 border-l-blue-500">
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <path
                d="M3.5 2C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V6H8.5C8.22386 6 8 5.77614 8 5.5V2H3.5ZM9 2.70711L11.2929 5H9V2.70711ZM2 2.5C2 1.67157 2.67157 1 3.5 1H8.5C8.63261 1 8.75979 1.05268 8.85355 1.14645L12.8536 5.14645C12.9473 5.24021 13 5.36739 13 5.5V12.5C13 13.3284 12.3284 14 11.5 14H3.5C2.67157 14 2 13.3284 2 12.5V2.5Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <Resplit.Root className="flex-1 font-mono text-sm">
          <Resplit.Pane
            order={0}
            initialSize="0.15fr"
            minSize="0.1fr"
            collapsedSize="40px"
            collapsible
            className="bg-zinc-800 overflow-hidden"
          >
            <PaneHeader id="files-pane">Files</PaneHeader>
            <SandpackFileExplorer autoHiddenFiles className="py-0" />
          </Resplit.Pane>
          <Resplit.Splitter
            order={1}
            size="1px"
            aria-labelledby="files-pane"
            className={[SPLITTER_CLASSES, HORIZONTAL_SPLITTER_CLASSES].join(' ')}
          />
          <Resplit.Pane
            order={2}
            initialSize="0.45fr"
            minSize="0.1fr"
            className="flex flex-col bg-zinc-800 overflow-hidden"
          >
            <PaneHeader id="code-pane">Code</PaneHeader>
            <div className="flex-1 overflow-auto -mt-4 -ml-1 data-[resplit-resizing=true]:opacity-5">
              <SandpackCodeEditor showTabs={false} style={{ height: '100%' }} />
            </div>
          </Resplit.Pane>
          <Resplit.Splitter
            order={3}
            size="1px"
            aria-labelledby="code-pane"
            className={[SPLITTER_CLASSES, HORIZONTAL_SPLITTER_CLASSES].join(' ')}
          />
          <Resplit.Pane order={4} initialSize="0.4fr" minSize="0.1fr">
            <PreviewPane />
          </Resplit.Pane>
        </Resplit.Root>
      </div>
      <div className="bg-zinc-800 border-t border-zinc-600 text-white p-3">
        Demonstration of how an editor can be built with{' '}
        <a href="https://github.com/KenanYusuf/react-resplit" className="underline">
          Resplit
        </a>{' '}
        and{' '}
        <a href="https://sandpack.codesandbox.io" className="underline">
          Sandpack
        </a>
      </div>
    </SandpackProvider>
  );
};
