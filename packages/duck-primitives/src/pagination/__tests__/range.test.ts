import { describe, expect, it } from 'vitest'
import { getPaginationRange } from '../range'

describe('getPaginationRange', () => {
  it('lists every page when they all fit', () => {
    expect(getPaginationRange(3, 5)).toEqual([1, 2, 3, 4, 5])
    expect(getPaginationRange(1, 6)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('lists every page when they all fit a wider window', () => {
    expect(getPaginationRange(1, 8, 2)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(getPaginationRange(1, 8, 1, 2)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('folds as soon as one page does not fit', () => {
    expect(getPaginationRange(1, 8)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 8])
    expect(getPaginationRange(1, 7, 1, 0)).toEqual([1, 2, 3, 4, 'end-ellipsis'])
  })

  it('folds the far end into an ellipsis on the first page', () => {
    expect(getPaginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10])
  })

  it('folds both ends around a page in the middle', () => {
    expect(getPaginationRange(5, 10)).toEqual([1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10])
  })

  it('folds the near end into an ellipsis on the last page', () => {
    expect(getPaginationRange(10, 10)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10])
  })

  it('shows the one page an ellipsis would hide', () => {
    expect(getPaginationRange(4, 9)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 9])
    expect(getPaginationRange(5, 9)).toEqual([1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 9])
  })

  it('keeps the same number of items on every page, so the controls do not shift', () => {
    const lengths = Array.from({ length: 20 }, (_, index) => getPaginationRange(index + 1, 20).length)

    expect(new Set(lengths)).toEqual(new Set([7]))
  })

  it('widens the window with more siblings and boundary pages', () => {
    expect(getPaginationRange(10, 20, 2, 2)).toEqual([1, 2, 'start-ellipsis', 8, 9, 10, 11, 12, 'end-ellipsis', 19, 20])
    expect(getPaginationRange(20, 20, 2, 2)).toEqual([1, 2, 'start-ellipsis', 13, 14, 15, 16, 17, 18, 19, 20])
  })

  it('leaves the ends out with no boundary pages', () => {
    expect(getPaginationRange(5, 10, 1, 0)).toEqual(['start-ellipsis', 4, 5, 6, 'end-ellipsis'])
    expect(getPaginationRange(10, 10, 1, 0)).toEqual(['start-ellipsis', 7, 8, 9, 10])
  })

  it('treats a page past either end as that end', () => {
    expect(getPaginationRange(99, 10)).toEqual(getPaginationRange(10, 10))
    expect(getPaginationRange(0, 10)).toEqual(getPaginationRange(1, 10))
  })

  it('has nothing to list with no pages', () => {
    expect(getPaginationRange(1, 0)).toEqual([])
  })
})
