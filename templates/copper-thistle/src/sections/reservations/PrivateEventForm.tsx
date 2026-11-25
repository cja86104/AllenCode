import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useInBrowser, useRestaurant } from '../../app/RestaurantContext';
import { DemonstrationResult, describedBy, Field, inputClass } from '../../components/form';
import { Reveal } from '../../components/Reveal';
import { Eyebrow, PillButton } from '../../components/ui';
import { EMAIL_PATTERN, senderFor, type FormSender, type SendResult } from '../../lib/forms';
import { isoDate } from '../../lib/hours';

interface Inquiry {
  eventDate: string;
  guests: string;
  occasion: string;
  name: string;
  email: string;
  message: string;
}

type ErrorKey = 'eventDate' | 'guests' | 'occasion' | 'name' | 'email';
const EMPTY: Inquiry = { eventDate: '', guests: '', occasion: '', name: '', email: '', message: '' };
const ORDER: ErrorKey[] = ['eventDate', 'guests', 'occasion', 'name', 'email'];

/** The private dining inquiry, on a dark card at the foot of the reservations page. */
export function PrivateEventForm({ sender: providedSender }: { sender?: FormSender }) {
  const restaurant = useRestaurant();
  const settings = restaurant.privateEvents;
  const inBrowser = useInBrowser();
  const [sender] = useState(() => providedSender ?? senderFor(import.meta.env.VITE_EVENTS_ENDPOINT));
  const [inquiry, setInquiry] = useState<Inquiry>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | undefined>(undefined);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLParagraphElement>(null);
  const base = useId();
  const id = (name: string) => `${base}-${name}`;
  const minDate = inBrowser ? isoDate(new Date()) : undefined;

  useEffect(() => {
    if (result?.kind === 'sent' || result?.kind === 'demonstration') resultRef.current?.focus();
    if (result?.kind === 'failed') failureRef.current?.focus();
  }, [result]);

  const update = (key: keyof Inquiry, value: string) => {
    setInquiry((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const found: Partial<Record<ErrorKey, string>> = {};
    if (!inquiry.eventDate) found.eventDate = 'Please choose a date.';
    else if (minDate && inquiry.eventDate < minDate) found.eventDate = 'Please choose a date from today onward.';
    const guests = Number(inquiry.guests);
    if (!inquiry.guests) found.guests = 'Please tell us how many guests.';
    else if (!Number.isInteger(guests) || guests < 1 || guests > settings.capacity)
      found.guests = `Please enter a number from 1 to ${settings.capacity}.`;
    if (!inquiry.occasion) found.occasion = 'Please choose an occasion.';
    if (!inquiry.name.trim()) found.name = 'Please enter your name.';
    if (!EMAIL_PATTERN.test(inquiry.email.trim())) found.email = 'Please enter a complete email address.';
    return found;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    const first = ORDER.find((key) => found[key]);
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }
    setSending(true);
    setResult(undefined);
    const outcome = await sender.send({
      ...inquiry,
      guests: Number(inquiry.guests),
      name: inquiry.name.trim(),
      email: inquiry.email.trim(),
    });
    setSending(false);
    setResult(outcome);
  };

  const control = (key: ErrorKey) => ({
    id: id(key),
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': describedBy(id(key), { error: errors[key], hint: key === 'guests' }),
  });

  return (
    <section id="private-events" aria-labelledby={id('title')} className="mx-auto max-w-7xl scroll-mt-28 px-6 pb-28">
      <Reveal className="bg-charcoal p-8 text-cream shadow-2xl md:p-12">
        {result?.kind === 'sent' ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto mb-4 text-gold" size={40} aria-hidden="true" />
            <h2 id={id('title')} ref={resultRef} tabIndex={-1} className="mb-2 font-display text-2xl italic focus:outline-none">
              Inquiry received
            </h2>
            <p className="text-mist">{settings.received}</p>
          </div>
        ) : result?.kind === 'demonstration' ? (
          <>
            <h2 id={id('title')} className="sr-only">
              {settings.heading}
            </h2>
            <DemonstrationResult
              ground="dark"
              headingRef={resultRef}
              wouldSee={`Inquiry received. ${settings.received}`}
              onBack={() => setResult(undefined)}
            />
          </>
        ) : (
          <form noValidate onSubmit={(event) => void submit(event)} aria-busy={sending}>
            <div className="mb-8">
              <Eyebrow tone="dark" className="tracking-[0.25em]">
                {settings.eyebrow}
              </Eyebrow>
              <h2 id={id('title')} className="font-display text-3xl italic">
                {settings.heading}
              </h2>
              {sender.mode === 'demonstration' ? (
                <p className="mt-3 border-l-2 border-gold pl-3 text-sm text-mist">
                  Template preview: this form isn’t connected, so nothing is sent.
                </p>
              ) : null}
            </div>
            {result?.kind === 'failed' ? (
              <p
                ref={failureRef}
                tabIndex={-1}
                role="alert"
                className="mb-6 border-l-2 border-gold pl-3 text-sm font-medium text-gold focus:outline-none"
              >
                {result.message}
              </p>
            ) : null}
            <div className="mb-6 grid gap-6 md:grid-cols-3">
              <Field id={id('eventDate')} label="Event date" error={errors.eventDate} ground="dark">
                <input
                  type="date"
                  min={minDate}
                  value={inquiry.eventDate}
                  onChange={(event) => update('eventDate', event.target.value)}
                  className={inputClass.dark}
                  {...control('eventDate')}
                />
              </Field>
              <Field id={id('guests')} label="Guests" error={errors.guests} hint={`Up to ${settings.capacity}.`} ground="dark">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={settings.capacity}
                  value={inquiry.guests}
                  onChange={(event) => update('guests', event.target.value)}
                  className={inputClass.dark}
                  {...control('guests')}
                />
              </Field>
              <Field id={id('occasion')} label="Occasion" error={errors.occasion} ground="dark">
                <select
                  value={inquiry.occasion}
                  onChange={(event) => update('occasion', event.target.value)}
                  className={inputClass.dark}
                  {...control('occasion')}
                >
                  <option value="">Select one</option>
                  {settings.occasions.map((occasion) => (
                    <option key={occasion} value={occasion}>
                      {occasion}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <Field id={id('name')} label="Your name" error={errors.name} ground="dark">
                <input
                  autoComplete="name"
                  value={inquiry.name}
                  onChange={(event) => update('name', event.target.value)}
                  className={inputClass.dark}
                  {...control('name')}
                />
              </Field>
              <Field id={id('email')} label="Email" error={errors.email} ground="dark">
                <input
                  type="email"
                  autoComplete="email"
                  value={inquiry.email}
                  onChange={(event) => update('email', event.target.value)}
                  className={inputClass.dark}
                  {...control('email')}
                />
              </Field>
            </div>
            <div className="mb-6">
              <Field id={id('message')} label="Tell us about your vision" optional ground="dark">
                <textarea
                  id={id('message')}
                  rows={3}
                  value={inquiry.message}
                  onChange={(event) => update('message', event.target.value)}
                  className={inputClass.dark}
                />
              </Field>
            </div>
            <PillButton disabled={sending}>{sending ? 'Sending…' : result?.kind === 'failed' ? 'Try again' : 'Send inquiry'}</PillButton>
          </form>
        )}
      </Reveal>
    </section>
  );
}
