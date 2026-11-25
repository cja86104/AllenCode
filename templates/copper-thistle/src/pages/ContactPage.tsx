import type { ReactNode } from 'react';
import { Car, Clock, Mail, MapPin, Phone, Star } from 'lucide-react';
import { usePageTitle, useRestaurant } from '../app/RestaurantContext';
import { Rotator } from '../components/Rotator';
import { PageHeading } from '../components/ui';
import { mapUrl } from '../lib/content';
import { hoursRows } from '../lib/hours';
import { Newsletter } from '../sections/contact/Newsletter';

function Detail({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
        <Icon size={14} aria-hidden="true" /> {title}
      </h3>
      <div className="text-sm leading-relaxed text-mist">{children}</div>
    </div>
  );
}

/** Where to find the restaurant: address with a link to open it in a map, hours, parking and how to reach it. */
function VisitCard() {
  const restaurant = useRestaurant();
  const { contact } = restaurant;
  return (
    <div className="grid gap-10 bg-charcoal p-8 text-cream md:grid-cols-2 md:p-12 lg:grid-cols-4">
      <Detail icon={MapPin} title="Address">
        <address className="not-italic">
          {contact.street}
          <br />
          {contact.city}, {contact.region} {contact.postalCode}
        </address>
        <a
          href={mapUrl(restaurant)}
          rel="noopener"
          className="mt-3 inline-flex min-h-[2.75rem] items-center border-b border-gold pb-1 text-xs uppercase tracking-[0.2em] text-gold"
        >
          Open in maps
        </a>
      </Detail>
      <Detail icon={Clock} title="Hours">
        <dl className="space-y-1.5">
          {hoursRows(restaurant.hours.schedule).map((row) => (
            <div key={row.days} className="flex justify-between gap-6">
              <dt>{row.days}</dt>
              <dd>{row.hours}</dd>
            </div>
          ))}
        </dl>
        {restaurant.hours.note ? <p className="mt-3">{restaurant.hours.note}</p> : null}
      </Detail>
      {contact.parking ? (
        <Detail icon={Car} title="Parking">
          <p>{contact.parking}</p>
        </Detail>
      ) : null}
      <Detail icon={Phone} title="Get in touch">
        <p>
          <a
            href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
            className="inline-flex min-h-[2.75rem] items-center gap-2 hover:text-gold"
          >
            <Phone size={14} className="text-gold" aria-hidden="true" /> {contact.phone}
          </a>
        </p>
        <p>
          <a href={`mailto:${contact.email}`} className="inline-flex min-h-[2.75rem] items-center gap-2 break-all hover:text-gold">
            <Mail size={14} className="shrink-0 text-gold" aria-hidden="true" /> {contact.email}
          </a>
        </p>
      </Detail>
    </div>
  );
}

function Reviews() {
  const { contactPage } = useRestaurant();
  const { reviews } = contactPage;
  if (reviews.length === 0) return null;
  return (
    <section aria-labelledby="reviews-title" className="bg-charcoal px-6 py-24 text-cream">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="reviews-title" className="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-gold">
          {contactPage.reviewsHeading}
        </h2>
        <Rotator
          label={contactPage.reviewsHeading}
          count={reviews.length}
          intervalMs={5500}
          minHeight="min-h-[240px]"
          itemLabel={(index) => `Show the review from ${reviews[index]?.name ?? ''}`}
          render={(index) => {
            const review = reviews[index];
            if (!review) return null;
            return (
              <figure>
                <p className="mb-5 flex justify-center gap-1">
                  <span className="sr-only">Rated {review.rating} out of 5</span>
                  {Array.from({ length: 5 }, (_, star) => (
                    <Star
                      key={star}
                      size={16}
                      aria-hidden="true"
                      className={star < review.rating ? 'fill-gold text-gold' : 'text-cream/40'}
                    />
                  ))}
                </p>
                <blockquote className="mb-6 font-display text-xl italic leading-relaxed md:text-2xl">
                  <p>“{review.quote}”</p>
                </blockquote>
                <figcaption className="text-sm text-mist">
                  {review.name}
                  {review.location ? `, ${review.location}` : ''}
                </figcaption>
              </figure>
            );
          }}
        />
      </div>
    </section>
  );
}

export function ContactPage() {
  const { contactPage } = useRestaurant();
  usePageTitle('Contact');
  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-7xl px-6 pt-28 md:pt-36">
        <PageHeading eyebrow={contactPage.eyebrow} title={contactPage.heading} />
      </div>
      <div className="mx-auto mb-24 max-w-7xl px-6">
        <h2 className="sr-only">Visit us</h2>
        <VisitCard />
      </div>
      <Reviews />
      <Newsletter />
    </div>
  );
}
