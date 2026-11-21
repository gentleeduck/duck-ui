import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import type { RegistryEntry } from '../../registry-schema'
import { registryUi } from '../../registry-ui/registry-ui'
import * as blocks from '../index'

// `duck add <block>` writes the block's files, installs its registryDependencies and theirs, and installs the npm
// dependencies of every item it wrote, so each import in a block has to land on something that install puts in place.
const SRC = path.resolve(import.meta.dirname, '../../../registry-blocks/src')
// The host app provides these, so no block declares them.
const HOST_PACKAGES = new Set(['react', 'react-dom', 'next'])
const IMPORT =
  /(?:^|\s)(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]|^import\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/gm
const PART = '@gentleduck/registry-ui/'

const registryBlocks = Object.values(blocks).flat() as RegistryEntry[]
const byName = new Map(registryUi.map((entry) => [entry.name, entry]))

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const full = path.join(dir, dirent.name)
    return dirent.isDirectory() ? walk(full) : [full]
  })
}

function importsOf(entry: RegistryEntry) {
  return walk(path.join(SRC, entry.root_folder))
    .filter((file) => /\.tsx?$/.test(file))
    .flatMap((file) =>
      Array.from(readFileSync(file, 'utf8').matchAll(IMPORT), (match) => ({
        file: path.relative(SRC, file),
        specifier: match[1] ?? match[2] ?? match[3] ?? '',
      })),
    )
}

function installedWith(names: string[], seen = new Set<string>()) {
  for (const name of names) {
    if (seen.has(name)) continue
    seen.add(name)
    installedWith(byName.get(name)?.registryDependencies ?? [], seen)
  }
  return seen
}

function packageOf(specifier: string) {
  const parts = specifier.split('/')
  return (specifier.startsWith('@') ? parts.slice(0, 2) : parts.slice(0, 1)).join('/')
}

describe('registry-blocks items install everything they import', () => {
  test('registryDependencies name registry-ui items', () => {
    const unknown = registryBlocks.flatMap((entry) =>
      (entry.registryDependencies ?? []).filter((name) => !byName.has(name)).map((name) => `${entry.name} -> ${name}`),
    )
    expect(unknown).toEqual([])
  })

  test('the registry-ui parts a block imports are installed with it', () => {
    const missing = registryBlocks.flatMap((entry) => {
      const installed = installedWith(entry.registryDependencies ?? [])
      return importsOf(entry)
        .filter(({ specifier }) => specifier.startsWith(PART))
        .map(({ specifier }) => specifier.slice(PART.length).split('/')[0] ?? '')
        .filter((part) => !installed.has(part))
        .map((part) => `${entry.name}: ${part}`)
    })
    expect([...new Set(missing)]).toEqual([])
  })

  test('package imports are declared by the block or what it installs', () => {
    const undeclared = registryBlocks.flatMap((entry) => {
      const declared = new Set(entry.dependencies ?? [])
      for (const name of installedWith(entry.registryDependencies ?? [])) {
        for (const pkg of byName.get(name)?.dependencies ?? []) declared.add(pkg)
      }
      return importsOf(entry)
        .map(({ specifier }) => specifier)
        .filter((specifier) => !specifier.startsWith('.') && !specifier.startsWith(PART))
        .map(packageOf)
        .filter((pkg) => !HOST_PACKAGES.has(pkg) && !declared.has(pkg))
        .map((pkg) => `${entry.name}: ${pkg}`)
    })
    expect([...new Set(undeclared)]).toEqual([])
  })

  test('every package a block declares is imported by one of its files', () => {
    const unused = registryBlocks.flatMap((entry) => {
      const imported = new Set(importsOf(entry).map(({ specifier }) => packageOf(specifier)))
      return (entry.dependencies ?? []).filter((pkg) => !imported.has(pkg)).map((pkg) => `${entry.name}: ${pkg}`)
    })
    expect(unused).toEqual([])
  })
})
