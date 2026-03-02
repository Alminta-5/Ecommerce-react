import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // If VERCEL environment exists, use root '/', otherwise use GH Pages path
    base: process.env.VERCEL ? '/' : (mode === 'production' ? '/Ecommerce-react/' : '/'),
  }
})