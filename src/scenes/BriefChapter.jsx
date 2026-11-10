// @ts-check
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ContactForm from '../components/ContactForm.jsx';
import { briefPrefill } from '../components/briefPrefill.js';
import { useDoor } from '../door/DoorProvider.jsx';
import { BRIEF_CHAPTER } from '../content/visitorTurn.js';

/** @typedef {import('../components/ContactForm.jsx').ContactFields} ContactFields */

/**
 * The brief as a markdown file, written from the form as the visitor fills it in. Empty fields add
 * nothing, so an untouched form leaves the file empty with its cursor.
 * @param {ContactFields | null} fields
 * @returns {string}
 */
export function briefFile(fields) {
  if (!fields) return '';
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();
  if (!name && !email && !message) return '';
  const from = [name, email && `<${email}>`].filter(Boolean).join(' ');
  return ['# Project brief', from && `from: ${from}`, `type: ${fields.projectType}`, message && `\n${message}`]
    .filter(Boolean)
    .join('\n');
}

/**
 * The close (spec section 4, step 9): the cursor returns to an empty file, now the visitor's, with
 * the contact form as the project brief. The primary action follows the door: "Start your project"
 * for door A (and before a door is chosen), "Browse templates" for door B. The idea from "Type your
 * idea" arrives through the address and becomes the brief's first line. The file beside the form
 * writes itself as the visitor fills the form in.
 */
export default function BriefChapter() {
  const { door } = useDoor();
  const [searchParams] = useSearchParams();
  const copy = door === 'b' ? BRIEF_CHAPTER.b : BRIEF_CHAPTER.a;
  const action = door === 'b' ? '/templates' : '/contact';
  const prefill = briefPrefill(searchParams.get('template'), searchParams.get('idea'));
  const [fields, setFields] = useState(/** @type {ContactFields | null} */ (null));
  const written = briefFile(fields);

  return (
    <section
      id="brief"
      data-chapter="brief"
      className="relative z-10 mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10"
    >
      <div>
        <p className="mono text-xs uppercase tracking-[0.3em] text-ember">{BRIEF_CHAPTER.eyebrow}</p>
        <h2 className="mt-4 font-serif-display text-4xl italic leading-tight text-white sm:text-5xl">{BRIEF_CHAPTER.title}</h2>
        <div aria-hidden="true" className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-night/80">
          <div className="mono border-b border-white/10 px-4 py-2 text-[11px] tracking-widest text-white/45">
            {BRIEF_CHAPTER.file}
          </div>
          <pre
            data-brief-file
            className="mono m-0 max-h-72 overflow-hidden whitespace-pre-wrap p-5 text-[13px] leading-[19px] text-white/80 [overflow-wrap:anywhere]"
          >
            {written}
            <span className="gate-cursor" data-cursor />
          </pre>
        </div>
        <p className="mt-6 max-w-md text-white/70">{copy.body}</p>
        <Link
          to={action}
          data-brief-action
          className="mono mt-6 inline-flex rounded-full border border-ember px-6 py-3 text-xs uppercase tracking-widest text-ember transition-colors hover:bg-ember hover:text-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
        >
          {copy.action}
        </Link>
      </div>
      {/* Solid backing so the drifting field never shows through the form's fields. */}
      <div className="rounded-2xl bg-night/95">
        <ContactForm prefill={prefill} idPrefix="brief" successHeading="h3" onFieldsChange={setFields} />
      </div>
    </section>
  );
}
