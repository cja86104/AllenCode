import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { MemorialPage } from './pages/MemorialPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PhotographsPage } from './pages/PhotographsPage';
import { PhotoRoute } from './pages/PhotoRoute';
import { FamilyAccessPage } from './pages/FamilyAccessPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SharePage } from './pages/SharePage';
import { StoryPage } from './pages/StoryPage';

// The family-area demonstration (and its unpublished demonstration memories) loads only when visited.
const FamilyPreviewPage = lazy(() => import('./pages/FamilyPreviewPage').then((module) => ({ default: module.FamilyPreviewPage })));

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<MemorialPage />} />
        <Route path="story" element={<StoryPage />} />
        <Route path="photographs" element={<PhotographsPage />} />
        <Route path="photographs/:photoId" element={<PhotoRoute />} />
        <Route path="share" element={<SharePage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="family" element={<FamilyAccessPage />} />
        <Route
          path="family/preview"
          element={
            <Suspense fallback={<p className="section">Opening the family area…</p>}>
              <FamilyPreviewPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
