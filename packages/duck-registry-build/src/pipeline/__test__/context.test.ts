import { realpathSync } from 'node:fs'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { resolveRegistryBuildConfig } from '../../config'
import type { ILoadedRegistryBuildConfig } from '../../config/loader/loader.types'
import type { IResolvedRegistryBuildConfig } from '../../config/types'
import { createRegistryBuildContext } from '../context'
import { createOutputPaths, createPathRegistry } from '../context/context.paths'

const tempDirs: string[] = []

async function createTempDir() {
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'registry-build-context-'))
  tempDirs.push(tempDir)
  return tempDir
}

function createMinimalResolvedConfig(
  overrides: Partial<IResolvedRegistryBuildConfig> = {},
): IResolvedRegistryBuildConfig {
  return {
    branding: { font: 'default', name: 'test' },
    collections: {},
    componentIndex: {
      excludeTypes: [],
      framework: 'react',
      header: '',
      ssr: false,
    },
    cssTemplates: { baseLayerRules: '', baseStyles: '' },
    extensions: [],
    importMappings: { contentRewrites: [], packageMappings: {} },
    output: {
      colorsDir: 'colors',
      componentIndexDir: 'component-index',
      componentIndexFile: 'index.ts',
      componentsDir: 'components',
      dir: '/tmp/test-output',
      registryDir: 'registry',
      themesCssFile: 'themes.css',
      themesDir: 'themes',
    },
    performance: { cacheDir: '.cache', incremental: false, parallelism: 1 },
    registries: {},
    registrySource: 'inline',
    schema: { itemTypes: [] },
    sources: {},
    stripVariables: [],
    targetPaths: {},
    ...overrides,
  } as IResolvedRegistryBuildConfig
}

function createLoadedConfig(
  overrides: Partial<IResolvedRegistryBuildConfig> = {},
  configDir?: string,
): ILoadedRegistryBuildConfig {
  const dir = configDir ?? '/tmp/test-project'
  return {
    config: createMinimalResolvedConfig(overrides),
    configDir: dir,
    configPath: path.join(dir, 'registry-build.config.json'),
  }
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { force: true, recursive: true })))
})

function canonicalise(absolute: string): string {
  let current = absolute
  const trailing: string[] = []
  while (true) {
    try {
      const real = realpathSync(current)
      return trailing.length === 0 ? real : path.join(real, ...trailing.reverse())
    } catch {
      const parent = path.dirname(current)
      if (parent === current) return absolute
      trailing.push(path.basename(current))
      current = parent
    }
  }
}

describe('createOutputPaths', () => {
  test('derives all output paths from the resolved config output section', () => {
    const config = createMinimalResolvedConfig()
    const paths = createOutputPaths(config)
    // createOutputPaths canonicalises the configured base dir so phase outputs
    // align with `resolveWithinBase` on platforms like macOS where /tmp -> /private/tmp.
    const canonicalBase = canonicalise(config.output.dir)

    expect(paths.baseDir).toBe(canonicalBase)
    expect(paths.registryDir).toBe(path.join(canonicalBase, config.output.registryDir))
    expect(paths.componentsDir).toBe(path.join(paths.registryDir, config.output.componentsDir))
    expect(paths.colorsDir).toBe(path.join(paths.registryDir, config.output.colorsDir))
    expect(paths.indexFile).toBe(path.join(paths.registryDir, 'index.json'))
    expect(paths.themesCssFile).toBe(path.join(paths.registryDir, config.output.themesCssFile))
    expect(paths.themesDir).toBe(path.join(paths.registryDir, config.output.themesDir))
    expect(paths.componentIndexDir).toBe(path.join(canonicalBase, config.output.componentIndexDir))
    expect(paths.componentIndexFile).toBe(
      path.join(canonicalBase, config.output.componentIndexDir, config.output.componentIndexFile),
    )
    expect(paths.cacheDir).toBe(path.join(canonicalBase, config.performance.cacheDir))
    expect(paths.cacheFile).toBe(path.join(canonicalBase, config.performance.cacheDir, 'build-cache.json'))
  })

  test('uses different base dirs when config output.dir differs', () => {
    const config = createMinimalResolvedConfig({
      output: {
        ...createMinimalResolvedConfig().output,
        dir: '/custom/output/path',
      },
    })
    const paths = createOutputPaths(config)

    expect(paths.baseDir).toBe('/custom/output/path')
    expect(paths.registryDir).toContain('/custom/output/path')
    expect(paths.componentsDir).toContain('/custom/output/path')
  })
})

