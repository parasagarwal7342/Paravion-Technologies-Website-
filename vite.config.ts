import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    host: true,
    allowedHosts: true, // Allow all hosts for preview/dev environments
  },
  base: process.env.BASE_PATH || '/',
})
