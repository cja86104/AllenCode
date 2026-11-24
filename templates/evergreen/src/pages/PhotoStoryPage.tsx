import { Link } from 'react-router-dom';
import { useMemorial } from '../app/MemorialContext';
import { usePageTitle } from '../app/usePageTitle';
import { Photo } from '../components/Photo';
import type { Photo as PhotoData } from '../content/types';
import { formatPartialDate, partialDateTimeValue } from '../lib/dates';
import { chronological, photoPath } from '../lib/photos';

/**
 * One photograph on its own page: the address a shared link opens, and the version a visitor gets
 * without JavaScript. Shows the photograph whole, its caption, what is known about it, and its story.
 */
export function PhotoStoryPage({ photo }: { photo: PhotoData }) {
  const memorial = useMemorial();
  usePageTitle(photo.caption);
  const ordered = chronological(memorial.photos.items);
  const index = ordered.findIndex((item) => item.id === photo.id);
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined;
  const date = formatPartialDate(photo.date);

  return (
    <article className="section photo-story" aria-labelledby="photo-story-title">
      <p className="photo-story__back">
        <Link className="text-link" to="/photographs">
          All photographs
        </Link>
      </p>
      <div className="photo-story__layout">
        <div className="photo-story__image">
          <Photo photo={photo} priority sizes="(min-width: 64em) 60vw, 92vw" />
        </div>
        <div className="photo-story__text">
          <h1 id="photo-story-title" className="photo-story__caption">
            {photo.caption}
          </h1>
          <dl className="details">
            {date ? (
              <div className="details__row">
                <dt>When</dt>
                <dd>
                  <time dateTime={partialDateTimeValue(photo.date)}>{date}</time>
                </dd>
              </div>
            ) : null}
            {photo.location ? (
              <div className="details__row">
                <dt>Where</dt>
                <dd>{photo.location}</dd>
              </div>
            ) : null}
            {photo.contributor ? (
              <div className="details__row">
                <dt>Shared by</dt>
                <dd>{photo.contributor}</dd>
              </div>
            ) : null}
          </dl>
          {photo.story && photo.story.length > 0 ? (
            <div className="prose photo-story__story">
              {photo.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
          <nav className="photo-story__nav" aria-label="Other photographs">
            {previous ? (
              <Link className="text-link" to={photoPath(previous.id)}>
                Previous: {previous.caption}
              </Link>
            ) : null}
            {next ? (
              <Link className="text-link" to={photoPath(next.id)}>
                Next: {next.caption}
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </article>
  );
}
