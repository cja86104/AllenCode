import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MemorialPage } from './pages/MemorialPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PhotographsPage } from './pages/PhotographsPage';
import { PhotoRoute } from './pages/PhotoRoute';
import { StoryPage } from './pages/StoryPage';

/** Opts in to React Router 7 behaviour now, so upgrading later changes nothing. */
export const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<MemorialPage />} />
        <Route path="story" element={<StoryPage />} />
        <Route path="photographs" element={<PhotographsPage />} />
        <Route path="photographs/:photoId" element={<PhotoRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
