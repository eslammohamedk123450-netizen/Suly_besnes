import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'supabase/**/*.test.ts'],
    exclude: ['admin-dashboard/**', 'node_modules/**', 'dist/**'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
