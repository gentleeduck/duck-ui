import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, test } from 'vitest'

// macOS aliases /var to /private/var; the pipeline's safe-path helpers
// canonicalise via realpath, so test assertions against output paths must do
// the same to stay platform-stable.
function realpath(p: string): string {
  try {
    return fsSync.realpathSync(p)
  } catch {
    return p
  }
}

import {
  build,
  createRegistryBuildContext,
  loadRegistryBuildConfig,
  resolveRegistryBuildConfig,
  runIndexBuildPhase,
  runValidatePhase,
} from '../..'

const tempDirs: string[] = []

async function createTempDir() {
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'registry-build-pipeline-'))
  tempDirs.push(tempDir)
  return tempDir
}

async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8')
}

async function writeFullPipelineFixture(tempDir: string) {
  await fs.mkdir(path.join(tempDir, 'sources', 'ui', 'button'), { recursive: true })
  await fs.mkdir(path.join(tempDir, 'sources', 'examples', 'button'), { recursive: true })
  await fs.writeFile(
    path.join(tempDir, 'sources', 'ui', 'button', 'button.tsx'),
    `import { helper } from '@old/pkg'

const iframeHeight = '10rem'
const description = 'remove me'

export const Button = () => helper()
`,
    'utf8',
  )
  await fs.mkdir(path.join(tempDir, 'sources', 'ui', 'button', '__test__'), { recursive: true })
  await fs.writeFile(
    path.join(tempDir, 'sources', 'ui', 'button', '__test__', 'button.test.tsx'),
    'export const shouldNotAppear = true\n',
    'utf8',
  )
  await fs.writeFile(path.join(tempDir, 'sources', 'ui', 'button', 'index.ts'), "export * from './button'\n", 'utf8')
  await fs.writeFile(
    path.join(tempDir, 'sources', 'examples', 'button', 'basic.tsx'),
    'export const BasicExample = () => null\n',
    'utf8',
  )

  const packageSourceUrl = pathToFileURL(path.resolve(import.meta.dirname, '../../index.ts')).href

  await fs.writeFile(
    path.join(tempDir, 'registry-build.config.ts'),
    `import { colorsExtension, componentIndexExtension, componentsExtension, indexBuildExtension, validateExtension } from ${JSON.stringify(packageSourceUrl)}

export default {
  output: {
    dir: './dist'
  },
  extensions: [
    validateExtension(),
    indexBuildExtension(),
    componentsExtension(),
    componentIndexExtension({
      packageMappings: {
        'registry:example': '@example/examples'
      }
    }),
    colorsExtension({
      colors: {
        data: {
          black: '#000',
          zinc: {
            hsl: 'hsl(1,2%,3%)',
            rgb: 'rgb(1,2,3)'
          }
        }
      },
      cssTemplates: {
        baseLayerRules: '@layer base { body { color: var(--foreground); } }',
        baseStyles: '@tailwind base;\\n'
      },
      themes: {
        cssVarKeys: ['background', 'foreground'],
        data: {
          demo: {
            dark: {
              background: 'black',
              foreground: 'white'
            },
            label: 'Demo',
            light: {
              background: 'white',
              foreground: 'black'
            },
            radius: '1rem'
          }
        },
        names: ['demo']
      }
    })
  ],
  registries: {
    uis: [
      {
        files: [],
        name: 'button',
        root_folder: 'button',
        type: 'registry:ui'
      }
    ],
    examples: [
      {
        files: [],
        name: 'button-examples',
        root_folder: 'button',
        type: 'registry:example'
      }
    ]
  },
  importMappings: {
    contentRewrites: [
      {
        pattern: '@old/pkg',
        replacement: '@new/pkg'
      }
    ]
  },
  sources: {
    'registry:example': {
      indexStrategy: 'file',
      packageName: '@example/examples',
      path: './sources/examples',
      referencePath: '/registry-examples/src'
    },
    'registry:ui': {
      packageName: '@example/ui',
      path: './sources/ui',
      referencePath: '/registry-ui/src'
    }
  },
  stripVariables: ['iframeHeight', 'description'],
  targetPaths: {
    'registry:example': 'components',
    'registry:ui': 'components/ui'
  }
}
`,
    'utf8',
  )
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { force: true, recursive: true })))
})

