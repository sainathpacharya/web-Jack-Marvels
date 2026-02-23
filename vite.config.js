import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages: set BASE_PATH to /your-repo-name/ (e.g. BASE_PATH=/jack-marvel-final-pixelmatched/)
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
  },
});
