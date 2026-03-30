import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/lime-explorer/',
  server: {
    host: true,
    port: 5173,
  },
  test: {
    environment: 'node',
  },
});
