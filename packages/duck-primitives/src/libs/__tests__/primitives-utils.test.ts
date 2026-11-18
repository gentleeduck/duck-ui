import { describe, expect, test } from 'bun:test'
import { clamp } from '../clamp'
import { composeEventHandlers } from '../compose-event-handler'
import { getState } from '../get-state'
import { isPointInPolygon, wrapArray } from '../shared-utils'

describe('duck-primitives utils', () => {
  test('clamp constrains numbers within an inclusive range', () => {
    expect(clamp(5, [1, 10])).toBe(5)
    expect(clamp(-2, [1, 10])).toBe(1)
    expect(clamp(12, [1, 10])).toBe(10)
  })

  test('clamp preserves boundary values', () => {
    expect(clamp(1, [1, 10])).toBe(1)
    expect(clamp(10, [1, 10])).toBe(10)
  })

  test('getState returns Radix-style open and closed strings', () => {
    expect(getState(true)).toBe('open')
    expect(getState(false)).toBe('closed')
  })

  test('composeEventHandlers preserves order and respects defaultPrevented', () => {
    const calls: string[] = []
    const handler = composeEventHandlers(
      (event) => {
        calls.push('original')
        event.defaultPrevented = true
      },
      () => {
        calls.push('ours')
      },
    )

    handler({ defaultPrevented: false })
    expect(calls).toEqual(['original'])
  })

  test('composeEventHandlers returns our handler result when it runs', () => {
    const handler = composeEventHandlers(undefined, () => 'handled')

    expect(handler({ defaultPrevented: false })).toBe('handled')
  })

  test('composeEventHandlers runs our handler when the original does not prevent default', () => {
    const calls: string[] = []
    const handler = composeEventHandlers(
      () => {
        calls.push('original')
      },
      () => {
        calls.push('ours')
      },
    )

    handler({ defaultPrevented: false })
    expect(calls).toEqual(['original', 'ours'])
  })

  test('composeEventHandlers can ignore defaultPrevented checks when requested', () => {
    const calls: string[] = []
    const handler = composeEventHandlers(
      (event) => {
        calls.push('original')
        event.defaultPrevented = true
      },
      () => {
        calls.push('ours')
      },
      { checkForDefaultPrevented: false },
    )

    handler({ defaultPrevented: false })
    expect(calls).toEqual(['original', 'ours'])
  })
})

describe('wrapArray', () => {
  test('wraps from a given start index', () => {
    expect(wrapArray(['a', 'b', 'c', 'd'], 2)).toEqual(['c', 'd', 'a', 'b'])
  })

  test('wraps from index 0 returns same order', () => {
    expect(wrapArray([1, 2, 3], 0)).toEqual([1, 2, 3])
  })

  test('wraps from last index', () => {
    expect(wrapArray([1, 2, 3], 2)).toEqual([3, 1, 2])
  })

  test('empty array returns empty', () => {
    expect(wrapArray([], 0)).toEqual([])
  })
})

describe('isPointInPolygon', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ]

  test('point inside returns true', () => {
    expect(isPointInPolygon({ x: 5, y: 5 }, square)).toBe(true)
  })

  test('point outside returns false', () => {
    expect(isPointInPolygon({ x: 15, y: 5 }, square)).toBe(false)
  })

  test('point far outside returns false', () => {
    expect(isPointInPolygon({ x: -10, y: -10 }, square)).toBe(false)
  })

  test('works with triangle', () => {
    const triangle = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]
    expect(isPointInPolygon({ x: 5, y: 3 }, triangle)).toBe(true)
    expect(isPointInPolygon({ x: 0, y: 10 }, triangle)).toBe(false)
  })
})
