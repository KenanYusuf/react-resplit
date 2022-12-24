import React, { useState } from 'react';
import { CodeEditorExample } from './examples/CodeEditor';
import { ImageCompareExample } from './examples/ImageCompare';
import { ContextExample } from './examples/Context';

const examples = [
  {
    name: 'Code Editor',
    component: CodeEditorExample,
  },
  {
    name: 'Image Compare',
    component: ImageCompareExample,
  },
  {
    name: 'Context',
    component: ContextExample,
  },
];

function App() {
  const [example, setExample] = useState(examples[0]);

  return (
    <div className="flex flex-col h-screen text-white bg-zinc-800">
      <header className="flex items-center justify-between gap-2 py-3 px-4 bg-zinc-700 border-b border-zinc-600">
        <h1 className="font-semibold text-md">Resplit Playground</h1>
        <nav>
          <ul className="flex gap-2">
            {examples.map((ex) => (
              <li key={ex.name}>
                <button
                  className={`text-sm ${example.name === ex.name ? 'underline' : ''}`}
                  onClick={() => setExample(ex)}
                >
                  {ex.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <example.component />
    </div>
  );
}

export default App;
