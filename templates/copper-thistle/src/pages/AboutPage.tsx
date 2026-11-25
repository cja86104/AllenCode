import { usePageTitle, useRestaurant } from '../app/RestaurantContext';
import { Photo } from '../components/Photo';
import { Reveal } from '../components/Reveal';
import { Eyebrow } from '../components/ui';

export function AboutPage() {
  const { about } = useRestaurant();
  usePageTitle('About');
  const heights = ['h-56', 'h-80', 'h-44', 'h-72'];
  return (
    <div className="bg-cream">
      <section aria-labelledby="about-title" className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-32 md:grid-cols-12 md:pt-40">
        <Reveal className="relative md:col-span-5">
          <figure>
            <Photo photo={about.chef.photo} priority className="h-[460px] w-full md:h-[640px]" />
            <figcaption className="bg-burgundy px-6 py-4 text-cream sm:absolute sm:-bottom-6 sm:-right-6">
              <span className="block font-display text-lg italic">{about.chef.name}</span>
              <span className="block text-xs uppercase tracking-widest text-gold">{about.chef.title}</span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="relative pt-4 md:col-span-7">
          <Eyebrow className="mb-4">{about.eyebrow}</Eyebrow>
          <h1 id="about-title" className="mb-8 font-display text-4xl italic leading-tight md:text-5xl">
            {about.heading}
          </h1>
          <figure className="my-10">
            <blockquote className="border-l-4 border-gold pl-6 font-display text-2xl italic leading-snug text-burgundy md:-mr-10 md:pl-8 md:text-[2.5rem]">
              <p>“{about.quote}”</p>
            </blockquote>
            <figcaption className="mt-3 pl-6 text-sm text-stone md:pl-8">{about.chef.name}</figcaption>
          </figure>
          <div className="max-w-md space-y-4 text-[15px] leading-relaxed text-charcoal/90">
            {about.story.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {about.process.length > 0 ? (
        <section aria-labelledby="process-title" className="mx-auto max-w-7xl px-6 pb-28">
          <h2 id="process-title" className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-gold-ink">
            {about.processHeading}
          </h2>
          <ul className="columns-2 gap-4 md:columns-4">
            {about.process.map((photo, index) => (
              <li key={photo.src} className="mb-4 break-inside-avoid overflow-hidden">
                <Photo photo={photo} className={`w-full ${heights[index % heights.length] ?? 'h-56'}`} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
