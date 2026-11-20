import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@duck-docs': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    testTimeout: 15_000,
  },
})
