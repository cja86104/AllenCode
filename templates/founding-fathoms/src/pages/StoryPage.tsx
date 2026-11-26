import { usePageTitle, useBrewery } from '../app/BreweryContext';
import { Photo } from '../components/Photo';
import { Reveal } from '../components/Reveal';
import { Eyebrow, PageHeading } from '../components/ui';

/** How the brewery started: the head brewer, the story in her words, how the beer is made, and a few numbers. */
export function StoryPage() {
  const { story } = useBrewery();
  usePageTitle('Our Story');
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-16 md:px-6 md:pt-20">
        <PageHeading eyebrow={story.eyebrow} title="Our Story" />
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-6">
          <figure className="lg:col-span-5">
            <Photo photo={story.brewer.photo} priority className="clip-card h-[480px] w-full border border-cream/10 md:h-[560px]" />
            <figcaption className="mt-3 text-xs uppercase tracking-[0.2em] text-mist">
              {story.brewer.name} · {story.brewer.role}
            </figcaption>
          </figure>

          <div className="lg:col-span-7 lg:pt-10">
            <blockquote className="relative z-10 mb-10 font-display text-5xl leading-[0.95] tracking-wide text-brass md:text-6xl lg:-ml-8">
              <p>“{story.quote}”</p>
            </blockquote>
            <div className="max-w-md space-y-4 text-[15px] leading-relaxed text-cream lg:ml-auto">
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="process-title" className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
        <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Eyebrow>{story.process.eyebrow}</Eyebrow>
            <h2 id="process-title" className="font-display text-5xl tracking-wide">
              {story.process.heading}
            </h2>
          </div>
          <p className="max-w-xs text-sm text-mist md:text-right">{story.process.note}</p>
        </div>
        <ol className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {story.process.steps.map((step, index) => (
            <li key={step.label}>
              <figure>
                <Photo photo={step.photo} className="clip-card aspect-[3/4] w-full border border-cream/10" />
                <figcaption className="mt-2 text-xs uppercase tracking-[0.2em] text-mist">
                  <span className="font-display text-base text-brass">{String(index + 1).padStart(2, '0')}</span> {step.label}
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="The brewery in numbers" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <ul className="grid gap-6 md:grid-cols-3">
          {story.stats.map((stat) => (
            <Reveal key={stat.label} as="li" className="border border-cream/15 p-6 text-center">
              <p className="font-display text-6xl leading-none text-brass">{stat.value}</p>
              <p className="mt-2 text-sm uppercase tracking-wider text-mist">{stat.label}</p>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
