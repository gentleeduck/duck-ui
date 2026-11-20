import { describe, expect, test } from 'vitest'
import { hashString, hashValue } from '../hash'

describe('hashString', () => {
  test('returns a 64-character hex string (SHA-256)', () => {
    const result = hashString('hello')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  test('produces deterministic output for the same input', () => {
    expect(hashString('test')).toBe(hashString('test'))
  })

  test('produces different output for different inputs', () => {
    expect(hashString('hello')).not.toBe(hashString('world'))
  })

  test('handles empty string', () => {
    const result = hashString('')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  test('handles unicode characters', () => {
    const result = hashString('\u{1F600}\u{1F680}')
    expect(result).toHaveLength(64)
  })

  test('known SHA-256 value for "hello"', () => {
    expect(hashString('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
  })
})

describe('hashValue', () => {
  test('hashes a simple string value', () => {
    const result = hashValue('hello')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  test('is deterministic for the same value', () => {
    expect(hashValue({ a: 1, b: 2 })).toBe(hashValue({ a: 1, b: 2 }))
  })

  test('produces the same hash regardless of object key order', () => {
    expect(hashValue({ a: 1, b: 2 })).toBe(hashValue({ b: 2, a: 1 }))
  })

  test('produces stable hash for nested objects with different key order', () => {
    const value1 = { outer: { z: 3, a: 1, m: 2 } }
    const value2 = { outer: { a: 1, m: 2, z: 3 } }
    expect(hashValue(value1)).toBe(hashValue(value2))
  })

  test('different values produce different hashes', () => {
    expect(hashValue({ a: 1 })).not.toBe(hashValue({ a: 2 }))
  })

  test('handles arrays (order-sensitive)', () => {
    expect(hashValue([1, 2, 3])).not.toBe(hashValue([3, 2, 1]))
  })

  test('arrays with same order produce same hash', () => {
    expect(hashValue([1, 2, 3])).toBe(hashValue([1, 2, 3]))
  })

  test('handles null', () => {
    const result = hashValue(null)
    expect(result).toHaveLength(64)
  })

  test('handles numbers', () => {
    expect(hashValue(42)).toBe(hashValue(42))
    expect(hashValue(42)).not.toBe(hashValue(43))
  })

  test('handles booleans', () => {
    expect(hashValue(true)).not.toBe(hashValue(false))
  })

  test('handles deeply nested structures with varying key order', () => {
    const value1 = { a: { c: [{ z: 1, a: 2 }], b: true } }
    const value2 = { a: { b: true, c: [{ a: 2, z: 1 }] } }
    expect(hashValue(value1)).toBe(hashValue(value2))
  })
})
