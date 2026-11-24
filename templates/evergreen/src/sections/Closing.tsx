import { useMemorial } from '../app/MemorialContext';
import { Photo } from '../components/Photo';
import { Drawing } from '../drawings/Drawing';
import { findPhoto } from '../lib/content';

/** Splits a note into sentences so each can sit on its own line instead of breaking mid-thought. */
function sentences(text: string): string[] {
  return text.split(/(?<=[.!?”])\s+(?=[A-Z“])/).filter((sentence) => sentence.trim() !== '');
}

/** The last spread: a spacious photograph and a short note from the family. No call to action. */
export function Closing() {
  const memorial = useMemorial();
  const { closing } = memorial;
  const photo = findPhoto(memorial, closing.photoId);

  return (
    <section className="closing" aria-label="A note from the family">
      {photo ? (
        <figure className="closing__photo">
          <Photo photo={photo} sizes="100vw" aspect={16 / 9} />
          <figcaption className="plate__caption closing__caption">
            <span className="plate__text">{photo.caption}</span>
          </figcaption>
        </figure>
      ) : null}
      <div className="closing__note">
        <Drawing name="sprig" className="closing__sprig" />
        <p className="closing__text">
          {sentences(closing.note).map((sentence, index) => (
            <span key={`${index}-${sentence}`} className="closing__sentence">
              {index > 0 ? ' ' : ''}
              {sentence}
            </span>
          ))}
        </p>
        {closing.signature ? <p className="closing__signature">{closing.signature}</p> : null}
      </div>
    </section>
  );
}
