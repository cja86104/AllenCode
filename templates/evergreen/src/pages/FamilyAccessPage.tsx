import { Link } from 'react-router-dom';
import { useMemorial } from '../app/MemorialContext';
import { usePageTitle } from '../app/usePageTitle';

/**
 * Family access. The static template has no sign-in, and says so plainly rather than showing a login
 * form that would protect nothing. The demonstration of the family area is offered only on the
 * template's own demonstration memorial.
 */
export function FamilyAccessPage() {
  const memorial = useMemorial();
  usePageTitle('Family access');
  const { site, contact } = memorial;

  return (
    <div className="section info-page">
      <header className="section-head section-head--narrow">
        <p className="photographs__back">
          <Link className="text-link" to="/">
            Back to the memorial
          </Link>
        </p>
        <h1 className="section-head__title">Family access</h1>
        <p className="section-head__intro">
          The family looks after this memorial from a protected area: editing the story, arranging photographs, reading memories before they
          appear, updating the gathering, and choosing who can see the page.
        </p>
      </header>

      <div className="info-page__body prose">
        {site.demonstration ? (
          <>
            <p>
              This is a template preview, so there is no sign-in here. On a published memorial, the family area sits behind real sign-in
              that the memorial’s server checks on every visit.
            </p>
            <p>
              <Link className="button" to="/family/preview">
                See a demonstration of the family area
              </Link>
            </p>
          </>
        ) : (
          <p>
            Family sign-in hasn’t been set up for this memorial yet.
            {contact.caretaker ? ` If you’re family, please contact ${contact.caretaker}.` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
