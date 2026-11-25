/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where contact messages are posted. Unset: the contact form is a labelled demonstration. */
  readonly VITE_CONTACT_ENDPOINT?: string;
  /** Where Can Club sign-ups are posted. Unset: the sign-up is a labelled demonstration. */
  readonly VITE_CAN_CLUB_ENDPOINT?: string;
  /** Where pickup orders are posted. Unset: checkout is a labelled demonstration. */
  readonly VITE_ORDER_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
