#!/usr/bin/env bun
/**
 * Benchmark script for @gentleduck/calendar.
 * Measures real performance and outputs JSON data for chart visualization.
 *
 * Output: public/benchmarks/results.json + docs public/data/benchmarks/calendar.json
 * Usage: bun run build, then bun run benchmark in duck-primitives (it measures React Aria, Ark and react-day-picker), then bun run benchmark
 */

import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { HebrewAdapter } from '../src/adapter/hebrew-adapter'
import { IslamicAdapter } from '../src/adapter/islamic-adapter'
import { NativeAdapter } from '../src/adapter/native-adapter'
import { PersianAdapter } from '../src/adapter/persian-adapter'
import { buildCalendarMonth, buildMultiMonth } from '../src/grid'
import { applySelection } from '../src/selection'

const PACKAGE_DIR = join(import.meta.dirname, '..')
const DIST_DIR = join(PACKAGE_DIR, 'dist')
const OUT_DIR = join(PACKAGE_DIR, 'public', 'benchmarks')
const DOCS_DIR = join(PACKAGE_DIR, '..', '..', 'apps', 'duck', 'public', 'data', 'benchmarks')
const PRIMITIVES_RESULTS = join(PACKAGE_DIR, '..', 'duck-primitives', 'public', 'benchmarks', 'results.json')
if (!existsSync(DIST_DIR)) throw new Error('dist/ is missing: run `bun run build` first')
if (!existsSync(PRIMITIVES_RESULTS)) throw new Error('run `bun run benchmark` in packages/duck-primitives first')
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(DOCS_DIR, { recursive: true })

function bench(fn: () => void, warmup = 200, iterations = 2000): number {
  for (let i = 0; i < warmup; i++) fn()
  const start = performance.now()
  for (let i = 0; i < iterations; i++) fn()
  return (performance.now() - start) / iterations
}

const native = new NativeAdapter()
const march2026 = new Date(2026, 2, 1)
const gridConfig = { showOutsideDays: true, fixedWeeks: false }

const corePerformance = {
  buildMonth: {
    label: 'buildCalendarMonth',
    us: +(bench(() => buildCalendarMonth(native, march2026, gridConfig)) * 1000).toFixed(1),
  },
  buildMulti3: {
    label: 'buildMultiMonth(3)',
    us: +(bench(() => buildMultiMonth(native, march2026, 3, gridConfig)) * 1000).toFixed(1),
  },
  buildMulti12: {
    label: 'buildMultiMonth(12)',
    us: +(bench(() => buildMultiMonth(native, march2026, 12, gridConfig)) * 1000).toFixed(1),
  },
  applySelection: {
    label: 'applySelection (single)',
    us: +(
      bench(() => {
        const raw = buildCalendarMonth(native, march2026, gridConfig)
        applySelection(raw.weeks, native, 'single', new Date(2026, 2, 15), {})
      }) * 1000
    ).toFixed(1),
  },
  applySelectionRange: {
    label: 'applySelection (range)',
    us: +(
      bench(() => {
        const raw = buildCalendarMonth(native, march2026, gridConfig)
        applySelection(raw.weeks, native, 'range', { from: new Date(2026, 2, 10), to: new Date(2026, 2, 20) }, {})
      }) * 1000
    ).toFixed(1),
  },
}

const islamic = new IslamicAdapter()
const persian = new PersianAdapter()
const hebrew = new HebrewAdapter()

const adapterList = [
  { name: 'Native (Gregorian)', adapter: native },
  { name: 'Islamic (Hijri)', adapter: islamic },
  { name: 'Persian (Jalali)', adapter: persian },
  { name: 'Hebrew', adapter: hebrew },
]

const adapterPerformance = adapterList.map(({ name, adapter }) => {
  const today = adapter.today()
  const startOfMonth = adapter.startOfMonth(today)
  return {
    name,
    buildMonth: +(bench(() => buildCalendarMonth(adapter, startOfMonth, gridConfig)) * 1000).toFixed(1),
    getYear: +(bench(() => adapter.getYear(today), 500, 5000) * 1000).toFixed(2),
    create: +(
      bench(() => adapter.create(adapter.getYear(today), adapter.getMonth(today), 1), 500, 5000) * 1000
    ).toFixed(2),
    addMonths: +(bench(() => adapter.addMonths(today, 3), 500, 5000) * 1000).toFixed(2),
    format: +(bench(() => adapter.format(today, { month: 'long', year: 'numeric' }), 200, 1000) * 1000).toFixed(1),
  }
})

const workDir = mkdtempSync(join(tmpdir(), 'duck-calendar-benchmark-'))
let entryCount = 0
// Minified with react external, then gzipped, the way the primitives benchmark measures its libraries.
async function gzippedKB(source: string) {
  const entry = join(workDir, `entry-${entryCount++}.ts`)
  writeFileSync(entry, source)
  const build = await Bun.build({
    entrypoints: [entry],
    minify: true,
    target: 'browser',
    external: ['react', 'react-dom', 'react/jsx-runtime', 'date-fns', 'dayjs', 'luxon'],
  })
  if (!build.success) throw new AggregateError(build.logs, `${source} failed to bundle`)
  return +(gzipSync(Buffer.from(await build.outputs[0].arrayBuffer())).length / 1024).toFixed(1)
}

