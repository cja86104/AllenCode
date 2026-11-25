import { usePageTitle, useRestaurant } from '../app/RestaurantContext';
import { PageHeading, PillLink } from '../components/ui';

export function NotFoundPage() {
  const { site } = useRestaurant();
  usePageTitle('Page not found');
  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 pt-36">
      <PageHeading eyebrow="404" title="This page isn’t on the menu.">
        <p>The link may be mistyped, or the page may have moved.</p>
      </PageHeading>
      <PillLink to="/" tone="light">
        Back to {site.name}
      </PillLink>
    </div>
  );
}
