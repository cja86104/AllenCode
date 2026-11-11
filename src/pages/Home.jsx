// @ts-check
import usePageMeta from '../hooks/usePageMeta.js';
import Gate from '../scenes/Gate.jsx';
import Fork from '../door/Fork.jsx';
import { useDoor } from '../door/DoorProvider.jsx';
import ServiceChapters from '../scenes/ServiceChapters.jsx';
import ProductChapters from '../scenes/ProductChapter.jsx';
import HowIWork from '../components/HowIWork.jsx';
import DoorBIntro from '../scenes/DoorBIntro.jsx';
import TemplateChapter from '../scenes/TemplateChapter.jsx';
import DoneForYou from '../scenes/DoneForYou.jsx';
import Builder from '../scenes/Builder.jsx';
import IdeaSketch from '../scenes/IdeaSketch.jsx';
import BriefChapter from '../scenes/BriefChapter.jsx';
import WorldJourney from '../scenes/WorldJourney.jsx';
import { useWorldHome } from '../world/worldSwitch.js';

/**
 * The home page: the Source to Screen experience (spec section 4). The shared opening and the fork;
 * once a door is chosen, its chapters, then the builder, the visitor's idea and the brief, which both
 * doors share. Before a choice the page ends at the fork (Chris, 2026-11-09), so the opening stays
 * focused. Only approved excerpts are shown here.
 */
export default function Home() {
  usePageMeta(
    'Allen Code Co. — Custom Software, Web Design & AI for Real Businesses',
    'Custom development, web design, UI/UX, and AI integration — built around your business. Tailored work for small business owners and founders.',
  );
  const { door } = useDoor();
  // The Code World journey replaces the gate and the fork behind `/?world=1` (Code World W1.3).
  const world = useWorldHome();

  return (
    <>
      {world ? (
        <WorldJourney />
      ) : (
        <>
          <Gate includeDrafts={false} />

          <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-16 lg:px-10 lg:py-20">
            <p className="mono mb-6 self-start text-xs uppercase tracking-[0.3em] text-ember">Pick a file to open</p>
            <Fork />
          </section>
        </>
      )}

      {door === 'a' && (
        <>
          <ServiceChapters includeDrafts={false} />
          <ProductChapters includeDrafts={false} />
          <HowIWork />
        </>
      )}
      {door === 'b' && (
        <>
          <DoorBIntro includeDrafts={false} />
          <TemplateChapter includeDrafts={false} />
          <DoneForYou />
        </>
      )}

      {door && (
        <>
          <Builder />
          <IdeaSketch />
          <BriefChapter />
        </>
      )}
    </>
  );
}
