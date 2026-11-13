import type { Adapter } from '../adapter'
import type { Selection } from './selection.types'

/**
 * Returns `true` when `date` should be non-interactive.
 *
 * Checks in order:
 * 1. Predicate / array from `constraints.disabled`
 * 2. Before `constraints.fromDate`
 * 3. After `constraints.toDate`
 */
export function isDateDisabled<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  date: TDate,
  constraints: Selection.ISelectionConstraints<TDate>,
): boolean {
  const { disabled, fromDate, toDate } = constraints

  if (matches(adapter, date, disabled)) return true
  if (fromDate && adapter.isBefore(date, fromDate)) return true
  if (toDate && adapter.isAfter(date, toDate)) return true

  return false
}

/** Returns `true` when `date` stays focusable but cannot be picked. */
export function isDateUnavailable<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  date: TDate,
  constraints: Selection.ISelectionConstraints<TDate>,
): boolean {
  return matches(adapter, date, constraints.unavailable)
}

/** The first unavailable day from `from` to `to`, both included, or `null`. */
export function findUnavailableDay<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  from: TDate,
  to: TDate,
  constraints: Selection.ISelectionConstraints<TDate>,
): TDate | null {
  if (!constraints.unavailable) return null
  const [start, end] = adapter.isBefore(to, from) ? [to, from] : [from, to]
  for (let day = start; !adapter.isAfter(day, end); day = adapter.addDays(day, 1)) {
    if (isDateUnavailable(adapter, day, constraints)) return day
  }
  return null
}

/** Returns `true` when the selection holds a day that cannot be picked, or a range spanning an unavailable one. */
export function isSelectionInvalid<TDate, M extends Selection.SelectionMode>(
  adapter: Adapter.IDateAdapter<TDate>,
  mode: M,
  value: Selection.CalendarValue<TDate, M>,
  constraints: Selection.ISelectionConstraints<TDate>,
): boolean {
  if (value === null) return false
  const unpickable = (from: TDate, to: TDate) =>
    isDateDisabled(adapter, from, constraints) ||
    isDateDisabled(adapter, to, constraints) ||
    findUnavailableDay(adapter, from, to, constraints) !== null
  switch (mode) {
    case 'single':
      return unpickable(value as TDate, value as TDate)
    case 'multi':
      return (value as TDate[]).some((date) => unpickable(date, date))
    default: {
      const ranges = (mode === 'range' ? [value] : value) as Selection.DateRange<TDate>[]
      return ranges.some((range) => unpickable(range.from, range.to ?? range.from))
    }
  }
}

function matches<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  date: TDate,
  matcher: TDate[] | ((date: TDate) => boolean) | undefined,
): boolean {
  if (!matcher) return false
  return typeof matcher === 'function' ? matcher(date) : matcher.some((d) => adapter.isSameDay(d, date))
}

/**
 * Returns `true` when `date` falls inside `range` (inclusive on both ends).
 * Returns `false` when `range.to` is null (range is still being selected).
 */
export function isInRange<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  date: TDate,
  range: Selection.DateRange<TDate>,
): boolean {
  if (range.to === null) return false

  const { from, to } = range

  // normalise so from is always the earlier end
  const [start, end] = adapter.isBefore(from, to) ? [from, to] : [to, from]

  return (
    (adapter.isSameDay(date, start) || adapter.isAfter(date, start)) &&
    (adapter.isSameDay(date, end) || adapter.isBefore(date, end))
  )
}
