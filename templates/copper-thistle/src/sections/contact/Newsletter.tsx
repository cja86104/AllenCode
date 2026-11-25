import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRestaurant } from '../../app/RestaurantContext';
import { DemonstrationResult } from '../../components/form';
import { EMAIL_PATTERN, senderFor, type FormSender, type SendResult } from '../../lib/forms';

/** The mailing-list sign-up on the contact page. */
export function Newsletter({ sender: providedSender }: { sender?: FormSender }) {
  const { newsletter } = useRestaurant();
  const [sender] = useState(() => providedSender ?? senderFor(import.meta.env.VITE_NEWSLETTER_ENDPOINT));
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | undefined>(undefined);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const fieldId = useId();

  useEffect(() => {
    if (result?.kind === 'sent' || result?.kind === 'demonstration') resultRef.current?.focus();
  }, [result]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Please enter a complete email address.');
      document.getElementById(fieldId)?.focus();
      return;
    }
    setError('');
    setSending(true);
    const outcome = await sender.send({ email: email.trim() });
    setSending(false);
    setResult(outcome);
  };

  return (
    <section
      aria-labelledby={`${fieldId}-title`}
      className="relative overflow-hidden bg-gradient-to-br from-burgundy-deep to-burgundy px-6 py-28 text-center text-cream"
    >
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 id={`${fieldId}-title`} className="mb-6 font-display text-4xl italic leading-tight md:text-6xl">
          {newsletter.heading}
        </h2>
        <p className="mx-auto mb-10 max-w-md text-cream/90">{newsletter.body}</p>

        {result?.kind === 'sent' ? (
          <div className="flex items-center justify-center gap-3 text-gold">
            <CheckCircle2 size={22} aria-hidden="true" />
            <h3 ref={resultRef} tabIndex={-1} className="text-sm uppercase tracking-[0.2em] focus:outline-none">
              You’re on the list. Welcome.
            </h3>
          </div>
        ) : result?.kind === 'demonstration' ? (
          <div className="text-left">
            <DemonstrationResult
              ground="dark"
              headingRef={resultRef}
              wouldSee="You’re on the list. Welcome."
              onBack={() => setResult(undefined)}
            />
          </div>
        ) : (
          <form noValidate onSubmit={(event) => void submit(event)} aria-busy={sending} className="mx-auto max-w-md">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor={fieldId} className="sr-only">
                Email address
              </label>
              <input
                id={fieldId}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your@email.com"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${fieldId}-error` : undefined}
                className="min-h-[3.25rem] flex-1 border border-cream/40 bg-white/10 px-5 py-4 text-cream placeholder:text-cream/70 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="group inline-flex min-h-[3.25rem] items-center justify-center gap-2 bg-gold px-6 py-4 text-sm uppercase tracking-[0.2em] text-charcoal transition-colors duration-300 hover:bg-cream disabled:opacity-70 motion-reduce:transition-none"
              >
                {sending ? 'Sending…' : 'Subscribe'}{' '}
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </button>
            </div>
            {sender.mode === 'demonstration' ? <p className="mt-3 text-sm text-cream/90">Template preview: nothing is sent.</p> : null}
            {error ? (
              <p id={`${fieldId}-error`} className="mt-4 text-sm font-medium text-gold">
                <span className="sr-only">Error: </span>
                {error}
              </p>
            ) : null}
            {result?.kind === 'failed' ? (
              <p role="alert" className="mt-4 text-sm font-medium text-gold">
                {result.message}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}
