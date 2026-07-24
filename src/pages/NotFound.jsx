import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

export default function NotFound() {
  usePageMeta('Page not found — Allen Code Co.', 'The page you were looking for does not exist.');
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">404</p>
      <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">Nothing to see here.</h1>
      <p className="mt-4 max-w-md text-white/60">
        The page you're looking for doesn't exist, moved, or was never built.
      </p>
      <Link
        to="/"
        className="mono mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-widest hover:border-orange-500 hover:text-orange-500"
      >
        <ArrowLeft size={14} /> Back home
      </Link>
    </div>
  );
}