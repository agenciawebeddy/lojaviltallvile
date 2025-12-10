import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify(env.STRIPE_PUBLIC_KEY || env.VITE_STRIPE_PUBLIC_KEY),
        'import.meta.env.VITE_URL_SUCESSO': JSON.stringify(env.URL_SUCESSO || env.VITE_URL_SUCESSO),
        'import.meta.env.VITE_URL_CANCELAMENTO': JSON.stringify(env.URL_CANCELAMENTO || env.VITE_URL_CANCELAMENTO),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});