import { useEffect, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { useMemorial } from '../app/MemorialContext';
import { usePageTitle } from '../app/usePageTitle';
import { PhotoFigure } from '../components/PhotoFigure';
import { findPhoto } from '../lib/content';
import { SECTION_IDS } from '../lib/navigation';
import { StoryModules } from '../sections/OptionalModules';

/**
 * A thin line along the top of the page showing how far through the story the reader is. Purely
 * visual (screen readers have the chapter list), and it simply stays put when motion is reduced.
 */
function ReadingProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = target.current;
      const bar = barRef.current;
      if (!element || !bar) return;
      const rect = element.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / total));
      bar.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [target]);
  return (
    <div className="reading-progress" aria-hidden="true">
      <div ref={barRef} className="reading-progress__bar" />
    </div>
  );
}

/** Which chapter is currently being read, for the chapter list. */
function useCurrentChapter(ids: string[]): string | undefined {
  const [current, setCurrent] = useState<string | undefined>(ids[0]);
  const key = ids.join('|');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const elements = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) setCurrent(first.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [key]);
  return current;
}

/** The full life story, set for reading: comfortable measure, chapter list, and a clean printed copy. */
export function StoryPage() {
  const memorial = useMemorial();
  const { life, person } = memorial;
  usePageTitle(person.pronouns.lifeLabel);
  const articleRef = useRef<HTMLElement>(null);
  const chapterIds = life.chapters.map((chapter) => `story-${chapter.id}`);
  const current = useCurrentChapter(chapterIds);

  return (
    <div className="story">
      <ReadingProgress target={articleRef} />
      <p className="story__back">
        <Link className="text-link" to={{ pathname: '/', hash: `#${SECTION_IDS.life}` }}>
          Back to the memorial
        </Link>
      </p>

      <article ref={articleRef} className="story__article" aria-labelledby="story-title">
        <header className="story__head">
          <p className="section-head__kicker">{person.pronouns.lifeLabel}</p>
          <h1 id="story-title" className="story__title">
            {life.heading}
          </h1>
          <p className="story__subject">{person.fullName}</p>
          {life.intro.length > 0 ? (
            <div className="prose prose--lead story__intro">
              {life.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
          {life.attribution ? <p className="attribution story__attribution">{life.attribution}</p> : null}
        </header>

        <div className="story__layout">
          {life.chapters.length > 1 ? (
            <nav className="story__toc" aria-label="Chapters">
              <p className="story__toc-label" aria-hidden="true">
                Chapters
              </p>
              <ol className="story__toc-list">
                {life.chapters.map((chapter, index) => {
                  const id = `story-${chapter.id}`;
                  return (
                    <li key={chapter.id}>
                      <a className="story__toc-link" href={`#${id}`} aria-current={current === id ? 'location' : undefined}>
                        <span className="story__toc-number" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {chapter.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}

          <div className="story__chapters">
            {life.chapters.map((chapter, index) => {
              const photo = findPhoto(memorial, chapter.photoId);
              const paragraphs = chapter.body.length > 0 ? chapter.body : chapter.excerpt;
              const id = `story-${chapter.id}`;
              return (
                <section key={chapter.id} id={id} className="story-chapter" aria-labelledby={`${id}-title`}>
                  <header className="chapter__head">
                    <p className="chapter__number">
                      <span className="visually-hidden">Chapter </span>
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h2 id={`${id}-title`} className="chapter__title">
                      {chapter.title}
                    </h2>
                    {chapter.years ? <p className="chapter__years">{chapter.years}</p> : null}
                  </header>
                  <div className="prose story-chapter__text">
                    {paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={`${paragraphIndex}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                    ))}
                    {chapter.aside ? (
                      <p className="chapter__aside">
                        <span className="visually-hidden">{person.displayName} used to say: </span>“{chapter.aside}”
                      </p>
                    ) : null}
                  </div>
                  {photo ? <PhotoFigure className="story-chapter__photo" photo={photo} sizes="(min-width: 64em) 44rem, 92vw" /> : null}
                </section>
              );
            })}
          </div>
        </div>
      </article>

      <StoryModules />

      <p className="story__end">
        <Link className="button" to="/">
          Return to the memorial
        </Link>
      </p>
    </div>
  );
}
