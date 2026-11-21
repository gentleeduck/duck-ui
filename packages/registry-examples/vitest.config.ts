import { defineConfig } from 'vitest/config'

export default defineConfig({
  // The package keeps JSX for Next, which esbuild would compile against a global React.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost' } },
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 15_000,
  },
})
