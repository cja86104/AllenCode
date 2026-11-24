import '@fontsource-variable/newsreader/wght.css';
import '@fontsource-variable/newsreader/wght-italic.css';
import '@fontsource-variable/inter/wght.css';
import './styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App, ROUTER_FUTURE } from './App';
import { MemorialProvider } from './app/MemorialContext';
import { memorial } from './content/memorial';

const root = document.getElementById('root');
if (!root) throw new Error('Evergreen: the #root element is missing from index.html.');

// Lets CSS collapse the small-screen menu only once JavaScript can open it again.
document.documentElement.classList.add('js');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter future={ROUTER_FUTURE}>
      <MemorialProvider memorial={memorial}>
        <App />
      </MemorialProvider>
    </BrowserRouter>
  </StrictMode>,
);
