import type { Photo as PhotoData } from '../content/types';
import { formatPartialDate, partialDateTimeValue } from '../lib/dates';
import { Photo } from './Photo';

interface PhotoFigureProps {
  photo: PhotoData;
  sizes: string;
  priority?: boolean;
  aspect?: number;
  className?: string;
  /** Show date, place and contributor under the caption. */
  showDetails?: boolean;
}

/** The line under a caption: "Summer, around 1982 · Edgewood Road, Asheville · Shared by Ruth". */
export function PhotoDetails({ photo }: { photo: PhotoData }) {
  const date = formatPartialDate(photo.date);
  const dateTime = partialDateTimeValue(photo.date);
  const parts = [
    date ? (
      <time key="date" dateTime={dateTime}>
        {date}
      </time>
    ) : null,
    photo.location ? <span key="place">{photo.location}</span> : null,
    photo.contributor ? <span key="by">Shared by {photo.contributor}</span> : null,
  ].filter((part) => part !== null);
  if (parts.length === 0) return null;
  return (
    <span className="photo-details">
      {parts.map((part, index) => (
        <span key={index} className="photo-details__item">
          {part}
        </span>
      ))}
    </span>
  );
}

/** A photograph with its caption, set like a captioned plate in a book. */
export function PhotoFigure({ photo, sizes, priority, aspect, className, showDetails = true }: PhotoFigureProps) {
  return (
    <figure className={['plate', className].filter(Boolean).join(' ')}>
      <div className="plate__frame">
        <Photo photo={photo} sizes={sizes} priority={priority} aspect={aspect} />
      </div>
      <figcaption className="plate__caption">
        <span className="plate__text">{photo.caption}</span>
        {showDetails ? <PhotoDetails photo={photo} /> : null}
      </figcaption>
    </figure>
  );
}
