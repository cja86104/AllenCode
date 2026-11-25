import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { useBrewery } from '../../app/BreweryContext';
import { DemonstrationResult, Field, describedBy, inputClass } from '../../components/form';
import { ClipButton } from '../../components/ui';
import { EMAIL_PATTERN, senderFor, type FormSender, type SendResult } from '../../lib/forms';

interface Values {
  name: string;
  email: string;
  topic: string;
  message: string;
}

type Errors = Partial<Record<keyof Values, string>>;

const ORDER: (keyof Values)[] = ['name', 'email', 'topic', 'message'];

export function validateContact(values: Values): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a complete email address.';
  if (values.message.trim().length < 10) errors.message = 'Tell us a little more: at least 10 characters.';
  return errors;
}

const WOULD_SEE = 'Message received. The pier office answers within two business days.';

/** “Write us”: a message to the pier office, posted to `VITE_CONTACT_ENDPOINT` when one is set. */
export function ContactForm({ sender: providedSender }: { sender?: FormSender }) {
  const { contactPage } = useBrewery();
  const [sender] = useState(() => providedSender ?? senderFor(import.meta.env.VITE_CONTACT_ENDPOINT));
  const firstTopic = contactPage.topics[0]?.id ?? '';
  const [values, setValues] = useState<Values>({ name: '', email: '', topic: firstTopic, message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | undefined>(undefined);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const fieldId = (name: keyof Values) => `${id}-${name}`;

  useEffect(() => {
    if (result?.kind === 'sent' || result?.kind === 'demonstration') resultRef.current?.focus();
  }, [result]);

  const update = (name: keyof Values, value: string) => setValues((current) => ({ ...current, [name]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    const first = ORDER.find((name) => found[name]);
    if (first) {
      document.getElementById(fieldId(first))?.focus();
      return;
    }
    setSending(true);
    const topic = contactPage.topics.find((entry) => entry.id === values.topic)?.label ?? values.topic;
    const outcome = await sender.send({
      name: values.name.trim(),
      email: values.email.trim(),
      topic,
      message: values.message.trim(),
    });
    setSending(false);
    setResult(outcome);
    if (outcome.kind === 'sent') setValues({ name: '', email: '', topic: firstTopic, message: '' });
  };

  return (
    <section aria-labelledby={`${id}-title`} className="border border-cream/15 bg-panel p-6 md:p-8">
      <h2 id={`${id}-title`} className="mb-6 flex items-center gap-2 font-display text-4xl tracking-wide">
        <Mail size={20} aria-hidden="true" className="text-brass" />
        Write us
      </h2>
      {result?.kind === 'sent' ? (
        <div className="flex gap-3">
          <CheckCircle2 size={20} aria-hidden="true" className="mt-1 shrink-0 text-brass" />
          <h3 ref={resultRef} tabIndex={-1} className="leading-relaxed focus:outline-none">
            {WOULD_SEE}
          </h3>
        </div>
      ) : result?.kind === 'demonstration' ? (
        <DemonstrationResult ground="dark" headingRef={resultRef} wouldSee={WOULD_SEE} onBack={() => setResult(undefined)} />
      ) : (
        <form noValidate onSubmit={(event) => void submit(event)} aria-busy={sending} className="space-y-5">
          <Field id={fieldId('name')} label="Name" error={errors.name} ground="dark">
            <input
              id={fieldId('name')}
              autoComplete="name"
              value={values.name}
              onChange={(event) => update('name', event.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy(fieldId('name'), { error: errors.name })}
              className={inputClass.dark}
            />
          </Field>
          <Field id={fieldId('email')} label="Email" error={errors.email} ground="dark">
            <input
              id={fieldId('email')}
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => update('email', event.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy(fieldId('email'), { error: errors.email })}
              className={inputClass.dark}
            />
          </Field>
          <Field id={fieldId('topic')} label="Topic" ground="dark">
            <select
              id={fieldId('topic')}
              value={values.topic}
              onChange={(event) => update('topic', event.target.value)}
              className={inputClass.dark}
            >
              {contactPage.topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id={fieldId('message')} label="Message" error={errors.message} ground="dark">
            <textarea
              id={fieldId('message')}
              rows={5}
              value={values.message}
              onChange={(event) => update('message', event.target.value)}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={describedBy(fieldId('message'), { error: errors.message })}
              className={`${inputClass.dark} resize-y`}
            />
          </Field>
          {result?.kind === 'failed' ? (
            <p role="alert" className="text-sm font-medium text-brass">
              {result.message}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4">
            <ClipButton disabled={sending}>{sending ? 'Sending…' : 'Send message'}</ClipButton>
            {sender.mode === 'demonstration' ? <p className="text-sm text-mist">Template preview: nothing is sent.</p> : null}
          </div>
        </form>
      )}
    </section>
  );
}
