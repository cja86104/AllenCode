// @ts-check
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Noise from './components/Noise';
import CustomCursor from './components/CustomCursor';
import FieldLayer, { useIsFieldRoute } from './field/FieldLayer.jsx';
import DoorProvider from './door/DoorProvider.jsx';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Templates from './pages/Templates';
import About from './pages/About';
import Contact from './pages/Contact';
import CheckoutSuccess from './pages/CheckoutSuccess';
import NotFound from './pages/NotFound';

// The home page is the Source to Screen experience. It loads on demand so its scenes and excerpts
// add nothing to the bundle the inner pages download (spec section 9).
const Home = lazy(() => import('./pages/Home.jsx'));

/** Everything inside the router, so the shell can tell whether the route shows the field. */
function AppShell() {
  const onFieldRoute = useIsFieldRoute();
  return (
    <>
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
      <FieldLayer />
      {/* Field routes clear the shell background so the fixed field behind it shows through, and use
          overflow-x: clip, because overflow-x: hidden makes the shell a scroll container and breaks
          position: sticky in the chapters. Regular routes keep their original classes. */}
      <div
        className={`relative flex min-h-screen flex-col ${
          onFieldRoute ? 'overflow-x-clip' : 'overflow-x-hidden bg-[#0a0a0a]'
        }`}
      >
        <Nav overlay={onFieldRoute} />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={null}>
                  <Home />
                </Suspense>
              }
            />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Analytics />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DoorProvider>
        <AppShell />
      </DoorProvider>
    </BrowserRouter>
  );
}
