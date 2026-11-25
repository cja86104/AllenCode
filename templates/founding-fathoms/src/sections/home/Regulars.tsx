import { useBrewery } from '../../app/BreweryContext';
import { Photo } from '../../components/Photo';
import { Rotator } from '../../components/Rotator';

/** What the regulars say, one at a time over a darkened photograph of the taproom. */
export function Regulars() {
  const { regulars } = useBrewery().home;
  return (
    <section aria-labelledby="regulars-title" className="relative flex min-h-[420px] items-center overflow-hidden">
      <Photo photo={regulars.photo} className="absolute inset-0 h-full w-full" />
      <div aria-hidden="true" className="absolute inset-0 bg-navy/90" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-20 text-center md:px-6">
        <h2 id="regulars-title" className="mb-6 text-xs font-semibold uppercase tracking-[0.35em] text-brass">
          {regulars.eyebrow}
        </h2>
        <Rotator
          label={regulars.eyebrow}
          count={regulars.quotes.length}
          intervalMs={6500}
          minHeight="min-h-[260px] md:min-h-[240px]"
          itemLabel={(index) => `Show the quote from ${regulars.quotes[index]?.name ?? ''}`}
          render={(index) => {
            const item = regulars.quotes[index];
            if (!item) return null;
            return (
              <figure>
                <blockquote className="font-display text-3xl leading-tight tracking-wide text-cream sm:text-4xl md:text-5xl">
                  <p>“{item.quote}”</p>
                </blockquote>
                <figcaption className="mt-8">
                  <span className="block font-semibold text-brass">{item.name}</span>
                  <span className="block text-sm text-mist">{item.role}</span>
                </figcaption>
              </figure>
            );
          }}
        />
      </div>
    </section>
  );
}
