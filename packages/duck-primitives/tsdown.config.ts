import { globSync } from 'node:fs'
import { config } from '@gentleduck/tsdown-config'
import { defineConfig } from 'tsdown'

export default defineConfig({
  ...config,
  // tsdown hands rolldown its glob's files in the order the crawl finished, and rolldown orders each file's imports
  // by entry, so an unsorted list wrote a different dist, and moved the size pins, on every build.
  entry: globSync('src/**/*.{ts,tsx}', {
    exclude: (path) => /(^|\/)__(tests|stories|benches)__(\/|$)/.test(path),
  }).sort(),
  plugins: [],
})
