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
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Templates from './pages/Templates';
import About from './pages/About';
import Contact from './pages/Contact';
import CheckoutSuccess from './pages/CheckoutSuccess';
import NotFound from './pages/NotFound';

// The development route loads on demand so it adds nothing to the live pages' bundle.
const Preview = lazy(() => import('./pages/Preview.jsx'));

/** Everything inside the router, so the shell can tell whether the route shows the field. */
function AppShell() {
  const onFieldRoute = useIsFieldRoute();
  return (
    <>
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
        <Nav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route
              path="/preview"
              element={
                <Suspense fallback={null}>
                  <Preview />
                </Suspense>
              }
            />
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
      <AppShell />
    </BrowserRouter>
  );
}
