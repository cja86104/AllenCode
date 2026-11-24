import { useMemorial } from '../app/MemorialContext';
import { Photo } from '../components/Photo';
import { Drawing } from '../drawings/Drawing';
import { findPhoto } from '../lib/content';
import { SECTION_IDS } from '../lib/navigation';

/**
 * A small collection of ordinary objects and the stories attached to them. Each story opens in place
 * with a native disclosure, so it works with a keyboard, a screen reader, a touch screen, and without
 * JavaScript. Nothing is revealed only on hover.
 */
export function RememberedThings() {
  const memorial = useMemorial();
  const { heading, intro, items } = memorial.objects;
  if (items.length === 0) return null;

  return (
    <section id={SECTION_IDS.objects} className="section things" aria-labelledby="things-heading">
      <header className="section-head section-head--narrow">
        <h2 id="things-heading" className="section-head__title">
          {heading}
        </h2>
        {intro ? <p className="section-head__intro">{intro}</p> : null}
      </header>
      <ul className="things__list">
        {items.map((item, index) => {
          const photo = findPhoto(memorial, item.photoId);
          return (
            <li key={item.id} className="thing">
              <p className="thing__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </p>
              <div className="thing__art">
                {photo ? (
                  <Photo photo={photo} sizes="(min-width: 48em) 20vw, 40vw" aspect={1} />
                ) : item.drawing ? (
                  <Drawing name={item.drawing} />
                ) : null}
              </div>
              <h3 className="thing__name">{item.name}</h3>
              <p className="thing__summary">{item.summary}</p>
              <details className="disclosure thing__story">
                <summary className="disclosure__summary">
                  <span>Read the story</span>
                  <span className="visually-hidden"> of {item.name.replace(/^The /, 'the ')}</span>
                </summary>
                <div className="disclosure__body prose">
                  {item.story.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {item.attribution ? <p className="attribution">Remembered by {item.attribution}</p> : null}
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
