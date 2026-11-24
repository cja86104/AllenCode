import { Closing } from '../sections/Closing';
import { Gathering } from '../sections/Gathering';
import { LifeChapters } from '../sections/LifeChapters';
import { Memories } from '../sections/Memories';
import { Opening } from '../sections/Opening';
import { PracticalModules, StoryModules } from '../sections/OptionalModules';
import { PhotoMoments } from '../sections/PhotoMoments';
import { Recipe } from '../sections/Recipe';
import { RememberedThings } from '../sections/RememberedThings';

/**
 * The main memorial. It works as a complete single page on its own: every section a family has filled
 * in appears in reading order, and every section left empty disappears without a trace.
 */
export function MemorialPage() {
  return (
    <>
      <Opening />
      <RememberedThings />
      <LifeChapters />
      <StoryModules />
      <PhotoMoments />
      <Gathering />
      <PracticalModules />
      <Memories />
      <Recipe />
      <Closing />
    </>
  );
}
