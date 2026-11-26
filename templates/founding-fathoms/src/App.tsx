import { Route, Routes } from 'react-router';
import { CartProvider } from './app/CartContext';
import { Layout } from './components/Layout';
import { BeerPage } from './pages/BeerPage';
import { ContactPage } from './pages/ContactPage';
import { FindUsPage } from './pages/FindUsPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ShopPage } from './pages/ShopPage';
import { StoryPage } from './pages/StoryPage';
import { TaproomPage } from './pages/TaproomPage';

export function App() {
  return (
    <CartProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="beer" element={<BeerPage />} />
          <Route path="taproom" element={<TaproomPage />} />
          <Route path="story" element={<StoryPage />} />
          <Route path="find-us" element={<FindUsPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}
