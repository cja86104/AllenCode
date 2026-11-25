import { useId, useState } from 'react';
import { MapPin, Package, Search } from 'lucide-react';
import { usePageTitle, useBrewery } from '../app/BreweryContext';
import { Photo } from '../components/Photo';
import { PageHeading } from '../components/ui';
import { searchRetailers } from '../lib/content';

/** The shops that carry the cans, searchable, with a count per region and a note for distributors. */
export function FindUsPage() {
  const brewery = useBrewery();
  const { findUs, contact } = brewery;
  usePageTitle('Find Us');
  const [query, setQuery] = useState('');
  const searchId = useId();
  const regions = searchRetailers(brewery, query);
  const found = regions.reduce((sum, region) => sum + region.stores.length, 0);
  const searching = query.trim() !== '';

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 md:px-6 md:pt-20">
      <PageHeading eyebrow={findUs.eyebrow} title="Find Us">
        <p>{findUs.intro}</p>
      </PageHeading>

      <div className="js-only -mt-4 mb-12 max-w-lg">
        <label htmlFor={searchId} className="mb-2 block text-xs uppercase tracking-[0.15em] text-mist">
          Search shops
        </label>
        <div className="relative">
          <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Shop, street, city or region"
            className="min-h-[2.875rem] w-full border border-mist/60 bg-panel py-3 pl-10 pr-4 text-cream placeholder:text-mist focus:border-brass focus:outline-none"
          />
        </div>
        <p role="status" className="mt-2 text-sm text-mist">
          {searching ? `${found} ${found === 1 ? 'shop matches' : 'shops match'} “${query.trim()}”.` : ''}
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          {regions.length === 0 ? (
            <p className="text-mist">No shops match that search. Try a city name, or clear the search to see them all.</p>
          ) : null}
          {regions.map((region, index) => (
            <section key={region.name} aria-labelledby={`region-${index}`}>
              <h2 id={`region-${index}`} className="mb-4 border-b border-brass/30 pb-2 font-display text-3xl tracking-wide text-brass">
                {region.name}
              </h2>
              <ul className="space-y-3">
                {region.stores.map((store) => (
                  <li key={`${store.name}-${store.address}`} className="flex gap-3 p-3">
                    <MapPin size={16} aria-hidden="true" className="mt-1 shrink-0 text-brass" />
                    <div>
                      <h3 className="font-semibold text-cream">{store.name}</h3>
                      <p className="text-sm text-mist">
                        {store.address} · {store.city}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="space-y-6 lg:col-span-4">
          <section aria-labelledby="by-region-title" className="border border-cream/15 bg-panel p-5">
            <h2 id="by-region-title" className="mb-4 font-display text-2xl tracking-wide">
              Shops by region
            </h2>
            <dl className="space-y-2 text-sm">
              {findUs.regions.map((region) => (
                <div key={region.name} className="flex items-baseline justify-between gap-4 border-b border-cream/10 pb-2">
                  <dt className="text-mist">{region.name}</dt>
                  <dd className="font-display text-2xl leading-none text-brass">{region.stores.length}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="trade-title" className="clip-card border border-brass/40 bg-navy p-6">
            <Package size={24} aria-hidden="true" className="mb-3 text-brass" />
            <h2 id="trade-title" className="mb-2 font-display text-3xl tracking-wide">
              {findUs.trade.heading}
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-mist">{findUs.trade.body}</p>
            <a
              href={`mailto:${contact.tradeEmail}`}
              className="clip-btn inline-flex min-h-[2.75rem] items-center break-all bg-brass px-4 py-2 text-xs font-bold uppercase tracking-wider text-navy transition-colors hover:bg-brass-bright"
            >
              {contact.tradeEmail}
            </a>
          </section>

          <Photo photo={findUs.photo} className="clip-card h-48 w-full border border-cream/10" />
        </div>
      </div>
    </div>
  );
}
