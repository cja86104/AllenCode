import { useBrewery } from '../../app/BreweryContext';
import { Photo } from '../../components/Photo';
import { ClipLink } from '../../components/ui';
import { CAN_CLUB_PATH } from '../../lib/navigation';

/** The opening photograph with the brewery's stamp: name, one line of who it is, and the two ways in. */
export function Hero() {
  const { hero } = useBrewery().home;
  const lastLine = hero.lines.length - 1;
  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[88vh] items-end overflow-hidden md:items-center">
      <Photo photo={hero.photo} priority className="absolute inset-0 h-full w-full" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/50" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-24 md:px-6 md:pb-28">
        <div className="hero-enter stamp-label ml-2 inline-block max-w-md bg-navy/80 px-6 py-5 md:ml-[8%]">
          <p className="mb-1 text-[11px] uppercase tracking-[0.35em] text-brass">{hero.eyebrow}</p>
          <h1 id="hero-title" className="font-display text-6xl leading-[0.9] text-cream md:text-7xl">
            {hero.lines.map((line, index) => (
              <span key={index} className={`block ${index === lastLine ? 'text-brass' : ''}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-3 max-w-xs text-sm text-cream">{hero.intro}</p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 md:ml-[8%] md:mt-14">
          <ClipLink to="/beer" arrow>
            See what’s on tap
          </ClipLink>
          <ClipLink to={CAN_CLUB_PATH} variant="outline">
            Join the Can Club
          </ClipLink>
        </div>
      </div>
    </section>
  );
}
