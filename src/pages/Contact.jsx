// @ts-check
import { useSearchParams } from 'react-router-dom';
import { Calendar, Mail } from 'lucide-react';
import Reveal from '../components/Reveal';
import ContactForm from '../components/ContactForm.jsx';
import PageHeader, { DISPLAY, PANEL } from '../components/PageHeader.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { briefPrefill } from '../components/briefPrefill.js';

export default function Contact() {
  usePageMeta(
    'Contact — Allen Code Co.',
    'Get in touch with Chris Allen at Allen Code Co. to start a custom software project, book a technical audit, or ask a question.',
  );

  const [searchParams] = useSearchParams();
  const prefill = briefPrefill(searchParams.get('template'), searchParams.get('idea'));

  return (
    <div className="px-6 pb-24 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <PageHeader
            path="contact"
            eyebrow="Contact"
            title="Tell me what you're building."
            lede="I read every message myself. Give me the real problem, not the pitch — I'll tell you honestly whether I'm the right person to build it."
          />
          <Reveal delay={0.1}>
            <div className="space-y-4">
              <a href="mailto:chris@allencodeco.com" className="flex w-fit items-center gap-3 text-white/75 hover:text-ember">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-night/80">
                  <Mail size={16} aria-hidden="true" />
                </span>
                chris@allencodeco.com
              </a>
              <a
                href="https://cal.com/allencodeco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-3 text-white/75 hover:text-ember"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-night/80">
                  <Calendar size={16} aria-hidden="true" />
                </span>
                Book a 20-minute call
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className={`mt-10 p-6 ${PANEL}`}>
              <p className="mono text-xs uppercase tracking-widest text-white/50">Typical response time</p>
              <p className={`${DISPLAY} mt-2 text-3xl text-ember`}>Within 1 business day</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="lg:pt-36">
            <div className={`overflow-hidden ${PANEL}`}>
              <p aria-hidden="true" className="mono border-b border-white/10 px-5 py-2.5 text-[11px] tracking-widest text-white/55">
                your-project.md
              </p>
              <ContactForm prefill={prefill} framed={false} />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
