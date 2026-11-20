import { describe, expect, test } from 'vitest'
import { uiRegistryPreset } from '../..'
import type { IUiRegistryPresetOptions } from '../presets/ui-registry.preset'

describe('uiRegistryPreset', () => {
  test('returns an array of extensions', () => {
    const extensions = uiRegistryPreset()

    expect(Array.isArray(extensions)).toBe(true)
    expect(extensions.length).toBeGreaterThan(0)
  })

  test('every extension has a name and run function', () => {
    const extensions = uiRegistryPreset()

    for (const ext of extensions) {
      expect(typeof ext.name).toBe('string')
      expect(ext.name.length).toBeGreaterThan(0)
      expect(typeof ext.run).toBe('function')
    }
  })

  test('includes banner, validate, indexBuild, and components by default', () => {
    const extensions = uiRegistryPreset()
    const names = extensions.map((e) => e.name)

    expect(names).toContain('banner')
    expect(names).toContain('validate')
    expect(names).toContain('indexBuild')
    expect(names).toContain('components')
  })

  test('does not include colors by default', () => {
    const extensions = uiRegistryPreset()
    const names = extensions.map((e) => e.name)

    expect(names).not.toContain('colors')
  })

  test('does not include componentIndex by default', () => {
    const extensions = uiRegistryPreset()
    const names = extensions.map((e) => e.name)

    expect(names).not.toContain('componentIndex')
  })

  test('returns exactly 4 extensions with default options', () => {
    const extensions = uiRegistryPreset()

    expect(extensions).toHaveLength(4)
  })

  test('excludes banner when banner is false', () => {
    const extensions = uiRegistryPreset({ banner: false })
    const names = extensions.map((e) => e.name)

    expect(names).not.toContain('banner')
  })

  test('excludes validate when validate is false', () => {
    const extensions = uiRegistryPreset({ validate: false })
    const names = extensions.map((e) => e.name)

    expect(names).not.toContain('validate')
  })

  test('excludes indexBuild when index is false', () => {
    const extensions = uiRegistryPreset({ index: false })
    const names = extensions.map((e) => e.name)

    expect(names).not.toContain('indexBuild')
  })

  test('excludes components when components is false', () => {
    const extensions = uiRegistryPreset({ components: false })
    const names = extensions.map((e) => e.name)

    expect(names).not.toContain('components')
  })

  test('disabling all default extensions returns empty array', () => {
    const extensions = uiRegistryPreset({
      banner: false,
      components: false,
      index: false,
      validate: false,
    })

    expect(extensions).toHaveLength(0)
  })

  test('includes colors when colors option is provided', () => {
    const extensions = uiRegistryPreset({ colors: {} })
    const names = extensions.map((e) => e.name)

    expect(names).toContain('colors')
  })

  test('includes componentIndex when componentIndex option is provided', () => {
    const extensions = uiRegistryPreset({ componentIndex: {} })
    const names = extensions.map((e) => e.name)

    expect(names).toContain('componentIndex')
  })

  test('includes both optional extensions when both are provided', () => {
    const extensions = uiRegistryPreset({ colors: {}, componentIndex: {} })
    const names = extensions.map((e) => e.name)

    expect(names).toContain('colors')
    expect(names).toContain('componentIndex')
    expect(extensions).toHaveLength(6)
  })

  test('banner is the first extension in the default list', () => {
    const extensions = uiRegistryPreset()

    expect(extensions[0]!.name).toBe('banner')
  })

  test('optional extensions appear after the default ones', () => {
    const extensions = uiRegistryPreset({ colors: {}, componentIndex: {} })
    const names = extensions.map((e) => e.name)

    const colorsIdx = names.indexOf('colors')
    const componentIndexIdx = names.indexOf('componentIndex')
    const componentsIdx = names.indexOf('components')

    expect(colorsIdx).toBeGreaterThan(componentsIdx)
    expect(componentIndexIdx).toBeGreaterThan(componentsIdx)
  })

  test('preset extensions can be spread into a config extensions array', () => {
    const customExtension = { name: 'custom', run: () => {} }
    const extensions = [...uiRegistryPreset(), customExtension]
    const names = extensions.map((e) => e.name)

    expect(names).toContain('custom')
    expect(names).toContain('banner')
    expect(extensions).toHaveLength(5)
  })

  test('custom extensions can be placed before preset extensions', () => {
    const customExtension = { name: 'custom', run: () => {} }
    const extensions = [customExtension, ...uiRegistryPreset()]

    expect(extensions[0]!.name).toBe('custom')
    expect(extensions[1]!.name).toBe('banner')
  })

  test('banner option with config object still includes banner', () => {
    const extensions = uiRegistryPreset({ banner: { name: 'my-tool' } })
    const names = extensions.map((e) => e.name)

    expect(names).toContain('banner')
    expect(extensions).toHaveLength(4)
  })

  test('selective disabling preserves unaffected extensions', () => {
    const extensions = uiRegistryPreset({ banner: false, validate: false })
    const names = extensions.map((e) => e.name)

    expect(names).not.toContain('banner')
    expect(names).not.toContain('validate')
    expect(names).toContain('indexBuild')
    expect(names).toContain('components')
    expect(extensions).toHaveLength(2)
  })

  test('calling with empty options object matches calling with no arguments', () => {
    const withEmpty = uiRegistryPreset({})
    const withNone = uiRegistryPreset()

    expect(withEmpty.map((e) => e.name)).toEqual(withNone.map((e) => e.name))
    expect(withEmpty).toHaveLength(withNone.length)
  })
})