const engineKB = await gzippedKB(`export { useCalendar, NativeAdapter } from '${join(DIST_DIR, 'index.js')}'\n`)
const primitivesCalendar: { name: string; sizeKB: number }[] = JSON.parse(
  readFileSync(PRIMITIVES_RESULTS, 'utf-8'),
).calendarComparison
const measuredKB = (name: string) => {
  const found = primitivesCalendar.find((c) => c.name === name)
  if (!found) throw new Error(`${name} is missing from the primitives calendar comparison`)
  return found.sizeKB
}

const rdpStyleSheet = createRequire(PRIMITIVES_RESULTS).resolve('react-day-picker/style.css')
const rdpCssKB = +(gzipSync(readFileSync(rdpStyleSheet)).length / 1024).toFixed(1)

// The last two are published sizes from bundlephobia; the rest are measured.
const bundleSize = [
  { name: '@gentleduck/calendar (hook)', sizeKB: engineKB, cssKB: 0, calendars: 4, measured: true },
  { name: '@gentleduck/primitives Calendar', sizeKB: measuredKB('gentleduck'), cssKB: 0, calendars: 4, measured: true },
  { name: 'React Aria Calendar', sizeKB: measuredKB('React Aria'), cssKB: 0, calendars: 13, measured: true },
  { name: 'Ark UI DatePicker', sizeKB: measuredKB('Ark UI'), cssKB: 0, calendars: 13, measured: true },
  {
    name: 'react-day-picker v10',
    sizeKB: measuredKB('react-day-picker'),
    cssKB: rdpCssKB,
    calendars: 1,
    measured: true,
  },
  { name: 'react-datepicker', sizeKB: 32.0, cssKB: 8.0, calendars: 1, measured: false },
  { name: 'react-calendar', sizeKB: 15.0, cssKB: 5.0, calendars: 1, measured: false },
]
const kb = (name: string) => `${bundleSize.find((b) => b.name === name)?.sizeKB} KB`

const features = [
  { feature: 'Tree-shakeable', gentleduck: true, rdp: true, reactAria: true, datepicker: false, reactCal: false },
  { feature: 'Zero CSS', gentleduck: true, rdp: false, reactAria: true, datepicker: false, reactCal: false },
  { feature: 'Date Adapter', gentleduck: true, rdp: false, reactAria: false, datepicker: false, reactCal: false },
  { feature: 'Multi-Calendar', gentleduck: '4', rdp: '1', reactAria: '13', datepicker: '1', reactCal: '1' },
  { feature: 'SSR Safe', gentleduck: true, rdp: true, reactAria: true, datepicker: false, reactCal: true },
  { feature: 'ARIA Compliant', gentleduck: true, rdp: true, reactAria: true, datepicker: false, reactCal: false },
  { feature: 'Keyboard Nav', gentleduck: true, rdp: true, reactAria: true, datepicker: false, reactCal: false },
]

const vsReactDayPicker = {
  name: 'react-day-picker',
  comparison: [
    {
      metric: 'Calendar component',
      gentleduck: kb('@gentleduck/primitives Calendar'),
      competitor: kb('react-day-picker v10'),
      winner: 'gentleduck',
    },
    { metric: 'Dependencies', gentleduck: '0', competitor: '2 (date-fns, @date-fns/tz)', winner: 'gentleduck' },
    { metric: 'Default stylesheet', gentleduck: 'None', competitor: `${rdpCssKB} KB`, winner: 'gentleduck' },
    { metric: 'Calendar systems', gentleduck: '4', competitor: '1', winner: 'gentleduck' },
    { metric: 'Date adapters', gentleduck: '7', competitor: 'dateLib override', winner: 'gentleduck' },
    { metric: 'Selection modes', gentleduck: '4', competitor: '3', winner: 'gentleduck' },
    { metric: 'Headless hook', gentleduck: 'useCalendar', competitor: 'None', winner: 'gentleduck' },
    { metric: 'Compound primitives', gentleduck: 'Yes', competitor: 'No', winner: 'gentleduck' },
    { metric: 'RTL support', gentleduck: 'Yes', competitor: 'Yes (dir)', winner: 'tie' },
    { metric: 'Maturity', gentleduck: 'New', competitor: 'Established', winner: 'competitor' },
    { metric: 'React 18', gentleduck: 'Yes', competitor: 'Yes', winner: 'tie' },
  ],
}

