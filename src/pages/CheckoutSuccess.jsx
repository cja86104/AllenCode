// @ts-check
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { BUTTON_QUIET, DISPLAY } from '../components/PageHeader.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

export default function CheckoutSuccess() {
  usePageMeta('Payment received — Allen Code Co.', 'Your payment was received.');
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-24 text-center">
      <CheckCircle2 className="text-ember" size={40} aria-hidden="true" />
      <h1 className={`${DISPLAY} mt-4 text-5xl sm:text-6xl`}>Payment received.</h1>
      <p className="mt-4 max-w-md text-white/70">
        Thanks — your payment went through Stripe successfully. A confirmation email is on its way, and I&apos;ll
        follow up personally within one business day.
      </p>
      {sessionId && (
        <p className="mono mt-4 rounded-lg border border-white/10 bg-night/90 px-4 py-2 text-xs tracking-widest text-white/50">
          Ref: {sessionId}
        </p>
      )}
      <Link to="/" viewTransition className={`${BUTTON_QUIET} mt-8`}>
        Back home <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
