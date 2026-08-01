import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/KPS_INN_Web/',
  plugins: [react()],
});
