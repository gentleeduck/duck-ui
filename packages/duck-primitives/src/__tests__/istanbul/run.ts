import { readFileSync, realpathSync } from 'node:fs'
import { join, relative } from 'node:path'
import { type IFileCoverage, instrument } from './instrument'

// A ratchet: raise a floor as coverage rises, and read a drop as the thing to fix, never the number to lower.
const FLOOR = { statements: 87, branches: 84, functions: 85, lines: 87 }

const PACKAGE = join(import.meta.dir, '../../..')
const SRC = join(PACKAGE, 'src')
const OUT = join(PACKAGE, 'coverage/coverage-final.json')

function run(args: Array<string>, env: Record<string, string> = {}) {
  return Bun.spawnSync(['bun', 'test', ...args], {
    cwd: PACKAGE,
    env: { ...process.env, ...env },
    stdio: ['inherit', 'inherit', 'inherit'],
  }).exitCode
}

// A filtered or flagged run covers part of the package, so the floor is read only on the whole suite.
const args = process.argv.slice(2)
if (args.length > 0) process.exit(run(args))

const exitCode = run(['--preload', join(import.meta.dir, 'preload.ts')], { DUCK_COVERAGE_OUT: OUT })
if (exitCode !== 0) process.exit(exitCode)

const coverage: Record<string, IFileCoverage> = JSON.parse(readFileSync(OUT, 'utf8'))

// The report holds only the files a test loaded, so a file none loads is instrumented here and counts as never run.
const unloaded = new Set<string>()
for (const file of new Bun.Glob('**/*.{ts,tsx}').scanSync({ cwd: SRC })) {
  const path = realpathSync(join(SRC, file))
  if (/(^|\/)__(tests|benches|stories)__\//.test(file) || coverage[path]) continue
  instrument(path, readFileSync(path, 'utf8'), (_, initial) => {
    coverage[path] = initial
  })
  unloaded.add(path)
}
const totals = {
  statements: [0, 0],
  branches: [0, 0],
  functions: [0, 0],
  lines: [0, 0],
}
const gaps: Array<string> = []

for (const [path, file] of Object.entries(coverage).sort(([a], [b]) => a.localeCompare(b))) {
  const missed = { statements: new Set<number>(), branches: new Set<number>(), functions: new Set<number>() }

  for (const [id, count] of Object.entries(file.s)) {
    totals.statements[1]++
    if (count > 0) totals.statements[0]++
    else missed.statements.add(file.statementMap[id]!.start.line)
  }
  for (const [id, count] of Object.entries(file.f)) {
    totals.functions[1]++
    if (count > 0) totals.functions[0]++
    else missed.functions.add(file.fnMap[id]!.loc.start.line)
  }
  for (const [id, counts] of Object.entries(file.b)) {
    const branch = file.branchMap[id]!
    counts.forEach((count, index) => {
      totals.branches[1]++
      if (count > 0) totals.branches[0]++
      else missed.branches.add(branch.locations[index]?.start?.line ?? branch.loc.start.line)
    })
  }

  const lines = new Map<number, number>()
  for (const [id, count] of Object.entries(file.s)) {
    const line = file.statementMap[id]!.start.line
    lines.set(line, Math.max(lines.get(line) ?? 0, count))
  }
  for (const count of lines.values()) {
    totals.lines[1]++
    if (count > 0) totals.lines[0]++
  }

  const parts = Object.entries(missed)
    .filter(([, at]) => at.size > 0)
    .map(([metric, at]) => `${metric} ${[...at].sort((a, b) => a - b).join(' ')}`)
  if (parts.length > 0) {
    gaps.push(`  ${relative(PACKAGE, path)}: ${unloaded.has(path) ? 'loaded by no test' : parts.join(' | ')}`)
  }
}

let below = false
console.log('\nCoverage of src:')
for (const [metric, [covered, total]] of Object.entries(totals) as Array<[keyof typeof FLOOR, Array<number>]>) {
  const percent = total === 0 ? 100 : (covered! / total!) * 100
  const short = covered! * 100 < FLOOR[metric] * total!
  below ||= short
  console.log(
    `  ${metric.padEnd(10)} ${percent.toFixed(2).padStart(6)}%  ${covered}/${total}${short ? `  below ${FLOOR[metric]}%` : ''}`,
  )
}

if (gaps.length > 0) console.log(`\nNot covered, by line:\n${gaps.join('\n')}`)
process.exit(below ? 1 : 0)
