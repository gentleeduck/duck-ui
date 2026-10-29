import type { IPagination } from './pagination.types'

const pages = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

/**
 * The pages to draw around `page`: `boundaryCount` at each end, `siblingCount` either side of it, and an
 * ellipsis for each gap. The list is the same length on every page, so the controls never shift under the pointer.
 */
export function getPaginationRange(
  page: number,
  pageCount: number,
  siblingCount = 1,
  boundaryCount = 1,
): IPagination.IRangeItem[] {
  if (pageCount <= 2 * (boundaryCount + siblingCount) + 3) return pages(1, pageCount)

  const center = Math.min(
    Math.max(page, boundaryCount + siblingCount + 2),
    pageCount - boundaryCount - siblingCount - 1,
  )
  const before = center - siblingCount - 1
  const after = center + siblingCount + 1

  return [
    ...pages(1, boundaryCount),
    before === boundaryCount + 1 ? before : 'start-ellipsis',
    ...pages(center - siblingCount, center + siblingCount),
    after === pageCount - boundaryCount ? after : 'end-ellipsis',
    ...pages(pageCount - boundaryCount + 1, pageCount),
  ]
}
