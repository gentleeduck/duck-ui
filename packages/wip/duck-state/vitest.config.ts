import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost' } },
    include: ['src/**/__test__/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 15_000,
  },
})
