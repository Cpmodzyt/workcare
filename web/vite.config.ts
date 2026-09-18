import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Relative paths for asset loading in Android WebView and PWA
  build: {
    outDir: path.resolve(__dirname, '../app/src/main/assets/www'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});
