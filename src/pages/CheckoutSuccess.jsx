import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

export default function CheckoutSuccess() {
  usePageMeta('Payment received — Allen Code Co.', 'Your payment was received.');
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <CheckCircle2 className="text-orange-500" size={40} />
      <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">Payment received.</h1>
      <p className="mt-4 max-w-md text-white/60">
        Thanks — your payment went through Stripe successfully. A confirmation email is on its way, and I'll
        follow up personally within one business day.
      </p>
      {sessionId && (
        <p className="mono mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs tracking-widest text-white/40">
          Ref: {sessionId}
        </p>
      )}
      <Link
        to="/"
        className="mono mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-widest hover:border-orange-500 hover:text-orange-500"
      >
        Back home <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
