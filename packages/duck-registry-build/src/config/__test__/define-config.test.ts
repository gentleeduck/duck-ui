import { describe, expect, test } from 'vitest'
import { defineConfig } from '../../define-config'
import type { IRegistryBuildConfig } from '../types'

describe('defineConfig', () => {
  test('returns the exact same config object (identity)', () => {
    const config: IRegistryBuildConfig = {
      output: { dir: './dist' },
    }
    const result = defineConfig(config)
    expect(result).toBe(config)
  })

  test('returns empty config unchanged', () => {
    const config: IRegistryBuildConfig = {}
    expect(defineConfig(config)).toBe(config)
  })

  test('preserves all config properties', () => {
    const config: IRegistryBuildConfig = {
      branding: { name: 'my-tool', font: 'Mono' },
      output: { dir: './build' },
      performance: { incremental: true, parallelism: 2 },
      sources: {
        'registry:ui': { path: './src/ui' },
      },
      stripVariables: ['description'],
    }
    const result = defineConfig(config)
    expect(result.branding?.name).toBe('my-tool')
    expect(result.output?.dir).toBe('./build')
    expect(result.performance?.parallelism).toBe(2)
    expect(result.sources?.['registry:ui']?.path).toBe('./src/ui')
    expect(result.stripVariables).toEqual(['description'])
  })

  test('preserves config with extensions', () => {
    const ext = { name: 'test-ext', run: () => {}, phases: [] }
    const config: IRegistryBuildConfig = {
      extensions: [ext],
      output: { dir: './dist' },
    }
    const result = defineConfig(config)
    expect(result.extensions).toHaveLength(1)
    expect(result.extensions![0]).toBe(ext)
  })

  test('preserves config with collections', () => {
    const config: IRegistryBuildConfig = {
      collections: {
        packages: {
          data: [{ name: 'bash' }],
          metadata: { kind: 'pkg' },
          sources: { pkgbuilds: { path: './pkgbuilds' } },
        },
      },
    }
    const result = defineConfig(config)
    expect(result.collections?.packages?.metadata?.kind).toBe('pkg')
  })
})
