import { useBrewery } from '../../app/BreweryContext';
import { Photo } from '../../components/Photo';
import { Reveal } from '../../components/Reveal';
import { ClipLink, Eyebrow } from '../../components/ui';
import { CAN_CLUB_PATH } from '../../lib/navigation';

/** The Can Club on cream: a photograph of the cans, what membership gets you, and the way to join. */
export function CanClubBanner() {
  const { canClub } = useBrewery().home;
  return (
    <>
      <div aria-hidden="true" className="diagonal-divider bg-navy" />
      <section aria-labelledby="can-club-title" className="overflow-hidden bg-cream text-navy">
        <div className="mx-auto max-w-7xl md:grid md:min-h-[480px] md:grid-cols-2">
          <div className="relative h-72 md:h-auto">
            <Photo photo={canClub.photo} className="absolute inset-0 h-full w-full" />
            <p aria-hidden="true" className="stamp-label absolute bottom-6 left-6 bg-navy px-3 py-2 font-display text-3xl text-brass">
              {canClub.stamp}
            </p>
          </div>

          <Reveal className="flex flex-col justify-center px-6 py-14 md:px-12 lg:px-16">
            <Eyebrow ground="light">{canClub.eyebrow}</Eyebrow>
            <h2 id="can-club-title" className="mb-4 font-display text-5xl tracking-wide">
              {canClub.heading}
            </h2>
            <p className="mb-6 max-w-md leading-relaxed text-slate">{canClub.body}</p>
            <ul className="mb-8 space-y-2 text-sm text-slate">
              {canClub.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span aria-hidden="true" className="font-bold text-brass-ink">
                    //
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <ClipLink to={CAN_CLUB_PATH} variant="navy" arrow>
              Claim a membership
            </ClipLink>
          </Reveal>
        </div>
      </section>
      <div aria-hidden="true" className="diagonal-divider diagonal-divider--to-navy bg-cream" />
    </>
  );
}
