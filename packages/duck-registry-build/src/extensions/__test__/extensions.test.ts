import { describe, expect, test } from 'vitest'
import { uiRegistryPreset } from '../../config/presets/ui-registry.preset'
import { bannerExtension } from '../banner'
import { colorsExtension } from '../colors'
import { componentIndexExtension } from '../component-index'
import type { IRegistryBuildExtension, RegistryBuildExtensionStage } from '../extension'
import { componentsExtension, indexBuildExtension } from '../ui/ui.extensions'
import { validateExtension } from '../validate'

function assertExtensionShape(
  ext: IRegistryBuildExtension,
  expectedName: string,
  expectedStage: RegistryBuildExtensionStage,
) {
  expect(ext).toBeDefined()
  expect(typeof ext.name).toBe('string')
  expect(ext.name).toBe(expectedName)
  expect(ext.stage).toBe(expectedStage)
  expect(typeof ext.run).toBe('function')
}

describe('extension type contract', () => {
  test('every extension has name, stage, and run', () => {
    const extensions: IRegistryBuildExtension[] = [
      bannerExtension(),
      validateExtension(),
      indexBuildExtension(),
      componentsExtension(),
      colorsExtension(),
      componentIndexExtension(),
    ]

    for (const ext of extensions) {
      expect(typeof ext.name).toBe('string')
      expect(ext.name.length).toBeGreaterThan(0)
      expect(['beforeBuild', 'afterBuild']).toContain(ext.stage)
      expect(typeof ext.run).toBe('function')
    }
  })

  test('extension names are unique across all built-in factories', () => {
    const extensions = [
      bannerExtension(),
      validateExtension(),
      indexBuildExtension(),
      componentsExtension(),
      colorsExtension(),
      componentIndexExtension(),
    ]
    const names = extensions.map((ext) => ext.name)

    expect(new Set(names).size).toBe(names.length)
  })
})

describe('bannerExtension', () => {
  test('returns correct name and beforeBuild stage', () => {
    assertExtensionShape(bannerExtension(), 'banner', 'beforeBuild')
  })

  test('accepts empty options', () => {
    const ext = bannerExtension({})
    assertExtensionShape(ext, 'banner', 'beforeBuild')
  })

  test('accepts branding options', () => {
    const ext = bannerExtension({ name: 'my-tool', font: 'standard' })
    assertExtensionShape(ext, 'banner', 'beforeBuild')
  })
})

describe('validateExtension', () => {
  test('returns correct name and beforeBuild stage', () => {
    assertExtensionShape(validateExtension(), 'validate', 'beforeBuild')
  })
})

describe('indexBuildExtension', () => {
  test('returns correct name and afterBuild stage', () => {
    assertExtensionShape(indexBuildExtension(), 'indexBuild', 'afterBuild')
  })
})

describe('componentsExtension', () => {
  test('returns correct name and afterBuild stage', () => {
    assertExtensionShape(componentsExtension(), 'components', 'afterBuild')
  })
})

describe('colorsExtension', () => {
  test('returns correct name and afterBuild stage', () => {
    assertExtensionShape(colorsExtension(), 'colors', 'afterBuild')
  })

  test('accepts empty options', () => {
    const ext = colorsExtension({})
    assertExtensionShape(ext, 'colors', 'afterBuild')
  })
})

describe('componentIndexExtension', () => {
  test('returns correct name and afterBuild stage', () => {
    assertExtensionShape(componentIndexExtension(), 'componentIndex', 'afterBuild')
  })

  test('accepts empty options', () => {
    const ext = componentIndexExtension({})
    assertExtensionShape(ext, 'componentIndex', 'afterBuild')
  })
})

describe('uiRegistryPreset', () => {
  test('returns default set of extensions with no options', () => {
    const extensions = uiRegistryPreset()

    expect(Array.isArray(extensions)).toBe(true)
    expect(extensions.length).toBe(4)

    const names = extensions.map((ext) => ext.name)
    expect(names).toEqual(['banner', 'validate', 'indexBuild', 'components'])
  })

  test('default extensions have correct stages', () => {
    const extensions = uiRegistryPreset()
    const stageMap = Object.fromEntries(extensions.map((ext) => [ext.name, ext.stage]))

    expect(stageMap.banner).toBe('beforeBuild')
    expect(stageMap.validate).toBe('beforeBuild')
    expect(stageMap.indexBuild).toBe('afterBuild')
    expect(stageMap.components).toBe('afterBuild')
  })

  test('includes colors extension when colors option is provided', () => {
    const extensions = uiRegistryPreset({ colors: {} })
    const names = extensions.map((ext) => ext.name)

    expect(names).toContain('colors')
    expect(extensions.length).toBe(5)
  })

  test('includes componentIndex extension when componentIndex option is provided', () => {
    const extensions = uiRegistryPreset({ componentIndex: {} })
    const names = extensions.map((ext) => ext.name)

    expect(names).toContain('componentIndex')
    expect(extensions.length).toBe(5)
  })

  test('includes both optional extensions when both options are provided', () => {
    const extensions = uiRegistryPreset({ colors: {}, componentIndex: {} })
    const names = extensions.map((ext) => ext.name)

    expect(names).toContain('colors')
    expect(names).toContain('componentIndex')
    expect(extensions.length).toBe(6)
  })

  test('excludes banner when banner is false', () => {
    const extensions = uiRegistryPreset({ banner: false })
    const names = extensions.map((ext) => ext.name)

    expect(names).not.toContain('banner')
    expect(extensions.length).toBe(3)
  })

  test('excludes validate when validate is false', () => {
    const extensions = uiRegistryPreset({ validate: false })
    const names = extensions.map((ext) => ext.name)

    expect(names).not.toContain('validate')
    expect(extensions.length).toBe(3)
  })

  test('excludes index when index is false', () => {
    const extensions = uiRegistryPreset({ index: false })
    const names = extensions.map((ext) => ext.name)

    expect(names).not.toContain('indexBuild')
    expect(extensions.length).toBe(3)
  })

  test('excludes components when components is false', () => {
    const extensions = uiRegistryPreset({ components: false })
    const names = extensions.map((ext) => ext.name)

    expect(names).not.toContain('components')
    expect(extensions.length).toBe(3)
  })

  test('returns empty array when all extensions are disabled', () => {
    const extensions = uiRegistryPreset({
      banner: false,
      components: false,
      index: false,
      validate: false,
    })

    expect(extensions).toEqual([])
  })

  test('preserves beforeBuild-then-afterBuild ordering', () => {
    const extensions = uiRegistryPreset({ colors: {}, componentIndex: {} })
    const stages = extensions.map((ext) => ext.stage)
    const lastBefore = stages.lastIndexOf('beforeBuild')
    const firstAfter = stages.indexOf('afterBuild')

    expect(lastBefore).toBeLessThan(firstAfter)
  })

  test('all returned items satisfy the extension contract', () => {
    const extensions = uiRegistryPreset({ colors: {}, componentIndex: {} })

    for (const ext of extensions) {
      expect(typeof ext.name).toBe('string')
      expect(ext.name.length).toBeGreaterThan(0)
      expect(['beforeBuild', 'afterBuild']).toContain(ext.stage)
      expect(typeof ext.run).toBe('function')
    }
  })
})
