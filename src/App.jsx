// @ts-check
import { lazy, Suspense, useState } from 'react';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Noise from './components/Noise';
import CustomCursor from './components/CustomCursor';
import FieldLayer from './field/FieldLayer.jsx';
import DoorProvider from './door/DoorProvider.jsx';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Templates from './pages/Templates';
import About from './pages/About';
import Contact from './pages/Contact';
import CheckoutSuccess from './pages/CheckoutSuccess';
import NotFound from './pages/NotFound';
import RouteError from './pages/RouteError.jsx';
import { useWorldHome } from './world/worldSwitch.js';

// The home page is the Source to Screen experience. It loads on demand so its scenes and excerpts
// add nothing to the bundle the inner pages download (spec section 9).
const Home = lazy(() => import('./pages/Home.jsx'));

// The Code world prototype (docs/superpowers/plans/2026-11-10-code-world-prototype.md): unlinked,
// noindex, outside the site's shell, and in its own chunk, so the site never downloads it.
const WorldLab = lazy(() => import('./pages/WorldLab.jsx'));
// The Code World on the home page behind `/?world=1` (Code World W1.3), loaded only when switched on.
const WorldLayer = lazy(() => import('./world/WorldLayer.jsx'));

/**
 * The frame every page shares: the skip link, the code field behind everything (Chris, 2026-11-09:
 * on every page, not only the home page), the nav over the page, and the footer.
 */
function AppShell() {
  const world = useWorldHome();
  return (
    <DoorProvider>
      {/* The first thing a keyboard reaches: straight past the nav and the pinned scenes' chrome. */}
      <a
        href="#main"
        data-skip-link
        className="sr-only z-[60] rounded-full bg-ember px-5 py-2 mono text-xs uppercase tracking-widest text-night focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Noise />
      <CustomCursor />
      {world ? (
        <Suspense fallback={null}>
          <WorldLayer />
        </Suspense>
      ) : (
        <FieldLayer />
      )}
      {/* The shell is clear so the fixed field behind it shows through, and uses overflow-x: clip,
          because overflow-x: hidden makes the shell a scroll container and breaks position: sticky
          in the pinned chapters. */}
      <div className="relative flex min-h-screen flex-col overflow-x-clip">
        <Nav overlay />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Analytics />
    </DoorProvider>
  );
}

/**
 * Every route the site serves, unchanged by the move to the data router. `HomePage` is the home
 * page's component: the browser passes the lazily loaded one (below); the build's server render
 * passes it imported directly (src/entry-server.jsx), so the page renders in one synchronous pass.
 * Both sit in the same Suspense boundary, so the HTML matches what the browser hydrates.
 * @param {import('react').ComponentType} HomePage
 */
export function createRoutes(HomePage) {
  return [
    {
      element: <AppShell />,
      errorElement: <RouteError />,
      children: [
        {
          path: '/',
          element: (
            // A screen's height while the home page's code arrives, so the footer never paints at the
            // top and then jumps down (measured: CLS 0.59 on desktop before this).
            <Suspense fallback={<div aria-hidden="true" className="min-h-screen" />}>
              <HomePage />
            </Suspense>
          ),
        },
        { path: '/products', element: <Products /> },
        { path: '/products/:slug', element: <ProductDetail /> },
        { path: '/services', element: <Services /> },
        { path: '/templates', element: <Templates /> },
        { path: '/about', element: <About /> },
        { path: '/contact', element: <Contact /> },
        { path: '/checkout-success', element: <CheckoutSuccess /> },
        { path: '*', element: <NotFound /> },
      ],
    },
    {
      path: '/lab/world',
      errorElement: <RouteError />,
      element: (
        <Suspense fallback={<div aria-hidden="true" className="min-h-screen bg-night" />}>
          <WorldLab />
        </Suspense>
      ),
    },
  ];
}

/** The routes the browser runs, with the home page loaded on demand. */
export const routes = createRoutes(Home);

export default function App() {
  // Created on first render, so the router starts from the address the page opened at.
  const [router] = useState(() => createBrowserRouter(routes));
  return <RouterProvider router={router} />;
}
