// @ts-check
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import Gate from '../scenes/Gate.jsx';
import Fork from '../door/Fork.jsx';
import { useDoor } from '../door/DoorProvider.jsx';
import ServiceChapters from '../scenes/ServiceChapters.jsx';
import ProductChapters from '../scenes/ProductChapter.jsx';
import DoorBIntro from '../scenes/DoorBIntro.jsx';
import TemplateChapter from '../scenes/TemplateChapter.jsx';
import { excerpts } from '../content/excerpts/index.js';

/**
 * Development route for the Source to Screen redesign: unlinked, noindex and disallowed in
 * robots.txt. Chapters are assembled here as they are built; BLUEPRINT Task 6.4 replaces it with the
 * new home page.
 */
export default function Preview() {
  usePageMeta('Preview (not public) | Allen Code Co.', 'Development route for the Source to Screen redesign.', {
    noindex: true,
  });
  const drafts = Object.values(excerpts).filter((excerpt) => !excerpt.approved);
  const { door } = useDoor();

  return (
    <>
      <Gate includeDrafts />

      <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-16 lg:px-10 lg:py-20">
        <Fork />
      </section>

      {door === 'a' && (
        <>
          <ServiceChapters includeDrafts />
          <ProductChapters includeDrafts />
        </>
      )}
      {door === 'b' && (
        <>
          <DoorBIntro includeDrafts />
          <TemplateChapter includeDrafts />
        </>
      )}

      <footer className="relative z-10 mx-auto max-w-4xl px-6 pb-16 lg:px-10">
        <p className="mono text-[10px] uppercase tracking-[0.3em] text-white/40">Preview (not public)</p>
        {drafts.length > 0 && (
          <p className="mono mt-3 text-xs text-white/50">
            Draft excerpts awaiting approval: {drafts.map((excerpt) => excerpt.file).join(', ')}
          </p>
        )}
        <Link
          to="/"
          className="mono mt-6 inline-flex w-fit text-xs uppercase tracking-widest text-white/70 hover:text-ember"
        >
          Back to the site
        </Link>
      </footer>
    </>
  );
}
