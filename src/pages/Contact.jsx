import { useState } from 'react';
import { Calendar, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';
import usePageMeta from '../hooks/usePageMeta';

const PROJECT_TYPES = [
  'Custom SaaS Build',
  'MVP Sprint',
  'AI Integration',
  'Technical Audit',
  'Acquisition Readiness',
  'Something else',
];

export default function Contact() {
  usePageMeta(
    'Contact — Allen Code Co.',
    'Get in touch with Chris Allen at Allen Code Co. to start a custom software project, book a technical audit, or ask a question.'
  );

  const [form, setForm] = useState({ name: '', email: '', projectType: PROJECT_TYPES[0], message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Give me at least a sentence to work with.';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.fieldErrors || {});
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong sending your message. Please try again.');
        return;
      }
      setStatus('sent');
    } catch {
      setStatus('error');
      setErrorMessage('Could not reach the server. Please email chris@allencodeco.com directly.');
    }
  }

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
          {status === 'sent' ? (
            <div className="flex h-full flex-col items-start justify-center gap-4 rounded-2xl border border-orange-500/30 bg-orange-500/[0.04] p-10">
              <CheckCircle2 className="text-orange-500" size={36} />
              <h2 className="font-display text-3xl tracking-tight">Message sent.</h2>
              <p className="max-w-sm text-white/60">
                Thanks, {form.name.split(' ')[0] || 'there'}. I'll reply from chris@allencodeco.com within one
                business day.
              </p>
              <button
                onClick={() => {
                  setStatus('idle');
                  setForm({ name: '', email: '', projectType: PROJECT_TYPES[0], message: '' });
                }}
                className="mono mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-widest hover:border-orange-500 hover:text-orange-500"
              >
                Send another <ArrowUpRight size={14} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mono text-[11px] uppercase tracking-widest text-white/40">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="input mt-2"
                    placeholder="Jane Founder"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-orange-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="mono text-[11px] uppercase tracking-widest text-white/40">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    type="email"
                    className="input mt-2"
                    placeholder="jane@company.com"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-orange-500">{errors.email}</p>}
                </div>
              </div>
              <div className="mt-5">
                <label className="mono text-[11px] uppercase tracking-widest text-white/40">Project type</label>
                <select
                  value={form.projectType}
                  onChange={(e) => update('projectType', e.target.value)}
                  className="input mt-2"
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0a0a0a]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-5">
                <label className="mono text-[11px] uppercase tracking-widest text-white/40">What are you building?</label>
                <textarea
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={5}
                  className="input mt-2 resize-none"
                  placeholder="Tell me about the problem, the timeline, and the budget range you have in mind."
                />
                {errors.message && <p className="mt-1.5 text-xs text-orange-500">{errors.message}</p>}
              </div>
              {status === 'error' && errorMessage && (
                <p className="mt-4 rounded-lg border border-orange-500/30 bg-orange-500/[0.04] px-4 py-3 text-sm text-orange-500">
                  {errorMessage}
                </p>
              )}
              <Magnetic className="mt-6 block w-full sm:w-fit">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 mono text-xs uppercase tracking-widest text-black hover:bg-orange-400 disabled:opacity-60 sm:w-fit"
                >
                  {status === 'sending' ? 'Sending…' : 'Send message'} <ArrowUpRight size={14} />
                </button>
              </Magnetic>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
}