import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages: set BASE_PATH to /your-repo-name/ (e.g. BASE_PATH=/jack-marvel-final-pixelmatched/)
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state-query': ['react-redux', '@reduxjs/toolkit', '@tanstack/react-query'],
          'vendor-motion': ['framer-motion'],
          'vendor-lottie': ['@lottiefiles/react-lottie-player'],
        },
      },
    },
  },
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
