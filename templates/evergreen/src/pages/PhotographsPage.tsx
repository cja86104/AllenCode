import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useMemorial } from '../app/MemorialContext';
import { usePageTitle } from '../app/usePageTitle';
import { Lightbox } from '../components/Lightbox';
import { Photo } from '../components/Photo';
import { PhotoDetails } from '../components/PhotoFigure';
import { availableCollections, COLLECTION_PARAM, filterPhotos, parseCollection, photoPath, photoShape, SHAPE_ASPECT } from '../lib/photos';

/**
 * The photograph last shown in the lightbox. Kept outside the component because closing the lightbox
 * changes route, which mounts a fresh collection page; that page moves focus back to this photograph.
 */
let lastLightboxPhoto: string | undefined;

/** A per-page-load marker, so Close can step back in history only when this page opened the photograph. */
export const LIGHTBOX_SESSION = Math.random().toString(36).slice(2);

export interface LightboxState {
  lightbox: string;
}

export function isLightboxState(state: unknown): state is LightboxState {
  return typeof state === 'object' && state !== null && 'lightbox' in state && typeof (state as LightboxState).lightbox === 'string';
}

interface PhotographsPageProps {
  /** The photograph open in the lightbox, if any. */
  openId?: string;
}

/**
 * Every photograph, in date order, with filters by collection. Filters are ordinary links
 * (`?show=family`), so they work without JavaScript and can be shared. Each photograph is a link to
 * its own page; with JavaScript it opens in the lightbox instead, and closing returns focus to it.
 */
export function PhotographsPage({ openId }: PhotographsPageProps) {
  const memorial = useMemorial();
  usePageTitle('Photographs');
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const collection = parseCollection(params.get(COLLECTION_PARAM));
  const options = availableCollections(memorial.photos.items);
  const photos = filterPhotos(memorial.photos.items, collection);
  const search = collection === 'all' ? '' : `?${COLLECTION_PARAM}=${collection}`;
  const openIndex = openId ? photos.findIndex((photo) => photo.id === openId) : -1;
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (openId) {
      lastLightboxPhoto = openId;
      return;
    }
    const id = lastLightboxPhoto;
    if (!id) return;
    lastLightboxPhoto = undefined;
    const links = gridRef.current?.querySelectorAll<HTMLAnchorElement>('[data-photo-link]') ?? [];
    for (const link of links) {
      if (link.dataset.photoLink === id) link.focus();
    }
  }, [openId]);

  const close = () => {
    const state: unknown = location.state;
    if (isLightboxState(state) && state.lightbox === LIGHTBOX_SESSION) navigate(-1);
    else navigate({ pathname: '/photographs', search }, { replace: true });
  };

  const move = (index: number) => {
    const target = photos[index];
    if (!target) return;
    navigate(photoPath(target.id, search), { replace: true, state: location.state });
  };

  return (
    <div className="section photographs">
      <header className="section-head">
        <p className="photographs__back">
          <Link className="text-link" to={{ pathname: '/', hash: '#photographs' }}>
            Back to the memorial
          </Link>
        </p>
        <h1 className="section-head__title">{memorial.photos.heading}</h1>
        {memorial.photos.intro ? <p className="section-head__intro">{memorial.photos.intro}</p> : null}
      </header>

      {options.length > 2 ? (
        <nav className="filters" aria-label="Photograph collections">
          <ul className="filters__list">
            {options.map((option) => {
              const to = option.id === 'all' ? '/photographs' : `/photographs?${COLLECTION_PARAM}=${option.id}`;
              const active = option.id === collection;
              return (
                <li key={option.id}>
                  <Link className="filters__link" to={to} replace aria-current={active ? 'page' : undefined}>
                    {option.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <p className="photographs__count" role="status">
        {photos.length === 1 ? '1 photograph' : `${photos.length} photographs`}
      </p>

      {photos.length > 0 ? (
        <ul ref={gridRef} className="collection">
          {photos.map((photo) => {
            const shape = photoShape(photo);
            const captionId = `caption-${photo.id}`;
            return (
              <li key={photo.id} className={`collection__item collection__item--${shape}`}>
                <Link
                  className="collection__link"
                  to={photoPath(photo.id, search)}
                  state={{ lightbox: LIGHTBOX_SESSION } satisfies LightboxState}
                  aria-labelledby={captionId}
                  data-photo-link={photo.id}
                >
                  <span className="plate__frame">
                    <Photo photo={photo} sizes="(min-width: 64em) 30vw, (min-width: 40em) 46vw, 92vw" aspect={SHAPE_ASPECT[shape]} />
                  </span>
                </Link>
                <p className="plate__caption">
                  <span id={captionId} className="plate__text">
                    {photo.caption}
                  </span>
                  <PhotoDetails photo={photo} />
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="memories__empty">No photographs have been added yet.</p>
      )}

      {openIndex >= 0 ? <Lightbox photos={photos} index={openIndex} onClose={close} onMove={move} /> : null}
    </div>
  );
}
