// @ts-check
import { products } from '../data/products.js';
import { ProductChapterFor } from './ProductChapter.jsx';
import { SERVICE_CHAPTERS, ServiceChapterFor } from './ServiceChapters.jsx';
import HowIWork from '../components/HowIWork.jsx';
import { templates } from '../data/templates.js';
import { getExcerpt } from '../content/excerpts/index.js';
import { DoorBIntroFor } from './DoorBIntro.jsx';
import { TemplateChapterFor } from './TemplateChapter.jsx';
import DoneForYou from './DoneForYou.jsx';
import Builder from './Builder.jsx';
import IdeaSketch from './IdeaSketch.jsx';
import { businessRoadStops, familyRoadStops } from '../world/roads.js';

/**
 * Scroll of road before each of a door's road chapters, while the camera travels to its landmark: both
 * roads' stops stood three times as far apart as they did (business 2026-11-16, family 2026-11-17), so
 * three times the scroll, at the same pace; the business road then about a quarter shorter (Chris,
 * 2026-11-26; 32 units for 42), so as much less scroll: 80vh for every 14 units of road (`roadStepFor`
 * in roadLayout.js), 80 × 32 / 14 for the business road.
 */
const ROAD_BEFORE = Object.freeze({ a: `${(80 * 32) / 14}vh`, b: '240vh' });
/** The road before your idea, on the shared road (the same for both doors). */
const MEETING_BEFORE = '80vh';
/** The road before the workshop: the bend where the roads meet is about three ordinary stretches (W4). */
const ROAD_TO_MEETING = '240vh';
/** A stop of words (done for you) holds on screen this long, so the camera rests on the road there. */
const WORDS_HOLD = '160vh';

/**
 * A door's chapters along its Code World road: today's chapters, unchanged, in the road's order, each
 * after a stretch of road, each marked as a rest for the camera's track (`data-world-segment="rest"`,
 * `data-world-stop`). Door a: the business road (W2 revised, R4), products first. Door b: the family
 * road (W3.4): Hearth, each template as its own chapter, then done for you. Both then go on to where
 * the roads meet (W4): the workshop (the builder) and your idea.
 * @param {{ door: 'a' | 'b', includeDrafts: boolean }} props
 */
export default function WorldRoadChapters({ door, includeDrafts }) {
  const stops = door === 'a' ? businessRoadStops({ includeDrafts }) : familyRoadStops({ includeDrafts });
  const templateStops = stops.filter((s) => s.kind === 'template' && s.id !== 'hearth');
  return (
    <>
      {stops.map((stop) => {
        let chapter = null;
        if (stop.id === 'hearth') {
          chapter = <DoorBIntroFor includeDrafts={includeDrafts} />;
        } else if (stop.kind === 'template') {
          const template = templates.find((t) => t.id === stop.id);
          const excerpt = stop.excerptId ? getExcerpt(stop.excerptId, { includeDrafts }) : null;
          const index = templateStops.indexOf(stop);
          if (template && excerpt) chapter = <TemplateChapterFor template={template} excerpt={excerpt} index={index} count={templateStops.length} />;
        } else if (stop.kind === 'words') {
          // Shorter than a screen, its words would give the camera no rest: they hold in a pinned frame.
          chapter = (
            <section data-words-hold style={{ height: WORDS_HOLD }} className="relative">
              <div className="pin-frame sticky top-0 flex items-center">
                <DoneForYou />
              </div>
            </section>
          );
        } else if (stop.kind === 'product' || stop.kind === 'unfinished') {
          const product = products.find((p) => p.slug === stop.id);
          if (product) chapter = <ProductChapterFor product={product} includeDrafts={includeDrafts} />;
        } else if (stop.kind === 'service' || stop.kind === 'audit') {
          const entry = SERVICE_CHAPTERS.find((c) => c.slug === stop.id);
          if (entry) chapter = <ServiceChapterFor slug={entry.slug} excerptId={entry.excerptId} includeDrafts={includeDrafts} />;
        } else {
          chapter = <HowIWork />;
        }
        if (!chapter) return null;
        return (
          <div key={stop.id}>
            <div aria-hidden="true" style={{ height: ROAD_BEFORE[door] }} />
            <div data-world-segment="rest" data-world-stop={stop.id}>
              {chapter}
            </div>
          </div>
        );
      })}
      {/* Where the roads meet (W4): the workshop, then your idea, held while it is on screen. */}
      <div aria-hidden="true" style={{ height: ROAD_TO_MEETING }} />
      <div data-world-segment="rest" data-world-stop="workshop">
        <Builder />
      </div>
      <div aria-hidden="true" style={{ height: MEETING_BEFORE }} />
      <div data-world-segment="rest" data-world-stop="your-idea" data-world-hold="visible">
        <IdeaSketch />
      </div>
    </>
  );
}
