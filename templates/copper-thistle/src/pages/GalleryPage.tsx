import { usePageTitle, useRestaurant } from '../app/RestaurantContext';
import { Photo } from '../components/Photo';
import { Reveal } from '../components/Reveal';
import { PageHeading } from '../components/ui';

const HEIGHT = { tall: 'h-[480px]', medium: 'h-[400px]', short: 'h-[290px]' } as const;

export function GalleryPage() {
  const restaurant = useRestaurant();
  const { gallery, contact } = restaurant;
  usePageTitle('Gallery');
  const instagram = contact.social.instagram;
  return (
    <div className="bg-cream pb-28 pt-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-6">
        <PageHeading eyebrow={gallery.eyebrow} title={gallery.heading}>
          <p>{gallery.intro}</p>
        </PageHeading>

        <ul className="columns-1 gap-5 sm:columns-2 md:columns-3">
          {gallery.photos.map((photo, index) => (
            <Reveal as="li" key={photo.src + index} delay={(index % 3) * 0.1} className="mb-5 break-inside-avoid">
              <figure className="overflow-hidden">
                <Photo photo={photo} className={`w-full ${HEIGHT[photo.size]}`} />
                {photo.caption ? <figcaption className="mt-2 text-sm text-stone">{photo.caption}</figcaption> : null}
              </figure>
            </Reveal>
          ))}
        </ul>

        {gallery.strip.photos.length > 0 ? (
          <section aria-labelledby="strip-title" className="mt-24">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h2 id="strip-title" className="font-display text-3xl italic md:text-4xl">
                {gallery.strip.heading}
              </h2>
              {instagram ? (
                <a
                  href={instagram.url}
                  rel="noopener"
                  className="inline-flex min-h-[2.75rem] items-center border-b border-gold-ink pb-1 text-sm uppercase tracking-[0.2em] text-gold-ink"
                >
                  {instagram.label}
                </a>
              ) : null}
            </div>
            <ul className="grid grid-cols-3 gap-4 md:grid-cols-6">
              {gallery.strip.photos.map((photo) => (
                <li key={photo.src} className="aspect-square overflow-hidden rounded-lg">
                  <Photo photo={photo} className="h-full w-full" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
