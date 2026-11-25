import { Link } from 'react-router';
import { useMemorial } from '../app/MemorialContext';
import { CopyLink } from './CopyLink';

/**
 * The footer: a way to pass the memorial on, and the discreet template credit. When the memorial is the
 * template's demonstration, a single preview note says so here and nowhere else on the page.
 */
export function SiteFooter() {
  const memorial = useMemorial();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <ul className="site-footer__links">
          {memorial.privacy.acceptMemories ? (
            <li>
              <Link className="text-link" to="/share">
                Share a memory
              </Link>
            </li>
          ) : null}
          <li>
            <CopyLink />
          </li>
          <li>
            <Link className="text-link" to="/privacy">
              Privacy
            </Link>
          </li>
          <li>
            <Link className="text-link" to="/family">
              Family access
            </Link>
          </li>
        </ul>
        {memorial.site.demonstration ? (
          <p className="site-footer__demo">
            Template preview. {memorial.person.shortName ?? memorial.person.fullName}, {memorial.person.pronouns.possessive} family, the
            venue and the gathering shown here are fictional, and the photographs are stock photography.
          </p>
        ) : null}
        <p className="site-footer__credit">
          <a href="https://allencodeco.com" rel="noopener">
            Evergreen by Allen Code Co.
          </a>
        </p>
      </div>
    </footer>
  );
}
