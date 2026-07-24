// Vercel Serverless Function
// POST /api/send-contact-email
//
// Sends the Contact page form to Chris via Resend. Replaces the previous
// fake setTimeout-only flow, which never sent anything anywhere.
//
// Required environment variables (set in Vercel project settings, never in code):
//   RESEND_API_KEY       Resend API key
//   CONTACT_FROM_EMAIL   A sender address on a domain verified in Resend,
//                        e.g. "Allen Code Co. <notifications@allencodeco.com>"
//   CONTACT_TO_EMAIL     Where messages should land, e.g. "chris@allencodeco.com"
//                        (falls back to chris@allencodeco.com if unset)
//
// Request body:
//   { name: string, email: string, projectType: string, message: string }

import { Resend } from 'resend';

function isValidEmail(email) {
  return typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FROM_EMAIL) {
    console.error('Missing RESEND_API_KEY or CONTACT_FROM_EMAIL environment variable');
    return res.status(500).json({ error: 'Contact form is not configured yet.' });
  }

  const { name, email, projectType, message } = req.body || {};
  const errors = {};
  if (typeof name !== 'string' || !name.trim()) errors.name = 'Enter your name.';
  if (!isValidEmail(email)) errors.email = 'Enter a valid email.';
  if (typeof message !== 'string' || message.trim().length < 10) {
    errors.message = 'Give me at least a sentence to work with.';
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Invalid submission.', fieldErrors: errors });
  }

  const toEmail = process.env.CONTACT_TO_EMAIL || 'chris@allencodeco.com';
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: toEmail,
      reply_to: email,
      subject: `New project inquiry: ${projectType || 'General'} — ${name}`,
      text: `From: ${name} <${email}>\nProject type: ${projectType || 'Not specified'}\n\n${message}`,
      html: `
        <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <p><strong>Project type:</strong> ${escapeHtml(projectType || 'Not specified')}</p>
        <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      `,
    });

    if (error) {
      console.error('Resend send failed:', error);
      return res.status(502).json({ error: 'Could not send your message. Please email chris@allencodeco.com directly.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend send threw:', err);
    return res.status(502).json({ error: 'Could not send your message. Please email chris@allencodeco.com directly.' });
  }
}
