import { Link } from 'react-router';
import { useMemorial } from '../app/MemorialContext';
import { PhotoFigure } from '../components/PhotoFigure';
import { featuredPhotos } from '../lib/content';
import { SECTION_IDS } from '../lib/navigation';

/**
 * A composed selection of photographs on the main memorial. Placement follows a fixed, art-directed
 * rhythm (a wide plate, a tall one, a pair, ...) rather than a masonry wall, and each photograph is
 * cropped to its slot around its focal point.
 */
const SLOTS: { className: string; aspect: number; sizes: string }[] = [
  { className: 'moments__item--wide', aspect: 3 / 2, sizes: '(min-width: 64em) 58vw, 92vw' },
  { className: 'moments__item--tall', aspect: 4 / 5, sizes: '(min-width: 64em) 30vw, 92vw' },
  { className: 'moments__item--small', aspect: 1, sizes: '(min-width: 64em) 26vw, 92vw' },
  { className: 'moments__item--medium', aspect: 3 / 2, sizes: '(min-width: 64em) 44vw, 92vw' },
  { className: 'moments__item--tall', aspect: 4 / 5, sizes: '(min-width: 64em) 30vw, 92vw' },
  { className: 'moments__item--wide', aspect: 3 / 2, sizes: '(min-width: 64em) 58vw, 92vw' },
];

export function PhotoMoments() {
  const memorial = useMemorial();
  const photos = featuredPhotos(memorial);
  if (photos.length === 0) return null;
  const total = memorial.photos.items.length;

  return (
    <section id={SECTION_IDS.photos} className="section moments" aria-labelledby="moments-heading">
      <header className="section-head">
        <h2 id="moments-heading" className="section-head__title">
          {memorial.photos.heading}
        </h2>
        {memorial.photos.intro ? <p className="section-head__intro">{memorial.photos.intro}</p> : null}
      </header>
      <ul className="moments__grid">
        {photos.map((photo, index) => {
          const slot = SLOTS[index % SLOTS.length] ?? SLOTS[0];
          if (!slot) return null;
          return (
            <li key={photo.id} className={`moments__item ${slot.className}`}>
              <PhotoFigure photo={photo} sizes={slot.sizes} aspect={slot.aspect} />
            </li>
          );
        })}
      </ul>
      <p className="moments__count">
        <Link className="button" to="/photographs">
          {total > photos.length ? `See all ${total} photographs` : 'See the photographs with their stories'}
        </Link>
      </p>
    </section>
  );
}
