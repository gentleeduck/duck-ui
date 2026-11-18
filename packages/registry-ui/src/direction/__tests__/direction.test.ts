import { describe, expect, test } from 'bun:test'
import { toDirection } from '../direction.libs'

describe('registry-ui toDirection', () => {
  test('keeps ltr and rtl', () => {
    expect(toDirection('ltr')).toBe('ltr')
    expect(toDirection('rtl')).toBe('rtl')
  })

  test('rejects keys inherited from Object.prototype', () => {
    for (const key of ['toString', 'constructor', '__proto__', 'hasOwnProperty']) {
      expect(toDirection(key)).toBeUndefined()
    }
  })

  test('rejects every other value', () => {
    for (const value of ['auto', 'LTR', '', undefined, null, 0, {}]) {
      expect(toDirection(value)).toBeUndefined()
    }
  })
})
