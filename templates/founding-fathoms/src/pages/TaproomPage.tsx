import { CalendarDays, Clock, Truck } from 'lucide-react';
import { usePageTitle, useBrewery } from '../app/BreweryContext';
import { HoursList } from '../components/HoursList';
import { Reveal } from '../components/Reveal';
import { PageHeading } from '../components/ui';
import { trucksByWeek } from '../lib/content';
import { dayName } from '../lib/hours';

/** The taproom: hours, the food truck on each open day, and the weekly events. */
export function TaproomPage() {
  const brewery = useBrewery();
  const { taproom, hours } = brewery;
  usePageTitle('Taproom');
  return (
    <>
      <div className="mx-auto grid max-w-7xl items-end gap-10 px-4 pb-16 pt-16 md:px-6 md:pt-20 lg:grid-cols-2">
        <PageHeading eyebrow={taproom.eyebrow} title="Taproom">
          <p>{taproom.intro}</p>
        </PageHeading>
        <section aria-labelledby="hours-title" className="clip-card mb-12 border border-cream/15 bg-panel p-6">
          <h2 id="hours-title" className="mb-3 flex items-center gap-3 font-display text-3xl tracking-wide">
            <Clock size={20} aria-hidden="true" className="text-brass" />
            Hours
          </h2>
          <HoursList className="text-sm" />
          {hours.note ? <p className="mt-4 text-sm text-mist">{hours.note}</p> : null}
        </section>
      </div>

      <section aria-labelledby="trucks-title" className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
        <h2 id="trucks-title" className="mb-8 flex items-center gap-3 font-display text-4xl tracking-wide">
          <Truck size={22} aria-hidden="true" className="text-brass" />
          Food truck schedule
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {trucksByWeek(brewery).map((truck) => (
            <li key={truck.day} className="h-full border border-cream/10 bg-panel p-4">
              <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-brass">{dayName(truck.day)}</p>
              <h3 className="font-display text-2xl tracking-wide text-cream">{truck.name}</h3>
              <p className="mt-2 text-sm text-mist">{truck.fare}</p>
            </li>
          ))}
        </ul>
      </section>

      <div aria-hidden="true" className="diagonal-divider bg-navy" />
      <section aria-labelledby="events-title" className="bg-cream py-16 text-navy md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10">
            <h2 id="events-title" className="flex items-center gap-3 font-display text-5xl tracking-wide">
              <CalendarDays size={24} aria-hidden="true" className="text-brass-ink" />
              Events
            </h2>
            <p className="mt-1 text-sm text-slate">{taproom.eventsNote}</p>
          </div>
          <ul className="max-w-3xl space-y-4">
            {taproom.events.map((event) => (
              <Reveal key={event.id} as="li" className="ticket-stub px-8 py-5 shadow-md sm:px-10">
                <div className="mb-3 flex flex-col gap-2 border-b border-dashed border-navy/25 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-display text-2xl tracking-wide">{event.title}</h3>
                  <p className="text-sm font-semibold text-brass-ink sm:text-right">{event.when}</p>
                </div>
                <p className="text-sm leading-relaxed text-slate">{event.detail}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