describe('createPathRegistry', () => {
  test('creates a registry with named lookups from output paths', () => {
    const config = createMinimalResolvedConfig()
    const outputPaths = createOutputPaths(config)
    const registry = createPathRegistry(outputPaths)

    expect(registry.baseDir).toBe(outputPaths.baseDir)
    expect(registry.named.registryDir).toBe(outputPaths.registryDir)
    expect(registry.named.componentsDir).toBe(outputPaths.componentsDir)
    expect(registry.named.colorsDir).toBe(outputPaths.colorsDir)
    expect(registry.named.indexFile).toBe(outputPaths.indexFile)
    expect(registry.named.cacheFile).toBe(outputPaths.cacheFile)
  })

  test('spreads all output path keys into the named map', () => {
    const config = createMinimalResolvedConfig()
    const outputPaths = createOutputPaths(config)
    const registry = createPathRegistry(outputPaths)

    for (const key of Object.keys(outputPaths)) {
      expect(registry.named[key]).toBe(outputPaths[key as keyof typeof outputPaths])
    }
  })
})

describe('createRegistryBuildContext', () => {
  test('creates a context with expected properties from a loaded config', async () => {
    const loaded = createLoadedConfig()
    const context = await createRegistryBuildContext(loaded, { silent: true })

    expect(context.config).toBe(loaded.config)
    expect(context.configDir).toBe(loaded.configDir)
    expect(context.configPath).toBe(loaded.configPath)
    expect(context.silent).toBe(true)
    expect(context.changedOnly).toBe(false)
    expect(context.changedPaths).toEqual([])
    expect(context.outputPaths).toBeDefined()
    expect(context.paths).toBeDefined()
    expect(context.cache).toBeDefined()
    expect(context.outputs).toEqual([])
    expect(context.artifacts).toBeDefined()
  })

  test('defaults silent to false when not specified', async () => {
    const loaded = createLoadedConfig()
    const context = await createRegistryBuildContext(loaded)

    expect(context.silent).toBe(false)
  })

  test('passes changedOnly and changedPaths through to context', async () => {
    const tempDir = await createTempDir()
    const loaded = createLoadedConfig({}, tempDir)
    const context = await createRegistryBuildContext(loaded, {
      changedOnly: true,
      changedPaths: ['./src/button/index.ts', './src/dialog/dialog.tsx'],
      cwd: tempDir,
      silent: true,
    })

    expect(context.changedOnly).toBe(true)
    expect(context.changedPaths).toHaveLength(2)
    for (const changedPath of context.changedPaths) {
      expect(path.isAbsolute(changedPath)).toBe(true)
    }
  })

  test('changedPaths are resolved relative to cwd', async () => {
    const tempDir = await createTempDir()
    const loaded = createLoadedConfig({}, tempDir)
    const context = await createRegistryBuildContext(loaded, {
      changedPaths: ['./src/button.ts'],
      cwd: tempDir,
      silent: true,
    })

    expect(context.changedPaths[0]).toContain('src/button.ts')
    expect(context.changedPaths[0]).toContain(tempDir)
  })

  describe('artifact API', () => {
    test('getArtifact returns undefined for unknown artifact names', async () => {
      const loaded = createLoadedConfig()
      const context = await createRegistryBuildContext(loaded, { silent: true })

      expect(context.getArtifact('nonexistent')).toBeUndefined()
    })

    test('setArtifact stores and getArtifact retrieves the value', async () => {
      const loaded = createLoadedConfig()
      const context = await createRegistryBuildContext(loaded, { silent: true })

      const data = { components: ['button', 'dialog'] }
      const returned = context.setArtifact('myData', data)

      expect(returned).toBe(data)
      expect(context.getArtifact('myData')).toBe(data)
    })

    test('setArtifact overwrites existing artifacts', async () => {
      const loaded = createLoadedConfig()
      const context = await createRegistryBuildContext(loaded, { silent: true })

      context.setArtifact('key', 'first')
      context.setArtifact('key', 'second')

      expect(context.getArtifact('key')).toBe('second')
    })

    test('collections artifact is pre-populated from config', async () => {
      const collections = {
        packages: {
          data: [{ name: 'test-pkg' }],
          metadata: {},
          sources: {},
        },
      }
      const loaded = createLoadedConfig({ collections } as Partial<IResolvedRegistryBuildConfig>)
      const context = await createRegistryBuildContext(loaded, { silent: true })

      expect(context.getArtifact('collections')).toEqual(collections)
    })
  })

  describe('output API', () => {
    test('registerOutput adds a new output record', async () => {
      const loaded = createLoadedConfig()
      const context = await createRegistryBuildContext(loaded, { silent: true })

      const record = context.registerOutput('index', '/out/index.json', { kind: 'json' })

      expect(record.name).toBe('index')
      expect(record.paths).toEqual(['/out/index.json'])
      expect(record.metadata).toEqual({ kind: 'json' })
    })

    test('registerOutput accepts an array of paths', async () => {
      const loaded = createLoadedConfig()
      const context = await createRegistryBuildContext(loaded, { silent: true })

      const record = context.registerOutput('components', ['/out/a.json', '/out/b.json'])

      expect(record.paths).toEqual(['/out/a.json', '/out/b.json'])
    })

    test('registerOutput replaces an existing output with the same name', async () => {
      const loaded = createLoadedConfig()
      const context = await createRegistryBuildContext(loaded, { silent: true })

      context.registerOutput('index', '/out/old.json')
      context.registerOutput('index', '/out/new.json', { updated: true })

      expect(context.outputs).toHaveLength(1)
      expect(context.outputs[0]?.paths).toEqual(['/out/new.json'])
      expect(context.outputs[0]?.metadata).toEqual({ updated: true })
    })

    test('getOutput retrieves an output by name', async () => {
      const loaded = createLoadedConfig()
      const context = await createRegistryBuildContext(loaded, { silent: true })

      context.registerOutput('colors', '/out/colors.json')

      expect(context.getOutput('colors')?.name).toBe('colors')
      expect(context.getOutput('missing')).toBeUndefined()
    })

    test('listOutputs returns a snapshot copy of all outputs', async () => {
      const loaded = createLoadedConfig()
      const context = await createRegistryBuildContext(loaded, { silent: true })

      context.registerOutput('a', '/out/a.json')
      context.registerOutput('b', '/out/b.json')

      const list = context.listOutputs()
      expect(list).toHaveLength(2)
      expect(list.map((o) => o.name)).toEqual(['a', 'b'])

      // listOutputs returns a copy.
      list.push({ name: 'c', paths: [] })
      expect(context.listOutputs()).toHaveLength(2)
    })
  })

  describe('path API', () => {
    test('getPath returns a known path by name', async () => {
      const loaded = createLoadedConfig()
      const context = await createRegistryBuildContext(loaded, { silent: true })

      expect(context.getPath('registryDir')).toBe(context.outputPaths.registryDir)
      expect(context.getPath('componentsDir')).toBe(context.outputPaths.componentsDir)
    })

    test('getPath throws for an unknown path name', async () => {
      const loaded = createLoadedConfig()
      const context = await createRegistryBuildContext(loaded, { silent: true })

      expect(() => context.getPath('doesNotExist')).toThrow('Unknown registry build path "doesNotExist"')
    })
  })

  describe('integration with resolveRegistryBuildConfig', () => {
    test('context from resolveRegistryBuildConfig exposes collections artifact', async () => {
      const tempDir = await createTempDir()
      const configPath = path.join(tempDir, 'registry-build.config.json')
      const config = await resolveRegistryBuildConfig(
        {
          collections: {
            packages: {
              data: [{ name: 'test', version: '1.0.0' }],
              metadata: { channel: 'stable' },
              sources: {
                files: {
                  glob: '**/*.ts',
                  path: './src',
                },
              },
            },
          },
          output: { dir: './dist' },
        },
        { configPath },
      )
      const context = await createRegistryBuildContext({ config, configDir: tempDir, configPath }, { silent: true })

      expect(context.getArtifact('collections')).toEqual(config.collections)
      expect(context.config.collections.packages?.metadata.channel).toBe('stable')
    })
  })
})
