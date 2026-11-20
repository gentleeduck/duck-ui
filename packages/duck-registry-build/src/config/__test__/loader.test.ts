import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import {
  DEFAULT_COMPONENT_INDEX_EXCLUDE_TYPES,
  DEFAULT_CONFIG_FILENAMES,
  DEFAULT_STRIP_VARIABLES,
  defineConfig,
  findRegistryBuildConfig,
  loadRegistryBuildConfig,
  resolveRegistryBuildConfig,
} from '../..'
import type { IRegistryBuildConfig } from '../types'

const tempDirs: string[] = []

async function createTempDir() {
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'registry-build-config-'))
  tempDirs.push(tempDir)
  return tempDir
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { force: true, recursive: true })))
})

describe('registry build config loader', () => {
  test('defineConfig returns the provided config object unchanged', () => {
    const config: IRegistryBuildConfig = {
      output: {
        dir: './dist',
      },
    }

    expect(defineConfig(config)).toBe(config)
  })

  test('resolveRegistryBuildConfig applies defaults and resolves config-relative paths', async () => {
    const tempDir = await createTempDir()
    const configPath = path.join(tempDir, DEFAULT_CONFIG_FILENAMES[0])

    const resolved = await resolveRegistryBuildConfig(
      {
        output: {
          dir: './build-output',
        },
        sources: {
          'registry:ui': {
            path: './src/ui',
          },
        },
      },
      { configPath },
    )

    expect(resolved.output.dir).toBe(path.join(tempDir, 'build-output'))
    expect(resolved.output.registryDir).toBe('public/r')
    expect(resolved.sources['registry:ui']?.path).toBe(path.join(tempDir, 'src/ui'))
    expect(resolved.sources['registry:ui']?.glob).toBe('**/*.{ts,tsx}')
    expect(resolved.stripVariables).toEqual([...DEFAULT_STRIP_VARIABLES])
    expect(resolved.componentIndex.excludeTypes).toEqual([...DEFAULT_COMPONENT_INDEX_EXCLUDE_TYPES])
    expect(resolved.registrySource).toBe('inline')
  })

  test('findRegistryBuildConfig searches parent directories', async () => {
    const tempDir = await createTempDir()
    const nestedDir = path.join(tempDir, 'apps', 'docs')

    await fs.mkdir(nestedDir, { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.json'),
      JSON.stringify({
        output: {
          dir: './dist',
        },
      }),
      'utf8',
    )

    expect(await findRegistryBuildConfig(nestedDir)).toBe(path.join(tempDir, 'registry-build.config.json'))
  })

  test('loadRegistryBuildConfig loads JSON config files discovered from cwd', async () => {
    const tempDir = await createTempDir()
    const nestedDir = path.join(tempDir, 'workspace', 'feature')

    await fs.mkdir(path.join(tempDir, 'registry-ui'), { recursive: true })
    await fs.mkdir(nestedDir, { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.json'),
      JSON.stringify({
        output: {
          dir: './apps/docs',
        },
        sources: {
          'registry:ui': {
            path: './registry-ui',
          },
        },
      }),
      'utf8',
    )

    const loaded = await loadRegistryBuildConfig({ cwd: nestedDir })

    expect(loaded.configPath).toBe(path.join(tempDir, 'registry-build.config.json'))
    expect(loaded.config.output.dir).toBe(path.join(tempDir, 'apps/docs'))
    expect(loaded.config.sources['registry:ui']?.path).toBe(path.join(tempDir, 'registry-ui'))
  })

  test('loadRegistryBuildConfig loads TS config and external registry/theme/color data files', async () => {
    const tempDir = await createTempDir()

    await fs.mkdir(path.join(tempDir, 'src', 'registry-ui'), { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'registries.ts'),
      `export default {
  uis: [
    {
      name: 'button',
      root_folder: 'button',
      type: 'registry:ui'
    }
  ]
}
`,
      'utf8',
    )
    await fs.writeFile(path.join(tempDir, 'colors.json'), JSON.stringify({ zinc: { cssVars: {} } }), 'utf8')
    await fs.writeFile(
      path.join(tempDir, 'themes.ts'),
      `export default {
  zinc: {
    label: 'Zinc',
    radius: '0.5rem',
    light: { background: 'oklch(1 0 0)' },
    dark: { background: 'oklch(0 0 0)' }
  }
}
`,
      'utf8',
    )
    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `export default {
  output: {
    dir: './apps/docs'
  },
  sources: {
    'registry:ui': {
      path: './src/registry-ui',
      packageName: '@example/registry-ui'
    }
  },
  registrySource: './registries.ts',
  colors: {
    data: './colors.json'
  },
  themes: {
    data: './themes.ts'
  }
}
`,
      'utf8',
    )

    const loaded = await loadRegistryBuildConfig({ cwd: tempDir })

    expect(loaded.configPath).toBe(path.join(tempDir, 'registry-build.config.ts'))
    expect(loaded.config.registrySource).toBe('inline')
    expect(loaded.config.registries.uis?.[0]?.name).toBe('button')
    expect(loaded.config.colors?.data).toEqual({ zinc: { cssVars: {} } })
    expect(loaded.config.themes?.data?.zinc?.label).toBe('Zinc')
    expect(loaded.config.sources['registry:ui']?.packageName).toBe('@example/registry-ui')
  })

  test('loadRegistryBuildConfig resolves collection data files and collection source paths', async () => {
    const tempDir = await createTempDir()

    await fs.mkdir(path.join(tempDir, 'pkgbuilds', 'core', 'bash'), { recursive: true })
    await fs.writeFile(path.join(tempDir, 'pkgbuilds', 'core', 'bash', 'PKGBUILD'), 'pkgname=bash\n', 'utf8')
    await fs.writeFile(
      path.join(tempDir, 'packages.json'),
      JSON.stringify([
        {
          description: 'The GNU Bourne Again shell',
          name: 'bash',
          repo: 'core',
          version: '5.2.037-1',
        },
      ]),
      'utf8',
    )
    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `export default {
  collections: {
    packages: {
      data: './packages.json',
      metadata: {
        repoOrder: ['core']
      },
      sources: {
        pkgbuilds: {
          glob: '**/PKGBUILD',
          path: './pkgbuilds',
          referencePath: '/pkgbuilds'
        }
      }
    }
  },
  output: {
    dir: './dist'
  }
}
`,
      'utf8',
    )

    const loaded = await loadRegistryBuildConfig({ cwd: tempDir })

    expect(loaded.config.collections.packages?.data).toEqual([
      {
        description: 'The GNU Bourne Again shell',
        name: 'bash',
        repo: 'core',
        version: '5.2.037-1',
      },
    ])
    expect(loaded.config.collections.packages?.metadata).toEqual({
      repoOrder: ['core'],
    })
    expect(loaded.config.collections.packages?.sources.pkgbuilds?.path).toBe(path.join(tempDir, 'pkgbuilds'))
    expect(loaded.config.collections.packages?.sources.pkgbuilds?.glob).toBe('**/PKGBUILD')
  })

  test('loadRegistryBuildConfig derives generic collections from legacy registries and sources', async () => {
    const tempDir = await createTempDir()

    await fs.mkdir(path.join(tempDir, 'src', 'ui'), { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.json'),
      JSON.stringify({
        output: {
          dir: './dist',
        },
        registries: {
          uis: [
            {
              name: 'button',
              root_folder: 'button',
              type: 'registry:ui',
            },
          ],
        },
        sources: {
          'registry:ui': {
            path: './src/ui',
            referencePath: '/registry-ui/src',
          },
        },
      }),
      'utf8',
    )

    const loaded = await loadRegistryBuildConfig({ cwd: tempDir })

    expect(loaded.config.collections.uis?.metadata).toEqual({
      compatibility: 'legacy-registries',
      itemTypes: ['registry:ui'],
      kind: 'ui-registry',
    })
    expect(loaded.config.collections.uis?.data).toEqual([
      {
        name: 'button',
        root_folder: 'button',
        type: 'registry:ui',
      },
    ])
    expect(loaded.config.collections.uis?.sources['registry:ui']?.path).toBe(path.join(tempDir, 'src', 'ui'))
  })

  test('loadRegistryBuildConfig rejects invalid config shape', async () => {
    const tempDir = await createTempDir()

    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.json'),
      JSON.stringify({
        output: {
          dir: '',
        },
      }),
      'utf8',
    )

    await expect(loadRegistryBuildConfig({ cwd: tempDir })).rejects.toThrow('Invalid registry build config')
  })

  test('loadRegistryBuildConfig resolves extends with path-aware merging', async () => {
    const tempDir = await createTempDir()
    const presetDir = path.join(tempDir, 'presets')

    await fs.mkdir(path.join(presetDir, 'theme-data'), { recursive: true })
    await fs.mkdir(path.join(presetDir, 'sources', 'base-ui'), { recursive: true })
    await fs.mkdir(path.join(tempDir, 'sources', 'feature-ui'), { recursive: true })
    await fs.writeFile(
      path.join(presetDir, 'theme-data', 'themes.json'),
      JSON.stringify({
        zinc: {
          dark: {
            background: 'black',
          },
          label: 'Zinc',
          light: {
            background: 'white',
          },
          radius: '0.5rem',
        },
      }),
      'utf8',
    )
    await fs.writeFile(
      path.join(presetDir, 'theme-preset.ts'),
      `export default {
  stripVariables: ['themeDescription'],
  themes: {
    data: './theme-data/themes.json',
    names: ['zinc']
  },
  sources: {
    'registry:ui': {
      path: './sources/base-ui',
      referencePath: '/preset-ui'
    }
  }
}
`,
      'utf8',
    )
    await fs.writeFile(
      path.join(tempDir, 'registry-build.config.ts'),
      `export default {
  extends: './presets/theme-preset.ts',
  output: {
    dir: './apps/docs'
  },
  stripVariables: ['localDescription'],
  themes: {
    data: {
      teal: {
        label: 'Teal',
        radius: '0.75rem',
        light: { background: 'mint' },
        dark: { background: 'forest' }
      }
    },
    names: ['teal']
  },
  sources: {
    'registry:block': {
      path: './sources/feature-ui',
      referencePath: '/feature-ui'
    }
  }
}
`,
      'utf8',
    )

    const loaded = await loadRegistryBuildConfig({ cwd: tempDir })

    expect(loaded.config.output.dir).toBe(path.join(tempDir, 'apps/docs'))
    expect(loaded.config.sources['registry:ui']?.path).toBe(path.join(presetDir, 'sources', 'base-ui'))
    expect(loaded.config.sources['registry:block']?.path).toBe(path.join(tempDir, 'sources', 'feature-ui'))
    expect(loaded.config.stripVariables).toEqual(expect.arrayContaining(['themeDescription', 'localDescription']))
    expect(loaded.config.themes?.names).toEqual(expect.arrayContaining(['zinc', 'teal']))
    expect(loaded.config.themes?.data?.zinc?.label).toBe('Zinc')
    expect(loaded.config.themes?.data?.teal?.label).toBe('Teal')
  })

  test('loadRegistryBuildConfig rejects circular extends chains', async () => {
    const tempDir = await createTempDir()

    await fs.writeFile(
      path.join(tempDir, 'a.ts'),
      `export default {
  extends: './b.ts',
  output: { dir: './dist' }
}
`,
      'utf8',
    )
    await fs.writeFile(
      path.join(tempDir, 'b.ts'),
      `export default {
  extends: './a.ts'
}
`,
      'utf8',
    )

    await expect(loadRegistryBuildConfig({ configFile: path.join(tempDir, 'a.ts'), cwd: tempDir })).rejects.toThrow(
      'Circular registry build config extends detected',
    )
  })
})
