// @ts-check
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// The site's three fonts, served from the site in the weights it uses, Latin only (Phase 8): no
// render-blocking request to Google Fonts, which held up the first paint by about 780 ms on a phone.
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element to render into.');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);