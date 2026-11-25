import { useLocation, useParams, useSearchParams } from 'react-router';
import { useMemorial } from '../app/MemorialContext';
import { findPhoto } from '../lib/content';
import { COLLECTION_PARAM, filterPhotos, parseCollection } from '../lib/photos';
import { NotFoundPage } from './NotFoundPage';
import { isLightboxState, PhotographsPage } from './PhotographsPage';
import { PhotoStoryPage } from './PhotoStoryPage';

/**
 * `/photographs/:photoId`. Opened from the collection, the photograph shows in the lightbox over it;
 * opened any other way (a shared link, a reload, no JavaScript) it gets its own page.
 */
export function PhotoRoute() {
  const memorial = useMemorial();
  const { photoId } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const photo = findPhoto(memorial, photoId);
  if (!photo) return <NotFoundPage />;

  const inCollection = filterPhotos(memorial.photos.items, parseCollection(params.get(COLLECTION_PARAM))).some(
    (item) => item.id === photo.id,
  );
  if (isLightboxState(location.state) && inCollection) return <PhotographsPage openId={photo.id} />;
  return <PhotoStoryPage photo={photo} />;
}
