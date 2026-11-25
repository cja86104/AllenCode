import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { BeerPage } from './pages/BeerPage';
import { ContactPage } from './pages/ContactPage';
import { FindUsPage } from './pages/FindUsPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { StoryPage } from './pages/StoryPage';
import { TaproomPage } from './pages/TaproomPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="beer" element={<BeerPage />} />
        <Route path="taproom" element={<TaproomPage />} />
        <Route path="story" element={<StoryPage />} />
        <Route path="find-us" element={<FindUsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
