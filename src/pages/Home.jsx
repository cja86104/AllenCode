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

/**
 * The home page: the Source to Screen experience (spec section 4). The shared opening, then the
 * chapters for the chosen door, then the builder, the visitor's idea and the brief, which both doors
 * share and which are shown before a door is chosen too. Only approved excerpts are shown here.
 */
export default function Home() {
  usePageMeta(
    'Allen Code Co. — Custom Software, Web Design & AI for Real Businesses',
    'Custom development, web design, UI/UX, and AI integration — built around your business. Tailored work for small business owners and founders.',
  );
  const { door } = useDoor();

  return (
    <>
      <Gate includeDrafts={false} />

      <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-16 lg:px-10 lg:py-20">
        <Fork />
      </section>

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

      <Builder />
      <IdeaSketch />
      <BriefChapter />
    </>
  );
}
