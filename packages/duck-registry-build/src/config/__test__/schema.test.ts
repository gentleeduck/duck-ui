import { describe, expect, test } from 'vitest'
import {
  registryBuildCollectionSchema,
  registryBuildConfigSchema,
  registryBuildExtensionSchema,
  registryBuildSourceSchema,
  registryEntriesSchema,
  registryItemTypeSchema,
  themeEntriesSchema,
} from '../schema'

describe('registryItemTypeSchema', () => {
  test('accepts valid registry item types', () => {
    expect(registryItemTypeSchema.parse('registry:ui')).toBe('registry:ui')
    expect(registryItemTypeSchema.parse('registry:block')).toBe('registry:block')
    expect(registryItemTypeSchema.parse('registry:hook')).toBe('registry:hook')
  })

  test('rejects strings missing the registry: prefix', () => {
    expect(() => registryItemTypeSchema.parse('ui')).toThrow()
    expect(() => registryItemTypeSchema.parse('block')).toThrow()
  })

  test('rejects empty string', () => {
    expect(() => registryItemTypeSchema.parse('')).toThrow()
  })

  test('rejects bare "registry:" with no suffix', () => {
    expect(() => registryItemTypeSchema.parse('registry:')).toThrow()
  })

  test('rejects whitespace-only string', () => {
    expect(() => registryItemTypeSchema.parse('   ')).toThrow()
  })
})

describe('registryBuildSourceSchema', () => {
  test('accepts minimal source with only path', () => {
    const result = registryBuildSourceSchema.parse({ path: './src/ui' })
    expect(result.path).toBe('./src/ui')
    expect(result.glob).toBeUndefined()
    expect(result.ignore).toBeUndefined()
  })

  test('accepts fully specified source', () => {
    const result = registryBuildSourceSchema.parse({
      glob: '**/*.tsx',
      ignore: ['**/dist/**'],
      indexStrategy: 'file',
      packageName: '@my/ui',
      path: './src/ui',
      referencePath: '/registry-ui/src',
    })
    expect(result.glob).toBe('**/*.tsx')
    expect(result.ignore).toEqual(['**/dist/**'])
    expect(result.indexStrategy).toBe('file')
    expect(result.packageName).toBe('@my/ui')
    expect(result.referencePath).toBe('/registry-ui/src')
  })

  test('rejects source with empty path', () => {
    expect(() => registryBuildSourceSchema.parse({ path: '' })).toThrow()
  })

  test('rejects source with missing path', () => {
    expect(() => registryBuildSourceSchema.parse({})).toThrow()
  })

  test('rejects invalid indexStrategy value', () => {
    expect(() => registryBuildSourceSchema.parse({ path: './src', indexStrategy: 'folder' })).toThrow()
  })

  test('accepts indexStrategy item', () => {
    const result = registryBuildSourceSchema.parse({ path: './src', indexStrategy: 'item' })
    expect(result.indexStrategy).toBe('item')
  })

  test('rejects empty string in ignore array', () => {
    expect(() => registryBuildSourceSchema.parse({ path: './src', ignore: [''] })).toThrow()
  })
})

describe('registryBuildCollectionSchema', () => {
  test('accepts empty collection object', () => {
    const result = registryBuildCollectionSchema.parse({})
    expect(result).toBeDefined()
  })

  test('accepts collection with metadata and sources', () => {
    const result = registryBuildCollectionSchema.parse({
      metadata: { kind: 'pkg' },
      sources: {
        pkgbuilds: { path: './pkgbuilds' },
      },
    })
    expect(result.metadata).toEqual({ kind: 'pkg' })
    expect(result.sources?.pkgbuilds?.path).toBe('./pkgbuilds')
  })

  test('accepts collection with data', () => {
    const result = registryBuildCollectionSchema.parse({
      data: [{ name: 'bash', version: '5.2' }],
    })
    expect(result.data).toEqual([{ name: 'bash', version: '5.2' }])
  })

  test('accepts collection with string data (file path)', () => {
    const result = registryBuildCollectionSchema.parse({
      data: './packages.json',
    })
    expect(result.data).toBe('./packages.json')
  })
})

describe('registryBuildExtensionSchema', () => {
  test('accepts a valid extension object with name and run', () => {
    const ext = { name: 'my-ext', run: () => {}, phases: [] }
    expect(registryBuildExtensionSchema.parse(ext)).toBe(ext)
  })

  test('rejects object missing name', () => {
    expect(() => registryBuildExtensionSchema.parse({ run: () => {} })).toThrow()
  })

  test('rejects object missing run', () => {
    expect(() => registryBuildExtensionSchema.parse({ name: 'my-ext' })).toThrow()
  })

  test('rejects null', () => {
    expect(() => registryBuildExtensionSchema.parse(null)).toThrow()
  })

  test('rejects string', () => {
    expect(() => registryBuildExtensionSchema.parse('my-ext')).toThrow()
  })
})

