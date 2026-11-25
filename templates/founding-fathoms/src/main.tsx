import '@fontsource/bebas-neue/400.css';
import '@fontsource-variable/source-sans-3/wght.css';
import './index.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { BreweryProvider } from './app/BreweryContext';
import { brewery } from './content/brewery';

const root = document.getElementById('root');
if (!root) throw new Error('Founding Fathoms: the #root element is missing from index.html.');

const app = (
  <StrictMode>
    <BrowserRouter>
      <BreweryProvider brewery={brewery}>
        <App />
      </BreweryProvider>
    </BrowserRouter>
  </StrictMode>
);

// Prerendered pages are hydrated; the development server starts from an empty root.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
