import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Minus, Plus } from 'lucide-react';
import { useInBrowser, useRestaurant } from '../../app/RestaurantContext';
import { DemonstrationResult, describedBy, Field, inputClass } from '../../components/form';
import { PillButton } from '../../components/ui';
import { EMAIL_PATTERN, senderFor, type FormSender, type SendResult } from '../../lib/forms';
import { addDays, dayName, isoDate, longDate, slotsFor, weekdayOf } from '../../lib/hours';

interface Details {
  date: string;
  time: string;
  party: number;
  name: string;
  email: string;
  phone: string;
  requests: string;
}

type ErrorKey = 'date' | 'time' | 'name' | 'email';
type Errors = Partial<Record<ErrorKey, string>>;

const EMPTY: Details = { date: '', time: '', party: 2, name: '', email: '', phone: '', requests: '' };

interface ReservationFormProps {
  /** Supplied by tests; the site uses the endpoint configured for the build. */
  sender?: FormSender;
  /** Supplied by tests; defaults to the visitor's today. */
  today?: Date;
}

/**
 * Reserve a table. Dates are limited to the booking window, closed days say so, and the times offered are
 * the ones the kitchen seats that day. When the restaurant books through an outside service, a link to it
 * replaces the form.
 */
export function ReservationForm({ sender: providedSender, today: providedToday }: ReservationFormProps) {
  const restaurant = useRestaurant();
  const settings = restaurant.reservations;
  const inBrowser = useInBrowser();
  const [sender] = useState(() => providedSender ?? senderFor(import.meta.env.VITE_RESERVATION_ENDPOINT));
  const [details, setDetails] = useState<Details>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | undefined>(undefined);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLParagraphElement>(null);
  const base = useId();
  const id = (name: string) => `${base}-${name}`;

  // The date limits depend on the visitor's own today, so they are only applied in the browser.
  const today = providedToday ?? new Date();
  const minDate = inBrowser ? isoDate(today) : undefined;
  const maxDate = inBrowser ? isoDate(addDays(today, settings.bookingWindowDays)) : undefined;
  const slots = details.date ? slotsFor(details.date, restaurant.hours.schedule, settings) : [];
  const weekday = weekdayOf(details.date);
  const closedDay = details.date !== '' && weekday !== undefined && slots.length === 0;

  useEffect(() => {
    if (result?.kind === 'sent' || result?.kind === 'demonstration') resultRef.current?.focus();
    if (result?.kind === 'failed') failureRef.current?.focus();
  }, [result]);

  if (settings.external) {
    return (
      <div className="bg-paper p-8 shadow-xl md:p-10">
        <h2 className="mb-3 font-display text-3xl italic">Reserve a table</h2>
        <p className="mb-8 text-stone">{settings.note}</p>
        <a
          href={settings.external.url}
          rel="noopener"
          className="inline-flex min-h-[2.75rem] items-center rounded-full border border-burgundy px-8 py-3.5 text-sm uppercase tracking-[0.2em] text-burgundy hover:bg-burgundy hover:text-cream"
        >
          {settings.external.label}
        </a>
      </div>
    );
  }

  const update = <K extends keyof Details>(key: K, value: Details[K]) => {
    setDetails((current) => ({ ...current, [key]: value, ...(key === 'date' ? { time: '' } : {}) }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): Errors => {
    const found: Errors = {};
    if (!details.date) found.date = 'Please choose a date.';
    else if (minDate && details.date < minDate) found.date = 'Please choose a date from today onward.';
    else if (maxDate && details.date > maxDate) found.date = `We take reservations up to ${settings.bookingWindowDays} days ahead.`;
    else if (closedDay && weekday !== undefined) found.date = `We’re closed on ${dayName(weekday)}s. Please choose another day.`;
    if (!found.date && !details.time) found.time = 'Please choose a time.';
    if (!details.name.trim()) found.name = 'Please enter your name.';
    if (!EMAIL_PATTERN.test(details.email.trim())) found.email = 'Please enter a complete email address.';
    return found;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    const first = (['date', 'time', 'name', 'email'] as const).find((key) => found[key]);
    if (first) {
      document.getElementById(first === 'time' ? `${id('time')}-0` : id(first))?.focus();
      return;
    }
    setSending(true);
    setResult(undefined);
    const outcome = await sender.send({ ...details, name: details.name.trim(), email: details.email.trim() });
    setSending(false);
    setResult(outcome);
  };

  if (result?.kind === 'sent') {
    return (
      <div className="bg-paper p-10 text-center shadow-xl">
        <CheckCircle2 className="mx-auto mb-4 text-burgundy" size={44} aria-hidden="true" />
        <h2 ref={resultRef} tabIndex={-1} className="mb-2 font-display text-2xl italic focus:outline-none">
          Request received, {details.name.trim().split(' ')[0]}
        </h2>
        <p className="mb-6 text-stone">
          A table for {details.party} on {longDate(details.date)} at {details.time}. We’ll confirm by email at {details.email.trim()}.
        </p>
        <button
          type="button"
          onClick={() => {
            setDetails(EMPTY);
            setResult(undefined);
          }}
          className="min-h-[2.75rem] border-b border-gold-ink pb-1 text-sm uppercase tracking-[0.2em] text-gold-ink"
        >
          Make another reservation
        </button>
      </div>
    );
  }

  if (result?.kind === 'demonstration') {
    return (
      <div className="bg-paper p-8 shadow-xl md:p-10">
        <DemonstrationResult
          headingRef={resultRef}
          headingLevel={2}
          wouldSee={`Request received, ${details.name.trim().split(' ')[0]}. A table for ${details.party} on ${longDate(details.date)} at ${details.time}. We’ll confirm by email at ${details.email.trim()}.`}
          onBack={() => setResult(undefined)}
        />
      </div>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form noValidate onSubmit={(event) => void submit(event)} aria-busy={sending} className="space-y-8 bg-paper p-8 shadow-xl md:p-10">
      <div>
        <h2 className="mb-1 font-display text-3xl italic">Reserve a table</h2>
        <p className="text-sm text-stone">{settings.note}</p>
        {sender.mode === 'demonstration' ? (
          <p className="mt-3 border-l-2 border-gold-ink pl-3 text-sm text-stone">
            Template preview: this form isn’t connected, so nothing is sent.
          </p>
        ) : null}
      </div>

      {errorCount > 0 ? (
        <p role="alert" className="text-sm font-medium text-burgundy">
          {errorCount === 1 ? 'One thing needs a look before booking.' : `${errorCount} things need a look before booking.`}
        </p>
      ) : null}
      {result?.kind === 'failed' ? (
        <p
          ref={failureRef}
          tabIndex={-1}
          role="alert"
          className="border-l-2 border-burgundy pl-3 text-sm font-medium text-burgundy focus:outline-none"
        >
          {result.message}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={id('date')} label="Date" error={errors.date}>
          <input
            id={id('date')}
            type="date"
            min={minDate}
            max={maxDate}
            value={details.date}
            onChange={(event) => update('date', event.target.value)}
            aria-invalid={errors.date ? true : undefined}
            aria-describedby={describedBy(id('date'), { error: errors.date })}
            className={inputClass.light}
          />
        </Field>
        <div>
          <span id={id('party-label')} className="mb-2 block text-xs uppercase tracking-[0.15em] text-stone">
            Party size
          </span>
          <div role="group" aria-labelledby={id('party-label')} className="flex items-center border border-stone/60">
            <button
              type="button"
              onClick={() => update('party', Math.max(1, details.party - 1))}
              disabled={details.party <= 1}
              className="inline-flex h-11 w-11 items-center justify-center hover:text-gold-ink disabled:opacity-40"
            >
              <Minus size={16} aria-hidden="true" />
              <span className="sr-only">Fewer guests</span>
            </button>
            <output aria-live="polite" className="flex-1 text-center">
              {details.party} {details.party === 1 ? 'guest' : 'guests'}
            </output>
            <button
              type="button"
              onClick={() => update('party', Math.min(settings.largestParty, details.party + 1))}
              disabled={details.party >= settings.largestParty}
              className="inline-flex h-11 w-11 items-center justify-center hover:text-gold-ink disabled:opacity-40"
            >
              <Plus size={16} aria-hidden="true" />
              <span className="sr-only">More guests</span>
            </button>
          </div>
          <p className="mt-1 text-sm text-stone">For more than {settings.largestParty}, please send a private event inquiry below.</p>
        </div>
      </div>

      <fieldset aria-describedby={errors.time ? `${id('time')}-error` : undefined}>
        <legend className="mb-3 block text-xs uppercase tracking-[0.15em] text-stone">Time</legend>
        {!details.date ? (
          <p className="text-sm text-stone">Choose a date to see available times.</p>
        ) : closedDay && weekday !== undefined ? (
          <p className="text-sm text-stone">We’re closed on {dayName(weekday)}s. Please choose another day.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot, index) => (
              <label key={slot} className="cursor-pointer">
                <input
                  id={`${id('time')}-${index}`}
                  type="radio"
                  name={id('time')}
                  value={slot}
                  checked={details.time === slot}
                  onChange={() => update('time', slot)}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-[2.75rem] items-center rounded-full border border-stone/60 px-4 text-sm transition-colors peer-checked:border-burgundy peer-checked:bg-burgundy peer-checked:text-cream peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-ink hover:border-gold-ink motion-reduce:transition-none">
                  {slot}
                </span>
              </label>
            ))}
          </div>
        )}
        {errors.time ? (
          <p id={`${id('time')}-error`} className="mt-2 text-sm font-medium text-burgundy">
            <span className="sr-only">Error: </span>
            {errors.time}
          </p>
        ) : null}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={id('name')} label="Name" error={errors.name}>
          <input
            id={id('name')}
            autoComplete="name"
            value={details.name}
            onChange={(event) => update('name', event.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy(id('name'), { error: errors.name })}
            className={inputClass.light}
          />
        </Field>
        <Field id={id('email')} label="Email" error={errors.email}>
          <input
            id={id('email')}
            type="email"
            autoComplete="email"
            value={details.email}
            onChange={(event) => update('email', event.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy(id('email'), { error: errors.email })}
            className={inputClass.light}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={id('phone')} label="Phone" optional hint="In case we need to reach you on the day.">
          <input
            id={id('phone')}
            type="tel"
            autoComplete="tel"
            value={details.phone}
            onChange={(event) => update('phone', event.target.value)}
            aria-describedby={describedBy(id('phone'), { hint: true })}
            className={inputClass.light}
          />
        </Field>
        <Field id={id('requests')} label="Special requests" optional>
          <textarea
            id={id('requests')}
            rows={3}
            value={details.requests}
            onChange={(event) => update('requests', event.target.value)}
            className={inputClass.light}
          />
        </Field>
      </div>

      <PillButton tone="light" disabled={sending} className="w-full sm:w-auto">
        {sending ? 'Sending…' : result?.kind === 'failed' ? 'Try again' : 'Request reservation'}
      </PillButton>
    </form>
  );
}
