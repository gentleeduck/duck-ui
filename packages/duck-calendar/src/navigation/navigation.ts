import type { Adapter } from '../adapter'
import type { Selection } from '../selection'
import type { Navigation } from './navigation.types'

/** Move the view date by one unit in the given direction. */
export function navigate<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  date: TDate,
  direction: Navigation.Direction,
  unit: Navigation.Unit,
): TDate {
  const sign = direction === 'next' ? 1 : -1

  switch (unit) {
    case 'month':
      return adapter.addMonths(date, sign)
    case 'year':
      return adapter.addYears(date, sign)
    case 'decade':
      return adapter.addYears(date, sign * 10)
  }
}

// The first and last day of the month, year or decade a date falls in. A decade runs from a year ending in 0,
// as the decade view draws it.
function period<TDate>(adapter: Adapter.IDateAdapter<TDate>, date: TDate, unit: Navigation.Unit): [TDate, TDate] {
  if (unit === 'month') return [adapter.startOfMonth(date), adapter.endOfMonth(date)]
  const year = adapter.getYear(date)
  const first = unit === 'year' ? year : Math.floor(year / 10) * 10
  // The decade of an adapter's last year runs past it, and a year past it cannot be made.
  const last = Math.min(unit === 'year' ? year : first + 9, adapter.maxYear ?? Number.POSITIVE_INFINITY)
  const lastYear = adapter.create(last, 0, 1)
  const lastMonth = adapter.create(last, (adapter.getMonthsInYear?.(lastYear) ?? 12) - 1, 1)
  return [adapter.create(first, 0, 1), adapter.endOfMonth(lastMonth)]
}

/** Check if the month, year or decade one step away has a day within fromDate/toDate. */
export function canNavigate<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  date: TDate,
  direction: Navigation.Direction,
  unit: Navigation.Unit,
  constraints: Pick<Selection.ISelectionConstraints<TDate>, 'fromDate' | 'toDate'> = {},
): boolean {
  const bound = direction === 'prev' ? constraints.fromDate : constraints.toDate
  if (bound === undefined) return true
  const [start, end] = period(adapter, navigate(adapter, date, direction, unit), unit)
  return direction === 'prev' ? !adapter.isBefore(end, bound) : !adapter.isAfter(start, bound)
}

export function goToNextMonth<TDate>(adapter: Adapter.IDateAdapter<TDate>, current: TDate): TDate {
  return adapter.addMonths(current, 1)
}

export function goToPrevMonth<TDate>(adapter: Adapter.IDateAdapter<TDate>, current: TDate): TDate {
  return adapter.addMonths(current, -1)
}

/**
 * Jumps to a specific month within the same year.
 * @param month - 0-indexed month (0 = January, 11 = December).
 */
export function goToMonth<TDate>(adapter: Adapter.IDateAdapter<TDate>, current: TDate, month: number): TDate {
  return adapter.create(adapter.getYear(current), month, 1)
}

/**
 * Jumps to the same month in a different year.
 */
export function goToYear<TDate>(adapter: Adapter.IDateAdapter<TDate>, current: TDate, year: number): TDate {
  return adapter.create(year, adapter.getMonth(current), 1)
}
