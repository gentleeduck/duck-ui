import { describe, expect, test } from 'vitest'
import { createStagger, staggerChildren } from '../stagger'

describe('createStagger', () => {
  test('returns array of correct length', () => {
    expect(createStagger(3, 50)).toHaveLength(3)
  })

  test('first item has delay 0 when no initial delay', () => {
    expect(createStagger(3, 50)[0]).toEqual({ delay: 0 })
  })

  test('subsequent items increment by staggerMs/1000', () => {
    const result = createStagger(3, 50)
    expect(result[1]?.delay).toBeCloseTo(0.05)
    expect(result[2]?.delay).toBeCloseTo(0.1)
  })

  test('applies initial delayMs offset', () => {
    const result = createStagger(2, 50, 100)
    expect(result[0]?.delay).toBeCloseTo(0.1)
    expect(result[1]?.delay).toBeCloseTo(0.15)
  })

  test('returns empty array when count is 0', () => {
    expect(createStagger(0, 50)).toHaveLength(0)
  })

  test('returns single-element array when count is 1', () => {
    const result = createStagger(1, 50)
    expect(result).toHaveLength(1)
    expect(result[0]?.delay).toBe(0)
  })

  test('all entries have only a delay key', () => {
    const result = createStagger(3, 50)
    for (const item of result) {
      expect(Object.keys(item)).toEqual(['delay'])
    }
  })
})

describe('staggerChildren', () => {
  test('returns staggerChildren in seconds', () => {
    const config = staggerChildren(50)
    expect((config as Record<string, unknown>).staggerChildren).toBeCloseTo(0.05)
  })

  test('applies delayChildren', () => {
    const config = staggerChildren(50, 100)
    expect((config as Record<string, unknown>).delayChildren).toBeCloseTo(0.1)
  })

  test('delayChildren defaults to 0 when not provided', () => {
    const config = staggerChildren(50)
    expect((config as Record<string, unknown>).delayChildren).toBe(0)
  })

  test('larger staggerMs produces larger staggerChildren value', () => {
    const slow = staggerChildren(200)
    const fast = staggerChildren(50)
    expect((slow as Record<string, unknown>).staggerChildren as number).toBeGreaterThan(
      (fast as Record<string, unknown>).staggerChildren as number,
    )
  })
})
