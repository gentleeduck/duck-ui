import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { registryUi } from '../../registry-ui/registry-ui'
import { registryExamples } from '../registry-examples'

// `duck add <example>` writes the file and installs its folder's registryDependencies, then theirs, so a part an
// example imports and nothing in that chain installs leaves the user an import that resolves to nothing.
const SRC = path.resolve(import.meta.dirname, '../../../registry-examples/src')
const PART = /from\s*['"]@gentleduck\/registry-ui\/([^/'"]+)/g
// The host app provides these, so no example declares them.
const HOST_PACKAGES = new Set(['react', 'react-dom', 'next'])
const PACKAGE = /from\s*['"]((?:@[^/'"]+\/)?[^./'"@][^/'"]*)[^'"]*['"]/g

const byName = new Map(registryUi.map((entry) => [entry.name, entry]))

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const full = path.join(dir, dirent.name)
    return dirent.isDirectory() ? walk(full) : [full]
  })
}

function installedWith(names: string[], seen = new Set<string>()) {
  for (const name of names) {
    if (seen.has(name)) continue
    seen.add(name)
    installedWith(byName.get(name)?.registryDependencies ?? [], seen)
  }
  return seen
}

describe('registry-examples items install every part they import', () => {
  test('registryDependencies name registry-ui items', () => {
    const unknown = registryExamples.flatMap((entry) =>
      (entry.registryDependencies ?? []).filter((name) => !byName.has(name)).map((name) => `${entry.name} -> ${name}`),
    )
    expect(unknown).toEqual([])
  })

  test('the registry-ui parts an example imports are installed with it', () => {
    const missing: string[] = []
    for (const entry of registryExamples) {
      const installed = installedWith(entry.registryDependencies ?? [])
      for (const file of walk(path.join(SRC, entry.root_folder)).filter((file) => /\.tsx?$/.test(file))) {
        for (const [, part] of readFileSync(file, 'utf8').matchAll(PART)) {
          if (part && !installed.has(part)) missing.push(`${path.relative(SRC, file)}: ${part}`)
        }
      }
    }
    expect([...new Set(missing)]).toEqual([])
  })

  test('package imports are declared by the example or the parts it installs', () => {
    const undeclared: string[] = []
    for (const entry of registryExamples) {
      const declared = new Set(entry.dependencies ?? [])
      for (const name of installedWith(entry.registryDependencies ?? [])) {
        for (const pkg of byName.get(name)?.dependencies ?? []) declared.add(pkg)
      }
      for (const file of walk(path.join(SRC, entry.root_folder)).filter((file) => /\.tsx?$/.test(file))) {
        for (const [, pkg] of readFileSync(file, 'utf8').matchAll(PACKAGE)) {
          if (pkg && pkg !== '@gentleduck/registry-ui' && !HOST_PACKAGES.has(pkg) && !declared.has(pkg)) {
            undeclared.push(`${entry.name}: ${pkg}`)
          }
        }
      }
    }
    expect([...new Set(undeclared)]).toEqual([])
  })
})
