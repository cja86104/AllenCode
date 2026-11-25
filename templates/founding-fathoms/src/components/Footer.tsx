import { Link } from 'react-router';
import { Anchor, Clock, Mail, MapPin } from 'lucide-react';
import { useBrewery } from '../app/BreweryContext';
import { mapUrl } from '../lib/content';
import { hoursRows } from '../lib/hours';
import { NAV_ITEMS } from '../lib/navigation';

/** The footer: what the brewery is, the pages, the hours, how to find it, and the batch mark. */
export function Footer() {
  const brewery = useBrewery();
  const { contact, site, hours, footer } = brewery;

  return (
    <footer className="border-t border-cream/10 bg-navy-deep text-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="mb-4 flex items-center gap-2">
              <Anchor size={28} strokeWidth={1.75} aria-hidden="true" className="text-brass" />
              <span className="font-display text-3xl tracking-wider">{site.shortName}</span>
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-mist">{footer.blurb}</p>
          </div>

          <nav aria-label="Footer" className="md:col-span-2">
            <h2 className="mb-3 font-display text-lg tracking-wide text-brass">Navigate</h2>
            <ul className="text-sm">
              {NAV_ITEMS.filter((item) => item.to !== '/').map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="inline-flex min-h-[2.75rem] items-center text-mist transition-colors hover:text-brass">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-sm text-mist md:col-span-3">
            <h2 className="mb-3 font-display text-lg tracking-wide text-brass">Visit</h2>
            <a href={mapUrl(brewery)} rel="noopener" className="flex min-h-[2.75rem] gap-2 py-1 transition-colors hover:text-brass">
              <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brass" />
              <span>
                {contact.street}
                <br />
                {contact.city}
              </span>
            </a>
            <div className="flex gap-2 py-2">
              <Clock size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brass" />
              <dl className="grid flex-1 grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                {hoursRows(hours.schedule).map((row) => (
                  <div key={row.days} className="contents">
                    <dt>{row.days}</dt>
                    <dd>
                      {row.hours}
                      {row.closed && hours.closedNote ? <span className="text-mist"> ({hours.closedNote})</span> : null}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <a href={`mailto:${contact.email}`} className="flex min-h-[2.75rem] items-center gap-2 transition-colors hover:text-brass">
              <Mail size={16} aria-hidden="true" className="shrink-0 text-brass" />
              {contact.email}
            </a>
          </div>

          <div className="md:col-span-3">
            <h2 className="mb-3 font-display text-lg tracking-wide text-brass">Batch mark</h2>
            <p className="stamp-label inline-block px-4 py-3">
              <span className="block font-display text-4xl leading-none text-brass">{footer.stamp.mark}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-mist">{footer.stamp.label}</span>
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-2 border-t border-cream/10 pt-6 text-xs text-mist">
          {site.demonstration ? (
            <p>
              Template preview. {site.name}, its people, beers, prices, shops and quotes are fictional; photographs are stock photography.
            </p>
          ) : null}
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {site.name}. {footer.closing}
            </p>
            <p>
              <a href="https://allencodeco.com" rel="noopener" className="underline-offset-4 hover:text-brass hover:underline">
                Website template by Allen Code Co.
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
