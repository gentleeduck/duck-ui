import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, test } from 'vitest'
import { build, loadRegistryBuildConfig } from '../..'

const fixtureDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../__fixtures__/golden/basic')
const packageSourceUrl = new URL('../../index.ts', import.meta.url).href
const tempDirs: string[] = []

async function createTempDir() {
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'registry-build-golden-'))
  tempDirs.push(tempDir)
  return tempDir
}

async function collectFiles(rootDir: string, currentDir = rootDir): Promise<string[]> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name)
    const relativePath = path.relative(rootDir, fullPath)

    if (relativePath === '.registry-build' || relativePath.startsWith('.registry-build/')) {
      continue
    }

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(rootDir, fullPath)))
      continue
    }

    files.push(relativePath)
  }

  return files.sort()
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { force: true, recursive: true })))
})

describe('registry build golden outputs', () => {
  test('build output matches the checked-in golden fixture tree', async () => {
    const tempDir = await createTempDir()
    const actualOutputDir = path.join(tempDir, 'dist')
    const expectedOutputDir = path.join(fixtureDir, 'expected')

    await fs.cp(path.join(fixtureDir, 'sources'), path.join(tempDir, 'sources'), { recursive: true })
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

    const result = await build({ cwd: tempDir, silent: true })
    const actualFiles = await collectFiles(actualOutputDir)
    const expectedFiles = await collectFiles(expectedOutputDir)

    expect(result.outputs.map((output) => output.name)).toEqual(['index', 'components', 'componentIndex', 'colors'])
    expect(actualFiles).toEqual(expectedFiles)

    for (const relativePath of expectedFiles) {
      const actualContent = await fs.readFile(path.join(actualOutputDir, relativePath), 'utf8')
      const expectedContent = await fs.readFile(path.join(expectedOutputDir, relativePath), 'utf8')

      if (relativePath.endsWith('.json')) {
        expect(JSON.parse(actualContent)).toEqual(JSON.parse(expectedContent))
        continue
      }

      expect(actualContent.trimEnd()).toBe(expectedContent.trimEnd())
    }
  })

  test('build with empty config (no registries, no extensions) succeeds with no outputs', async () => {
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
  })

  test('build with minimal config (one source, one entry) creates output directory', async () => {
    const tempDir = await createTempDir()
    const outputDir = path.join(tempDir, 'dist')

    await fs.mkdir(path.join(tempDir, 'sources', 'ui', 'tag'), { recursive: true })
    await fs.writeFile(path.join(tempDir, 'sources', 'ui', 'tag', 'tag.tsx'), 'export const Tag = () => null\n', 'utf8')

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `import { indexBuildExtension } from ${JSON.stringify(packageSourceUrl)}

export default {
  output: {
    dir: './dist'
  },
  extensions: [
    indexBuildExtension()
  ],
  registries: {
    uis: [
      {
        files: [],
        name: 'tag',
        root_folder: 'tag',
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
    const dirStat = await fs.stat(path.join(outputDir, 'public', 'r'))

    expect(dirStat.isDirectory()).toBe(true)
    expect(result.phaseResults.map((p) => p.name)).toEqual(['index'])
  })

  test('index.json is generated when indexBuild extension runs', async () => {
    const tempDir = await createTempDir()

    await fs.mkdir(path.join(tempDir, 'sources', 'ui', 'card'), { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'sources', 'ui', 'card', 'card.tsx'),
      'export const Card = () => null\n',
      'utf8',
    )

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `import { indexBuildExtension } from ${JSON.stringify(packageSourceUrl)}

export default {
  output: {
    dir: './dist'
  },
  extensions: [
    indexBuildExtension()
  ],
  registries: {
    uis: [
      {
        files: [],
        name: 'card',
        root_folder: 'card',
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

    await expect(fs.access(result.outputPaths.indexFile)).resolves.toBeUndefined()

    const indexContent = JSON.parse(await fs.readFile(result.outputPaths.indexFile, 'utf8')) as Array<
      Record<string, unknown>
    >

    expect(indexContent).toHaveLength(1)
    expect(indexContent[0]?.name).toBe('card')
    expect(indexContent[0]?.type).toBe('registry:ui')
    expect(indexContent[0]?.source).toBe('/registry-ui/src/card')
  })

  test('output structure matches expected format with files, tree, and source fields', async () => {
    const tempDir = await createTempDir()

    await fs.mkdir(path.join(tempDir, 'sources', 'ui', 'badge'), { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'sources', 'ui', 'badge', 'badge.tsx'),
      'export const Badge = () => null\n',
      'utf8',
    )
    await fs.writeFile(path.join(tempDir, 'sources', 'ui', 'badge', 'index.ts'), "export * from './badge'\n", 'utf8')

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `import { indexBuildExtension } from ${JSON.stringify(packageSourceUrl)}

export default {
  output: {
    dir: './dist'
  },
  extensions: [
    indexBuildExtension()
  ],
  registries: {
    uis: [
      {
        files: [],
        name: 'badge',
        root_folder: 'badge',
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
    const indexContent = JSON.parse(await fs.readFile(result.outputPaths.indexFile, 'utf8')) as Array<
      Record<string, unknown>
    >
    const entry = indexContent[0] as Record<string, unknown>

    expect(entry).toHaveProperty('name')
    expect(entry).toHaveProperty('type')
    expect(entry).toHaveProperty('source')
    expect(entry).toHaveProperty('files')
    expect(entry).toHaveProperty('tree')
    expect(entry).toHaveProperty('root_folder')

    const files = entry.files as Array<{ path: string; type: string }>
    expect(files.map((f) => f.path).sort()).toEqual(['badge/badge.tsx', 'badge/index.ts'])
    expect(files.every((f) => f.type === 'registry:ui')).toBe(true)

    const tree = entry.tree as Array<{ name: string; path: string; type: string }>
    expect(tree.map((n) => n.name).sort()).toEqual(['badge.tsx', 'index.ts'])
    expect(tree.every((n) => n.type === 'file')).toBe(true)
  })

  test('build with no registries but with extensions still runs extensions', async () => {
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
      name: 'stamp',
      stage: 'afterBuild',
      async run(api) {
        const stampPath = path.join(api.getPath('registryDir'), 'stamp.txt')
        await fs.mkdir(path.dirname(stampPath), { recursive: true })
        await fs.writeFile(stampPath, 'built', 'utf8')
        api.registerOutput('stamp', stampPath)
        return { name: 'stamp', itemCount: 1, outputFiles: [stampPath] }
      }
    }
  ]
}
`,
      'utf8',
    )

    const result = await build({ cwd: tempDir, silent: true })
    const stampPath = path.join(result.outputPaths.registryDir, 'stamp.txt')
    const stampContent = await fs.readFile(stampPath, 'utf8')

    expect(result.phaseResults).toHaveLength(1)
    expect(result.phaseResults[0]?.name).toBe('stamp')
    expect(stampContent).toBe('built')
  })
})
