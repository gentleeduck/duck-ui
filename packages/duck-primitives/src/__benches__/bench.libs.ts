import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { IBench } from './bench.types'

export const SRC_DIR = join(import.meta.dirname, '..')
export const PACKAGE_DIR = join(SRC_DIR, '..')
export const DIST_DIR = join(PACKAGE_DIR, 'dist')
export const OUT_DIR = join(PACKAGE_DIR, 'public', 'benchmarks')
export const DOCS_DIR = join(PACKAGE_DIR, '..', '..', 'apps', 'duck', 'public', 'data', 'benchmarks')
export const DOCS_PAGE = join(
  PACKAGE_DIR,
  '..',
  '..',
  'apps',
  'duck',
  'content',
  'docs',
  'duck-primitives',
  'benchmarks.mdx',
)

export const LIBRARIES: Record<IBench.Library, string> = {
  duck: 'gentleduck',
  radix: 'Radix',
  baseui: 'Base UI',
  'react-aria': 'React Aria',
  ark: 'Ark UI',
  headless: 'Headless UI',
  cmdk: 'cmdk',
  'input-otp': 'input-otp',
  vaul: 'vaul',
  'react-day-picker': 'react-day-picker',
}

export const RIVALS = Object.keys(LIBRARIES).filter((lib) => lib !== 'duck') as IBench.Rival[]

export function benchFiles(only: string[] = []) {
  return readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((dir) => dir.isDirectory() && !dir.name.startsWith('__'))
    .map((dir) => ({ module: dir.name, file: join(SRC_DIR, dir.name, '__benches__', `${dir.name}.bench.tsx`) }))
    .filter(({ module, file }) => existsSync(file) && (only.length === 0 || only.includes(module)))
}

export async function loadCases(only?: string[]): Promise<IBench.IModuleCase[]> {
  return Promise.all(
    benchFiles(only).map(async ({ module, file }) => ({ module, ...((await import(file)).default as IBench.ICase) })),
  )
}

export function parts(entry: IBench.Entry): Exclude<IBench.Part, string>[] {
  return [entry].flat().map((part) => (typeof part === 'string' ? { names: ['*'], from: part } : part))
}

export function entrySource(entry: IBench.Entry): string {
  return parts(entry)
    .map(({ names, from }) =>
      names[0] === '*' ? `export * from '${from}'\n` : `export { ${names.join(', ')} } from '${from}'\n`,
    )
    .join('')
}

export function versionOf(entry: IBench.Entry): string {
  const from = parts(entry)[0].from
  const name = from
    .split('/')
    .slice(0, from.startsWith('@') ? 2 : 1)
    .join('/')
  for (let dir = dirname(Bun.resolveSync(from, PACKAGE_DIR)); dir !== dirname(dir); dir = dirname(dir)) {
    const file = join(dir, 'package.json')
    if (!existsSync(file)) continue
    const pkg = JSON.parse(readFileSync(file, 'utf-8'))
    if (pkg.name === name) return pkg.version
  }
  throw new Error(`cannot find the version of ${name}`)
}
