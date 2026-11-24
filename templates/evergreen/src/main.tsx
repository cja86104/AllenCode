import '@fontsource-variable/newsreader/wght.css';
import '@fontsource-variable/newsreader/wght-italic.css';
import '@fontsource-variable/inter/wght.css';
import './styles/index.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App, ROUTER_FUTURE } from './App';
import { MemorialProvider } from './app/MemorialContext';
import { memorial } from './content/memorial';

const root = document.getElementById('root');
if (!root) throw new Error('Evergreen: the #root element is missing from index.html.');

// Lets CSS collapse the small-screen menu only once JavaScript can open it again.
document.documentElement.classList.add('js');

// A prerendered page records when it was rendered, so the first browser render matches it exactly
// (for example, whether the gathering is still to come) before the page catches up to the present.
const renderedAt = Number(root.dataset.renderedAt);

const app = (
  <StrictMode>
    <BrowserRouter future={ROUTER_FUTURE}>
      <MemorialProvider memorial={memorial} renderedAt={Number.isFinite(renderedAt) ? renderedAt : undefined}>
        <App />
      </MemorialProvider>
    </BrowserRouter>
  </StrictMode>
);

if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
