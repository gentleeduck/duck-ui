import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { DEFAULT_SOURCE_GLOB, DEFAULT_SOURCE_IGNORE, DEFAULT_SOURCE_INDEX_STRATEGY } from '../defaults'
import {
  deriveDeclaredItemTypes,
  deriveLegacyCollections,
  deriveThemeCssVarKeys,
  resolveCollectionSources,
  resolveSources,
} from '../resolution/resolution.lib'
import type { IRegistryBuildConfig, IRegistryBuildSource } from '../types'

describe('deriveDeclaredItemTypes', () => {
  test('returns empty array for empty config', () => {
    const result = deriveDeclaredItemTypes({})
    expect(result).toEqual([])
  })

  test('collects types from sources keys', () => {
    const config: IRegistryBuildConfig = {
      sources: {
        'registry:ui': { path: './ui' },
        'registry:block': { path: './blocks' },
      },
    }
    const result = deriveDeclaredItemTypes(config)
    expect(result).toContain('registry:ui')
    expect(result).toContain('registry:block')
  })

  test('collects types from targetPaths keys', () => {
    const config: IRegistryBuildConfig = {
      targetPaths: {
        'registry:ui': 'components/ui',
      },
    }
    const result = deriveDeclaredItemTypes(config)
    expect(result).toContain('registry:ui')
  })

  test('collects types from schema.itemTypes', () => {
    const config: IRegistryBuildConfig = {
      schema: {
        itemTypes: ['registry:ui', 'registry:hook'],
      },
    }
    const result = deriveDeclaredItemTypes(config)
    expect(result).toContain('registry:ui')
    expect(result).toContain('registry:hook')
  })

  test('collects types from importMappings.packageMappings', () => {
    const config: IRegistryBuildConfig = {
      importMappings: {
        packageMappings: { 'registry:ui': '@gentleduck/ui' },
      },
    }
    const result = deriveDeclaredItemTypes(config)
    expect(result).toContain('registry:ui')
  })

  test('collects types from componentIndex.excludeTypes', () => {
    const config: IRegistryBuildConfig = {
      componentIndex: {
        excludeTypes: ['registry:hook'],
      },
    }
    const result = deriveDeclaredItemTypes(config)
    expect(result).toContain('registry:hook')
  })

  test('deduplicates types from multiple sections', () => {
    const config: IRegistryBuildConfig = {
      sources: { 'registry:ui': { path: './ui' } },
      targetPaths: { 'registry:ui': 'components/ui' },
      schema: { itemTypes: ['registry:ui'] },
    }
    const result = deriveDeclaredItemTypes(config)
    const uiCount = result.filter((t) => t === 'registry:ui').length
    expect(uiCount).toBe(1)
  })

  test('returns sorted types', () => {
    const config: IRegistryBuildConfig = {
      sources: {
        'registry:ui': { path: './ui' },
        'registry:block': { path: './blocks' },
        'registry:hook': { path: './hooks' },
      },
    }
    const result = deriveDeclaredItemTypes(config)
    const sorted = [...result].sort()
    expect(result).toEqual(sorted)
  })
})

