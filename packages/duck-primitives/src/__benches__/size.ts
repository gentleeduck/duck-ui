#!/usr/bin/env bun

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import * as esbuild from 'esbuild'
import {
  DIST_DIR,
  DOCS_DIR,
  entrySource,
  LIBRARIES,
  loadCases,
  OUT_DIR,
  PACKAGE_DIR,
  parts,
  versionOf,
} from './bench.libs'
import type { IBench } from './bench.types'
import { render } from './render'

if (!existsSync(DIST_DIR)) throw new Error('dist/ is missing: run `bun run build` first')

async function gzipped(contents: string, what: string): Promise<number> {
  try {
    const result = await esbuild.build({
      stdin: { contents, resolveDir: PACKAGE_DIR, loader: 'ts' },
      bundle: true,
      minify: true,
      format: 'esm',
      platform: 'browser',
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      write: false,
      logLevel: 'silent',
    })
    return gzipSync(Buffer.from(result.outputFiles[0].contents)).length
  } catch (error) {
    throw new Error(`${what} failed to bundle`, { cause: error })
  }
}

const duckModules: Record<string, string> = Object.fromEntries(
  readdirSync(DIST_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(DIST_DIR, entry.name, 'index.js')))
    .map((entry) => [entry.name, join(DIST_DIR, entry.name, 'index.js')]),
)
const duckSizes: Record<string, number> = {}
for (const [name, file] of Object.entries(duckModules)) duckSizes[name] = await gzipped(entrySource(file), name)

if (process.argv.includes('--check')) {
  const pinned: { name: string; sizeBytes: number }[] = JSON.parse(
    readFileSync(join(OUT_DIR, 'results.json'), 'utf-8'),
  ).allSizes
  // Moving shared code between chunks shifts untouched modules by up to ~20 bytes.
  const GROWTH_TOLERANCE = 0.005
  const grown = pinned.filter((p) => (duckSizes[p.name] ?? 0) > p.sizeBytes * (1 + GROWTH_TOLERANCE))
  for (const p of pinned) {
    const now = duckSizes[p.name] ?? 0
    if (now !== p.sizeBytes) console.log(`${p.name}: ${p.sizeBytes} -> ${now} bytes`)
  }
  const unpinned = Object.keys(duckSizes).filter((name) => !pinned.some((p) => p.name === name))
  if (unpinned.length) console.log(`not pinned yet: ${unpinned.join(', ')}`)
  if (grown.length) {
    console.error(`${grown.length} module(s) grew past the pin; rerun bun run benchmark if that is intended`)
    process.exit(1)
  }
  console.log('no module grew past the pin')
  process.exit(0)
}

const cases = (await loadCases()).sort((a, b) => a.name.localeCompare(b.name))

const components: IBench.ISizeResult[] = []
for (const c of cases) {
  const bytes: IBench.ISizeResult['bytes'] = {
    duck: c.duck ? await gzipped(entrySource(c.duck), `${c.name} (gentleduck)`) : duckSizes[c.module],
  }
  const versions: IBench.ISizeResult['versions'] = {}
  for (const [lib, entry] of Object.entries(c.size) as [IBench.Rival, IBench.Entry][]) {
    bytes[lib] = await gzipped(entrySource(entry), `${c.name} (${lib})`)
    versions[lib] = versionOf(entry)
  }
  components.push({ name: c.name, module: c.module, bytes, versions, note: c.note })
}

// The docs charts label the bars by these names, and their axis has room for a short one only.
const chartName = (name: string) => (name === 'Navigation Menu' ? 'Nav Menu' : name)

const perComponent = components.map(({ name, module, bytes }) => ({
  name: chartName(name),
  gentleduck: bytes.duck ?? 0,
  radix: bytes.radix ?? 0,
  baseui: bytes.baseui ?? 0,
}))

function savingsVs(key: 'radix' | 'baseui') {
  return perComponent
    .filter((c) => c[key] > 0 && c.gentleduck > 0)
    .map((c) => ({
      name: c.name,
      gentleduckKB: +(c.gentleduck / 1024).toFixed(1),
      competitorKB: +(c[key] / 1024).toFixed(1),
      savingPercent: Math.round((1 - c.gentleduck / c[key]) * 100),
    }))
}

