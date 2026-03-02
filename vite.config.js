import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {
  // during development we want the app to run at the root so that
  // navigating to `/kidswear` etc. works without requiring the GitHub
  // Pages subpath. The production build on GH Pages lives under
  // `/Ecommerce-react/`, so we use that as the base there.
  return {
    plugins: [react(),tailwindcss()],
    base: mode === 'production' ? '/Ecommerce-react/' : '/',
  };
});

