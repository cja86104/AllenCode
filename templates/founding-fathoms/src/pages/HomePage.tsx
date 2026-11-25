import { usePageTitle } from '../app/BreweryContext';
import { CanClubBanner } from '../sections/home/CanClubBanner';
import { CurrentlyPouring } from '../sections/home/CurrentlyPouring';
import { Hero } from '../sections/home/Hero';
import { OnTheFloor } from '../sections/home/OnTheFloor';
import { Regulars } from '../sections/home/Regulars';

export function HomePage() {
  usePageTitle();
  return (
    <>
      <Hero />
      <CurrentlyPouring />
      <CanClubBanner />
      <Regulars />
      <OnTheFloor />
    </>
  );
}
