import { Quote } from 'lucide-react';
import { useRestaurant } from '../../app/RestaurantContext';
import { Rotator } from '../../components/Rotator';
import { Eyebrow } from '../../components/ui';

export function Press() {
  const { press } = useRestaurant().home;
  if (press.quotes.length === 0) return null;
  return (
    <section aria-labelledby="press-title" className="relative overflow-hidden bg-charcoal px-6 py-28 text-center text-cream md:py-36">
      <h2 id="press-title" className="sr-only">
        {press.eyebrow}
      </h2>
      <Quote className="mx-auto mb-8 text-gold/50" size={48} aria-hidden="true" />
      <div className="mx-auto max-w-4xl">
        <Rotator
          label={press.eyebrow}
          count={press.quotes.length}
          intervalMs={6000}
          minHeight="min-h-[200px] md:min-h-[180px]"
          itemLabel={(index) => `Show the quote from ${press.quotes[index]?.source ?? ''}`}
          render={(index) => {
            const item = press.quotes[index];
            if (!item) return null;
            return (
              <figure>
                <blockquote className="mb-6 font-display text-2xl italic leading-snug md:text-4xl">
                  <p>“{item.quote}”</p>
                </blockquote>
                <figcaption>
                  <Eyebrow tone="dark" className="mb-0 tracking-[0.25em]">
                    {item.source}
                  </Eyebrow>
                </figcaption>
              </figure>
            );
          }}
        />
      </div>
    </section>
  );
}
