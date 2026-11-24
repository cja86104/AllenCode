import { Link } from 'react-router-dom';
import { useMemorial } from '../app/MemorialContext';
import { usePageTitle } from '../app/usePageTitle';
import { PRIVACY_MODES } from '../lib/privacy';

/** What visitors and contributors should know: who can see the memorial, and what happens to a memory. */
export function PrivacyPage() {
  const memorial = useMemorial();
  const { privacy, contact, person, site } = memorial;
  usePageTitle('Privacy and sharing');
  const mode = PRIVACY_MODES[privacy.mode];

  return (
    <div className="section info-page">
      <header className="section-head section-head--narrow">
        <p className="photographs__back">
          <Link className="text-link" to="/">
            Back to the memorial
          </Link>
        </p>
        <h1 className="section-head__title">Privacy and sharing</h1>
      </header>

      <div className="info-page__body prose">
        <h2>Who can see this memorial</h2>
        <p>
          <strong>{mode.label}.</strong> {mode.summary}
        </p>

        {privacy.acceptMemories ? (
          <>
            <h2>When you share a memory</h2>
            <p>
              We ask for your name and your memory. You can also tell us how you knew {person.displayName}, add a photograph, and leave an
              email address if you’d like the family to be able to reply. You don’t need an account.
            </p>
            <p>
              Every memory goes to the family first. Nothing appears on this page until they have read it. If you untick the permission box,
              your memory is shared with the family only and is never shown here.
            </p>
            <p>Your email address is never shown on the memorial and is used only if the family chooses to reply.</p>
          </>
        ) : (
          <>
            <h2>Memories</h2>
            <p>The family isn’t adding new memories to this page at the moment.</p>
          </>
        )}

        <h2>What this site doesn’t do</h2>
        <p>
          This memorial has no analytics, no advertising and no tracking cookies, and it loads nothing from other companies’ servers. If you
          start writing a memory, your unsent words are kept in your own browser so they aren’t lost; they don’t leave your device until you
          send them.
        </p>

        <h2>Changes and removal</h2>
        {contact.publicEmail ? (
          <p>
            To ask for a memory or photograph to be changed or taken down, write to{' '}
            <a className="text-link" href={`mailto:${contact.publicEmail}`}>
              {contact.publicEmail}
            </a>
            {contact.caretaker ? `, which ${contact.caretaker} reads` : ''}.
          </p>
        ) : (
          <p>
            To ask for a memory or photograph to be changed or taken down, please contact {contact.caretaker ?? 'the family member'} who
            shared this memorial with you.
          </p>
        )}

        {site.demonstration ? (
          <p className="notice notice--quiet">
            This is a template preview: nothing you enter on these pages is collected or sent anywhere.
          </p>
        ) : null}
      </div>
    </div>
  );
}
