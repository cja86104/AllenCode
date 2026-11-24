import { Link } from 'react-router-dom';
import { useMemorial } from '../app/MemorialContext';
import { PhotoFigure } from '../components/PhotoFigure';
import type { Memory } from '../content/types';
import { findPhoto } from '../lib/content';
import { isLongMemory, orderMemories } from '../lib/memories';
import { SECTION_IDS } from '../lib/navigation';

function Byline({ memory }: { memory: Memory }) {
  return (
    <p className="memory__byline">
      <span className="memory__author">{memory.author}</span>
      {memory.relationship ? <span className="memory__relationship">, {memory.relationship}</span> : null}
    </p>
  );
}

/**
 * One memory. Text is rendered as plain React text, never as HTML. A long memory shows its opening
 * paragraph and opens the rest in place, so the reader keeps their position on the page.
 */
function MemoryEntry({ memory }: { memory: Memory }) {
  const memorial = useMemorial();
  const photo = findPhoto(memorial, memory.photoId);
  const long = isLongMemory(memory);
  const [first, ...rest] = memory.text;
  const quoteClass = long ? 'memory__text prose' : 'memory__text memory__text--short';

  return (
    <article className={['memory', memory.pinned ? 'memory--pinned' : '', long ? 'memory--long' : ''].filter(Boolean).join(' ')}>
      {memory.pinned ? <p className="memory__pin">Pinned by the family</p> : null}
      <blockquote className={quoteClass}>
        {first !== undefined ? <p>{first}</p> : null}
        {long && rest.length > 0 ? (
          <details className="disclosure">
            <summary className="disclosure__summary">
              <span>Keep reading</span>
              <span className="visually-hidden"> {memory.author}’s memory</span>
            </summary>
            <div className="disclosure__body">
              {rest.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </details>
        ) : null}
      </blockquote>
      {photo ? <PhotoFigure photo={photo} sizes="(min-width: 64em) 30vw, 92vw" showDetails={false} /> : null}
      <Byline memory={memory} />
    </article>
  );
}

export function Memories() {
  const memorial = useMemorial();
  const { heading, intro, items } = memorial.memories;
  const accepting = memorial.privacy.acceptMemories;
  if (items.length === 0 && !accepting) return null;
  const ordered = orderMemories(items);

  return (
    <section id={SECTION_IDS.memories} className="section memories" aria-labelledby="memories-heading">
      <header className="section-head section-head--narrow">
        <h2 id="memories-heading" className="section-head__title">
          {heading}
        </h2>
        {intro && items.length > 0 ? <p className="section-head__intro">{intro}</p> : null}
      </header>
      {ordered.length > 0 ? (
        <ul className="memories__list">
          {ordered.map((memory) => (
            <li key={memory.id} className="memories__item">
              <MemoryEntry memory={memory} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="memories__empty">No memories have been shared here yet.</p>
      )}
      {accepting ? (
        <p className="memories__share">
          <Link className="button" to="/share">
            Share a memory
          </Link>
        </p>
      ) : null}
    </section>
  );
}
