import { describe, expect, test } from 'vitest'
import {
  DEFAULT_BRANDING,
  DEFAULT_PERFORMANCE,
  DEFAULT_SOURCE_GLOB,
  DEFAULT_SOURCE_IGNORE,
  withRegistryBuildDefaults,
} from '../..'
import type { IRegistryBuildConfig } from '../types'

describe('withRegistryBuildDefaults', () => {
  test('applies DEFAULT_SOURCE_GLOB to sources missing glob', () => {
    const config: IRegistryBuildConfig = {
      sources: {
        'registry:ui': { path: './src/ui' },
      },
    }
    const result = withRegistryBuildDefaults(config)

    expect(result.sources!['registry:ui']!.glob).toBe(DEFAULT_SOURCE_GLOB)
  })

  test('applies DEFAULT_SOURCE_IGNORE to sources missing ignore', () => {
    const config: IRegistryBuildConfig = {
      sources: {
        'registry:ui': { path: './src/ui' },
      },
    }
    const result = withRegistryBuildDefaults(config)

    expect(result.sources!['registry:ui']!.ignore).toEqual([...DEFAULT_SOURCE_IGNORE])
  })

  test('applies DEFAULT_PERFORMANCE when no performance config provided', () => {
    const result = withRegistryBuildDefaults({})

    expect(result.performance!.cacheDir).toBe(DEFAULT_PERFORMANCE.cacheDir)
    expect(result.performance!.incremental).toBe(DEFAULT_PERFORMANCE.incremental)
    expect(typeof result.performance!.parallelism).toBe('number')
  })

  test('applies DEFAULT_BRANDING when no branding provided', () => {
    const result = withRegistryBuildDefaults({})

    expect(result.branding!.font).toBe(DEFAULT_BRANDING.font)
    expect(result.branding!.name).toBe(DEFAULT_BRANDING.name)
  })

  test('preserves user-provided values and does not override them with defaults', () => {
    const config: IRegistryBuildConfig = {
      branding: { name: 'my-tool' },
      performance: { cacheDir: '.my-cache', incremental: false, parallelism: 2 },
      sources: {
        'registry:ui': { path: './src/ui', glob: '**/*.vue', ignore: ['**/dist/**'] },
      },
    }
    const result = withRegistryBuildDefaults(config)

    expect(result.branding!.name).toBe('my-tool')
    expect(result.performance!.cacheDir).toBe('.my-cache')
    expect(result.performance!.incremental).toBe(false)
    expect(result.performance!.parallelism).toBe(2)
    expect(result.sources!['registry:ui']!.glob).toBe('**/*.vue')
    // User-provided ignore is merged with DEFAULT_SOURCE_IGNORE so the
    // built-in test/snapshot exclusions are never accidentally dropped.
    expect(result.sources!['registry:ui']!.ignore).toEqual([...DEFAULT_SOURCE_IGNORE, '**/dist/**'])
  })

  test('applies collection source defaults', () => {
    const config: IRegistryBuildConfig = {
      collections: {
        packages: {
          sources: {
            pkgbuilds: { path: './pkgbuilds' },
          },
        },
      },
    }
    const result = withRegistryBuildDefaults(config)

    const src = result.collections!.packages!.sources!.pkgbuilds!
    expect(src.glob).toBe(DEFAULT_SOURCE_GLOB)
    expect(src.ignore).toEqual([...DEFAULT_SOURCE_IGNORE])
  })

  test('returns empty extensions array when none provided', () => {
    const result = withRegistryBuildDefaults({})

    expect(result.extensions).toEqual([])
  })

  test('does NOT set output when output is undefined', () => {
    const result = withRegistryBuildDefaults({})

    expect(result.output).toBeUndefined()
  })
})
