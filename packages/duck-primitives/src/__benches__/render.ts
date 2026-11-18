#!/usr/bin/env bun

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DOCS_PAGE, LIBRARIES, OUT_DIR, RIVALS, SRC_DIR } from './bench.libs'
import type { IBench } from './bench.types'

const ORDER = Object.keys(LIBRARIES) as IBench.Library[]
// The docs tables give these a column each and fold the single-component libraries into one.
const MAIN: IBench.Library[] = ['duck', 'radix', 'baseui', 'react-aria', 'ark', 'headless']
const METRICS = ['mount', 'update', 'type', 'unmount', 'unmount open', 'open', 'close']
const README_BLOCK = /(<!-- benchmarks -->\n)[\s\S]*?(<!-- \/benchmarks -->)/
const API_BLOCK = /(\{\/\* benchmarks \*\/\}\n)[\s\S]*?(\{\/\* \/benchmarks \*\/\})/
const docsBlock = (name: string) =>
  new RegExp(`(\\{/\\* benchmarks:${name} \\*/\\}\\n)[\\s\\S]*?(\\{/\\* /benchmarks:${name} \\*/\\})`)

const bytes = (n: number) => n.toLocaleString('en-US')
const kb = (n: number) => (n / 1024).toFixed(1)
const ms = (n: number) => (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n >= 1 ? n.toFixed(2) : n.toFixed(3))
const percent = (n: number) => `${Math.round(n * 100)}%`
const label = (metric: string) => metric[0].toUpperCase() + metric.slice(1)
const rank = (metric: string) => METRICS.indexOf(metric.replace(/ x\d+$/, ''))
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)

