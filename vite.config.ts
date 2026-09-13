/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const apiProxy = {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // The booking flow formats slot times in the practice's local timezone
    // (Mexico City, GMT-6). Pin it so date/time-dependent tests are
    // deterministic regardless of the machine or CI runner's own timezone.
    env: { TZ: 'America/Mexico_City' },
  },
})
