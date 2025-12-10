/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLIC_KEY: string | undefined;
  readonly VITE_URL_SUCESSO: string | undefined;
  readonly VITE_URL_CANCELAMENTO: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}