describe('registryEntriesSchema', () => {
  test('accepts a record of named registry entry lists', () => {
    const data = {
      uis: [{ name: 'button', root_folder: 'button', type: 'registry:ui' }],
    }
    const result = registryEntriesSchema.parse(data)
    expect(result.uis).toHaveLength(1)
    expect(result.uis[0].name).toBe('button')
  })

  test('accepts empty record', () => {
    const result = registryEntriesSchema.parse({})
    expect(result).toEqual({})
  })

  test('rejects entry with missing name', () => {
    expect(() =>
      registryEntriesSchema.parse({
        uis: [{ root_folder: 'button', type: 'registry:ui' }],
      }),
    ).toThrow()
  })

  test('rejects entry with invalid type', () => {
    expect(() =>
      registryEntriesSchema.parse({
        uis: [{ name: 'button', root_folder: 'button', type: 'ui' }],
      }),
    ).toThrow()
  })
})

describe('themeEntriesSchema', () => {
  test('accepts valid theme entries', () => {
    const data = {
      zinc: {
        dark: { background: 'oklch(0 0 0)' },
        label: 'Zinc',
        light: { background: 'oklch(1 0 0)' },
        radius: '0.5rem',
      },
    }
    const result = themeEntriesSchema.parse(data)
    expect(result.zinc.label).toBe('Zinc')
  })

  test('rejects theme entry missing label', () => {
    expect(() =>
      themeEntriesSchema.parse({
        zinc: {
          dark: { background: 'black' },
          light: { background: 'white' },
          radius: '0.5rem',
        },
      }),
    ).toThrow()
  })

  test('rejects theme entry missing dark', () => {
    expect(() =>
      themeEntriesSchema.parse({
        zinc: {
          label: 'Zinc',
          light: { background: 'white' },
          radius: '0.5rem',
        },
      }),
    ).toThrow()
  })

  test('rejects theme entry missing light', () => {
    expect(() =>
      themeEntriesSchema.parse({
        zinc: {
          dark: { background: 'black' },
          label: 'Zinc',
          radius: '0.5rem',
        },
      }),
    ).toThrow()
  })
})

