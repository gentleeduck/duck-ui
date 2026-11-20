import { describe, expect, test, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { clamp } from '../clamp'
import { composeEventHandlers } from '../compose-event-handler'
import { getState } from '../get-state'
import { focusFirst, isPointInPolygon, wrapArray } from '../shared-utils'

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

  test('point beside it, level with it, returns false', () => {
    expect(isPointInPolygon({ x: -5, y: 5 }, square)).toBe(false)
  })

  test('counts a point on its left edge as inside and one on its right edge as outside, casting its ray rightwards', () => {
    expect(isPointInPolygon({ x: 0, y: 5 }, square)).toBe(true)
    expect(isPointInPolygon({ x: 10, y: 5 }, square)).toBe(false)
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

describe('focusFirst', () => {
  freshDom()

  test('moves on past a candidate that will not take focus', () => {
    const [refuses, takes] = ['Refuses', 'Takes'].map((label) => {
      const button = document.body.appendChild(document.createElement('button'))
      button.textContent = label
      return button
    })
    refuses.focus = () => {}

    focusFirst([refuses, takes])

    expect(document.activeElement?.textContent).toBe('Takes')
    refuses.remove()
    takes.remove()
  })

  test('stops at the first candidate that takes focus, and hands on preventScroll', () => {
    const [first, second] = ['First', 'Second'].map((label) => {
      const button = document.body.appendChild(document.createElement('button'))
      button.textContent = label
      return button
    })
    const focus = vi.spyOn(first as HTMLButtonElement, 'focus')

    focusFirst([first as HTMLButtonElement, second as HTMLButtonElement], true)

    expect([document.activeElement?.textContent, focus.mock.calls]).toEqual(['First', [[{ preventScroll: true }]]])
    first?.remove()
    second?.remove()
  })

  test('leaves focus on a candidate that already has it', () => {
    const [focused, other] = ['Focused', 'Other'].map((label) => {
      const button = document.body.appendChild(document.createElement('button'))
      button.textContent = label
      return button
    })
    focused?.focus()

    focusFirst([focused as HTMLButtonElement, other as HTMLButtonElement])

    expect(document.activeElement?.textContent).toBe('Focused')
    focused?.remove()
    other?.remove()
  })
})
