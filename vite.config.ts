import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react-vendor';
            if (id.includes('react-router')) return 'router';
            if (id.includes('lucide-react')) return 'icons';
          }
        },
      },
    },
  },
  server: {
    /** Ouvre le navigateur par défaut au lancement de `npm run dev` */
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3300',
        changeOrigin: true,
      },
    },
  },
});
