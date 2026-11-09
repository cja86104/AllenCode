import { useSearchParams } from 'react-router-dom';
import { Mail, Calendar } from 'lucide-react';
import Reveal from '../components/Reveal';
import ContactForm from '../components/ContactForm';
import usePageMeta from '../hooks/usePageMeta';
import { briefPrefill } from '../components/briefPrefill';

export default function Contact() {
  usePageMeta(
    'Contact — Allen Code Co.',
    'Get in touch with Chris Allen at Allen Code Co. to start a custom software project, book a technical audit, or ask a question.'
  );

  const [searchParams] = useSearchParams();
  const prefill = briefPrefill(searchParams.get('template'), searchParams.get('idea'));

  return (
    <div className="px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Reveal>
            <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Contact</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
              Tell me what you're building.
            </h1>
            <p className="mt-6 max-w-md text-lg text-white/60">
              I read every message myself. Give me the real problem, not the pitch — I'll tell you honestly whether
              I'm the right person to build it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 space-y-4">
              <a href="mailto:chris@allencodeco.com" className="flex items-center gap-3 text-white/70 hover:text-orange-500">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10">
                  <Mail size={16} />
                </span>
                chris@allencodeco.com
              </a>
              <a
                href="https://cal.com/allencodeco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/70 hover:text-orange-500"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10">
                  <Calendar size={16} />
                </span>
                Book a 20-minute call
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="mono text-xs uppercase tracking-widest text-white/40">Typical response time</p>
              <p className="mt-2 font-display text-2xl text-orange-500">Within 1 business day</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <ContactForm prefill={prefill} />
        </Reveal>
      </div>
    </div>
  );
}