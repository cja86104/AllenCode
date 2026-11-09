// @ts-check

/**
 * Source for the gate: this site's entry point, the file everything starts from.
 * @type {import('./index.js').Excerpt}
 */
const gate = {
  id: 'gate',
  file: 'main.jsx',
  repo: 'cja86104/AllenCode',
  path: 'src/main.jsx',
  lines: [1, 10],
  commit: '43ddef625d7d8d41d7c61126c10dc8c1c12c9cb0',
  code: [
    "import React from 'react';",
    "import ReactDOM from 'react-dom/client';",
    "import App from './App.jsx';",
    "import './index.css';",
    '',
    "ReactDOM.createRoot(document.getElementById('root')).render(",
    '  <React.StrictMode>',
    '    <App />',
    '  </React.StrictMode>',
    ');',
  ].join('\n'),
  becomes: 'the headline that welcomes you to Allen Code Co',
  approved: { by: 'Chris', on: '2026-11-08' },
};

export default gate;