describe('deriveLegacyCollections', () => {
  test('returns empty object when no registries', () => {
    const result = deriveLegacyCollections({})
    expect(result).toEqual({})
  })

  test('materializes a collection from registries with matching sources', () => {
    const config: IRegistryBuildConfig = {
      registries: {
        uis: [
          { name: 'button', root_folder: 'button', type: 'registry:ui' },
          { name: 'card', root_folder: 'card', type: 'registry:ui' },
        ],
      },
      sources: {
        'registry:ui': { path: './src/ui', referencePath: '/ui' },
      },
    }
    const result = deriveLegacyCollections(config)

    expect(result.uis).toBeDefined()
    expect(result.uis.metadata).toEqual({
      compatibility: 'legacy-registries',
      kind: 'ui-registry',
      itemTypes: ['registry:ui'],
    })
    expect(result.uis.data).toHaveLength(2)
    expect(result.uis.sources['registry:ui']?.path).toBe('./src/ui')
  })

  test('collects multiple item types from a single registry group', () => {
    const config: IRegistryBuildConfig = {
      registries: {
        mixed: [
          { name: 'button', root_folder: 'button', type: 'registry:ui' },
          { name: 'useToggle', root_folder: 'use-toggle', type: 'registry:hook' },
        ],
      },
      sources: {
        'registry:ui': { path: './src/ui' },
        'registry:hook': { path: './src/hooks' },
      },
    }
    const result = deriveLegacyCollections(config)

    expect(result.mixed.metadata.itemTypes).toContain('registry:ui')
    expect(result.mixed.metadata.itemTypes).toContain('registry:hook')
    expect(result.mixed.sources['registry:ui']).toBeDefined()
    expect(result.mixed.sources['registry:hook']).toBeDefined()
  })

  test('omits sources that do not exist in config.sources', () => {
    const config: IRegistryBuildConfig = {
      registries: {
        uis: [{ name: 'button', root_folder: 'button', type: 'registry:ui' }],
      },
      // no sources defined
    }
    const result = deriveLegacyCollections(config)

    expect(Object.keys(result.uis.sources)).toHaveLength(0)
  })
})

describe('deriveThemeCssVarKeys', () => {
  test('returns empty array for empty themes', () => {
    const result = deriveThemeCssVarKeys({})
    expect(result).toEqual([])
  })

  test('collects keys from light and dark', () => {
    const result = deriveThemeCssVarKeys({
      zinc: {
        dark: { background: 'black', foreground: 'white' },
        label: 'Zinc',
        light: { background: 'white', accent: 'blue' },
        radius: '0.5rem',
      },
    })
    expect(result).toContain('background')
    expect(result).toContain('foreground')
    expect(result).toContain('accent')
  })

  test('deduplicates keys across themes and modes', () => {
    const result = deriveThemeCssVarKeys({
      zinc: {
        dark: { background: 'black' },
        label: 'Zinc',
        light: { background: 'white' },
        radius: '0.5rem',
      },
      teal: {
        dark: { background: 'forest' },
        label: 'Teal',
        light: { background: 'mint' },
        radius: '0.75rem',
      },
    })
    const bgCount = result.filter((k) => k === 'background').length
    expect(bgCount).toBe(1)
  })

  test('returns sorted keys', () => {
    const result = deriveThemeCssVarKeys({
      zinc: {
        dark: { foreground: 'white', background: 'black' },
        label: 'Zinc',
        light: { accent: 'blue', border: 'gray' },
        radius: '0.5rem',
      },
    })
    const sorted = [...result].sort()
    expect(result).toEqual(sorted)
  })
})

