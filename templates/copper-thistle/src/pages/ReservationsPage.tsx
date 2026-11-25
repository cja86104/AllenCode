import { usePageTitle, useRestaurant } from '../app/RestaurantContext';
import { Photo } from '../components/Photo';
import { Eyebrow, PageHeading } from '../components/ui';
import { PrivateEventForm } from '../sections/reservations/PrivateEventForm';
import { ReservationForm } from '../sections/reservations/ReservationForm';

function AmbiancePanel() {
  const { ambiance } = useRestaurant().reservations;
  return (
    <div className="relative min-h-[420px] overflow-hidden lg:h-full">
      <Photo photo={ambiance.photo} className="absolute inset-0 h-full w-full" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-x-6 bottom-6 border border-white/25 bg-charcoal/70 p-6 text-cream backdrop-blur-md md:inset-x-10 md:bottom-10 md:p-8">
        <Eyebrow tone="dark" className="tracking-[0.25em]">
          {ambiance.eyebrow}
        </Eyebrow>
        <h2 className="mb-3 font-display text-2xl italic md:text-3xl">{ambiance.heading}</h2>
        <p className="mb-5 text-sm leading-relaxed text-cream/90">{ambiance.body}</p>
        <a
          href="#private-events"
          className="inline-flex min-h-[2.75rem] items-center border-b border-gold pb-1 text-xs uppercase tracking-[0.2em] text-gold"
        >
          {ambiance.action}
        </a>
      </div>
    </div>
  );
}

export function ReservationsPage() {
  const { reservations } = useRestaurant();
  usePageTitle('Reservations');
  return (
    <div className="bg-cream pb-6 pt-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-6">
        <PageHeading eyebrow={reservations.eyebrow} title={reservations.heading} />
      </div>
      <div className="mx-auto mb-24 grid max-w-7xl items-start gap-10 px-6 lg:grid-cols-2">
        <ReservationForm />
        <AmbiancePanel />
      </div>
      <PrivateEventForm />
    </div>
  );
}
