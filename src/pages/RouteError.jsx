// @ts-check
import { BUTTON, BUTTON_QUIET, DISPLAY } from '../components/PageHeader.jsx';

/**
 * Shown instead of the router's raw error screen when a page cannot render, most often because a
 * page left open across a deploy asks for files that have since been replaced. Reloading fetches the
 * current site. It stands alone (no nav or footer), because the shell itself may be what failed.
 */
export default function RouteError() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-night px-6 text-center">
      <p aria-hidden="true" className="mono text-[11px] tracking-widest text-white/45">
        <span className="text-ember">~/</span>allencode: failed to load
        <span className="gate-cursor" />
      </p>
      <h1 className={`${DISPLAY} mt-6 text-5xl sm:text-6xl`}>This page didn&apos;t load.</h1>
      <p className="mt-4 max-w-md text-white/70">
        The site may have just been updated. Reloading picks up the latest version.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => window.location.reload()} className={BUTTON}>
          Reload the page
        </button>
        <a href="/" className={BUTTON_QUIET}>
          Back home
        </a>
      </div>
    </main>
  );
}
