import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  // Keep dev always rooted at "/" so localhost launch works even if BASE_PATH is exported in shell.
  const base = command === 'serve' ? '/' : (process.env.BASE_PATH || '/');
  const apiProxyTarget = process.env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:8080';

  return {
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
      // Used when dev uses same-origin `/api/*` (`VITE_DEV_USE_VITE_PROXY=true` in apiClient); forwards to Spring Boot.
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          configure(proxy) {
            let lastEconnrefusedHintAt = 0;
            proxy.on('error', (err) => {
              if (!String(err?.code || err?.message || '').includes('ECONNREFUSED')) return;
              const now = Date.now();
              if (now - lastEconnrefusedHintAt < 60_000) return;
              lastEconnrefusedHintAt = now;
              console.warn(
                `\n[Vite /api proxy] Connection refused to ${apiProxyTarget} (repeats while the API is down). ` +
                  'Start Spring Boot on that host/port, or set VITE_DEV_API_PROXY_TARGET in .env.\n'
              );
            });
          },
        },
      },
    },
  };
});
