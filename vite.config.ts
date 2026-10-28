import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    test: {
      exclude: ['**/node_modules/**', '**/dist/**', 'admin-dashboard/**'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Keep the Ollama secret on the dev server and avoid browser CORS.
      proxy: {
        '/api/ollama': {
          target: env.OLLAMA_API_BASE || 'https://ollama.com',
          changeOrigin: true,
          secure: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/ollama/, '/api'),
          headers: env.OLLAMA_API_KEY
            ? { Authorization: `Bearer ${env.OLLAMA_API_KEY}` }
            : undefined,
        },
      },
    },
  };
});