describe('registryBuildConfigSchema', () => {
  test('accepts empty config', () => {
    const result = registryBuildConfigSchema.parse({})
    expect(result).toBeDefined()
  })

  test('accepts minimal config with output', () => {
    const result = registryBuildConfigSchema.parse({
      output: { dir: './dist' },
    })
    expect(result.output?.dir).toBe('./dist')
  })

  test('rejects config with empty output.dir', () => {
    expect(() => registryBuildConfigSchema.parse({ output: { dir: '' } })).toThrow()
  })

  test('accepts config with branding', () => {
    const result = registryBuildConfigSchema.parse({
      branding: { name: 'my-tool', font: 'Mono' },
    })
    expect(result.branding?.name).toBe('my-tool')
    expect(result.branding?.font).toBe('Mono')
  })

  test('accepts config with performance settings', () => {
    const result = registryBuildConfigSchema.parse({
      performance: { cacheDir: '.cache', incremental: false, parallelism: 4 },
    })
    expect(result.performance?.incremental).toBe(false)
    expect(result.performance?.parallelism).toBe(4)
  })

  test('rejects performance.parallelism that is zero', () => {
    expect(() =>
      registryBuildConfigSchema.parse({
        performance: { parallelism: 0 },
      }),
    ).toThrow()
  })

  test('rejects performance.parallelism that is negative', () => {
    expect(() =>
      registryBuildConfigSchema.parse({
        performance: { parallelism: -2 },
      }),
    ).toThrow()
  })

  test('rejects performance.parallelism that is not an integer', () => {
    expect(() =>
      registryBuildConfigSchema.parse({
        performance: { parallelism: 2.5 },
      }),
    ).toThrow()
  })

  test('accepts config with sources', () => {
    const result = registryBuildConfigSchema.parse({
      sources: {
        'registry:ui': { path: './src/ui' },
        'registry:block': { path: './src/blocks', glob: '**/*.tsx' },
      },
    })
    expect(result.sources?.['registry:ui']?.path).toBe('./src/ui')
    expect(result.sources?.['registry:block']?.glob).toBe('**/*.tsx')
  })

  test('accepts config with extends as string', () => {
    const result = registryBuildConfigSchema.parse({
      extends: './base.ts',
    })
    expect(result.extends).toBe('./base.ts')
  })

  test('accepts config with extends as array', () => {
    const result = registryBuildConfigSchema.parse({
      extends: ['./base.ts', './theme.ts'],
    })
    expect(result.extends).toEqual(['./base.ts', './theme.ts'])
  })

  test('accepts config with stripVariables', () => {
    const result = registryBuildConfigSchema.parse({
      stripVariables: ['description', 'meta'],
    })
    expect(result.stripVariables).toEqual(['description', 'meta'])
  })

  test('accepts config with componentIndex settings', () => {
    const result = registryBuildConfigSchema.parse({
      componentIndex: {
        framework: 'vite',
        ssr: true,
        header: '// auto-generated',
      },
    })
    expect(result.componentIndex?.framework).toBe('vite')
    expect(result.componentIndex?.ssr).toBe(true)
  })

  test('rejects componentIndex with invalid framework', () => {
    expect(() =>
      registryBuildConfigSchema.parse({
        componentIndex: { framework: 'webpack' },
      }),
    ).toThrow()
  })

  test('accepts config with import mappings', () => {
    const result = registryBuildConfigSchema.parse({
      importMappings: {
        contentRewrites: [{ pattern: '@/ui', replacement: '@gentleduck/ui' }],
        packageMappings: { 'registry:ui': '@gentleduck/ui' },
      },
    })
    expect(result.importMappings?.contentRewrites).toHaveLength(1)
  })

  test('accepts config with collections', () => {
    const result = registryBuildConfigSchema.parse({
      collections: {
        packages: {
          data: './packages.json',
          metadata: { kind: 'pkg' },
          sources: {
            pkgbuilds: { path: './pkgbuilds', glob: '**/PKGBUILD' },
          },
        },
      },
    })
    expect(result.collections?.packages?.metadata?.kind).toBe('pkg')
  })

  test('accepts config with themes', () => {
    const result = registryBuildConfigSchema.parse({
      themes: {
        names: ['zinc', 'teal'],
        cssVarKeys: ['--bg', '--fg'],
        defaultRadius: '0.75rem',
        data: {
          zinc: {
            dark: { background: 'black' },
            label: 'Zinc',
            light: { background: 'white' },
            radius: '0.5rem',
          },
        },
      },
    })
    expect(result.themes?.names).toEqual(['zinc', 'teal'])
    expect(result.themes?.defaultRadius).toBe('0.75rem')
  })

  test('accepts config with colors as data object', () => {
    const result = registryBuildConfigSchema.parse({
      colors: { data: { zinc: { cssVars: {} } } },
    })
    expect(result.colors?.data).toBeDefined()
  })

  test('accepts config with colors as file path', () => {
    const result = registryBuildConfigSchema.parse({
      colors: { data: './colors.json' },
    })
    expect(result.colors?.data).toBe('./colors.json')
  })

  test('accepts config with registries', () => {
    const result = registryBuildConfigSchema.parse({
      registries: {
        uis: [{ name: 'button', root_folder: 'button', type: 'registry:ui' }],
      },
    })
    expect(result.registries?.uis).toHaveLength(1)
  })

  test('accepts config with registrySource inline', () => {
    const result = registryBuildConfigSchema.parse({
      registrySource: 'inline',
    })
    expect(result.registrySource).toBe('inline')
  })

  test('accepts config with registrySource as file path', () => {
    const result = registryBuildConfigSchema.parse({
      registrySource: './registries.ts',
    })
    expect(result.registrySource).toBe('./registries.ts')
  })

  test('accepts config with targetPaths', () => {
    const result = registryBuildConfigSchema.parse({
      targetPaths: { 'registry:ui': 'components/ui' },
    })
    expect(result.targetPaths?.['registry:ui']).toBe('components/ui')
  })

  test('accepts config with cssTemplates', () => {
    const result = registryBuildConfigSchema.parse({
      cssTemplates: {
        baseLayerRules: '@layer base { * { border: 0; } }',
        baseStyles: '@tailwind base;',
      },
    })
    expect(result.cssTemplates?.baseLayerRules).toContain('@layer base')
  })

  test('accepts full real-world config', () => {
    const config = {
      branding: { name: 'duck-ui' },
      collections: {
        packages: {
          data: './packages.json',
          metadata: { repoOrder: ['core'] },
          sources: { pkgbuilds: { path: './pkgbuilds' } },
        },
      },
      componentIndex: { framework: 'nextjs' as const, ssr: false },
      extensions: [{ name: 'my-ext', run: () => {}, phases: [] }],
      output: { dir: './dist' },
      performance: { incremental: true, parallelism: 4 },
      registries: {
        uis: [{ name: 'button', root_folder: 'button', type: 'registry:ui' }],
      },
      registrySource: 'inline' as const,
      sources: { 'registry:ui': { path: './src/ui' } },
      stripVariables: ['description'],
      targetPaths: { 'registry:ui': 'components/ui' },
    }
    const result = registryBuildConfigSchema.parse(config)
    expect(result.output?.dir).toBe('./dist')
    expect(result.branding?.name).toBe('duck-ui')
  })
})
