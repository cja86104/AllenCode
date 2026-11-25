import { useRestaurant } from '../../app/RestaurantContext';
import { Photo } from '../../components/Photo';
import { Eyebrow, PillLink } from '../../components/ui';

export function Hero() {
  const { hero } = useRestaurant().home;
  return (
    <section aria-labelledby="hero-title" className="relative h-screen min-h-[640px] w-full overflow-hidden bg-charcoal">
      <Photo photo={hero.photo} priority className="absolute inset-0 h-full w-full" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#140a0a] via-[#140a0a]/60 to-[#140a0a]/20" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/10 to-transparent" />

      <div className="relative z-10 flex h-full max-w-4xl flex-col justify-end px-6 pb-24 md:px-16 md:pb-32">
        <div className="hero-enter">
          <Eyebrow tone="dark" className="md:text-sm">
            {hero.eyebrow}
          </Eyebrow>
        </div>
        <h1
          id="hero-title"
          className="hero-enter mb-6 font-display text-5xl italic leading-[1.03] text-cream [animation-delay:0.15s] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          {hero.headline.map((line, index) => (
            <span key={line} className="block">
              {index > 0 ? ' ' : ''}
              {line}
            </span>
          ))}
        </h1>
        <div aria-hidden="true" className="hero-enter mb-6 h-px w-24 bg-gold [animation-delay:0.4s]" />
        <p className="hero-enter mb-10 max-w-md text-lg font-light text-cream [animation-delay:0.4s]">{hero.intro}</p>
        <div className="hero-enter [animation-delay:0.6s]">
          <PillLink to="/reservations">{hero.action}</PillLink>
        </div>
      </div>
    </section>
  );
}
