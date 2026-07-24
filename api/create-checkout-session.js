// Vercel Serverless Function
// POST /api/create-checkout-session
//
// Creates a real Stripe Checkout Session using dynamic price_data, so no
// Stripe Products/Prices need to be pre-created in the dashboard.
//
// Required environment variables (set in Vercel project settings, never in code):
//   STRIPE_SECRET_KEY   sk_test_... or sk_live_...
//
// Request body:
//   {
//     title: string,               e.g. "Ignite — SaaS Landing" or "MVP Sprints"
//     description: string,
//     priceInCents: number,        integer, > 0
//     mode: "template" | "deposit",
//     customerName: string,
//     customerEmail: string
//   }
//
// Response: { url: string }  -- the Stripe-hosted Checkout URL to redirect the browser to.

import Stripe from 'stripe';

function isValidEmail(email) {
  return typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Missing STRIPE_SECRET_KEY environment variable');
    return res.status(500).json({ error: 'Payments are not configured yet.' });
  }

  const { title, description, priceInCents, mode, customerName, customerEmail } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Missing item title.' });
  }
  if (!Number.isInteger(priceInCents) || priceInCents <= 0) {
    return res.status(400).json({ error: 'Invalid price.' });
  }
  if (mode !== 'template' && mode !== 'deposit') {
    return res.status(400).json({ error: 'Invalid mode.' });
  }
  if (typeof customerName !== 'string' || !customerName.trim()) {
    return res.status(400).json({ error: 'Enter your name.' });
  }
  if (!isValidEmail(customerEmail)) {
    return res.status(400).json({ error: 'Enter a valid email.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const origin = req.headers.origin || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: priceInCents,
            product_data: {
              name: title,
              description: (description || '').slice(0, 500),
              tax_code: 'txcd_20030000', // Professional services — required by Stripe Managed Payments
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        mode,
        customerName,
      },
      success_url: `${origin}/#/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/services`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout session creation failed:', err);
    return res.status(502).json({ error: 'Could not start checkout. Please try again.' });
  }
}
