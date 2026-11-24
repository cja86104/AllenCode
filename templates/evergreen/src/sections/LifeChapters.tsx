import { Link } from 'react-router-dom';
import { useMemorial } from '../app/MemorialContext';
import { PhotoFigure } from '../components/PhotoFigure';
import { findPhoto } from '../lib/content';
import { SECTION_IDS } from '../lib/navigation';

/**
 * "A life, in chapters": a short introduction and edited chapters, each with a number, a year range,
 * a few paragraphs and, now and then, a photograph set outside the reading column. Chapters alternate
 * sides on wide screens so the section reads like turning pages rather than scrolling a timeline.
 */
export function LifeChapters() {
  const memorial = useMemorial();
  const { life } = memorial;
  if (life.chapters.length === 0 && life.intro.length === 0) return null;

  return (
    <section id={SECTION_IDS.life} className="section life" aria-labelledby="life-heading">
      <header className="section-head section-head--narrow">
        <p className="section-head__kicker">{memorial.person.pronouns.lifeLabel}</p>
        <h2 id="life-heading" className="section-head__title">
          {life.heading}
        </h2>
      </header>
      {life.intro.length > 0 ? (
        <div className="life__intro prose prose--lead">
          {life.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      <ol className="chapters">
        {life.chapters.map((chapter, index) => {
          const photo = findPhoto(memorial, chapter.photoId);
          const number = String(index + 1).padStart(2, '0');
          const headingId = `chapter-${chapter.id}`;
          return (
            <li
              key={chapter.id}
              className={['chapter', photo ? 'chapter--with-photo' : '', index % 2 === 1 ? 'chapter--reverse' : '']
                .filter(Boolean)
                .join(' ')}
            >
              <article aria-labelledby={headingId}>
                <header className="chapter__head">
                  <p className="chapter__number">
                    <span className="visually-hidden">Chapter </span>
                    {number}
                  </p>
                  <h3 id={headingId} className="chapter__title">
                    {chapter.title}
                  </h3>
                  {chapter.years ? <p className="chapter__years">{chapter.years}</p> : null}
                </header>
                <div className="chapter__text prose">
                  {chapter.excerpt.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {chapter.aside ? (
                    <p className="chapter__aside">
                      <span className="visually-hidden">{memorial.person.displayName} used to say: </span>“{chapter.aside}”
                    </p>
                  ) : null}
                </div>
                {photo ? <PhotoFigure className="chapter__photo" photo={photo} sizes="(min-width: 64em) 38vw, 92vw" /> : null}
              </article>
            </li>
          );
        })}
      </ol>
      <div className="life__end">
        {life.chapters.some((chapter) => chapter.body.length > chapter.excerpt.length) ? (
          <Link className="button" to="/story">
            Read {memorial.person.pronouns.possessive} full story
          </Link>
        ) : null}
        {life.attribution ? <p className="attribution">{life.attribution}</p> : null}
      </div>
    </section>
  );
}
