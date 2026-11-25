import { usePageTitle } from '../app/RestaurantContext';
import { EventsBanner } from '../sections/home/EventsBanner';
import { Hero } from '../sections/home/Hero';
import { Press } from '../sections/home/Press';
import { SignatureDishes } from '../sections/home/SignatureDishes';

export function HomePage() {
  usePageTitle();
  return (
    <>
      <Hero />
      <SignatureDishes />
      <Press />
      <EventsBanner />
    </>
  );
}
