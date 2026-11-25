import { useBrewery } from '../../app/BreweryContext';
import { Photo } from '../../components/Photo';
import { Reveal } from '../../components/Reveal';
import { ClipLink, Eyebrow } from '../../components/ui';

/** The brewhouse: a short note on tours, three photographs and the batch that's on deck. */
export function OnTheFloor() {
  const { floor } = useBrewery().home;
  const [first, second, third] = floor.photos;
  return (
    <section aria-labelledby="floor-title" className="bg-panel py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <Eyebrow>{floor.eyebrow}</Eyebrow>
          <h2 id="floor-title" className="mb-4 font-display text-5xl tracking-wide text-cream">
            {floor.heading}
          </h2>
          <p className="mb-6 leading-relaxed text-mist">{floor.body}</p>
          <ClipLink to="/story" variant="brassOutline">
            Read our story
          </ClipLink>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 lg:col-span-7">
          <div className="space-y-3">
            {first ? <Photo photo={first} className="clip-card h-40 w-full" /> : null}
            {second ? <Photo photo={second} className="clip-card h-52 w-full" /> : null}
          </div>
          <div className="space-y-3 pt-8">
            <div className="clip-card relative z-10 -rotate-2 border border-brass/40 bg-navy p-5 shadow-xl">
              <p className="text-[11px] uppercase tracking-[0.25em] text-mist">{floor.batch.label}</p>
              <p className="mt-1 font-display text-6xl leading-none text-brass">{floor.batch.number}</p>
              <p className="mt-2 text-sm text-mist">{floor.batch.detail}</p>
            </div>
            {third ? <Photo photo={third} className="clip-card h-36 w-full" /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
