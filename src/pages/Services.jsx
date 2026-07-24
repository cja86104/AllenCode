import { useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';
import CheckoutModal from '../components/CheckoutModal';
import usePageMeta from '../hooks/usePageMeta';

export default function Services() {
  usePageMeta(
    'Services — Allen Code Co.',
    'Custom SaaS builds, MVP sprints, AI integration, technical audits, and acquisition-readiness consulting from Allen Code Co.'
  );
  const [checkoutItem, setCheckoutItem] = useState(null);

  function openDeposit(service) {
    const isFlat = service.priceNote.toLowerCase().includes('flat');
    const depositAmount = isFlat ? service.startingPrice : Math.round(service.startingPrice * 0.4);
    setCheckoutItem({
      mode: isFlat ? 'template' : 'deposit',
      title: service.name,
      description: service.summary,
      price: depositAmount,
      balance: Math.max(service.startingPrice - depositAmount, 0),
    });
  }

  return (
    <div className="px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Services</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
            Custom work, scoped and priced upfront.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/60">
            No hourly retainers, no scope creep. Every engagement below is fixed-scope, deposit-gated, and delivered
            by me — the person who'll actually write the code.
          </p>
        </Reveal>

        <div className="mt-16 space-y-6">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.06}>
              <div className="grid gap-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-colors hover:border-orange-500/40 lg:grid-cols-[1.4fr_1fr_auto] lg:items-center lg:gap-10">
                <div>
                  <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{s.name}</h2>
                  <p className="mt-3 max-w-xl text-white/60">{s.summary}</p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {s.scope.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                        <Check size={14} className="mt-0.5 shrink-0 text-orange-500" /> {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mono mt-5 text-[11px] uppercase tracking-widest text-white/30">
                    {s.timeline} · {s.deposit}
                  </p>
                </div>
                <div className="lg:text-right">
                  <p className="mono text-xs uppercase tracking-widest text-white/40">{s.priceNote}</p>
                  <p className="font-display text-4xl text-orange-500">${s.startingPrice.toLocaleString()}</p>
                </div>
                <Magnetic>
                  <button
                    onClick={() => openDeposit(s)}
                    className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-orange-500 px-6 py-3 mono text-xs uppercase tracking-widest text-black hover:bg-orange-400 lg:w-auto"
                  >
                    Reserve a slot <ArrowUpRight size={14} />
                  </button>
                </Magnetic>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-2xl tracking-tight sm:text-3xl">Not sure what you need?</h3>
              <p className="mt-2 max-w-lg text-white/60">
                Send me a few lines about the problem you're solving and I'll tell you honestly what it'll take.
              </p>
            </div>
            <Magnetic>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/20 px-6 py-3 mono text-xs uppercase tracking-widest text-white hover:border-orange-500 hover:text-orange-500"
              >
                Get in touch <ArrowUpRight size={14} />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>

      <CheckoutModal item={checkoutItem} onClose={() => setCheckoutItem(null)} />
    </div>
  );
}