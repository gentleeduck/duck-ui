import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { registryUi } from '../../registry-ui/registry-ui'
import { registryInternal } from '../registry-internal'

// The primitive examples install the way the other examples do: their entry's registryDependencies and their npm
// dependencies, so each import has to land on one of those.
const SRC = path.resolve(import.meta.dirname, '../../../registry-internals/src')
const HOST_PACKAGES = new Set(['react', 'react-dom'])
const IMPORT = /(?:^|\s)(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]|^import\s+['"]([^'"]+)['"]/gm

const byName = new Map(registryUi.map((entry) => [entry.name, entry]))

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const full = path.join(dir, dirent.name)
    return dirent.isDirectory() ? walk(full) : [full]
  })
}

function packageOf(specifier: string) {
  const parts = specifier.split('/')
  return (specifier.startsWith('@') ? parts.slice(0, 2) : parts.slice(0, 1)).join('/')
}

describe('registry-internal items install everything they import', () => {
  test('registryDependencies name registry-ui items', () => {
    const unknown = registryInternal.flatMap((entry) =>
      (entry.registryDependencies ?? []).filter((name) => !byName.has(name)).map((name) => `${entry.name} -> ${name}`),
    )
    expect(unknown).toEqual([])
  })

  test('package imports are declared by the item', () => {
    const undeclared = registryInternal.flatMap((entry) => {
      const declared = new Set(entry.dependencies ?? [])
      return walk(path.join(SRC, entry.root_folder))
        .filter((file) => /\.tsx?$/.test(file) && !file.includes('__tests__'))
        .flatMap((file) =>
          Array.from(readFileSync(file, 'utf8').matchAll(IMPORT), (match) => match[1] ?? match[2] ?? ''),
        )
        .filter((specifier) => !specifier.startsWith('.'))
        .map(packageOf)
        .filter((pkg) => !HOST_PACKAGES.has(pkg) && !declared.has(pkg))
        .map((pkg) => `${entry.name}: ${pkg}`)
    })
    expect([...new Set(undeclared)]).toEqual([])
  })
})
