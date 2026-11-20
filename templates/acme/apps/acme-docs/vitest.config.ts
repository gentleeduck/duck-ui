import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['app/**/__test__/**/*.test.ts'],
    testTimeout: 15_000,
  },
})