const vsReactAria = {
  name: 'react-aria',
  comparison: [
    {
      metric: 'Calendar component',
      gentleduck: kb('@gentleduck/primitives Calendar'),
      competitor: kb('React Aria Calendar'),
      winner: 'gentleduck',
    },
    { metric: 'Architecture', gentleduck: 'Headless hook', competitor: 'Hooks + Components', winner: 'tie' },
    { metric: 'Calendar systems', gentleduck: '4', competitor: '13', winner: 'competitor' },
    { metric: 'Date adapters', gentleduck: '7 (pluggable)', competitor: '0 (built-in)', winner: 'gentleduck' },
    { metric: 'Typed date field', gentleduck: 'No', competitor: 'DateField', winner: 'competitor' },
    { metric: 'ARIA compliance', gentleduck: 'Full', competitor: 'Full', winner: 'tie' },
    { metric: 'Keyboard nav', gentleduck: 'Full', competitor: 'Full', winner: 'tie' },
    { metric: 'Internationalization', gentleduck: 'Via adapters', competitor: 'Built-in', winner: 'competitor' },
    { metric: 'Maturity', gentleduck: 'New', competitor: 'Battle-tested', winner: 'competitor' },
  ],
}

const vsReactDatepicker = {
  name: 'react-datepicker',
  comparison: [
    {
      metric: 'Calendar component',
      gentleduck: kb('@gentleduck/primitives Calendar'),
      competitor: kb('react-datepicker'),
      winner: 'gentleduck',
    },
    { metric: 'Dependencies', gentleduck: '0', competitor: '3', winner: 'gentleduck' },
    { metric: 'CSS required', gentleduck: 'None', competitor: '8 KB', winner: 'gentleduck' },
    { metric: 'Headless', gentleduck: 'Yes', competitor: 'No (styled)', winner: 'gentleduck' },
    { metric: 'ARIA compliance', gentleduck: 'Full', competitor: 'Partial', winner: 'gentleduck' },
    { metric: 'Keyboard nav', gentleduck: 'Full', competitor: 'Partial', winner: 'gentleduck' },
    { metric: 'SSR safe', gentleduck: 'Yes', competitor: 'No', winner: 'gentleduck' },
    { metric: 'Time picker', gentleduck: 'useTimePicker', competitor: 'Built-in', winner: 'tie' },
    { metric: 'Popularity', gentleduck: 'New', competitor: '10M+ downloads/mo', winner: 'competitor' },
  ],
}

const vsReactCalendar = {
  name: 'react-calendar',
  comparison: [
    {
      metric: 'Calendar component',
      gentleduck: kb('@gentleduck/primitives Calendar'),
      competitor: kb('react-calendar'),
      winner: 'gentleduck',
    },
    { metric: 'CSS required', gentleduck: 'None', competitor: '5 KB', winner: 'gentleduck' },
    { metric: 'Headless', gentleduck: 'Yes', competitor: 'No (styled)', winner: 'gentleduck' },
    { metric: 'Calendar systems', gentleduck: '4', competitor: '1', winner: 'gentleduck' },
    { metric: 'Selection modes', gentleduck: '4', competitor: '1', winner: 'gentleduck' },
    { metric: 'ARIA compliance', gentleduck: 'Full', competitor: 'Partial', winner: 'gentleduck' },
    { metric: 'React 18', gentleduck: 'Yes', competitor: 'Yes', winner: 'tie' },
    { metric: 'Simplicity', gentleduck: 'Hook-based', competitor: 'Drop-in', winner: 'competitor' },
  ],
}

const libraryComparisons = [vsReactDayPicker, vsReactAria, vsReactDatepicker, vsReactCalendar]

// Total cost (JS + CSS)
const totalCost = bundleSize.map((b) => ({
  name: b.name,
  js: b.sizeKB,
  css: b.cssKB,
  total: +(b.sizeKB + b.cssKB).toFixed(1),
}))

const moduleSizes: { name: string; sizeKB: number }[] = []
for (const entry of readdirSync(DIST_DIR, { withFileTypes: true })) {
  const index = join(DIST_DIR, entry.name, 'index.js')
  if (entry.isDirectory() && existsSync(index))
    moduleSizes.push({ name: entry.name, sizeKB: await gzippedKB(`export * from '${index}'\n`) })
}
moduleSizes.sort((a, b) => b.sizeKB - a.sizeKB)
rmSync(workDir, { recursive: true, force: true })

const results = {
  corePerformance: Object.values(corePerformance),
  adapterPerformance,
  bundleSize,
  totalCost,
  features,
  libraryComparisons,
  moduleSizes,
  generatedAt: new Date().toISOString(),
}

const json = JSON.stringify(results, null, 2)
writeFileSync(join(OUT_DIR, 'results.json'), json)
writeFileSync(join(DOCS_DIR, 'calendar.json'), json)

console.log('Calendar benchmarks generated (JSON only):')
console.log(`  ${OUT_DIR}/results.json`)
console.log(`  ${DOCS_DIR}/calendar.json`)
console.log()
console.log('Core Performance:')
for (const p of Object.values(corePerformance)) {
  console.log(`  ${p.label}: ${p.us} us`)
}
console.log()
console.log('Bundle size:')
for (const b of bundleSize) console.log(`  ${b.name}: ${b.sizeKB} KB${b.measured ? '' : ' (published)'}`)
console.log()
console.log('Adapter Performance (buildCalendarMonth):')
for (const a of adapterPerformance) {
  console.log(`  ${a.name}: ${a.buildMonth} us`)
}
