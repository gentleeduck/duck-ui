import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost' } },
    include: ['src/**/__test__/**/*.test.{ts,tsx}'],
    testTimeout: 15_000,
  },
})
