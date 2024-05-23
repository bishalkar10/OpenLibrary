import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // proxy not working in the netlify deployment
    // proxy: {
    //   '/people': {
    //     target: 'https://openlibrary.org',
    //     changeOrigin: true,
    //     cache: true,
    //   },
    //   '/search': {
    //     target: 'https://openlibrary.org',
    //     changeOrigin: true,
    //     cache: true,
    //   },
    //   '/work': {
    //     target: 'https://openlibrary.org',
    //     changeOrigin: true,
    //     cache: true,
    //   },
    // },
  },
});
