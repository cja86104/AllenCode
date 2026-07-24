import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ScrambleText from './ScrambleText';
import CodeTerminal from './CodeTerminal';
import CursorGlow from './CursorGlow';
import Magnetic from './Magnetic';

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
      <CursorGlow />
      <div className="relative mx-auto max-w-7xl">

        {/* Booking badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.25em] text-white/60">Booking new projects</span>
        </div>

        {/* H1 + terminal */}
        <div className="mt-8 grid gap-12 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <h1 className="font-display text-[13vw] leading-[0.92] tracking-tight text-white sm:text-7xl lg:text-[5.2rem]">
            <ScrambleText as="span" text="We build what" className="block" />
            <ScrambleText as="span" text="you need — for" className="block" />
            <span className="block text-orange-500">
              <ScrambleText as="span" text="whoever you are." />
            </span>
          </h1>
          <CodeTerminal />
        </div>

        {/* Body + CTAs */}
        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-lg space-y-3">
            <p className="text-lg text-white/60">
              Not just for businesses. For anyone who needs something built.
            </p>
            <p className="text-white/40">
              Whether you're running a company, launching a product, or carving out a corner of the internet that's
              yours — you get the same craft, the same quality, and the same attention to detail. From the first
              conversation to the day it goes live, we handle it. Tailored to you. Delivered on time. Built to last.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-4">
            <Magnetic>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 mono text-xs uppercase tracking-widest text-black transition hover:bg-orange-400"
              >
                Start a Project <ArrowRight size={14} />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 mono text-xs uppercase tracking-widest text-white transition hover:border-orange-500 hover:text-orange-500"
              >
                See Our Work <ArrowRight size={14} />
              </Link>
            </Magnetic>
          </div>
        </div>

      </div>
    </section>
  );
}
