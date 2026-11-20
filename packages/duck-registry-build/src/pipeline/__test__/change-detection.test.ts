import { describe, expect, test } from 'vitest'
import { createRegistryEntryCacheKey, isRegistryEntryAffectedByChangedPaths } from '../change-detection'
import type { IRegistryBuildContext } from '../types'

function createMockContext(
  overrides: { changedOnly?: boolean; changedPaths?: string[]; sources?: Record<string, { path: string }> } = {},
): IRegistryBuildContext {
  return {
    changedOnly: overrides.changedOnly ?? false,
    changedPaths: overrides.changedPaths ?? [],
    config: {
      sources: (overrides.sources ?? {}) as IRegistryBuildContext['config']['sources'],
    },
  } as unknown as IRegistryBuildContext
}

describe('createRegistryEntryCacheKey', () => {
  test('produces a deterministic key from type:folder:name', () => {
    const key = createRegistryEntryCacheKey({
      name: 'button',
      root_folder: 'button',
      type: 'registry:ui',
    })

    expect(key).toBe('registry:ui:button:button')
  })

  test('normalizes backslashes in the folder path', () => {
    const key = createRegistryEntryCacheKey({
      name: 'dialog',
      root_folder: 'components\\dialog',
      type: 'registry:ui',
    })

    expect(key).toBe('registry:ui:components/dialog:dialog')
  })
})

describe('isRegistryEntryAffectedByChangedPaths', () => {
  const entry = {
    name: 'button',
    root_folder: 'button',
    type: 'registry:ui' as const,
  }

  test('returns true when changedOnly is false (rebuilds everything)', () => {
    const ctx = createMockContext({
      changedOnly: false,
      changedPaths: ['src/ui/other/index.ts'],
      sources: { 'registry:ui': { path: 'src/ui' } },
    })

    expect(isRegistryEntryAffectedByChangedPaths(ctx, entry)).toBe(true)
  })

  test('returns true when changedPaths is empty', () => {
    const ctx = createMockContext({
      changedOnly: true,
      changedPaths: [],
      sources: { 'registry:ui': { path: 'src/ui' } },
    })

    expect(isRegistryEntryAffectedByChangedPaths(ctx, entry)).toBe(true)
  })

  test('returns true when a changed path matches an entry source file', () => {
    const ctx = createMockContext({
      changedOnly: true,
      changedPaths: ['src/ui/button/index.ts'],
      sources: { 'registry:ui': { path: 'src/ui' } },
    })

    expect(isRegistryEntryAffectedByChangedPaths(ctx, entry)).toBe(true)
  })

  test('returns false when changed paths do not overlap with entry paths', () => {
    const ctx = createMockContext({
      changedOnly: true,
      changedPaths: ['src/ui/dialog/index.ts'],
      sources: { 'registry:ui': { path: 'src/ui' } },
    })

    expect(isRegistryEntryAffectedByChangedPaths(ctx, entry)).toBe(false)
  })

  test('returns true when entry has no source configured (cannot determine, so rebuild)', () => {
    const ctx = createMockContext({
      changedOnly: true,
      changedPaths: ['src/ui/button/index.ts'],
      sources: {},
    })

    expect(isRegistryEntryAffectedByChangedPaths(ctx, entry)).toBe(true)
  })
})