describe('registry build pipeline', () => {
  test('context exposes resolved collections as a generic artifact', async () => {
    const tempDir = await createTempDir()
    const configPath = path.join(tempDir, 'registry-build.config.ts')
    const config = await resolveRegistryBuildConfig(
      {
        collections: {
          packages: {
            data: [
              {
                name: 'bash',
                repo: 'core',
                version: '5.2.037-1',
              },
            ],
            metadata: {
              repoOrder: ['core'],
            },
            sources: {
              pkgbuilds: {
                glob: '**/PKGBUILD',
                path: './pkgbuilds',
              },
            },
          },
        },
        output: {
          dir: './dist',
        },
      },
      { configPath },
    )
    const context = await createRegistryBuildContext(
      {
        config,
        configDir: tempDir,
        configPath,
      },
      { silent: true },
    )

    expect(context.getArtifact('collections')).toEqual(config.collections)
    expect(context.config.collections.packages?.sources.pkgbuilds?.path).toBe(path.join(tempDir, 'pkgbuilds'))
  })

  test('validate phase rejects duplicate registry entry names', async () => {
    const tempDir = await createTempDir()

    await fs.mkdir(path.join(tempDir, 'sources', 'ui', 'button'), { recursive: true })
    await fs.mkdir(path.join(tempDir, 'sources', 'ui', 'button-2'), { recursive: true })
    await writeJson(path.join(tempDir, 'registry-build.config.json'), {
      output: {
        dir: './dist',
      },
      registries: {
        uis: [
          {
            files: [],
            name: 'button',
            root_folder: 'button',
            type: 'registry:ui',
          },
          {
            files: [],
            name: 'button',
            root_folder: 'button-2',
            type: 'registry:ui',
          },
        ],
      },
      sources: {
        'registry:ui': {
          path: './sources/ui',
          referencePath: '/registry-ui/src',
        },
      },
    })

    const loaded = await loadRegistryBuildConfig({ cwd: tempDir })
    const context = await createRegistryBuildContext(loaded, { silent: true })

    await expect(runValidatePhase(context)).rejects.toThrow('Duplicate registry entry name "button"')
  })

  test('index phase discovers files and expands file-index sources into per-file entries', async () => {
    const tempDir = await createTempDir()

    await fs.mkdir(path.join(tempDir, 'sources', 'ui', 'button'), { recursive: true })
    await fs.mkdir(path.join(tempDir, 'sources', 'examples', 'button'), { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'sources', 'ui', 'button', 'button.tsx'),
      'export const Button = () => null\n',
      'utf8',
    )
    await fs.writeFile(path.join(tempDir, 'sources', 'ui', 'button', 'index.ts'), "export * from './button'\n", 'utf8')
    await fs.writeFile(
      path.join(tempDir, 'sources', 'examples', 'button', 'basic.tsx'),
      'export const BasicExample = () => null\n',
      'utf8',
    )
    await fs.writeFile(
      path.join(tempDir, 'sources', 'examples', 'button', 'advanced.tsx'),
      'export const AdvancedExample = () => null\n',
      'utf8',
    )

    await writeJson(path.join(tempDir, 'registry-build.config.json'), {
      output: {
        dir: './dist',
      },
      registries: {
        uis: [
          {
            files: [],
            name: 'button',
            root_folder: 'button',
            type: 'registry:ui',
          },
        ],
        examples: [
          {
            files: [],
            name: 'button-examples',
            registryDependencies: ['button'],
            root_folder: 'button',
            type: 'registry:example',
          },
        ],
      },
      sources: {
        'registry:example': {
          indexStrategy: 'file',
          path: './sources/examples',
          referencePath: '/registry-examples/src',
        },
        'registry:ui': {
          indexStrategy: 'item',
          path: './sources/ui',
          referencePath: '/registry-ui/src',
        },
      },
    })

    const loaded = await loadRegistryBuildConfig({ cwd: tempDir })
    const context = await createRegistryBuildContext(loaded, { silent: true })

    await runValidatePhase(context)
    const result = await runIndexBuildPhase(context)
    const writtenIndex = JSON.parse(await fs.readFile(context.outputPaths.indexFile, 'utf8')) as Array<
      Record<string, unknown>
    >

    expect(result.itemCount).toBe(3)
    expect(writtenIndex).toHaveLength(3)
    expect(writtenIndex.map((entry) => entry.name)).toEqual(['button', 'advanced', 'basic'])
    expect(writtenIndex[0]?.source).toBe('/registry-ui/src/button')
    expect(writtenIndex[1]?.source).toBe('/registry-examples/src/button')
    expect((writtenIndex[0]?.files as Array<{ path: string }>).map((file) => file.path).sort()).toEqual([
      'button/button.tsx',
      'button/index.ts',
    ])
    expect((writtenIndex[0]?.tree as Array<{ name: string }>).map((node) => node.name).sort()).toEqual([
      'button.tsx',
      'index.ts',
    ])
  })

  test('runner executes the full migrated pipeline and writes component, index, and color outputs', async () => {
    const tempDir = await createTempDir()
    await writeFullPipelineFixture(tempDir)

    const result = await build({ cwd: tempDir, silent: true })
    const buttonComponent = JSON.parse(
      await fs.readFile(path.join(result.outputPaths.componentsDir, 'button.json'), 'utf8'),
    ) as Record<string, unknown>
    const basicComponent = JSON.parse(
      await fs.readFile(path.join(result.outputPaths.componentsDir, 'basic.json'), 'utf8'),
    ) as Record<string, unknown>
    const colorsIndex = JSON.parse(
      await fs.readFile(path.join(result.outputPaths.colorsDir, 'index.json'), 'utf8'),
    ) as Record<string, unknown>
    const componentIndex = await fs.readFile(result.outputPaths.componentIndexFile, 'utf8')
    const themesCss = await fs.readFile(result.outputPaths.themesCssFile, 'utf8')
    const buttonSourceFile = (buttonComponent.files as Array<{ content: string; path: string; target: string }>).find(
      (file) => file.path === 'button/button.tsx',
    )

    expect(result.phaseResults.map((phase) => phase.name)).toEqual([
      'validate',
      'index',
      'components',
      'componentIndex',
      'colors',
    ])
    await expect(fs.access(result.outputPaths.indexFile)).resolves.toBeUndefined()
    await expect(fs.access(result.outputPaths.componentIndexFile)).resolves.toBeUndefined()
    expect(buttonComponent).not.toHaveProperty('tree')
    expect(buttonSourceFile?.content).not.toContain('iframeHeight')
    expect(buttonSourceFile?.content).toContain('@new/pkg')
    expect(buttonSourceFile?.target).toBe('components/ui/button.tsx')
    expect((buttonComponent.files as Array<{ path: string }>).map((file) => file.path)).not.toContain(
      'button/__test__/button.test.tsx',
    )
    expect((basicComponent.files as Array<{ target: string }>)[0]?.target).toBe('components/basic.tsx')
    expect(componentIndex).toContain('@example/examples/button/basic')
    expect(componentIndex).toContain('"basic"')
    expect(themesCss).toContain('.theme-demo')
    expect(colorsIndex.zinc).toEqual({
      hsl: 'hsl(1,2%,3%)',
      hslChannel: '1 2% 3%',
      rgb: 'rgb(1,2,3)',
      rgbChannel: '1 2 3',
    })
  })

  test('incremental rebuild reuses unchanged outputs', async () => {
    const tempDir = await createTempDir()

    await writeFullPipelineFixture(tempDir)

    const firstResult = await build({ cwd: tempDir, silent: true })
    const secondResult = await build({ cwd: tempDir, silent: true })
    const phaseResultMap = new Map(secondResult.phaseResults.map((phase) => [phase.name, phase]))

    await expect(fs.access(firstResult.outputPaths.cacheFile)).resolves.toBeUndefined()
    expect(phaseResultMap.get('index')?.outputFiles).toEqual([])
    expect(phaseResultMap.get('components')?.outputFiles).toEqual([])
    expect(phaseResultMap.get('componentIndex')?.outputFiles).toEqual([])
    expect(phaseResultMap.get('colors')?.outputFiles).toEqual([])
  })

  test('changed-only rebuild updates only affected component outputs', async () => {
    const tempDir = await createTempDir()

    await writeFullPipelineFixture(tempDir)
    const initialResult = await build({ cwd: tempDir, silent: true })

    await fs.writeFile(
      path.join(tempDir, 'sources', 'examples', 'button', 'basic.tsx'),
      'export const BasicExample = () => "updated"\n',
      'utf8',
    )

    const nextResult = await build({
      changedOnly: true,
      changedPaths: ['./sources/examples/button/basic.tsx'],
      cwd: tempDir,
      silent: true,
    })
    const phaseResultMap = new Map(nextResult.phaseResults.map((phase) => [phase.name, phase]))
    const basicComponent = JSON.parse(
      await fs.readFile(path.join(initialResult.outputPaths.componentsDir, 'basic.json'), 'utf8'),
    ) as { files: Array<{ content: string }> }

    expect(phaseResultMap.get('index')?.outputFiles).toEqual([])
    expect(phaseResultMap.get('components')?.outputFiles).toEqual([
      path.join(realpath(initialResult.outputPaths.componentsDir), 'basic.json'),
    ])
    expect(phaseResultMap.get('componentIndex')?.outputFiles).toEqual([])
    expect(phaseResultMap.get('colors')?.outputFiles).toEqual([])
    expect(basicComponent.files[0]?.content).toContain('"updated"')
  })

  test('custom extensions can register artifacts and outputs without core phase coupling', async () => {
    const tempDir = await createTempDir()

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `import fs from 'node:fs/promises'
import path from 'node:path'

export default {
  output: {
    dir: './dist'
  },
  extensions: [
    {
      name: 'manifest',
      stage: 'afterBuild',
      async run(api) {
        const manifest = {
          generatedBy: 'test-extension',
          outputs: api.listOutputs().map((output) => output.name)
        }
        const manifestPath = path.join(api.getPath('registryDir'), 'manifest.json')

        await fs.mkdir(path.dirname(manifestPath), { recursive: true })
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

        api.setArtifact('manifest', manifest)
        api.registerOutput('manifest', manifestPath, {
          kind: 'custom'
        })

        return {
          itemCount: 1,
          name: 'manifest',
          outputFiles: [manifestPath]
        }
      }
    }
  ]
}
`,
      'utf8',
    )

    const result = await build({ cwd: tempDir, silent: true })
    const manifestPath = path.join(result.outputPaths.registryDir, 'manifest.json')
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as Record<string, unknown>

    expect(result.phaseResults.map((phase) => phase.name)).toEqual(['manifest'])
    expect(result.artifacts.manifest).toEqual(manifest)
    expect(result.outputs).toEqual([
      {
        metadata: {
          kind: 'custom',
        },
        name: 'manifest',
        paths: [manifestPath],
      },
    ])
    expect(manifest).toEqual({
      generatedBy: 'test-extension',
      outputs: [],
    })
  })

  test('runner with no extensions produces no phase results or outputs', async () => {
    const tempDir = await createTempDir()

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.json'),
      JSON.stringify({
        output: {
          dir: './dist',
        },
      }),
      'utf8',
    )

    const result = await build({ cwd: tempDir, silent: true })

    expect(result.phaseResults).toEqual([])
    expect(result.outputs).toEqual([])
    expect(result.artifacts.collections).toEqual({})
  })

  test('runner with only beforeBuild extensions runs them and skips afterBuild', async () => {
    const tempDir = await createTempDir()

    await fs.mkdir(path.join(tempDir, 'sources', 'ui', 'chip'), { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'sources', 'ui', 'chip', 'chip.tsx'),
      'export const Chip = () => null\n',
      'utf8',
    )

    const packageSourceUrl = pathToFileURL(path.resolve(import.meta.dirname, '../../index.ts')).href

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `import { validateExtension } from ${JSON.stringify(packageSourceUrl)}

export default {
  output: {
    dir: './dist'
  },
  extensions: [
    validateExtension()
  ],
  registries: {
    uis: [
      {
        files: [],
        name: 'chip',
        root_folder: 'chip',
        type: 'registry:ui'
      }
    ]
  },
  sources: {
    'registry:ui': {
      path: './sources/ui',
      referencePath: '/registry-ui/src'
    }
  }
}
`,
      'utf8',
    )

    const result = await build({ cwd: tempDir, silent: true })

    expect(result.phaseResults).toHaveLength(1)
    expect(result.phaseResults[0]?.name).toBe('validate')
    expect(result.outputs).toEqual([])
  })

  test('runner respects extension stage ordering (beforeBuild runs before afterBuild)', async () => {
    const tempDir = await createTempDir()
    const executionOrder: string[] = []

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `export default {
  output: {
    dir: './dist'
  },
  extensions: [
    {
      name: 'after-first',
      stage: 'afterBuild',
      run() {
        return { name: 'after-first', itemCount: 0 }
      }
    },
    {
      name: 'before-first',
      stage: 'beforeBuild',
      run() {
        return { name: 'before-first', itemCount: 0 }
      }
    },
    {
      name: 'before-second',
      stage: 'beforeBuild',
      run() {
        return { name: 'before-second', itemCount: 0 }
      }
    },
    {
      name: 'after-second',
      stage: 'afterBuild',
      run() {
        return { name: 'after-second', itemCount: 0 }
      }
    }
  ]
}
`,
      'utf8',
    )

    const result = await build({ cwd: tempDir, silent: true })

    expect(result.phaseResults.map((p) => p.name)).toEqual([
      'before-first',
      'before-second',
      'after-first',
      'after-second',
    ])
  })

  test('runner passes context to extension run functions with config and path access', async () => {
    const tempDir = await createTempDir()

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `export default {
  output: {
    dir: './custom-out'
  },
  extensions: [
    {
      name: 'inspector',
      stage: 'afterBuild',
      run(api) {
        const hasConfig = api.config !== undefined
        const hasGetPath = typeof api.getPath === 'function'
        const hasRegisterOutput = typeof api.registerOutput === 'function'
        const hasSetArtifact = typeof api.setArtifact === 'function'
        const hasGetArtifact = typeof api.getArtifact === 'function'
        const hasListOutputs = typeof api.listOutputs === 'function'
        const registryDir = api.getPath('registryDir')

        api.setArtifact('inspected', {
          hasConfig,
          hasGetArtifact,
          hasGetPath,
          hasListOutputs,
          hasRegisterOutput,
          hasSetArtifact,
          registryDirEndsCorrectly: registryDir.length > 0
        })

        return { name: 'inspector', itemCount: 0 }
      }
    }
  ]
}
`,
      'utf8',
    )

    const result = await build({ cwd: tempDir, silent: true })
    const inspected = result.artifacts.inspected as Record<string, boolean>

    expect(inspected.hasConfig).toBe(true)
    expect(inspected.hasGetPath).toBe(true)
    expect(inspected.hasRegisterOutput).toBe(true)
    expect(inspected.hasSetArtifact).toBe(true)
    expect(inspected.hasGetArtifact).toBe(true)
    expect(inspected.hasListOutputs).toBe(true)
    expect(inspected.registryDirEndsCorrectly).toBe(true)
  })

  test('runner handles extension errors gracefully by propagating them', async () => {
    const tempDir = await createTempDir()

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `export default {
  output: {
    dir: './dist'
  },
  extensions: [
    {
      name: 'exploder',
      stage: 'afterBuild',
      run() {
        throw new Error('Extension failed intentionally')
      }
    }
  ]
}
`,
      'utf8',
    )

    await expect(build({ cwd: tempDir, silent: true })).rejects.toThrow('Extension failed intentionally')
  })

  test('runner propagates async extension errors', async () => {
    const tempDir = await createTempDir()

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `export default {
  output: {
    dir: './dist'
  },
  extensions: [
    {
      name: 'async-exploder',
      stage: 'afterBuild',
      async run() {
        throw new Error('Async extension failed')
      }
    }
  ]
}
`,
      'utf8',
    )

    await expect(build({ cwd: tempDir, silent: true })).rejects.toThrow('Async extension failed')
  })

  test('runner with changedOnly flag and no changed paths skips component output', async () => {
    const tempDir = await createTempDir()

    await writeFullPipelineFixture(tempDir)
    await build({ cwd: tempDir, silent: true })

    const result = await build({
      changedOnly: true,
      changedPaths: [],
      cwd: tempDir,
      silent: true,
    })
    const phaseResultMap = new Map(result.phaseResults.map((phase) => [phase.name, phase]))

    expect(phaseResultMap.get('components')?.outputFiles).toEqual([])
  })

  test('extensions can pass artifacts between stages', async () => {
    const tempDir = await createTempDir()

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `export default {
  output: {
    dir: './dist'
  },
  extensions: [
    {
      name: 'producer',
      stage: 'beforeBuild',
      run(api) {
        api.setArtifact('shared-data', { message: 'hello from before' })
        return { name: 'producer', itemCount: 1 }
      }
    },
    {
      name: 'consumer',
      stage: 'afterBuild',
      run(api) {
        const data = api.getArtifact('shared-data')
        api.setArtifact('consumed', data)
        return { name: 'consumer', itemCount: 1 }
      }
    }
  ]
}
`,
      'utf8',
    )

    const result = await build({ cwd: tempDir, silent: true })

    expect(result.artifacts['shared-data']).toEqual({ message: 'hello from before' })
    expect(result.artifacts.consumed).toEqual({ message: 'hello from before' })
    expect(result.phaseResults.map((p) => p.name)).toEqual(['producer', 'consumer'])
  })

  test('extension returning void is silently skipped in phase results', async () => {
    const tempDir = await createTempDir()

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `export default {
  output: {
    dir: './dist'
  },
  extensions: [
    {
      name: 'silent-ext',
      stage: 'afterBuild',
      run() {
        // returns void
      }
    },
    {
      name: 'reporting-ext',
      stage: 'afterBuild',
      run() {
        return { name: 'reporting-ext', itemCount: 5 }
      }
    }
  ]
}
`,
      'utf8',
    )

    const result = await build({ cwd: tempDir, silent: true })

    expect(result.phaseResults).toHaveLength(1)
    expect(result.phaseResults[0]?.name).toBe('reporting-ext')
  })

  test('extension returning an array of phase results spreads them into the results list', async () => {
    const tempDir = await createTempDir()

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `export default {
  output: {
    dir: './dist'
  },
  extensions: [
    {
      name: 'multi-phase',
      stage: 'afterBuild',
      run() {
        return [
          { name: 'phase-a', itemCount: 1 },
          { name: 'phase-b', itemCount: 2 }
        ]
      }
    }
  ]
}
`,
      'utf8',
    )

    const result = await build({ cwd: tempDir, silent: true })

    expect(result.phaseResults).toHaveLength(2)
    expect(result.phaseResults.map((p) => p.name)).toEqual(['phase-a', 'phase-b'])
  })
})
