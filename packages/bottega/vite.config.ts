import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2022',
  },
  server: {
    port: 5173,
    // Proxy local pras Netlify Functions quando rodar `netlify dev`.
    // Dev puro (npm run dev) sem netlify dev cai no mock.
  },
});
