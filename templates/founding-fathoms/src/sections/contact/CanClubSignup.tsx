import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useBrewery } from '../../app/BreweryContext';
import { DemonstrationResult, Field, describedBy, inputClass } from '../../components/form';
import { ClipButton, Eyebrow } from '../../components/ui';
import { price } from '../../lib/content';
import { EMAIL_PATTERN, senderFor, type FormSender, type SendResult } from '../../lib/forms';

interface Values {
  name: string;
  email: string;
  plan: string;
  ofAge: boolean;
}

type Errors = Partial<Record<keyof Values, string>>;

const ORDER: (keyof Values)[] = ['name', 'email', 'ofAge'];

export function validateCanClub(values: Values, minimumAge: number): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a complete email address.';
  if (!values.ofAge) errors.ofAge = `Can Club members must be ${minimumAge} or older.`;
  return errors;
}

const welcome = (plan: string) =>
  `You’re in: ${plan}. We’ll email you when your first drop is ready to collect, and you can skip or pause any month.`;

/**
 * The Can Club sign-up on cream: pick a plan, leave a name and email. There are no accounts or passwords;
 * the brewery confirms each member by email. Posts to `VITE_CAN_CLUB_ENDPOINT` when one is set.
 */
export function CanClubSignup({ sender: providedSender }: { sender?: FormSender }) {
  const { canClub, shop } = useBrewery();
  const [sender] = useState(() => providedSender ?? senderFor(import.meta.env.VITE_CAN_CLUB_ENDPOINT));
  const firstPlan = canClub.plans[0]?.id ?? '';
  const [values, setValues] = useState<Values>({ name: '', email: '', plan: firstPlan, ofAge: false });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ outcome: SendResult; plan: string } | undefined>(undefined);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const fieldId = (name: keyof Values) => `${id}-${name}`;

  useEffect(() => {
    if (result?.outcome.kind === 'sent' || result?.outcome.kind === 'demonstration') resultRef.current?.focus();
  }, [result]);

  const update = <K extends keyof Values>(name: K, value: Values[K]) => setValues((current) => ({ ...current, [name]: value }));
  const plan = canClub.plans.find((entry) => entry.id === values.plan);
  const planName = plan ? `${plan.label}, ${plan.cans} cans ${plan.cadence} for ${price(plan.price)}` : values.plan;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateCanClub(values, shop.minimumAge);
    setErrors(found);
    const first = ORDER.find((name) => found[name]);
    if (first) {
      document.getElementById(fieldId(first))?.focus();
      return;
    }
    setSending(true);
    const outcome = await sender.send({
      name: values.name.trim(),
      email: values.email.trim(),
      plan: plan?.label ?? values.plan,
      price: plan?.price ?? 0,
      ageConfirmed: values.ofAge,
    });
    setSending(false);
    setResult({ outcome, plan: planName });
  };

  return (
    <section id="can-club" aria-labelledby={`${id}-title`} className="scroll-mt-24 bg-cream py-16 text-navy md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 max-w-2xl">
          <Eyebrow ground="light">{canClub.eyebrow}</Eyebrow>
          <h2 id={`${id}-title`} className="font-display text-5xl tracking-wide">
            {canClub.heading}
          </h2>
          <p className="mt-3 leading-relaxed text-slate">{canClub.intro}</p>
        </div>

        <div className="max-w-3xl">
          {result?.outcome.kind === 'sent' ? (
            <div className="flex gap-3 border-2 border-navy/15 bg-cream-deep p-6">
              <CheckCircle2 size={22} aria-hidden="true" className="mt-1 shrink-0 text-brass-ink" />
              <h3 ref={resultRef} tabIndex={-1} className="leading-relaxed focus:outline-none">
                {welcome(result.plan)}
              </h3>
            </div>
          ) : result?.outcome.kind === 'demonstration' ? (
            <DemonstrationResult headingRef={resultRef} wouldSee={welcome(result.plan)} onBack={() => setResult(undefined)} />
          ) : (
            <form noValidate onSubmit={(event) => void submit(event)} aria-busy={sending} className="space-y-6">
              <fieldset>
                <legend className="mb-3 text-xs uppercase tracking-[0.15em] text-slate">Plan</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {canClub.plans.map((entry) => (
                    <label
                      key={entry.id}
                      className="clip-card flex cursor-pointer gap-3 border-2 border-navy/15 bg-cream-deep p-5 has-[:checked]:border-navy"
                    >
                      <input
                        type="radio"
                        name={`${id}-plan`}
                        value={entry.id}
                        checked={values.plan === entry.id}
                        onChange={() => update('plan', entry.id)}
                        className="mt-1 h-5 w-5 shrink-0 accent-navy"
                      />
                      <span>
                        <span className="block font-display text-2xl tracking-wide">{entry.label}</span>
                        <span className="block font-display text-3xl text-brass-ink">
                          {price(entry.price)} <span className="font-sans text-sm text-slate">{entry.cadence}</span>
                        </span>
                        <span className="block text-sm text-slate">{entry.cans} cans each drop</span>
                        {entry.note ? <span className="mt-1 block text-sm font-semibold text-navy">{entry.note}</span> : null}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id={fieldId('name')} label="Name" error={errors.name}>
                  <input
                    id={fieldId('name')}
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => update('name', event.target.value)}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={describedBy(fieldId('name'), { error: errors.name })}
                    className={inputClass.light}
                  />
                </Field>
                <Field id={fieldId('email')} label="Email" error={errors.email}>
                  <input
                    id={fieldId('email')}
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(event) => update('email', event.target.value)}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={describedBy(fieldId('email'), { error: errors.email })}
                    className={inputClass.light}
                  />
                </Field>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    id={fieldId('ofAge')}
                    type="checkbox"
                    checked={values.ofAge}
                    onChange={(event) => update('ofAge', event.target.checked)}
                    aria-invalid={errors.ofAge ? true : undefined}
                    aria-describedby={describedBy(fieldId('ofAge'), { error: errors.ofAge })}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-navy"
                  />
                  <span>I’m {shop.minimumAge} or older, and I’ll bring photo ID when I collect each drop.</span>
                </label>
                {errors.ofAge ? (
                  <p id={`${fieldId('ofAge')}-error`} className="mt-1 text-sm font-medium text-navy">
                    <span className="sr-only">Error: </span>
                    {errors.ofAge}
                  </p>
                ) : null}
              </div>

              {result?.outcome.kind === 'failed' ? (
                <p role="alert" className="text-sm font-medium text-navy">
                  {result.outcome.message}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-4">
                <ClipButton variant="navy" disabled={sending}>
                  {sending ? 'Joining…' : 'Join the Can Club'}
                </ClipButton>
                {sender.mode === 'demonstration' ? <p className="text-sm text-slate">Template preview: nothing is sent.</p> : null}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
