import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { GalleryPage } from './pages/GalleryPage';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ReservationsPage } from './pages/ReservationsPage';

/** Opts in to React Router 7 behaviour now, so upgrading later changes nothing. */
export const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