// A total is one bundle of every part it names, so code its components share counts once.
async function combined(entries: IBench.Entry[], what: string) {
  const named = new Map<string, Set<string>>()
  const whole = new Set<string>()
  for (const { names, from } of entries.flatMap(parts)) {
    if (names[0] === '*') whole.add(from)
    else for (const name of names) named.set(from, (named.get(from) ?? new Set()).add(name))
  }
  const source = [
    ...[...whole].map((from, i) => `export * as m${i} from ${JSON.stringify(from)}`),
    ...[...named].map(([from, names]) => `export { ${[...names].join(', ')} } from ${JSON.stringify(from)}`),
  ].join('\n')
  return Math.round((await gzipped(source, what)) / 1024)
}

const duckEntry = (c: IBench.IModuleCase): IBench.Entry => c.duck ?? duckModules[c.module]

const totalComparison: IBench.ITotal[] = [
  {
    name: 'gentleduck',
    sizeKB: await combined(Object.values(duckModules), 'gentleduck total'),
    components: Object.keys(duckModules).length,
    verified: true,
  },
]
// sizeKB is the library over the components it is compared on, gentleduckKB gentleduck over the same ones.
for (const lib of ['radix', 'baseui', 'react-aria', 'ark', 'headless'] as const) {
  const withLib = cases.filter((c) => c.size[lib])
  if (withLib.length === 0) continue
  totalComparison.push({
    name: LIBRARIES[lib],
    sizeKB: await combined(
      withLib.map((c) => c.size[lib] as IBench.Entry),
      `${lib} total`,
    ),
    gentleduckKB: await combined(withLib.map(duckEntry), `gentleduck total against ${lib}`),
    components: withLib.length,
    verified: true,
  })
}
totalComparison.sort((a, b) => a.sizeKB - b.sizeKB)

// @gentleduck/calendar reads calendarComparison by these names.
function comparison(module: string) {
  const found = components.find((c) => c.module === module)
  if (!found) throw new Error(`no ${module} bench`)
  return Object.entries(found.bytes).map(([lib, size]) => ({
    name: LIBRARIES[lib as IBench.Library],
    sizeBytes: size,
    sizeKB: +(size / 1024).toFixed(1),
  }))
}

const allSizes = Object.entries(duckSizes)
  .map(([name, size]) => ({ name, sizeBytes: size, sizeKB: +(size / 1024).toFixed(1) }))
  .sort((a, b) => b.sizeBytes - a.sizeBytes)

const results = {
  components,
  perComponent,
  savingsVsRadix: savingsVs('radix'),
  savingsVsBaseui: savingsVs('baseui'),
  totalComparison,
  calendarComparison: comparison('calendar'),
  paginationComparison: comparison('pagination'),
  allSizes,
  methodology:
    "Every library is measured the same way: an entry re-exporting what the module's bench file in its __benches__ folder names, bundled and minified by esbuild with react and react-dom external, then gzipped. gentleduck is the whole dist module; Radix, Base UI, Ark UI, cmdk, input-otp and vaul are their whole package or subpath; React Aria, Headless UI and react-day-picker, which ship one entry for everything, are the named parts a component draws. A total is one bundle of every part it covers, so shared code counts once: gentleduck's own row is the whole library, and each other library's row carries gentleduckKB, gentleduck over the same components. The calendar's gentleduck figure includes the NativeAdapter it needs.",
  generatedAt: new Date().toISOString(),
}

const json = `${JSON.stringify(results, null, 2)}\n`
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(DOCS_DIR, { recursive: true })
writeFileSync(join(OUT_DIR, 'results.json'), json)
writeFileSync(join(DOCS_DIR, 'primitives.json'), json)

console.log(`${join(OUT_DIR, 'results.json')}\n${join(DOCS_DIR, 'primitives.json')}\n`)
for (const t of totalComparison)
  console.log(
    `${t.name.padEnd(12)} ${String(t.sizeKB).padStart(4)} KB, ${t.components} components${t.gentleduckKB ? `, gentleduck ${t.gentleduckKB} KB for the same` : ''}`,
  )
console.log()
for (const { name, bytes } of components) {
  const others = Object.entries(bytes)
    .filter(([lib]) => lib !== 'duck')
    .map(([lib, size]) => `${lib} ${size} x${((bytes.duck ?? 0) / size).toFixed(2)}`)
  console.log(`${name.padEnd(16)} duck ${String(bytes.duck).padStart(6)}  ${others.join('  ')}`)
}
render()
