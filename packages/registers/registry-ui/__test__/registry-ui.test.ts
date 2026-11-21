import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import type { RegistryEntry } from '../../registry-schema'
import { registryUi } from '../registry-ui'

// `duck add` writes an item's files verbatim, installs its registryDependencies recursively, and
// installs the npm dependencies of every item it wrote. Each import in a shipped file has to land on
// a file or a package that this install puts in place.
const SRC = path.resolve(import.meta.dirname, '../../../registry-ui/src')
// registry-build's DEFAULT_SOURCE_IGNORE: tests and snapshots never ship.
const NOT_SHIPPED = /(^|\/)(__tests?__|__snapshots__)\/|\.(test|spec)\.[^/]+$/
// The host app provides React, so no item declares it.
const HOST_PACKAGES = new Set(['react', 'react-dom'])
const IMPORT =
  /(?:^|\s)(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]|^import\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/gm

const byName = new Map(registryUi.map((entry) => [entry.name, entry]))

function isFile(file: string) {
  try {
    return statSync(file).isFile()
  } catch {
    return false
  }
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const full = path.join(dir, dirent.name)
    return dirent.isDirectory() ? walk(full) : [full]
  })
}

function shippedFiles(entry: RegistryEntry) {
  if (entry.files.length > 0) return entry.files.map((file) => file.path)
  return walk(path.join(SRC, entry.root_folder))
    .map((file) => path.relative(SRC, file).split(path.sep).join('/'))
    .filter((file) => /\.tsx?$/.test(file) && !NOT_SHIPPED.test(file))
}

function importsOf(file: string) {
  const source = readFileSync(path.join(SRC, file), 'utf8')
  return Array.from(source.matchAll(IMPORT), (match) => match[1] ?? match[2] ?? match[3] ?? '')
}

function resolveImport(from: string, specifier: string) {
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier))
  return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find((candidate) =>
    isFile(path.join(SRC, candidate)),
  )
}

function packageOf(specifier: string) {
  const parts = specifier.split('/')
  return (specifier.startsWith('@') ? parts.slice(0, 2) : parts.slice(0, 1)).join('/')
}

function installedWith(name: string, seen = new Set<string>()) {
  for (const dependency of byName.get(name)?.registryDependencies ?? []) {
    if (seen.has(dependency)) continue
    seen.add(dependency)
    installedWith(dependency, seen)
  }
  return seen
}

const shipped = new Map(registryUi.map((entry) => [entry.name, shippedFiles(entry)]))
const owner = new Map([...shipped].flatMap(([name, files]) => files.map((file) => [file, name] as const)))

describe('registry-ui items install everything they import', () => {
  test('registryDependencies name registry-ui items', () => {
    const unknown = registryUi.flatMap((entry) =>
      (entry.registryDependencies ?? []).filter((name) => !byName.has(name)).map((name) => `${entry.name} -> ${name}`),
    )
    expect(unknown).toEqual([])
  })

  test('every shipped file exists', () => {
    const missing = [...shipped].flatMap(([name, files]) =>
      files.filter((file) => !isFile(path.join(SRC, file))).map((file) => `${name}: ${file}`),
    )
    expect(missing).toEqual([])
  })

  test('relative imports land on files the item or its registryDependencies ship', () => {
    const unresolved: string[] = []
    for (const [name, files] of shipped) {
      const installed = installedWith(name)
      for (const file of files) {
        for (const specifier of importsOf(file).filter((s) => s.startsWith('.'))) {
          const target = resolveImport(file, specifier)
          const by = target && owner.get(target)
          if (!by) unresolved.push(`${file}: ${specifier} is shipped by no item`)
          else if (by !== name && !installed.has(by)) unresolved.push(`${file}: ${specifier} needs "${by}"`)
        }
      }
    }
    expect(unresolved).toEqual([])
  })

  test('package imports are declared by the item or its registryDependencies', () => {
    const undeclared: string[] = []
    for (const [name, files] of shipped) {
      const declared = new Set(byName.get(name)?.dependencies ?? [])
      for (const dependency of installedWith(name)) {
        for (const pkg of byName.get(dependency)?.dependencies ?? []) declared.add(pkg)
      }
      for (const file of files) {
        for (const specifier of importsOf(file).filter((s) => !s.startsWith('.'))) {
          const pkg = packageOf(specifier)
          if (!HOST_PACKAGES.has(pkg) && !declared.has(pkg)) undeclared.push(`${name}: ${pkg} (${file})`)
        }
      }
    }
    expect(undeclared).toEqual([])
  })

  test('every package an item declares is imported by one of its files', () => {
    const unused = [...shipped].flatMap(([name, files]) => {
      const imported = new Set(
        files
          .flatMap(importsOf)
          .filter((s) => !s.startsWith('.'))
          .map(packageOf),
      )
      return (byName.get(name)?.dependencies ?? []).filter((pkg) => !imported.has(pkg)).map((pkg) => `${name}: ${pkg}`)
    })
    expect(unused).toEqual([])
  })
})
