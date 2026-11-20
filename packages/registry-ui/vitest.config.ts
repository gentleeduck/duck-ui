import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost' } },
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    testTimeout: 15_000,
  },
})
