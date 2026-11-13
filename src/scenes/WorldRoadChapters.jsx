// @ts-check
import { products } from '../data/products.js';
import { ProductChapterFor } from './ProductChapter.jsx';
import { SERVICE_CHAPTERS, ServiceChapterFor } from './ServiceChapters.jsx';
import HowIWork from '../components/HowIWork.jsx';
import { businessRoadStops } from '../world/roads.js';

/** Scroll of road before each chapter, while the camera travels to its landmark. */
const ROAD_BEFORE = '80vh';

/**
 * Door A's chapters along the Code World's business road (W2 revised, R4): today's chapters,
 * unchanged, in the road's order (products first), each after a stretch of road, each marked as a
 * rest for the camera's track (`data-world-segment="rest"`, `data-world-stop`).
 * @param {{ includeDrafts: boolean }} props
 */
export default function WorldRoadChapters({ includeDrafts }) {
  const stops = businessRoadStops({ includeDrafts });
  return (
    <>
      {stops.map((stop) => {
        let chapter = null;
        if (stop.kind === 'product' || stop.kind === 'unfinished') {
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
            <div aria-hidden="true" style={{ height: ROAD_BEFORE }} />
            <div data-world-segment="rest" data-world-stop={stop.id}>
              {chapter}
            </div>
          </div>
        );
      })}
    </>
  );
}
