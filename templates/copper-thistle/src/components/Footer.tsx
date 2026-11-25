import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useRestaurant } from '../app/RestaurantContext';
import { mapUrl } from '../lib/content';
import { hoursRows } from '../lib/hours';
import { NAV_ITEMS } from '../lib/navigation';

/** The footer: what the restaurant is, the pages, the hours, and how to find and reach it. */
export function Footer() {
  const restaurant = useRestaurant();
  const { contact, site } = restaurant;
  const social = [
    contact.social.instagram ? { link: contact.social.instagram, Icon: Instagram } : null,
    contact.social.facebook ? { link: contact.social.facebook, Icon: Facebook } : null,
  ].filter((entry) => entry !== null);

  return (
    <footer className="bg-charcoal text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div>
          <p className="mb-4 font-display text-2xl italic">{site.name}</p>
          <p className="max-w-xs text-sm leading-relaxed text-mist">{restaurant.footer.about}</p>
          {social.length > 0 ? (
            <ul className="mt-6 flex gap-3">
              {social.map(({ link, Icon }) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    rel="noopener"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 transition-colors hover:border-gold hover:text-gold"
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span className="sr-only">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Footer">
          <h2 className="mb-5 text-xs uppercase tracking-[0.2em] text-gold">Explore</h2>
          <ul className="space-y-1 text-sm">
            {NAV_ITEMS.filter((item) => item.to !== '/').map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="inline-flex min-h-[2.75rem] items-center text-mist transition-colors hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-5 text-xs uppercase tracking-[0.2em] text-gold">Hours</h2>
          <dl className="space-y-2 text-sm text-mist">
            {hoursRows(restaurant.hours.schedule).map((row) => (
              <div key={row.days} className="flex justify-between gap-6">
                <dt>{row.days}</dt>
                <dd>{row.hours}</dd>
              </div>
            ))}
          </dl>
          {restaurant.hours.note ? <p className="mt-3 text-sm text-mist">{restaurant.hours.note}</p> : null}
        </div>

        <div>
          <h2 className="mb-5 text-xs uppercase tracking-[0.2em] text-gold">Find us</h2>
          <address className="space-y-1 text-sm not-italic text-mist">
            <a
              href={mapUrl(restaurant)}
              rel="noopener"
              className="flex min-h-[2.75rem] items-start gap-2 transition-colors hover:text-gold"
            >
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
              <span>
                {contact.street}, {contact.city}, {contact.region} {contact.postalCode}
              </span>
            </a>
            <a
              href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
              className="flex min-h-[2.75rem] items-center gap-2 transition-colors hover:text-gold"
            >
              <Phone size={16} className="shrink-0 text-gold" aria-hidden="true" />
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} className="flex min-h-[2.75rem] items-center gap-2 transition-colors hover:text-gold">
              <Mail size={16} className="shrink-0 text-gold" aria-hidden="true" />
              {contact.email}
            </a>
          </address>
        </div>
      </div>
      <div className="border-t border-cream/10 px-6 py-6 text-center text-xs text-mist">
        {site.demonstration ? (
          <p className="mx-auto mb-2 max-w-2xl">
            Template preview. {site.name}, its chef, address, reviews and press quotes are fictional; photographs are stock photography.
          </p>
        ) : null}
        <p>
          © {new Date().getFullYear()} {site.name}.{' '}
          <a href="https://allencodeco.com" rel="noopener" className="underline-offset-4 hover:text-gold hover:underline">
            Website template by Allen Code Co.
          </a>
        </p>
      </div>
    </footer>
  );
}
