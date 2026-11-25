import { usePageTitle } from '../app/BreweryContext';
import { ClipLink, PageHeading } from '../components/ui';

export function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-20 md:px-6">
      <PageHeading eyebrow="404" title="Nothing on this tap.">
        <p>The link may be mistyped, or the page may have moved.</p>
      </PageHeading>
      <ClipLink to="/" arrow>
        Back to the taproom
      </ClipLink>
    </div>
  );
}