describe('resolveSources', () => {
  test('resolves relative path from config dir', () => {
    const sources = {
      'registry:ui': { path: './src/ui' } as IRegistryBuildSource,
    }
    const result = resolveSources('/project/root', sources)
    expect(result['registry:ui']?.path).toBe(path.resolve('/project/root', './src/ui'))
  })

  test('preserves absolute paths unchanged', () => {
    const sources = {
      'registry:ui': { path: '/absolute/ui' } as IRegistryBuildSource,
    }
    const result = resolveSources('/project/root', sources)
    expect(result['registry:ui']?.path).toBe('/absolute/ui')
  })

  test('applies default glob when not specified', () => {
    const sources = {
      'registry:ui': { path: './src/ui' } as IRegistryBuildSource,
    }
    const result = resolveSources('/project', sources)
    expect(result['registry:ui']?.glob).toBe(DEFAULT_SOURCE_GLOB)
  })

  test('preserves user-provided glob', () => {
    const sources = {
      'registry:ui': { path: './src/ui', glob: '**/*.vue' } as IRegistryBuildSource,
    }
    const result = resolveSources('/project', sources)
    expect(result['registry:ui']?.glob).toBe('**/*.vue')
  })

  test('applies default ignore when not specified', () => {
    const sources = {
      'registry:ui': { path: './src/ui' } as IRegistryBuildSource,
    }
    const result = resolveSources('/project', sources)
    expect(result['registry:ui']?.ignore).toEqual([...DEFAULT_SOURCE_IGNORE])
  })

  test('merges user-provided ignore with DEFAULT_SOURCE_IGNORE', () => {
    const sources = {
      'registry:ui': { path: './src/ui', ignore: ['**/dist/**'] } as IRegistryBuildSource,
    }
    const result = resolveSources('/project', sources)
    expect(result['registry:ui']?.ignore).toEqual([...DEFAULT_SOURCE_IGNORE, '**/dist/**'])
  })

  test('applies default indexStrategy when not specified', () => {
    const sources = {
      'registry:ui': { path: './src/ui' } as IRegistryBuildSource,
    }
    const result = resolveSources('/project', sources)
    expect(result['registry:ui']?.indexStrategy).toBe(DEFAULT_SOURCE_INDEX_STRATEGY)
  })

  test('handles empty sources record', () => {
    const result = resolveSources('/project', {})
    expect(Object.keys(result)).toHaveLength(0)
  })

  test('resolves multiple sources', () => {
    const sources = {
      'registry:ui': { path: './src/ui' } as IRegistryBuildSource,
      'registry:block': { path: './src/blocks' } as IRegistryBuildSource,
    }
    const result = resolveSources('/project', sources)
    expect(result['registry:ui']?.path).toBe(path.resolve('/project', './src/ui'))
    expect(result['registry:block']?.path).toBe(path.resolve('/project', './src/blocks'))
  })
})

describe('resolveCollectionSources', () => {
  test('resolves collection source paths from config dir', () => {
    const collections = {
      packages: {
        metadata: { kind: 'pkg' },
        sources: {
          pkgbuilds: { path: './pkgbuilds' },
        },
      },
    }
    const result = resolveCollectionSources('/project', collections)
    expect(result.packages.sources.pkgbuilds.path).toBe(path.resolve('/project', './pkgbuilds'))
  })

  test('applies source defaults to collection sources', () => {
    const collections = {
      packages: {
        sources: {
          pkgbuilds: { path: './pkgbuilds' },
        },
      },
    }
    const result = resolveCollectionSources('/project', collections)
    const src = result.packages.sources.pkgbuilds
    expect(src.glob).toBe(DEFAULT_SOURCE_GLOB)
    expect(src.ignore).toEqual([...DEFAULT_SOURCE_IGNORE])
    expect(src.indexStrategy).toBe(DEFAULT_SOURCE_INDEX_STRATEGY)
  })

  test('preserves collection metadata', () => {
    const collections = {
      packages: {
        metadata: { kind: 'pkg', repoOrder: ['core'] },
        sources: {},
      },
    }
    const result = resolveCollectionSources('/project', collections)
    expect(result.packages.metadata).toEqual({ kind: 'pkg', repoOrder: ['core'] })
  })

  test('defaults metadata to empty object when not provided', () => {
    const collections = {
      packages: {
        sources: { pkgbuilds: { path: './pkgbuilds' } },
      },
    }
    const result = resolveCollectionSources('/project', collections)
    expect(result.packages.metadata).toEqual({})
  })

  test('clears string data references (they need separate loading)', () => {
    const collections = {
      packages: {
        data: './packages.json',
        sources: {},
      },
    }
    const result = resolveCollectionSources('/project', collections)
    expect(result.packages.data).toBeUndefined()
  })

  test('preserves inline data objects', () => {
    const data = [{ name: 'bash' }]
    const collections = {
      packages: {
        data,
        sources: {},
      },
    }
    const result = resolveCollectionSources('/project', collections)
    expect(result.packages.data).toEqual(data)
  })

  test('handles empty collections record', () => {
    const result = resolveCollectionSources('/project', {})
    expect(Object.keys(result)).toHaveLength(0)
  })

  test('handles collection with no sources', () => {
    const collections = {
      packages: {
        metadata: { kind: 'pkg' },
      },
    }
    const result = resolveCollectionSources('/project', collections)
    expect(result.packages.sources).toEqual({})
  })
})