function list(names: string[]) {
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

interface IRow {
  name: string
  unit: 'bytes' | 'ms'
  values: Partial<Record<IBench.Library, number>>
}

interface IBehind {
  module: string
  row: IRow
  lib: IBench.Rival
  ratio: number
  gap: number
}

interface IResults {
  sizes: IBench.ISizeResult[]
  totals: IBench.ITotal[]
  runtimes: IBench.IRuntimeResult[]
  environment?: IBench.IEnvironment
}

function read(): IResults {
  const size = JSON.parse(readFileSync(join(OUT_DIR, 'results.json'), 'utf-8'))
  const runtimeFile = join(OUT_DIR, 'runtime.json')
  const runtime = existsSync(runtimeFile) ? JSON.parse(readFileSync(runtimeFile, 'utf-8')) : { results: [] }
  return {
    sizes: size.components ?? [],
    totals: size.totalComparison ?? [],
    runtimes: runtime.results,
    environment: runtime.environment,
  }
}

function rowsOf(size: IBench.ISizeResult, runtime: IBench.IRuntimeResult | undefined): IRow[] {
  return [
    { name: 'Size, gzipped bytes', unit: 'bytes', values: size.bytes },
    ...(runtime?.metrics ?? [])
      .toSorted((a, b) => rank(a.metric) - rank(b.metric))
      .map((m): IRow => ({ name: `${label(m.metric)}, ms`, unit: 'ms', values: m.ms })),
  ]
}

function behindIn(module: string, rows: IRow[]) {
  const behind: IBehind[] = []
  for (const row of rows) {
    const duck = row.values.duck
    if (duck === undefined) continue
    for (const lib of RIVALS) {
      const theirs = row.values[lib]
      if (theirs === undefined) continue
      const ratio = +(duck / theirs).toFixed(2)
      if (ratio > 1) behind.push({ module, row, lib, ratio, gap: duck - theirs })
    }
  }
  return behind.toSorted((a, b) => b.ratio - a.ratio)
}

function behindLine({ row, lib, ratio, gap }: IBehind) {
  const amount = row.unit === 'bytes' ? `${bytes(gap)} bytes more` : `${ms(gap)} ms more`
  return `${row.name.replace(/, .*$/, '')} against ${LIBRARIES[lib]}: ${ratio.toFixed(2)}x, ${amount}`
}

function readmeBlock(size: IBench.ISizeResult, runtime: IBench.IRuntimeResult | undefined) {
  const rows = rowsOf(size, runtime)
  const libs = ORDER.filter((lib) => rows.some((row) => row.values[lib] !== undefined))
  const rivals = libs.filter((lib): lib is IBench.Rival => lib !== 'duck')
  const behind = behindIn(size.module, rows)
  const out: string[] = []

  if (rivals.length === 0) {
    out.push(`No other library ships one to compare with. The module is ${bytes(size.bytes.duck ?? 0)} bytes gzipped.`)
  } else {
    const larger = rivals.filter((lib) => behind.some((b) => b.row === rows[0] && b.lib === lib))
    const smaller = rivals.filter((lib) => rows[0].values[lib] !== undefined && !larger.includes(lib))
    const sizeLine = larger.length
      ? `Smaller than ${list(smaller.map((lib) => LIBRARIES[lib])) || 'none of them'}; larger than ${list(larger.map((lib) => LIBRARIES[lib]))}.`
      : `Smaller than ${smaller.length > 1 ? `all ${smaller.length}` : LIBRARIES[smaller[0]]}.`
    const timed = rows
      .filter((row) => row.unit === 'ms' && row.values.duck !== undefined)
      .reduce((n, row) => n + rivals.filter((lib) => row.values[lib] !== undefined).length, 0)
    const slower = behind.filter((b) => b.row.unit === 'ms').length
    const timeLine = timed
      ? slower
        ? ` Faster in ${timed - slower} of ${timed} timed comparisons.`
        : ` Faster in all ${timed} timed comparisons.`
      : ''
    out.push(`${sizeLine}${timeLine}`, '')
    out.push(`| | ${libs.map((lib) => LIBRARIES[lib]).join(' | ')} |`, `|---|${libs.map(() => '--:').join('|')}|`)
    for (const row of rows) {
      const show = row.unit === 'bytes' ? bytes : ms
      const duck = row.values.duck
      const cells = libs.map((lib) => {
        const value = row.values[lib]
        if (value === undefined) return '-'
        if (lib === 'duck' || duck === undefined) return show(value)
        const ratio = +(duck / value).toFixed(2)
        const cell = `${show(value)} (${ratio.toFixed(2)}x)`
        return ratio > 1 ? `**${cell}**` : cell
      })
      out.push(`| ${row.name} | ${cells.join(' | ')} |`)
    }
    out.push('')
    if (behind.length) {
      out.push('Where gentleduck is behind:', '', ...behind.map((b) => `- ${behindLine(b)}.`))
    } else {
      out.push(
        `Behind nowhere: ${timed ? 'smaller and faster than every library here, in every case' : 'smaller than every library here'}.`,
      )
    }
    out.push('')
    const versions = rivals.filter((lib) => size.versions[lib]).map((lib) => `${LIBRARIES[lib]} ${size.versions[lib]}`)
    out.push(
      "Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame." +
        (runtime?.overlay
          ? ' The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy.'
          : '') +
        (versions.length ? ` Versions: ${list(versions)}.` : ''),
    )
  }
  if (size.note) out.push('', size.note)
  return out.join('\n')
}

function renderReadmes({ sizes, runtimes }: IResults) {
  let done = 0
  for (const size of sizes) {
    const file = join(SRC_DIR, size.module, 'README.md')
    if (!existsSync(file)) continue
    const text = readFileSync(file, 'utf-8')
    if (!README_BLOCK.test(text)) throw new Error(`${file} has no <!-- benchmarks --> block`)
    const runtime = runtimes.find((r) => r.module === size.module)
    writeFileSync(
      file,
      text.replace(README_BLOCK, (_, open, close) => `${open}${readmeBlock(size, runtime)}\n${close}`),
    )
    done++
  }
  console.log(`benchmarks written into ${done} READMEs`)
}

// A module's API page carries its README table only where the page holds a `{/* benchmarks */}` block.
function renderApiDocs({ sizes, runtimes }: IResults) {
  let done = 0
  for (const size of sizes) {
    const file = join(dirname(DOCS_PAGE), 'api', `${size.module}.mdx`)
    if (!existsSync(file)) continue
    const text = readFileSync(file, 'utf-8')
    if (!API_BLOCK.test(text)) continue
    const runtime = runtimes.find((r) => r.module === size.module)
    writeFileSync(
      file,
      text.replace(API_BLOCK, (_, open, close) => `${open}\n${readmeBlock(size, runtime)}\n\n${close}`),
    )
    done++
  }
  if (done) console.log(`benchmarks written into ${done} API pages`)
}

function docsTable(rows: Pick<IRow, 'name' | 'values'>[], show: (n: number) => string) {
  const has = (lib: IBench.Library) => rows.some((row) => row.values[lib] !== undefined)
  const columns = MAIN.filter(has)
  const others = ORDER.filter((lib) => !MAIN.includes(lib) && has(lib))
  const out = [
    `| | ${columns.map((lib) => LIBRARIES[lib]).join(' | ')}${others.length ? ' | Other' : ''} |`,
    `|---|${columns.map(() => '--:').join('|')}${others.length ? '|---' : ''}|`,
  ]
  for (const row of rows) {
    const values = Object.values(row.values).filter((v) => v !== undefined)
    const best = values.length > 1 ? Math.min(...values) : undefined
    const cell = (lib: IBench.Library) => {
      const value = row.values[lib]
      if (value === undefined) return '-'
      return value === best ? `**${show(value)}**` : show(value)
    }
    const other = others
      .filter((lib) => row.values[lib] !== undefined)
      .map((lib) => `${LIBRARIES[lib]} ${cell(lib)}`)
      .join(', ')
    out.push(`| ${row.name} | ${columns.map(cell).join(' | ')}${others.length ? ` | ${other || '-'}` : ''} |`)
  }
  return out.join('\n')
}

function docsTotals(totals: IBench.ITotal[]) {
  const own = totals.find((t) => t.name === LIBRARIES.duck)
  const position = (t: IBench.ITotal) => Object.values(LIBRARIES).indexOf(t.name)
  const rivals = totals
    .filter((t) => t !== own && t.gentleduckKB !== undefined)
    .toSorted((a, b) => position(a) - position(b))
  const smaller = rivals.filter((t) => (t.gentleduckKB ?? 0) < t.sizeKB)
  return [
    '| Library | Compared on | Its bundle | gentleduck over the same |',
    '|---|--:|--:|--:|',
    ...rivals.map((t) => `| ${t.name} | ${t.components} components | ${t.sizeKB} KB | ${t.gentleduckKB} KB |`),
    '',
    `gentleduck's whole library, all ${own?.components} modules, is ${own?.sizeKB} KB. Over the components each library ` +
      `is compared on, gentleduck's bundle is the smaller in ${smaller.length === rivals.length ? `all ${rivals.length}` : `${smaller.length} of ${rivals.length}`}.`,
  ].join('\n')
}

// Radix ships a package per component, each with its own version.
function versionsOf(sizes: IBench.ISizeResult[]) {
  return RIVALS.flatMap((lib) => {
    const versions = [...new Set(sizes.flatMap((s) => s.versions[lib] ?? []))].toSorted((a, b) =>
      a.localeCompare(b, 'en', { numeric: true }),
    )
    if (versions.length === 0) return []
    return [`${LIBRARIES[lib]} ${versions.length === 1 ? versions[0] : `${versions[0]} to ${versions.at(-1)}`}`]
  })
}

function docsSize(sizes: IBench.ISizeResult[]) {
  const compared = sizes.filter((s) => Object.keys(s.bytes).length > 1)
  const smallest = compared.filter((s) => RIVALS.every((lib) => (s.bytes[lib] ?? Infinity) > (s.bytes.duck ?? 0)))
  const margins = RIVALS.flatMap((lib) => {
    const saved = sizes
      .filter((s) => s.bytes[lib] !== undefined && s.bytes.duck !== undefined)
      .map((s) => 1 - (s.bytes.duck ?? 0) / (s.bytes[lib] ?? 1))
    if (saved.length === 0) return []
    const low = Math.min(...saved)
    const high = Math.max(...saved)
    return [`${LIBRARIES[lib]} ${low === high ? percent(low) : `${percent(low)} to ${percent(high)}`}`]
  })
  return [
    docsTable(
      sizes.toSorted(byName).map((s) => ({ name: s.name, values: s.bytes })),
      kb,
    ),
    '',
    `gentleduck is the smallest in ${smallest.length === compared.length ? 'all' : `${smallest.length} of the`} ${compared.length} modules another library ships. ` +
      `The share of each library's size it saves, from its closest component to its furthest: ${list(margins)}.`,
    '',
    `Versions: ${list(versionsOf(sizes))}.`,
  ].join('\n')
}

const GROUPS: { title: string; pick: (r: IBench.IRuntimeResult) => IBench.IMetric | undefined }[] = [
  { title: 'Mount x100', pick: (r) => r.metrics.find((m) => m.metric === 'mount x100') },
  { title: 'Update x100', pick: (r) => r.metrics.find((m) => /^(update|type) x\d+$/.test(m.metric)) },
  { title: 'Unmount x100', pick: (r) => r.metrics.find((m) => m.metric === 'unmount x100') },
  { title: 'Unmount open x100', pick: (r) => r.metrics.find((m) => m.metric === 'unmount open x100') },
  { title: 'Open', pick: (r) => r.metrics.find((m) => m.metric === 'open') },
  { title: 'Close', pick: (r) => r.metrics.find((m) => m.metric === 'close') },
]

function docsRuntime(runtimes: IBench.IRuntimeResult[], environment: IBench.IEnvironment | undefined) {
  const out: string[] = []
  if (environment)
    out.push(
      `Measured in ${environment.browser} with React ${environment.react} on ${environment.cpu}, over ${environment.rounds} rounds.`,
      '',
    )
  let fastest = 0
  let rows = 0
  for (const { title, pick } of GROUPS) {
    const picked = runtimes.toSorted(byName).flatMap((r) => {
      const metric = pick(r)
      return metric ? [{ name: metric.metric.startsWith('type') ? `${r.name}, typed` : r.name, values: metric.ms }] : []
    })
    if (picked.length === 0) continue
    for (const row of picked) {
      const duck = row.values.duck
      const theirs = RIVALS.flatMap((lib) => row.values[lib] ?? [])
      if (duck === undefined || theirs.length === 0) continue
      rows++
      if (theirs.every((value) => duck <= value)) fastest++
    }
    out.push(`### ${title}`, '', docsTable(picked, ms), '')
  }
  out.push(`gentleduck is the fastest in ${fastest} of these ${rows} rows.`)
  return out.join('\n')
}

function docsBehind({ sizes, runtimes }: IResults) {
  const behind = sizes.flatMap((size) =>
    behindIn(
      size.module,
      rowsOf(
        size,
        runtimes.find((r) => r.module === size.module),
      ),
    ),
  )
  if (behind.length === 0) return 'Nowhere: gentleduck is the smallest and the fastest in every comparison.'
  const names = new Map(sizes.map((s) => [s.module, s.name]))
  const cases = new Map<string, IBehind[]>()
  for (const b of behind) {
    const key = `${b.module}\0${b.row.name}`
    cases.set(key, [...(cases.get(key) ?? []), b])
  }
  const rows = [...cases.values()].toSorted((a, b) => b[0].ratio - a[0].ratio)
  return [
    `gentleduck loses ${behind.length} comparisons, in ${rows.length} cases. Each row is one case, worst first, with every library ` +
      "that beats it and gentleduck's figure as a multiple of that library's.",
    '',
    '| Module | Case | Behind |',
    '|---|---|---|',
    ...rows.map((losses) => {
      const { module, row } = losses[0]
      const amount = (b: IBehind) => (row.unit === 'bytes' ? `${bytes(b.gap)} bytes` : `${ms(b.gap)} ms`)
      const against = losses.map((b) => `${LIBRARIES[b.lib]} ${b.ratio.toFixed(2)}x, +${amount(b)}`).join('; ')
      return `| ${names.get(module)} | ${row.name.replace(/, .*$/, '')} | ${against} |`
    }),
  ].join('\n')
}

function renderDocs(results: IResults) {
  if (!existsSync(DOCS_PAGE)) return
  const blocks: Record<string, string> = {
    totals: docsTotals(results.totals),
    size: docsSize(results.sizes),
    runtime: docsRuntime(results.runtimes, results.environment),
    behind: docsBehind(results),
  }
  let text = readFileSync(DOCS_PAGE, 'utf-8')
  for (const [name, body] of Object.entries(blocks)) {
    const pattern = docsBlock(name)
    if (!pattern.test(text)) throw new Error(`${DOCS_PAGE} has no benchmarks:${name} block`)
    text = text.replace(pattern, (_, open, close) => `${open}\n${body}\n\n${close}`)
  }
  writeFileSync(DOCS_PAGE, text)
  console.log(`benchmarks written into ${DOCS_PAGE}`)
}

export function render() {
  const results = read()
  renderReadmes(results)
  renderApiDocs(results)
  renderDocs(results)
}

if (import.meta.main) render()
