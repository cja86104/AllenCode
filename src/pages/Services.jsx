// @ts-check
import { Check, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader, { BUTTON, BUTTON_QUIET, DISPLAY, PANEL, PANEL_HOVER } from '../components/PageHeader.jsx';

/**
 * The services, each leading to the brief. No prices: the deposit checkout this page once kept
 * unwired was removed (Chris, 2026-11-10); `CheckoutModal` and `api/create-checkout-session.js`
 * remain, and the blueprint ledger records how to wire a deposit button back in.
 */
export default function Services() {
  usePageMeta(
    'Services — Allen Code Co.',
    'Custom SaaS builds, MVP sprints, AI integration, technical audits, and acquisition-readiness consulting from Allen Code Co.'
  );
  return (
    <div className="px-6 pb-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          path="services"
          eyebrow="Services"
          title="Custom work, scoped and priced upfront."
          lede="No hourly retainers, no scope creep. Every engagement below is fixed-scope, deposit-gated, and delivered by me — the person who'll actually write the code."
        />

        <div className="mt-6 space-y-6">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.06}>
              <article data-service={s.slug} className={`overflow-hidden ${PANEL_HOVER}`}>
                <p aria-hidden="true" className="mono border-b border-white/10 px-6 py-2.5 text-[11px] tracking-widest text-white/55">
                  services/{s.slug}
                </p>
                <div className="grid gap-8 p-8 lg:grid-cols-[1.4fr_auto] lg:items-center lg:gap-10">
                  <div>
                    <h2 className={`${DISPLAY} text-3xl sm:text-4xl`}>{s.name}</h2>
                    <p className="mt-3 max-w-xl text-white/70">{s.summary}</p>
                    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                      {s.scope.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                          <Check size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-ember" /> {item}
                        </li>
                      ))}
                    </ul>
                    <p className="mono mt-5 text-[11px] uppercase tracking-widest text-ember/80">
                      {s.timeline} · {s.deposit}
                    </p>
                  </div>
                  <Magnetic>
                    <Link to="/contact" viewTransition className={`${BUTTON} w-full whitespace-nowrap lg:w-auto`}>
                      Reserve a slot <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  </Magnetic>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className={`mt-16 flex flex-col items-start gap-6 p-10 sm:flex-row sm:items-center sm:justify-between ${PANEL}`}>
            <div>
              <h2 className={`${DISPLAY} text-3xl sm:text-4xl`}>Not sure what you need?</h2>
              <p className="mt-2 max-w-lg text-white/65">
                Send me a few lines about the problem you&apos;re solving and I&apos;ll tell you honestly what it&apos;ll take.
              </p>
            </div>
            <Magnetic>
              <Link to="/contact" viewTransition className={`${BUTTON_QUIET} whitespace-nowrap`}>
                Get in touch <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </div>
  );
}