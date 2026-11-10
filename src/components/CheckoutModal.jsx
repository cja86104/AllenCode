// @ts-check
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2, ShieldCheck } from 'lucide-react';

/**
 * What to charge for: a flat template price, or a deposit with the balance invoiced on delivery.
 * @typedef {{ mode: 'template' | 'deposit', title: string, description: string, price: number, balance: number }} CheckoutItem
 */

/**
 * Stripe checkout in a dialog. Not mounted anywhere since the Services deposit flow was removed
 * (Chris, 2026-11-10); kept, with `api/create-checkout-session.js`, so payments can be switched back on.
 *
 * @param {{ item: CheckoutItem | null, onClose: () => void }} props
 */
export default function CheckoutModal({ item, onClose }) {
  const [stage, setStage] = useState('details');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function reset() {
    setStage('details');
    setEmail('');
    setName('');
    setError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  /** @param {import('react').FormEvent<HTMLFormElement>} e */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!item) return;
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter your name and a valid email to continue.');
      return;
    }
    setError('');
    setStage('processing');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          priceInCents: Math.round(item.price * 100),
          mode: item.mode,
          customerName: name,
          customerEmail: email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Could not start checkout.');
      }
      // Hand off to Stripe's hosted Checkout page. Stripe redirects back to
      // /checkout-success (or /services on cancel) once payment finishes.
      window.location.href = data.url;
    } catch (err) {
      setError((err instanceof Error && err.message) || 'Something went wrong starting checkout. Please try again.');
      setStage('details');
    }
  }

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-8"
        >
          <button onClick={handleClose} aria-label="Close checkout" className="absolute right-5 top-5 text-white/50 hover:text-orange-500">
            <X size={20} />
          </button>

          {stage === 'details' && (
            <form onSubmit={handleSubmit}>
              <p className="mono text-xs uppercase tracking-widest text-orange-500">
                {item.mode === 'template' ? 'Secure Checkout' : 'Reserve Your Slot'}
              </p>
              <h3 className="mt-3 font-display text-2xl tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm text-white/60">{item.description}</p>
              <div className="mt-6 flex items-baseline justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="mono text-xs uppercase tracking-widest text-white/50">
                  {item.mode === 'template' ? 'Total due today' : 'Deposit due today'}
                </span>
                <span className="font-display text-2xl text-orange-500">${item.price.toLocaleString()}</span>
              </div>
              {item.mode === 'deposit' && (
                <p className="mt-2 text-xs text-white/55">Balance of ${item.balance.toLocaleString()} invoiced on delivery.</p>
              )}
              <div className="mt-6 space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="input"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                  className="input"
                />
              </div>
              {error && <p className="mt-3 text-xs text-orange-500">{error}</p>}
              <button
                type="submit"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 mono text-xs uppercase tracking-widest text-black hover:bg-orange-400"
              >
                <ShieldCheck size={15} /> Pay with Stripe
              </button>
              <p className="mt-4 text-center text-[11px] text-white/55">Secure payment via Stripe. Card details never touch our servers.</p>
            </form>
          )}

          {stage === 'processing' && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <Loader2 className="animate-spin text-orange-500" size={32} />
              <p className="mono text-xs uppercase tracking-widest text-white/60">Redirecting to Stripe Checkout…</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}