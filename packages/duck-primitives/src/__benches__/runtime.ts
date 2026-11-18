#!/usr/bin/env bun

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { cpus, platform, release, tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { benchFiles, DIST_DIR, OUT_DIR } from './bench.libs'
import type { IBench } from './bench.types'
import type { IBenchApi } from './harness'
import { render } from './render'

const OUT_FILE = join(OUT_DIR, 'runtime.json')
// --quick takes one round and writes nothing, to try a bench file.
const quick = process.argv.includes('--quick')
const COPIES = 100
const ROUNDS = quick ? 1 : 12
const WARMUP_ROUNDS = quick ? 0 : 2
const TOGGLE_REPS = quick ? 3 : 20

if (!existsSync(DIST_DIR)) throw new Error('dist/ is missing: run `bun run build` first')

const only = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
const files = benchFiles(only)
if (files.length === 0) throw new Error(`no bench file for ${only.join(', ')}`)

const outdir = mkdtempSync(join(tmpdir(), 'duck-primitives-runtime-'))
writeFileSync(
  join(outdir, 'entry.tsx'),
  [
    `import { install } from ${JSON.stringify(join(import.meta.dirname, 'harness.tsx'))}`,
    ...files.map(({ file }, i) => `import case${i} from ${JSON.stringify(file)}`),
    `install([${files.map(({ module }, i) => `{ module: ${JSON.stringify(module)}, ...case${i} }`).join(', ')}])`,
  ].join('\n'),
)
writeFileSync(
  join(outdir, 'index.html'),
  '<!doctype html><html><body><script type="module" src="./entry.tsx"></script></body></html>',
)

const build = await Bun.build({
  entrypoints: [join(outdir, 'index.html')],
  outdir: join(outdir, 'out'),
  minify: true,
  target: 'browser',
  define: { 'process.env.NODE_ENV': '"production"' },
})
if (!build.success) throw new AggregateError(build.logs, 'runtime benchmark page failed to build')

const server = Bun.serve({
  port: 0,
  async fetch(request: Request) {
    const path = new URL(request.url).pathname
    const file = Bun.file(join(outdir, 'out', path === '/' ? 'index.html' : path))
    return (await file.exists()) ? new Response(file) : new Response('not found', { status: 404 })
  },
})

// Collecting before each timed phase keeps garbage left by one phase out of the next one's number.
const browser = await chromium.launch({ args: ['--js-flags=--expose-gc'] })

const page = await browser.newPage()
page.on('pageerror', (error) => console.error('page error:', error.message))
await page.goto(`http://localhost:${server.port}/`)
await page.waitForFunction(() => window.__bench !== undefined)
if (!(await page.evaluate(() => typeof window.gc === 'function')))
  throw new Error('page cannot force a garbage collection')

const cases: IBenchApi['cases'] = await page.evaluate(() => window.__bench.cases)

interface ITraceEvent {
  cat: string
  name: string
  ph: string
  pid: number
  tid: number
  ts: number
  dur?: number
}

// The main thread's work in each phase the harness marks, in ms, less the idle window's work for each frame the
// phase waited.
async function traced(run: () => Promise<void>) {
  await browser.startTracing(page, { categories: ['toplevel', 'blink.user_timing'] })
  await run()
  const { traceEvents }: { traceEvents: ITraceEvent[] } = JSON.parse((await browser.stopTracing()).toString())
  const marks = traceEvents
    .filter((event) => event.cat === 'blink.user_timing' && /:(start|end:\d+)$/.test(event.name))
    .toSorted((a, b) => a.ts - b.ts)
  const thread = marks[0]
  if (!thread) throw new Error('the trace holds no phase marks')
  const tasks = traceEvents.filter(
    (event) =>
      event.pid === thread.pid &&
      event.tid === thread.tid &&
      event.ph === 'X' &&
      event.name === 'ThreadControllerImpl::RunTask',
  )
  const busy = (from: number, to: number) =>
    tasks.reduce((sum, { ts, dur = 0 }) => sum + Math.max(0, Math.min(ts + dur, to) - Math.max(ts, from)), 0) / 1000
  const starts = new Map<string, number[]>()
  const work = new Map<string, { ms: number; frames: number }[]>()
  for (const { name, ts } of marks) {
    const [phase = '', edge, frames] = name.split(':')
    if (edge === 'start') starts.set(phase, [...(starts.get(phase) ?? []), ts])
    else {
      const ms = busy(starts.get(phase)?.shift() ?? ts, ts)
      work.set(phase, [...(work.get(phase) ?? []), { ms, frames: Number(frames) }])
    }
  }
  const idle = work.get('idle')
  if (!idle) throw new Error('the trace holds no idle window')
  const perFrame = median(idle.map(({ ms, frames }) => ms / frames))
  return (phase: string) => {
    const values = work.get(phase)
    if (!values) throw new Error(`the trace holds no ${phase} phase`)
    return values.map(({ ms, frames }) => Math.max(0, ms - frames * perFrame))
  }
}

const samples: Record<string, Record<string, Partial<Record<IBench.Library, number[]>>>> = {}
function record(caseName: string, metric: string, lib: IBench.Library, values: number[]) {
  samples[caseName] ??= {}
  samples[caseName][metric] ??= {}
  samples[caseName][metric][lib] ??= []
  samples[caseName][metric][lib].push(...values)
}

// React Aria's calendar leaves elements in the document, so each case after it measured a bigger page.
const leftBehind = new Map<string, number>()

for (let round = 0; round < WARMUP_ROUNDS + ROUNDS; round++) {
  for (const { name, overlay, update, libs, closedOnly } of cases) {
    for (const lib of round % 2 === 0 ? libs : libs.toReversed()) {
      const many = await traced(() =>
        page.evaluate(([n, l, c]) => window.__bench.many(n, l, c), [name, lib, COPIES] as const),
      )
      const toggled =
        overlay && !closedOnly.includes(lib)
          ? await traced(() =>
              page.evaluate(([n, l, r]) => window.__bench.toggle(n, l, r), [name, lib, TOGGLE_REPS] as const),
            )
          : null
      const left = await page.evaluate(() => window.__bench.sweep())
      if (left > 0) leftBehind.set(`${name} (${lib})`, left)
      if (round < WARMUP_ROUNDS) continue
      record(name, `mount x${COPIES}`, lib, many('mount'))
      if (!overlay) record(name, `${update} x${COPIES}`, lib, many('update'))
      record(name, `unmount x${COPIES}`, lib, many('unmount'))
      if (toggled) {
        record(name, `unmount open x${COPIES}`, lib, many('unmount open'))
        record(name, 'open', lib, toggled('open'))
        record(name, 'close', lib, toggled('close'))
      }
    }
  }
  process.stdout.write(round < WARMUP_ROUNDS ? 'w' : '.')
}
process.stdout.write('\n')
for (const [run, left] of leftBehind)
  console.log(`${run} left ${left} elements in the document, removed before the next run`)

const environment = {
  browser: `chromium ${browser.version()}`,
  react: (await import('react')).version,
  cpu: cpus()[0]?.model ?? 'unknown',
  os: `${platform()} ${release()}`,
  copies: COPIES,
  rounds: ROUNDS,
  toggleReps: TOGGLE_REPS,
} satisfies IBench.IEnvironment

await browser.close()
server.stop(true)
rmSync(outdir, { recursive: true, force: true })

function median(values: number[]) {
  const sorted = values.toSorted((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const measured: IBench.IRuntimeResult[] = cases.map(({ name, module, overlay, libs }) => ({
  name,
  module,
  overlay,
  metrics: Object.entries(samples[name]).map(([metric, byLib]) => {
    const timed = libs.filter((lib) => byLib[lib]?.length)
    const ms = Object.fromEntries(timed.map((lib) => [lib, +median(byLib[lib] ?? []).toFixed(3)]))
    const duckVs = Object.fromEntries(
      timed
        .filter((lib) => lib !== 'duck' && ms.duck > 0 && ms[lib] > 0)
        .map((lib) => [lib, +(ms.duck / ms[lib]).toFixed(2)]),
    )
    return { metric, ms, duckVs, samples: byLib.duck?.length ?? 0 }
  }),
}))

if (quick) {
  for (const { name, metrics } of measured)
    for (const m of metrics) console.log(`${name.padEnd(16)} ${m.metric.padEnd(16)} ${JSON.stringify(m.ms)}`)
  process.exit(0)
}

// A run over some modules keeps the last numbers of the rest, which only holds where they were measured the same way.
const previous = only.length && existsSync(OUT_FILE) ? JSON.parse(readFileSync(OUT_FILE, 'utf-8')) : undefined
if (previous && JSON.stringify(previous.environment) !== JSON.stringify(environment))
  throw new Error(`runtime.json was measured on ${JSON.stringify(previous.environment)}: run every module again`)
const kept: IBench.IRuntimeResult[] = (previous?.results ?? []).filter(
  (r: IBench.IRuntimeResult) => !measured.some((m) => m.name === r.name),
)
const results = [...kept, ...measured].sort((a, b) => a.name.localeCompare(b.name))

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(
  OUT_FILE,
  `${JSON.stringify(
    {
      environment,
      methodology:
        'Production React in headless Chromium. Each library renders the same controlled tree, from the bench file in the module\'s __benches__ folder; a value is the median ms across rounds, with the libraries interleaved and their order alternated per round, and a garbage collection forced before each timed phase. "x100" is a hundred copies rendered at once; overlays mount and unmount closed, and "unmount open" tears down a hundred once every one shows. Each value is the main thread\'s work, read from a Chromium trace, from the step until two frames after its result shows, less the harness\'s own work for each of those frames, measured over frames with nothing to do: an effect that mounts the content, a later task that positions it, a frame-late unmount, and the style, layout and paint of the frame showing it all count, and idle time between them does not. After mounting and after an update the page settles, until two frames pass with nothing changed, so the next step does not pay for work the last one left behind. "open" and "close" are one overlay. "type" sets every copy\'s input and dispatches its input event, as typing does, and runs until every copy shows the change. A duckVs ratio under 1 means gentleduck is faster than that library.',
      results,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`,
)

console.log(`${environment.browser}, React ${environment.react}, ${environment.cpu}`)
for (const { name, metrics } of measured) {
  for (const m of metrics) {
    const others = Object.entries(m.duckVs).map(([lib, ratio]) => `${lib} x${ratio}`)
    console.log(
      `${name.padEnd(16)} ${m.metric.padEnd(16)} duck ${m.ms.duck?.toFixed(3).padStart(8)}  ${others.join('  ')}`,
    )
  }
}
console.log(`\n${OUT_FILE}`)
render()
