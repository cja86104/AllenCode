// @ts-check
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BUTTON_QUIET, DISPLAY } from '../components/PageHeader.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

export default function NotFound() {
  usePageMeta('Page not found — Allen Code Co.', 'The page you were looking for does not exist.');
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-24 text-center">
      <p aria-hidden="true" className="mono text-[11px] tracking-widest text-white/45">
        <span className="text-ember">~/</span>allencode: no such file
        <span className="gate-cursor" />
      </p>
      <p className="mono mt-6 text-xs uppercase tracking-[0.3em] text-ember">404</p>
      <h1 className={`${DISPLAY} mt-4 text-5xl sm:text-6xl`}>Nothing to see here.</h1>
      <p className="mt-4 max-w-md text-white/70">The page you&apos;re looking for doesn&apos;t exist, moved, or was never built.</p>
      <Link to="/" viewTransition className={`${BUTTON_QUIET} mt-8`}>
        <ArrowLeft size={14} aria-hidden="true" /> Back home
      </Link>
    </div>
  );
}
