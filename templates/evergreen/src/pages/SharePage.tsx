import { useEffect, useId, useRef, useState, useSyncExternalStore, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useMemorial } from '../app/MemorialContext';
import { usePageTitle } from '../app/usePageTitle';
import {
  configuredAdapter,
  draftStore,
  EMPTY_DRAFT,
  FIELD_ORDER,
  formatBytes,
  LIMITS,
  PHOTO_TYPES,
  validateField,
  validateSubmission,
  type FieldErrors,
  type FieldName,
  type MemoryDraft,
  type SubmissionAdapter,
  type SubmitResult,
} from '../lib/submission';

const PROMPTS = ['What small thing do you remember?', 'Was there something she always said?', 'Tell us about a day you still think about.'];

const FIELD_LABELS: Record<FieldName, string> = {
  name: 'Your name',
  relationship: 'How you knew her',
  memory: 'Your memory',
  photo: 'A photograph',
  email: 'Your email',
};

type Phase = { kind: 'editing' } | { kind: 'sending'; progress?: number } | { kind: 'done'; result: SubmitResult };

interface SharePageProps {
  /** Supplied by tests; the app uses the adapter configured for the build. */
  adapter?: SubmissionAdapter;
}

const buildAdapter = () => configuredAdapter(import.meta.env.VITE_MEMORY_ENDPOINT);

/** Replaces "she/her" in the prompts with the person's own pronouns. */
function personalize(prompt: string, subject: string, object: string): string {
  return prompt.replace(/\bshe\b/g, subject).replace(/\bher\b/g, object);
}

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={error ? 'field field--invalid' : 'field'}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional ? <span className="field__optional"> (optional)</span> : null}
      </label>
      {hint ? (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field__error" id={`${id}-error`}>
          <span className="visually-hidden">Error: </span>
          {error}
        </p>
      ) : null}
      {children}
    </div>
  );
}

const noSubscription = () => () => undefined;

