/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Where shared memories are posted (README, "Receiving memories"). Leave unset and the Share a memory
   * form runs as a clearly labelled demonstration that sends nothing.
   */
  readonly VITE_MEMORY_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
