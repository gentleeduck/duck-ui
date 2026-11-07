import { describe, expect, it } from 'bun:test'
import { getExitSideFromRect, getHull, getPaddedExitPoints, getPointsFromRect } from '../tooltip.libs'

describe('tooltip geometry', () => {
  const box = new DOMRect(0, 0, 100, 50)

  it('names the edge of a box nearest a point', () => {
    expect(getExitSideFromRect({ x: 50, y: 1 }, box)).toBe('top')
    expect(getExitSideFromRect({ x: 50, y: 49 }, box)).toBe('bottom')
    expect(getExitSideFromRect({ x: 1, y: 25 }, box)).toBe('left')
    expect(getExitSideFromRect({ x: 99, y: 25 }, box)).toBe('right')
  })

  it('refuses a point with no position', () => {
    expect(() => getExitSideFromRect({ x: Number.NaN, y: 0 }, box)).toThrow('unreachable')
  })

  it('pads an exit point back inside the edge it left by', () => {
    const exit = { x: 10, y: 10 }

    expect(getPaddedExitPoints(exit, 'top')).toEqual([
      { x: 5, y: 15 },
      { x: 15, y: 15 },
    ])
    expect(getPaddedExitPoints(exit, 'bottom')).toEqual([
      { x: 5, y: 5 },
      { x: 15, y: 5 },
    ])
    expect(getPaddedExitPoints(exit, 'left')).toEqual([
      { x: 15, y: 5 },
      { x: 15, y: 15 },
    ])
    expect(getPaddedExitPoints(exit, 'right', 2)).toEqual([
      { x: 8, y: 8 },
      { x: 8, y: 12 },
    ])
  })

  it('lists the corners of a box clockwise from the top left', () => {
    expect(getPointsFromRect(box)).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
      { x: 0, y: 50 },
    ])
  })

  it('lists the convex hull in order from its top-left corner, dropping the points inside', () => {
    const square = [
      { x: 0, y: 10 },
      { x: 5, y: 5 },
      { x: 10, y: 0 },
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 5 },
    ]

    expect(getHull(square)).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 10, y: 10 },
      { x: 10, y: 0 },
    ])
  })

  it('finds the hull of points stacked in a column, whatever order they come in', () => {
    const column = [
      { x: 1, y: 4 },
      { x: 0, y: 2 },
      { x: 0, y: 0 },
      { x: 0, y: 4 },
      { x: 0, y: 3 },
    ]

    expect(getHull(column)).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 4 },
      { x: 1, y: 4 },
    ])
  })

  it('keeps one point once however often it repeats', () => {
    expect(getHull([])).toEqual([])
    expect(getHull([{ x: 1, y: 1 }])).toEqual([{ x: 1, y: 1 }])
    expect(
      getHull([
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ]),
    ).toEqual([{ x: 1, y: 1 }])
  })
})
