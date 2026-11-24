import { useMemorial } from '../app/MemorialContext';
import { formatPartialDate } from '../lib/dates';

/**
 * The modules a family can switch on in `memorial.modules`. Each renders nothing unless it is enabled
 * and has the content it needs, so an unused module leaves no heading, gap or empty box behind.
 * The recipe module has its own section (`Recipe.tsx`).
 */

function ReadingList() {
  const module = useMemorial().modules.readingList;
  if (!module?.enabled || module.books.length === 0) return null;
  return (
    <section className="section module" aria-labelledby="reading-heading">
      <header className="section-head section-head--narrow">
        <h2 id="reading-heading" className="section-head__title">
          {module.heading}
        </h2>
        {module.intro ? <p className="section-head__intro">{module.intro}</p> : null}
      </header>
      <ul className="reading-list">
        {module.books.map((book) => (
          <li key={`${book.title}-${book.author}`} className="reading-list__item">
            <cite className="reading-list__title">{book.title}</cite>
            <span className="reading-list__author">{book.author}</span>
            {book.note ? <span className="reading-list__note">{book.note}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Letter() {
  const module = useMemorial().modules.letter;
  if (!module?.enabled || module.paragraphs.length === 0) return null;
  return (
    <section className="section module" aria-labelledby="letter-heading">
      <header className="section-head section-head--narrow">
        <h2 id="letter-heading" className="section-head__title">
          {module.heading}
        </h2>
      </header>
      <div className="letter prose">
        {module.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {module.signature ? <p className="letter__signature">{module.signature}</p> : null}
      </div>
    </section>
  );
}

function AudioMemory() {
  const module = useMemorial().modules.audio;
  // Audio is never shown without its transcript.
  if (!module?.enabled || module.transcript.length === 0 || module.src.trim() === '') return null;
  return (
    <section className="section module" aria-labelledby="audio-heading">
      <header className="section-head section-head--narrow">
        <h2 id="audio-heading" className="section-head__title">
          {module.heading}
        </h2>
        {module.speaker ? <p className="section-head__intro">{module.speaker}</p> : null}
      </header>
      <div className="audio">
        <audio className="audio__player" controls preload="none" src={module.src}>
          {module.captions ? <track kind="captions" src={module.captions} srcLang="en" label="English" default /> : null}
          <a href={module.src}>Download the recording</a>
        </audio>
        <div className="audio__transcript prose">
          <h3 className="recipe__subhead">Transcript</h3>
          {module.transcript.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Remembrance() {
  const module = useMemorial().modules.remembrance;
  const date = formatPartialDate(module?.date);
  if (!module?.enabled || !date) return null;
  return (
    <section className="section module module--compact" aria-labelledby="remembrance-heading">
      <h2 id="remembrance-heading" className="section-head__title section-head__title--small">
        {module.heading}
      </h2>
      <p className="module__date">{date}</p>
      {module.text ? <p className="module__text">{module.text}</p> : null}
    </section>
  );
}

function Donation() {
  const module = useMemorial().modules.donation;
  if (!module?.enabled || !module.link.url.startsWith('https://')) return null;
  return (
    <section className="section module module--compact" aria-labelledby="donation-heading">
      <h2 id="donation-heading" className="section-head__title section-head__title--small">
        {module.heading}
      </h2>
      <p className="module__text">{module.text}</p>
      <p>
        <a className="text-link" href={module.link.url} rel="noopener">
          {module.link.label}
        </a>
      </p>
    </section>
  );
}

function Program() {
  const module = useMemorial().modules.program;
  if (!module?.enabled || module.file.url.trim() === '') return null;
  return (
    <section className="section module module--compact" aria-labelledby="program-heading">
      <h2 id="program-heading" className="section-head__title section-head__title--small">
        {module.heading}
      </h2>
      <p>
        <a className="text-link" href={module.file.url} download>
          {module.file.label}
        </a>
        {module.description ? <span className="module__meta"> ({module.description})</span> : null}
      </p>
    </section>
  );
}

function Observances() {
  const module = useMemorial().modules.observances;
  if (!module?.enabled || module.paragraphs.length === 0) return null;
  return (
    <section className="section module" aria-labelledby="observances-heading">
      <header className="section-head section-head--narrow">
        <h2 id="observances-heading" className="section-head__title">
          {module.heading}
        </h2>
      </header>
      <div className="prose module__prose">
        {module.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

/** Modules that belong with the life story: the family letter, reading list and audio. */
export function StoryModules() {
  return (
    <>
      <Letter />
      <ReadingList />
      <AudioMemory />
    </>
  );
}

/** Practical modules that belong with the gathering: observances, programme, remembrance date, donations. */
export function PracticalModules() {
  return (
    <>
      <Observances />
      <Program />
      <Remembrance />
      <Donation />
    </>
  );
}
