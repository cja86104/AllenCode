// @ts-check
import { products } from '../data/products.js';
import { services } from '../data/services.js';
import { ProductText } from './ProductChapter.jsx';
import { ServiceText } from './ServiceChapters.jsx';
import { CommitEntry, PRINCIPLES } from '../components/HowIWork.jsx';
import { CHAPTER_TITLE } from './chapterType.js';

/** @typedef {import('../world/roads.js').RoadStop} RoadStop */

/**
 * A stop's words on the road (Code World W2.5): today's chapter text, unchanged and in full, as the
 * spec names it (a product's name, tagline, status and stats; a service's name, summary, scope and
 * timeline; how I work's three commits, each marked shipped once the camera has passed it).
 * @param {{ stop: RoadStop, commits: number }} props
 */
export default function RoadStop({ stop, commits }) {
  if (stop.kind === 'product' || stop.kind === 'unfinished') {
    const product = products.find((p) => p.slug === stop.id);
    if (!product) throw new Error(`products.js has no product "${stop.id}".`);
    return <ProductText product={product} countT={1} />;
  }
  if (stop.kind === 'service' || stop.kind === 'audit') {
    const service = services.find((s) => s.slug === stop.id);
    if (!service) throw new Error(`services.js has no service "${stop.id}".`);
    return <ServiceText service={service} />;
  }
  return (
    <div>
      <h2 className={CHAPTER_TITLE}>{stop.name}</h2>
      <ol className="mt-5 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-night/85">
        {PRINCIPLES.map((principle, i) => (
          <CommitEntry key={principle.n} principle={principle} state={{ typed: 1, body: 1, shipped: commits > i }} live compact />
        ))}
      </ol>
    </div>
  );
}
