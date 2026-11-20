import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { IResolvedRegistryBuildConfig } from '../../config/types'
import { config as mainConfig } from '../../main/main.constants'
import { runBannerPhase } from '../../pipeline/phases/banner'
import { runValidatePhase } from '../../pipeline/phases/validate'
import type { IRegistryBuildContext } from '../../pipeline/types'

const tempDirs: string[] = []

async function createTempDir() {
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'registry-build-run-phases-'))
  tempDirs.push(tempDir)
  return tempDir
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { force: true, recursive: true })))
})

function createMinimalConfig(overrides: Partial<IResolvedRegistryBuildConfig> = {}): IResolvedRegistryBuildConfig {
  return {
    branding: { font: 'default', name: 'test-project' },
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

function createMockContext(
  configOverrides: Partial<IResolvedRegistryBuildConfig> = {},
  contextOverrides: Partial<IRegistryBuildContext> = {},
): IRegistryBuildContext {
  const config = createMinimalConfig(configOverrides)
  return {
    artifacts: {},
    cache: {
      enabled: false,
      filePath: '/tmp/test-cache.json',
      getFileHash: async () => '',
      getPhaseData: () => undefined,
      save: async () => {},
      setPhaseData: <TValue>(phase: string, value: TValue) => value,
    },
    changedOnly: false,
    changedPaths: [],
    config,
    configDir: '/tmp/test-project',
    configPath: '/tmp/test-project/registry-build.config.json',
    cwd: '/tmp/test-project',
    getArtifact: () => undefined,
    getOutput: () => undefined,
    getPath: () => '',
    listOutputs: () => [],
    outputPaths: {
      baseDir: '/tmp/test-output',
      cacheDir: '/tmp/test-output/.cache',
      cacheFile: '/tmp/test-output/.cache/build-cache.json',
      colorsDir: '/tmp/test-output/registry/colors',
      componentIndexDir: '/tmp/test-output/component-index',
      componentIndexFile: '/tmp/test-output/component-index/index.ts',
      componentsDir: '/tmp/test-output/registry/components',
      indexFile: '/tmp/test-output/registry/index.json',
      registryDir: '/tmp/test-output/registry',
      themesCssFile: '/tmp/test-output/registry/themes.css',
      themesDir: '/tmp/test-output/registry/themes',
    },
    outputs: [],
    paths: { baseDir: '/tmp/test-output', named: {} },
    project: {} as IRegistryBuildContext['project'],
    registerOutput: () => ({ name: '', paths: [] }),
    setArtifact: <TValue>(_name: string, value: TValue) => value,
    silent: false,
    ...contextOverrides,
  } as IRegistryBuildContext
}

describe('runValidatePhase', () => {
  test('passes with an empty config (no registries, no sources)', async () => {
    const context = createMockContext()
    const result = await runValidatePhase(context)

    expect(result.name).toBe('validate')
    expect(result.itemCount).toBe(0)
  })

  test('passes when all sources and entries are valid', async () => {
    const tempDir = await createTempDir()
    const srcUi = path.join(tempDir, 'src', 'ui')
    const buttonDir = path.join(srcUi, 'button')
    await fs.mkdir(buttonDir, { recursive: true })

    const context = createMockContext({
      registries: {
        uis: [
          {
            files: [],
            name: 'button',
            root_folder: 'button',
            type: 'registry:ui',
          },
        ],
      },
      schema: { itemTypes: ['registry:ui'] },
      sources: {
        'registry:ui': {
          glob: '**/*.ts',
          ignore: [],
          indexStrategy: 'item',
          path: srcUi,
        },
      },
    })

    const result = await runValidatePhase(context)

    expect(result.name).toBe('validate')
    expect(result.itemCount).toBe(1)
  })

  test('reports missing source paths', async () => {
    const context = createMockContext({
      schema: { itemTypes: ['registry:ui'] },
      sources: {
        'registry:ui': {
          glob: '**/*.ts',
          ignore: [],
          indexStrategy: 'item',
          path: '/nonexistent/path/that/does/not/exist',
        },
      },
    })

    await expect(runValidatePhase(context)).rejects.toThrow('Source path does not exist')
  })

  test('reports unknown item type on a registry entry', async () => {
    const tempDir = await createTempDir()
    const srcUi = path.join(tempDir, 'src', 'ui')
    await fs.mkdir(srcUi, { recursive: true })

    const context = createMockContext({
      registries: {
        uis: [
          {
            files: [{ content: '', path: 'button.tsx', type: 'registry:widget' }],
            name: 'button',
            root_folder: 'button',
            type: 'registry:widget',
          },
        ],
      },
      schema: { itemTypes: ['registry:ui'] },
      sources: {},
    })

    await expect(runValidatePhase(context)).rejects.toThrow('unknown item type "registry:widget"')
  })

  test('reports duplicate registry entry names across categories', async () => {
    const tempDir = await createTempDir()
    const srcDir = path.join(tempDir, 'src')
    await fs.mkdir(path.join(srcDir, 'button'), { recursive: true })
    await fs.mkdir(path.join(srcDir, 'button-alt'), { recursive: true })

    const context = createMockContext({
      registries: {
        category_a: [
          {
            files: [],
            name: 'button',
            root_folder: 'button',
            type: 'registry:ui',
          },
        ],
        category_b: [
          {
            files: [],
            name: 'button',
            root_folder: 'button-alt',
            type: 'registry:ui',
          },
        ],
      },
      schema: { itemTypes: ['registry:ui'] },
      sources: {
        'registry:ui': {
          glob: '**/*.ts',
          ignore: [],
          indexStrategy: 'item',
          path: srcDir,
        },
      },
    })

    await expect(runValidatePhase(context)).rejects.toThrow('Duplicate registry entry name "button"')
  })

  test('reports duplicate schema.itemTypes', async () => {
    const context = createMockContext({
      schema: { itemTypes: ['registry:ui', 'registry:ui'] },
    })

    await expect(runValidatePhase(context)).rejects.toThrow('schema.itemTypes` contains duplicate values')
  })

  test('reports entry that requires a source when no files are provided', async () => {
    const context = createMockContext({
      registries: {
        uis: [
          {
            files: [],
            name: 'button',
            root_folder: 'button',
            type: 'registry:ui',
          },
        ],
      },
      schema: { itemTypes: ['registry:ui'] },
      sources: {},
    })

    await expect(runValidatePhase(context)).rejects.toThrow('requires a source for type "registry:ui"')
  })

  test('skips source folder check when entry has inline files', async () => {
    const context = createMockContext({
      registries: {
        uis: [
          {
            files: [{ content: 'export const Button = () => null', path: 'button.tsx', type: 'registry:ui' }],
            name: 'button',
            root_folder: 'button',
            type: 'registry:ui',
          },
        ],
      },
      schema: { itemTypes: ['registry:ui'] },
      sources: {},
    })

    const result = await runValidatePhase(context)

    expect(result.name).toBe('validate')
    expect(result.itemCount).toBe(1)
  })

  test('reports missing entry root folder when source exists but folder does not', async () => {
    const tempDir = await createTempDir()
    const srcUi = path.join(tempDir, 'src', 'ui')
    await fs.mkdir(srcUi, { recursive: true })

    const context = createMockContext({
      registries: {
        uis: [
          {
            files: [],
            name: 'button',
            root_folder: 'button',
            type: 'registry:ui',
          },
        ],
      },
      schema: { itemTypes: ['registry:ui'] },
      sources: {
        'registry:ui': {
          glob: '**/*.ts',
          ignore: [],
          indexStrategy: 'item',
          path: srcUi,
        },
      },
    })

    await expect(runValidatePhase(context)).rejects.toThrow('missing source folder')
  })

  test('collects multiple issues into one error message', async () => {
    const context = createMockContext({
      registries: {
        uis: [
          {
            files: [],
            name: 'button',
            root_folder: 'button',
            type: 'registry:unknown',
          },
          {
            files: [],
            name: 'button',
            root_folder: 'dialog',
            type: 'registry:unknown',
          },
        ],
      },
      schema: { itemTypes: ['registry:ui'] },
      sources: {},
    })

    try {
      await runValidatePhase(context)
      expect.unreachable('should have thrown')
    } catch (error) {
      const message = (error as Error).message
      expect(message).toContain('unknown item type')
      expect(message).toContain('Duplicate registry entry name')
    }
  })

  test('returns correct itemCount across multiple categories', async () => {
    const tempDir = await createTempDir()
    const srcDir = path.join(tempDir, 'src')
    await fs.mkdir(path.join(srcDir, 'button'), { recursive: true })
    await fs.mkdir(path.join(srcDir, 'dialog'), { recursive: true })
    await fs.mkdir(path.join(srcDir, 'basic'), { recursive: true })

    const context = createMockContext({
      registries: {
        examples: [
          {
            files: [],
            name: 'basic-example',
            root_folder: 'basic',
            type: 'registry:example',
          },
        ],
        uis: [
          {
            files: [],
            name: 'button',
            root_folder: 'button',
            type: 'registry:ui',
          },
          {
            files: [],
            name: 'dialog',
            root_folder: 'dialog',
            type: 'registry:ui',
          },
        ],
      },
      schema: { itemTypes: ['registry:ui', 'registry:example'] },
      sources: {
        'registry:example': {
          glob: '**/*.tsx',
          ignore: [],
          indexStrategy: 'file',
          path: srcDir,
        },
        'registry:ui': {
          glob: '**/*.ts',
          ignore: [],
          indexStrategy: 'item',
          path: srcDir,
        },
      },
    })

    const result = await runValidatePhase(context)

    expect(result.itemCount).toBe(3)
  })
})

describe('runBannerPhase', () => {
  const originalLog = console.log

  afterEach(() => {
    console.log = originalLog
  })

  test('prints nothing when context.silent is true', async () => {
    const calls: unknown[][] = []
    console.log = (...args: unknown[]) => calls.push(args)

    const context = createMockContext({}, { silent: true })
    await runBannerPhase(context)

    expect(calls).toHaveLength(0)
  })

  test('prints banner with default name from mainConfig when no branding provided', async () => {
    const calls: unknown[][] = []
    console.log = (...args: unknown[]) => calls.push(args)

    const context = createMockContext(
      { branding: undefined as unknown as IResolvedRegistryBuildConfig['branding'] },
      { silent: false },
    )
    await runBannerPhase(context)

    expect(calls).toHaveLength(2)
    const bannerLine = String(calls[0]?.[0])
    expect(bannerLine).toContain(mainConfig.name)
    expect(bannerLine).toContain(mainConfig.version)
  })

  test('prints banner using config branding name', async () => {
    const calls: unknown[][] = []
    console.log = (...args: unknown[]) => calls.push(args)

    const context = createMockContext({ branding: { font: 'default', name: 'my-custom-tool' } }, { silent: false })
    await runBannerPhase(context)

    expect(calls).toHaveLength(2)
    const bannerLine = String(calls[0]?.[0])
    expect(bannerLine).toContain('my-custom-tool')
    expect(bannerLine).toContain(mainConfig.version)
  })

  test('branding option overrides config branding name', async () => {
    const calls: unknown[][] = []
    console.log = (...args: unknown[]) => calls.push(args)

    const context = createMockContext({ branding: { font: 'default', name: 'config-name' } }, { silent: false })
    await runBannerPhase(context, { name: 'override-name' })

    expect(calls).toHaveLength(2)
    const bannerLine = String(calls[0]?.[0])
    expect(bannerLine).toContain('override-name')
    expect(bannerLine).not.toContain('config-name')
  })

  test('prints a separator line as the second output', async () => {
    const calls: unknown[][] = []
    console.log = (...args: unknown[]) => calls.push(args)

    const context = createMockContext({}, { silent: false })
    await runBannerPhase(context)

    expect(calls).toHaveLength(2)
    const separatorLine = String(calls[1]?.[0])
    expect(separatorLine).toContain('\u2500')
  })

  test('handles empty branding options object (defaults to config or mainConfig)', async () => {
    const calls: unknown[][] = []
    console.log = (...args: unknown[]) => calls.push(args)

    const context = createMockContext({ branding: { font: 'default', name: 'from-config' } }, { silent: false })
    await runBannerPhase(context, {})

    expect(calls).toHaveLength(2)
    const bannerLine = String(calls[0]?.[0])
    expect(bannerLine).toContain('from-config')
  })

  test('returns void (no phase result)', async () => {
    console.log = () => {}
    const context = createMockContext({}, { silent: false })
    const result = await runBannerPhase(context)

    expect(result).toBeUndefined()
  })
})
