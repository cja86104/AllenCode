import '@fontsource-variable/playfair-display/wght.css';
import '@fontsource-variable/playfair-display/wght-italic.css';
import '@fontsource-variable/inter/wght.css';
import './index.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App, ROUTER_FUTURE } from './App';
import { RestaurantProvider } from './app/RestaurantContext';
import { restaurant } from './content/restaurant';

const root = document.getElementById('root');
if (!root) throw new Error('Copper Thistle: the #root element is missing from index.html.');

const app = (
  <StrictMode>
    <BrowserRouter future={ROUTER_FUTURE}>
      <RestaurantProvider restaurant={restaurant}>
        <App />
      </RestaurantProvider>
    </BrowserRouter>
  </StrictMode>
);

// Prerendered pages are hydrated; the development server starts from an empty root.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
