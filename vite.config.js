import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages: set BASE_PATH to /your-repo-name/ (e.g. BASE_PATH=/jack-marvel-final-pixelmatched/)
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    // When VITE_API_BASE_URL is unset, relative `/api/*` requests hit Vite; forward them to Spring Boot.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
