import { Link } from 'react-router';
import { useMemorial } from '../app/MemorialContext';
import { usePageTitle } from '../app/usePageTitle';

/** Shown for an address the memorial does not have. */
export function NotFoundPage() {
  const memorial = useMemorial();
  usePageTitle('Page not found');
  return (
    <div className="section not-found">
      <h1 className="section-head__title">This page isn’t here.</h1>
      <p className="section-head__intro">The link may be mistyped, or the page may have been moved by the family.</p>
      <p className="not-found__action">
        <Link className="button" to="/">
          Go to the memorial for {memorial.person.displayName}
        </Link>
      </p>
    </div>
  );
}
