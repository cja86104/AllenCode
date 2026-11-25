/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where table reservations are posted. Unset: the reservation form is a labelled demonstration. */
  readonly VITE_RESERVATION_ENDPOINT?: string;
  /** Where private event inquiries are posted. Unset: the inquiry form is a labelled demonstration. */
  readonly VITE_EVENTS_ENDPOINT?: string;
  /** Where newsletter sign-ups are posted. Unset: the sign-up is a labelled demonstration. */
  readonly VITE_NEWSLETTER_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
