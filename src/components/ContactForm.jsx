// @ts-check
import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Magnetic from './Magnetic';

/** The project types offered, unchanged from the Contact page. */
export const PROJECT_TYPES = Object.freeze([
  'Custom SaaS Build',
  'MVP Sprint',
  'AI Integration',
  'Technical Audit',
  'Acquisition Readiness',
  'Website from a template',
  'Something else',
]);

/** @typedef {{ name: string, email: string, projectType: string, message: string }} ContactFields */
/** @typedef {Partial<Record<keyof ContactFields, string>>} FieldErrors */
/** @typedef {{ projectType?: string, message?: string }} Prefill */

/** @returns {ContactFields} */
const emptyForm = () => ({ name: '', email: '', projectType: PROJECT_TYPES[0], message: '' });

/**
 * @param {Prefill} prefill
 * @returns {ContactFields}
 */
function formFrom(prefill) {
  const projectType = prefill.projectType && PROJECT_TYPES.includes(prefill.projectType) ? prefill.projectType : PROJECT_TYPES[0];
  return { ...emptyForm(), projectType, message: prefill.message ?? '' };
}

/**
 * @param {ContactFields} form
 * @returns {FieldErrors}
 */
function validate(form) {
  /** @type {FieldErrors} */
  const errors = {};
  if (!form.name.trim()) errors.name = 'Enter your name.';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email.';
  if (!form.message.trim() || form.message.trim().length < 10) errors.message = 'Give me at least a sentence to work with.';
  return errors;
}

/**
 * The project brief: the contact form, extracted from the Contact page with its behavior unchanged.
 * It posts `{ name, email, projectType, message }` to `/api/send-contact-email` and shows the same
 * validation, error and success states. `prefill` starts the project type and message; when a new
 * prefill arrives (the visitor sketches another idea), the message follows it until the visitor
 * edits the message themselves.
 *
 * `onFieldsChange` hears every change to the fields, so the page can show the brief as it is written.
 *
 * `framed` draws the form's own border; a page that already sets it in a panel turns it off.
 *
 * @param {{ prefill?: Prefill, idPrefix?: string, successHeading?: 'h2' | 'h3', onFieldsChange?: (fields: ContactFields) => void, framed?: boolean }} props
 */
export default function ContactForm({ prefill = {}, idPrefix = 'contact', successHeading = 'h2', onFieldsChange, framed = true }) {
  const [form, setForm] = useState(() => formFrom(prefill));
  const [errors, setErrors] = useState(/** @type {FieldErrors} */ ({}));
  const [status, setStatus] = useState(/** @type {'idle' | 'sending' | 'sent' | 'error'} */ ('idle'));
  const [errorMessage, setErrorMessage] = useState('');
  const [messageEdited, setMessageEdited] = useState(false);
  const [lastPrefill, setLastPrefill] = useState(prefill.message ?? '');

  useEffect(() => {
    onFieldsChange?.(form);
  }, [form, onFieldsChange]);

  // A new prefill replaces the message only while the visitor has not written it themselves.
  const nextPrefill = prefill.message ?? '';
  if (nextPrefill !== lastPrefill) {
    setLastPrefill(nextPrefill);
    if (!messageEdited) setForm((f) => ({ ...f, message: nextPrefill }));
  }

  /**
   * @template {keyof ContactFields} K
   * @param {K} field
   * @param {ContactFields[K]} value
   */
  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  /** @param {import('react').FormEvent<HTMLFormElement>} ev */
  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate(form);
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

  const id = (/** @type {string} */ field) => `${idPrefix}-${field}`;
  const Heading = successHeading;

  if (status === 'sent') {
    return (
      <div
        className={`flex h-full flex-col items-start justify-center gap-4 p-10 ${
          framed ? 'rounded-2xl border border-orange-500/30 bg-orange-500/[0.04]' : ''
        }`}
      >
        <CheckCircle2 className="text-orange-500" size={36} />
        <Heading className="font-display text-3xl tracking-tight">Message sent.</Heading>
        <p className="max-w-sm text-white/60">
          Thanks, {form.name.split(' ')[0] || 'there'}. I&apos;ll reply from chris@allencodeco.com within one business day.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            setMessageEdited(false);
            setForm(emptyForm());
          }}
          className="mono mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-widest hover:border-orange-500 hover:text-orange-500"
        >
          Send another <ArrowUpRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`p-8 sm:p-10 ${framed ? 'rounded-2xl border border-white/10 bg-white/[0.02]' : ''}`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id('name')} className="mono text-[11px] uppercase tracking-widest text-white/40">
            Name
          </label>
          <input
            id={id('name')}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="input mt-2"
            placeholder="Jane Founder"
          />
          {errors.name && <p className="mt-1.5 text-xs text-orange-500">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor={id('email')} className="mono text-[11px] uppercase tracking-widest text-white/40">
            Email
          </label>
          <input
            id={id('email')}
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
        <label htmlFor={id('type')} className="mono text-[11px] uppercase tracking-widest text-white/40">
          Project type
        </label>
        <select
          id={id('type')}
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
        <label htmlFor={id('message')} className="mono text-[11px] uppercase tracking-widest text-white/40">
          What are you building?
        </label>
        <textarea
          id={id('message')}
          value={form.message}
          onChange={(e) => {
            setMessageEdited(true);
            update('message', e.target.value);
          }}
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
  );
}