/** False while a prerendered page is being hydrated, true once the page is running in the browser. */
function useInBrowser(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

/**
 * The form for sharing a memory. No account is needed. Every memory is reviewed by the family before
 * it appears, the email address is never shown, and a visitor's writing is never thrown away: it is
 * kept in this browser while they write, and kept on the page through every error.
 */
export function SharePage({ adapter }: SharePageProps) {
  const inBrowser = useInBrowser();
  // An unsent memory kept in this browser is restored once the page is running there; the server copy of
  // the page always starts empty, so the two never disagree.
  const saved = inBrowser ? draftStore.load() : undefined;
  const restore = saved && (saved.memory !== '' || saved.name !== '') ? saved : undefined;
  return <ShareForm key={inBrowser ? 'browser' : 'server'} adapter={adapter} initialDraft={restore} />;
}

function ShareForm({ adapter: providedAdapter, initialDraft }: SharePageProps & { initialDraft: MemoryDraft | undefined }) {
  const memorial = useMemorial();
  const { person, privacy, contact } = memorial;
  usePageTitle('Share a memory');
  const [adapter] = useState(() => providedAdapter ?? buildAdapter());
  const [draft, setDraft] = useState<MemoryDraft>(initialDraft ?? EMPTY_DRAFT);
  const restored = initialDraft !== undefined;
  const [photo, setPhoto] = useState<File | undefined>(undefined);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showSummary, setShowSummary] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: 'editing' });
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const base = useId();
  const ids = Object.fromEntries(FIELD_ORDER.map((field) => [field, `${base}-${field}`])) as Record<FieldName, string>;
  const permissionId = `${base}-permission`;

  useEffect(() => {
    if (showSummary) summaryRef.current?.focus();
  }, [showSummary]);

  useEffect(() => {
    if (phase.kind !== 'done') return;
    if (phase.result.kind === 'failed') failureRef.current?.focus();
    else resultRef.current?.focus();
  }, [phase]);

  if (!privacy.acceptMemories) {
    return (
      <div className="section share">
        <h1 className="section-head__title">Sharing memories</h1>
        <p className="section-head__intro">The family isn’t adding new memories to this page at the moment.</p>
        {contact.preference ? <p className="share__aside">{contact.preference}</p> : null}
        <p className="share__aside">
          <Link className="text-link" to="/">
            Return to the memorial
          </Link>
        </p>
      </div>
    );
  }

  const submission = { ...draft, photo };
  const update = (field: keyof MemoryDraft) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'displayPermission' ? (event.target as HTMLInputElement).checked : event.target.value;
    const next = { ...draft, [field]: value };
    setDraft(next);
    // Saved only as the visitor writes, so loading the page can never overwrite a kept draft.
    draftStore.save(next);
    if (errors[field as FieldName]) {
      setErrors((current) => ({ ...current, [field]: validateField(field as FieldName, { ...submission, [field]: value }) }));
    }
  };
  const blur = (field: FieldName) => () => {
    const message = validateField(field, submission);
    setErrors((current) => ({ ...current, [field]: message }));
  };

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPhoto(file);
    setErrors((current) => ({ ...current, photo: validateField('photo', { ...submission, photo: file }) }));
  };
  const removePhoto = () => {
    setPhoto(undefined);
    setErrors((current) => ({ ...current, photo: undefined }));
    if (photoInputRef.current) photoInputRef.current.value = '';
    photoInputRef.current?.focus();
  };

  const describedBy = (field: FieldName, extra?: string) =>
    [`${ids[field]}-hint`, errors[field] ? `${ids[field]}-error` : '', extra ?? ''].filter(Boolean).join(' ');

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (phase.kind === 'sending') return;
    const found = validateSubmission(submission);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setShowSummary(false);
      // Re-show so the summary is announced and focused on every attempt.
      window.requestAnimationFrame(() => setShowSummary(true));
      return;
    }
    setShowSummary(false);
    setPhase({ kind: 'sending' });
    const result = await adapter.submit(submission, (progress) => setPhase({ kind: 'sending', progress }));
    if (result.kind === 'received') draftStore.clear();
    setPhase({ kind: 'done', result });
  };

  if (phase.kind === 'done' && phase.result.kind === 'received') {
    return (
      <div className="section share">
        <h1 ref={resultRef} tabIndex={-1} className="section-head__title share__result-title">
          Thank you.
        </h1>
        <p className="share__confirmation">Thank you for sharing this memory. The family will review it before it appears here.</p>
        <p className="share__aside">
          <Link className="button" to="/">
            Return to the memorial
          </Link>
        </p>
      </div>
    );
  }

  if (phase.kind === 'done' && phase.result.kind === 'demonstration') {
    return (
      <div className="section share">
        <p className="demo-note">Template preview</p>
        <h1 ref={resultRef} tabIndex={-1} className="section-head__title share__result-title">
          Nothing was sent.
        </h1>
        <p className="share__confirmation">
          This form is a demonstration, so your memory has not gone to anyone and has not been saved anywhere except this browser.
        </p>
        <p className="share__aside">On a published memorial, the visitor would now read:</p>
        <blockquote className="share__sample">
          Thank you for sharing this memory. The family will review it before it appears here.
        </blockquote>
        <div className="share__kept">
          <h2 className="recipe__subhead">What you wrote</h2>
          <div className="prose">
            {draft.memory
              .split(/\n+/)
              .filter((paragraph) => paragraph.trim() !== '')
              .map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
              ))}
          </div>
        </div>
        <p className="share__actions">
          <button type="button" className="button" onClick={() => setPhase({ kind: 'editing' })}>
            Back to the form
          </button>
          <Link className="text-link" to="/">
            Return to the memorial
          </Link>
        </p>
      </div>
    );
  }

  const sending = phase.kind === 'sending';
  const failure = phase.kind === 'done' && phase.result.kind === 'failed' ? phase.result : undefined;
  const errorEntries = FIELD_ORDER.filter((field) => errors[field]);
  const memoryLength = draft.memory.trim().length;
  const local = adapter.mode === 'local';

  return (
    <div className="section share">
      <header className="section-head section-head--narrow">
        <p className="photographs__back">
          <Link className="text-link" to={{ pathname: '/', hash: '#memories' }}>
            Back to the memorial
          </Link>
        </p>
        <h1 className="section-head__title">Share a memory of {person.displayName}</h1>
        <p className="section-head__intro">
          The family reads every memory before it appears on this page. You don’t need an account, and only your name and memory are ever
          shown.
        </p>
      </header>

      {local ? (
        <div className="notice" role="note">
          <p className="notice__title">This form is a template preview.</p>
          <p>It works exactly as a published form would, but nothing you write here is sent to anyone.</p>
        </div>
      ) : null}

      {restored ? (
        <p className="notice notice--quiet" role="status">
          We kept the memory you started earlier in this browser.
        </p>
      ) : null}

      {showSummary && errorEntries.length > 0 ? (
        <div ref={summaryRef} tabIndex={-1} className="error-summary" role="alert" aria-labelledby={`${base}-summary-title`}>
          <h2 id={`${base}-summary-title`} className="error-summary__title">
            {errorEntries.length === 1
              ? 'One thing needs a look before sending'
              : `${errorEntries.length} things need a look before sending`}
          </h2>
          <ul className="error-summary__list">
            {errorEntries.map((field) => (
              <li key={field}>
                <a href={`#${ids[field]}`}>
                  {FIELD_LABELS[field]}: {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {failure ? (
        <div ref={failureRef} tabIndex={-1} className="error-summary" role="alert">
          <h2 className="error-summary__title">Your memory wasn’t sent</h2>
          <p>{failure.message}</p>
        </div>
      ) : null}

      <form className="share__form" noValidate onSubmit={(event) => void send(event)} aria-busy={sending}>
        <Field
          id={ids.name}
          label={FIELD_LABELS.name}
          hint={`As you’d like the family to see it. Up to ${LIMITS.name} characters.`}
          error={errors.name}
        >
          <input
            id={ids.name}
            className="field__input"
            type="text"
            autoComplete="name"
            value={draft.name}
            onChange={update('name')}
            onBlur={blur('name')}
            maxLength={LIMITS.name * 2}
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy('name')}
          />
        </Field>

        <Field
          id={ids.relationship}
          label={personalize(FIELD_LABELS.relationship, person.pronouns.subject, person.pronouns.object)}
          optional
          hint="For example: neighbor, cousin, former student. Leave it empty if you’d rather."
          error={errors.relationship}
        >
          <input
            id={ids.relationship}
            className="field__input"
            type="text"
            value={draft.relationship}
            onChange={update('relationship')}
            onBlur={blur('relationship')}
            aria-invalid={errors.relationship ? true : undefined}
            aria-describedby={describedBy('relationship')}
          />
        </Field>

        <div className="prompts">
          <p className="prompts__title">If you’re not sure where to begin</p>
          <ul className="prompts__list">
            {PROMPTS.map((prompt) => (
              <li key={prompt}>{personalize(prompt, person.pronouns.subject, person.pronouns.object)}</li>
            ))}
          </ul>
          <p className="prompts__note">These are only suggestions. Write whatever you’d like.</p>
        </div>

        <Field
          id={ids.memory}
          label={FIELD_LABELS.memory}
          hint={`A few words or a few paragraphs, up to ${LIMITS.memory.toLocaleString('en-US')} characters.`}
          error={errors.memory}
        >
          <textarea
            id={ids.memory}
            className="field__input field__textarea"
            rows={10}
            value={draft.memory}
            onChange={update('memory')}
            onBlur={blur('memory')}
            required
            aria-invalid={errors.memory ? true : undefined}
            aria-describedby={describedBy('memory', `${ids.memory}-count`)}
          />
          <p id={`${ids.memory}-count`} className={memoryLength > LIMITS.memory ? 'field__count field__count--over' : 'field__count'}>
            {memoryLength.toLocaleString('en-US')} of {LIMITS.memory.toLocaleString('en-US')} characters
          </p>
        </Field>

        {privacy.acceptPhotos ? (
          <Field
            id={ids.photo}
            label={FIELD_LABELS.photo}
            optional
            hint="JPEG, PNG or WebP, up to 10 MB. Please only share a photograph you’re happy for the family to use."
            error={errors.photo}
          >
            <input
              ref={photoInputRef}
              id={ids.photo}
              className="field__file"
              type="file"
              accept={PHOTO_TYPES.join(',')}
              onChange={choosePhoto}
              aria-invalid={errors.photo ? true : undefined}
              aria-describedby={describedBy('photo')}
            />
            {photo ? (
              <p className="field__file-chosen">
                <span>
                  {photo.name} ({formatBytes(photo.size)})
                </span>
                <button type="button" className="text-button" onClick={removePhoto}>
                  Remove photograph
                </button>
              </p>
            ) : null}
          </Field>
        ) : null}

        <Field
          id={ids.email}
          label={FIELD_LABELS.email}
          optional
          hint="Only if you’d like the family to be able to reply. Your email will not appear on the memorial."
          error={errors.email}
        >
          <input
            id={ids.email}
            className="field__input"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={draft.email}
            onChange={update('email')}
            onBlur={blur('email')}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('email')}
          />
        </Field>

        <div className="field field--check">
          <input
            id={permissionId}
            className="field__checkbox"
            type="checkbox"
            checked={draft.displayPermission}
            onChange={update('displayPermission')}
            aria-describedby={`${permissionId}-hint`}
          />
          <div>
            <label htmlFor={permissionId} className="field__label">
              The family may show my name, my memory{privacy.acceptPhotos ? ' and my photograph' : ''} on this memorial.
            </label>
            <p id={`${permissionId}-hint`} className="field__hint">
              Untick this to share your memory with the family privately. They’ll read it, but it won’t appear here.
            </p>
          </div>
        </div>

        <p className="share__review">Every memory is reviewed by the family before it is published.</p>

        <div className="share__submit">
          <button type="submit" className="button button--solid" disabled={sending}>
            {sending ? 'Sending…' : local ? 'Try the form (nothing is sent)' : failure ? 'Try sending again' : 'Send to the family'}
          </button>
          {sending && adapter.reportsProgress && photo ? (
            <label className="share__progress">
              <span>Uploading your photograph</span>
              <progress max={1} value={phase.progress ?? 0} />
            </label>
          ) : null}
          {sending ? (
            <p className="visually-hidden" role="status">
              Sending your memory.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
