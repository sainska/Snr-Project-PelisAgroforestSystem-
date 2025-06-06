/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MPESA_CONSUMER_KEY: string;
  readonly VITE_MPESA_CONSUMER_SECRET: string;
  readonly VITE_MPESA_PASSKEY: string;
  readonly VITE_MPESA_BUSINESS_SHORT_CODE: string;
  readonly VITE_MPESA_CALLBACK_URL: string;
  readonly VITE_MPESA_TIMEOUT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_MPESA_CONSUMER_KEY: string;
    NEXT_PUBLIC_MPESA_CONSUMER_SECRET: string;
    NEXT_PUBLIC_MPESA_PASSKEY: string;
    NEXT_PUBLIC_MPESA_BUSINESS_SHORT_CODE: string;
    NEXT_PUBLIC_MPESA_CALLBACK_URL: string;
    NEXT_PUBLIC_MPESA_TIMEOUT_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 
