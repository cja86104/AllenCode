import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useBrewery } from '../../app/BreweryContext';
import { useCart } from '../../app/CartContext';
import { DemonstrationResult, Field, describedBy, inputClass } from '../../components/form';
import { ClipButton } from '../../components/ui';
import { holdsBeer, money } from '../../lib/cart';
import { EMAIL_PATTERN, senderFor, type FormSender, type SendResult } from '../../lib/forms';

interface Values {
  name: string;
  email: string;
  phone: string;
  pickup: string;
  notes: string;
  ofAge: boolean;
}

type Errors = Partial<Record<keyof Values, string>>;

const ORDER: (keyof Values)[] = ['name', 'email', 'phone', 'ofAge'];

export function validateCheckout(values: Values, options: { beer: boolean; minimumAge: number }): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter the name the order is for.';
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a complete email address.';
  if (values.phone.replace(/\D/g, '').length < 7) errors.phone = 'Please enter a phone number we can call at pickup.';
  if (options.beer && !values.ofAge) errors.ofAge = `Beer can only be collected by someone ${options.minimumAge} or older.`;
  return errors;
}

const confirmation = (pickup: string) => `Your order is held. ${pickup}. We’ll check your ID and take payment when you collect it.`;

/** Pickup checkout: who's collecting, how, and an age confirmation when there's beer. No payment is taken online. */
export function Checkout({ sender: providedSender }: { sender?: FormSender }) {
  const { shop } = useBrewery();
  const cart = useCart();
  const [sender] = useState(() => providedSender ?? senderFor(import.meta.env.VITE_ORDER_ENDPOINT));
  const firstPickup = shop.pickupOptions[0]?.id ?? '';
  const [values, setValues] = useState<Values>({ name: '', email: '', phone: '', pickup: firstPickup, notes: '', ofAge: false });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ outcome: SendResult; pickup: string } | undefined>(undefined);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const fieldId = (name: keyof Values) => `${id}-${name}`;
  const beer = holdsBeer(cart.lines);

  useEffect(() => {
    if (result?.outcome.kind === 'sent' || result?.outcome.kind === 'demonstration') resultRef.current?.focus();
  }, [result]);

  const update = <K extends keyof Values>(name: K, value: Values[K]) => setValues((current) => ({ ...current, [name]: value }));
  const pickupLabel = shop.pickupOptions.find((option) => option.id === values.pickup)?.label ?? values.pickup;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateCheckout(values, { beer, minimumAge: shop.minimumAge });
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
      phone: values.phone.trim(),
      pickup: pickupLabel,
      notes: values.notes.trim(),
      ageConfirmed: beer ? values.ofAge : false,
      items: cart.lines.map((line) => ({
        id: line.product.id,
        name: line.product.name,
        quantity: line.quantity,
        price: line.product.price,
      })),
      total: cart.total,
    });
    setSending(false);
    setResult({ outcome, pickup: pickupLabel });
    if (outcome.kind === 'sent') cart.clear();
  };

  return (
    <section id="checkout" aria-labelledby={`${id}-title`} className="scroll-mt-24 bg-panel py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h2 id={`${id}-title`} className="mb-2 font-display text-5xl tracking-wide">
          Checkout
        </h2>
        <p className="mb-8 text-mist">Order ahead and collect at the taproom. {shop.paymentNote}</p>

        {result?.outcome.kind === 'sent' ? (
          <div className="flex gap-3 border border-brass/40 bg-navy p-6">
            <CheckCircle2 size={22} aria-hidden="true" className="mt-1 shrink-0 text-brass" />
            <h3 ref={resultRef} tabIndex={-1} className="leading-relaxed focus:outline-none">
              {confirmation(result.pickup)}
            </h3>
          </div>
        ) : result?.outcome.kind === 'demonstration' ? (
          <div className="border border-cream/10 bg-navy p-6">
            <DemonstrationResult
              ground="dark"
              headingRef={resultRef}
              wouldSee={confirmation(result.pickup)}
              onBack={() => setResult(undefined)}
            />
          </div>
        ) : cart.lines.length === 0 ? (
          <p className="border border-cream/10 bg-navy p-6 text-mist">
            Your cart is empty. Add four-packs or gear above, then come back here to check out.
          </p>
        ) : (
          <>
            <div className="mb-8 border border-cream/10 bg-navy p-6">
              <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-brass">Your order</h3>
              <ul className="mb-4 space-y-2">
                {cart.lines.map((line) => (
                  <li key={line.product.id} className="flex justify-between gap-4 text-sm">
                    <span>
                      {line.quantity} × {line.product.name}
                      {line.product.pack ? <span className="text-mist"> ({line.product.pack})</span> : null}
                    </span>
                    <span className="text-brass">{money(line.total)}</span>
                  </li>
                ))}
              </ul>
              <p className="flex justify-between border-t border-cream/10 pt-3 font-display text-2xl">
                <span>Total before tax</span>
                <span className="text-brass">{money(cart.total)}</span>
              </p>
            </div>

            <form noValidate onSubmit={(event) => void submit(event)} aria-busy={sending} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id={fieldId('name')} label="Name for the order" error={errors.name} ground="dark">
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
              </div>
              <Field id={fieldId('phone')} label="Phone" error={errors.phone} ground="dark">
                <input
                  id={fieldId('phone')}
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={describedBy(fieldId('phone'), { error: errors.phone })}
                  className={inputClass.dark}
                />
              </Field>

              <fieldset>
                <legend className="mb-2 text-xs uppercase tracking-[0.15em] text-mist">Pickup</legend>
                <div className="space-y-2">
                  {shop.pickupOptions.map((option) => (
                    <label key={option.id} className="flex min-h-[2.75rem] cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name={`${id}-pickup`}
                        value={option.id}
                        checked={values.pickup === option.id}
                        onChange={() => update('pickup', option.id)}
                        className="h-5 w-5 accent-brass"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field id={fieldId('notes')} label="Notes" optional ground="dark">
                <textarea
                  id={fieldId('notes')}
                  rows={2}
                  value={values.notes}
                  onChange={(event) => update('notes', event.target.value)}
                  className={`${inputClass.dark} resize-y`}
                />
              </Field>

              {beer ? (
                <div>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      id={fieldId('ofAge')}
                      type="checkbox"
                      checked={values.ofAge}
                      onChange={(event) => update('ofAge', event.target.checked)}
                      aria-invalid={errors.ofAge ? true : undefined}
                      aria-describedby={describedBy(fieldId('ofAge'), { error: errors.ofAge })}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-brass"
                    />
                    <span>I’m {shop.minimumAge} or older, and whoever collects this order will bring photo ID.</span>
                  </label>
                  {errors.ofAge ? (
                    <p id={`${fieldId('ofAge')}-error`} className="mt-1 text-sm font-medium text-brass">
                      <span className="sr-only">Error: </span>
                      {errors.ofAge}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {result?.outcome.kind === 'failed' ? (
                <p role="alert" className="text-sm font-medium text-brass">
                  {result.outcome.message}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-4">
                <ClipButton disabled={sending}>{sending ? 'Placing order…' : 'Place pickup order'}</ClipButton>
                {sender.mode === 'demonstration' ? <p className="text-sm text-mist">Template preview: nothing is sent.</p> : null}
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
