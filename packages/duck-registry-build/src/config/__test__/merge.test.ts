import { describe, expect, test } from 'vitest'
import { mergeRegistryBuildConfigs } from '../..'
import { mergeUniqueStrings } from '../merge/merge.lib'
import type { IRegistryBuildConfig } from '../types'

describe('mergeUniqueStrings', () => {
  test('merges and deduplicates two string arrays', () => {
    expect(mergeUniqueStrings(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c'])
  })

  test('handles undefined left input', () => {
    expect(mergeUniqueStrings(undefined, ['x', 'y'])).toEqual(['x', 'y'])
  })

  test('handles undefined right input', () => {
    expect(mergeUniqueStrings(['x', 'y'], undefined)).toEqual(['x', 'y'])
  })

  test('handles both inputs undefined', () => {
    expect(mergeUniqueStrings(undefined, undefined)).toEqual([])
  })
})

describe('mergeRegistryBuildConfigs', () => {
  test('merging two empty configs returns empty-ish result', () => {
    const base: IRegistryBuildConfig = {}
    const next: IRegistryBuildConfig = {}
    const result = mergeRegistryBuildConfigs(base, next)

    expect(result.extends).toBeUndefined()
    expect(result.extensions).toEqual([])
    expect(result.sources).toEqual({})
    expect(result.collections).toEqual({})
  })

  test('extensions arrays are concatenated', () => {
    const extA = { name: 'a', phases: [] }
    const extB = { name: 'b', phases: [] }
    const result = mergeRegistryBuildConfigs({ extensions: [extA] }, { extensions: [extB] })

    expect(result.extensions).toEqual([extA, extB])
  })

  test('collections from both configs are merged by name', () => {
    const result = mergeRegistryBuildConfigs(
      {
        collections: {
          packages: { metadata: { kind: 'pkg' }, sources: {} },
        },
      },
      {
        collections: {
          images: { metadata: { kind: 'img' }, sources: {} },
        },
      },
    )

    expect(Object.keys(result.collections!)).toEqual(expect.arrayContaining(['packages', 'images']))
  })

  test('sources from both configs are merged by key, combining ignore arrays', () => {
    const result = mergeRegistryBuildConfigs(
      {
        sources: {
          'registry:ui': { path: './ui', ignore: ['**/test/**'] },
        },
      },
      {
        sources: {
          'registry:ui': { path: './ui-v2', ignore: ['**/spec/**'] },
        },
      },
    )

    const uiSource = result.sources!['registry:ui']!
    expect(uiSource.path).toBe('./ui-v2')
    expect(uiSource.ignore).toEqual(expect.arrayContaining(['**/test/**', '**/spec/**']))
  })

  test('themes.data objects are shallow-merged', () => {
    const result = mergeRegistryBuildConfigs(
      { themes: { data: { zinc: { label: 'Zinc' } } } },
      { themes: { data: { teal: { label: 'Teal' } } } },
    )

    const data = result.themes!.data as Record<string, unknown>
    expect(data.zinc).toEqual({ label: 'Zinc' })
    expect(data.teal).toEqual({ label: 'Teal' })
  })

  test('themes.cssVarKeys and themes.names are deduplicated', () => {
    const result = mergeRegistryBuildConfigs(
      { themes: { cssVarKeys: ['--bg', '--fg'], names: ['zinc'] } },
      { themes: { cssVarKeys: ['--fg', '--border'], names: ['zinc', 'teal'] } },
    )

    expect(result.themes!.cssVarKeys).toEqual(['--bg', '--fg', '--border'])
    expect(result.themes!.names).toEqual(['zinc', 'teal'])
  })

  test('extends is always cleared to undefined', () => {
    const result = mergeRegistryBuildConfigs({ extends: './base.ts' }, { extends: './override.ts' })

    expect(result.extends).toBeUndefined()
  })

  test('colors.data string values from next override base', () => {
    const result = mergeRegistryBuildConfigs(
      { colors: { data: { zinc: { cssVars: {} } } } },
      { colors: { data: './colors.json' } },
    )

    expect(result.colors!.data).toBe('./colors.json')
  })
})
