import { describe, expect, test } from 'vitest'
import { assertUniqueNames } from '../component-index.lib'

describe('assertUniqueNames', () => {
  test('refuses two items of one name, naming both of their types', () => {
    expect(() =>
      assertUniqueNames([
        { name: 'sidebar-10', type: 'registry:block' },
        { name: 'sidebar-10', type: 'registry:example' },
      ]),
    ).toThrow('Two registry items are named "sidebar-10", a registry:block and a registry:example')
  })

  test('passes items whose names differ', () => {
    expect(() =>
      assertUniqueNames([
        { name: 'sidebar-10', type: 'registry:block' },
        { name: 'sidebar-17', type: 'registry:example' },
      ]),
    ).not.toThrow()
  })
})
