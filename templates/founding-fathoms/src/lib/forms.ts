/**
 * How the site's forms leave the page.
 *
 * Each form posts JSON to an endpoint set at build time (`VITE_CONTACT_ENDPOINT`, `VITE_CAN_CLUB_ENDPOINT`,
 * `VITE_ORDER_ENDPOINT`; see `.env.example`). Without one, the form runs as a
 * demonstration: it validates, then says plainly that nothing was sent, and keeps what the visitor typed.
 */

export type SendResult = { kind: 'sent' } | { kind: 'demonstration' } | { kind: 'failed'; message: string };

export interface FormSender {
  mode: 'demonstration' | 'live';
  send(payload: Record<string, string | number>): Promise<SendResult>;
}

export const demonstrationSender: FormSender = {
  mode: 'demonstration',
  send: () => Promise.resolve({ kind: 'demonstration' }),
};

export function httpSender(endpoint: string, fetcher: typeof fetch = (...args) => fetch(...args)): FormSender {
  return {
    mode: 'live',
    async send(payload) {
      try {
        const response = await fetcher(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) return { kind: 'sent' };
        if (response.status >= 400 && response.status < 500) {
          return { kind: 'failed', message: 'This couldn’t be accepted as it is. Please check the details and try again.' };
        }
        return {
          kind: 'failed',
          message: 'Something went wrong on our side. Your details are still here; please try again in a few minutes.',
        };
      } catch {
        return {
          kind: 'failed',
          message: 'This couldn’t be sent. You may be offline. Your details are still here; try again when you’re connected.',
        };
      }
    },
  };
}

/** The sender for an endpoint setting: live when one is configured, otherwise the demonstration. */
export function senderFor(endpoint: string | undefined): FormSender {
  const value = endpoint?.trim();
  return value ? httpSender(value) : demonstrationSender;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
