import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    // If we are on Vercel, use '/', otherwise use the GH Pages path
    base: process.env.VERCEL ? '/' : (mode === 'production' ? '/Ecommerce-react/' : '/'),
  };
});