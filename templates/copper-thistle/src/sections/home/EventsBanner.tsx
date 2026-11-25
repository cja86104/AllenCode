import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useRestaurant } from '../../app/RestaurantContext';
import { Photo } from '../../components/Photo';
import { Reveal } from '../../components/Reveal';
import { Eyebrow } from '../../components/ui';

/** The angled cut from the dark press band into the cream events section. */
function AngledDivider() {
  return (
    <div aria-hidden="true" className="relative h-16 w-full bg-cream md:h-28">
      <div className="absolute inset-0 bg-charcoal [clip-path:polygon(0_0,100%_0,0_100%)]" />
    </div>
  );
}

export function EventsBanner() {
  const { events } = useRestaurant().home;
  return (
    <>
      <AngledDivider />
      <section aria-labelledby="events-title" className="relative bg-cream">
        <div className="grid md:min-h-[560px] md:grid-cols-2">
          <div className="order-2 flex items-center px-6 py-16 md:order-1 md:px-16 md:py-0 lg:px-20">
            <Reveal className="relative z-10 max-w-lg bg-burgundy p-10 text-cream shadow-2xl md:p-14">
              <Eyebrow tone="dark">{events.eyebrow}</Eyebrow>
              <h2 id="events-title" className="mb-6 font-display text-4xl italic leading-tight md:text-5xl">
                {events.heading}
              </h2>
              <p className="mb-8 leading-relaxed text-cream/90">{events.body}</p>
              <Link
                to="/reservations#private-events"
                className="inline-flex min-h-[2.75rem] items-center gap-2 border-b border-gold pb-1 text-gold transition-all duration-300 hover:gap-4 motion-reduce:transition-none"
              >
                {events.action} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
          <div className="relative order-1 h-[380px] shadow-2xl md:order-2 md:-my-12 md:h-auto lg:-my-20">
            <Photo photo={events.photo} className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      </section>
    </>
  );
}
