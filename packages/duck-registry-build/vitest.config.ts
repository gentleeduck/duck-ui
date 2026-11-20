import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/__test__/**/*.test.ts'],
    testTimeout: 15_000,
  },
})
