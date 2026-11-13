import type React from 'react'
import type { Adapter } from '../../adapter'
import type { Grid } from '../../grid'
import type { Selection } from '../../selection'
import type { UseCalendar } from './use-calendar.types'

/**
 * Empty initial value for `useControllableState` per selection mode.
 * - `multi` / `multi-range` start as `[]`
 * - `single` / `range` start as `null`
 *
 * Hides the mode-discriminated cast in one place so callers stay clean.
 */
export function emptySelectionValue<TDate, M extends Selection.SelectionMode>(
  mode: M,
): Selection.CalendarValue<TDate, M> {
  if (mode === 'multi' || mode === 'multi-range') {
    return [] as Selection.CalendarValue<TDate, M>
  }
  return null as Selection.CalendarValue<TDate, M>
}

/**
 * Pick the initial focused date from a selection value, narrowing the
 * mode-discriminated `CalendarValue` to a concrete `TDate`.
 * Returns `null` if no date can be derived (multi/multi-range/empty).
 */
export function initialFocusFromSelected<TDate, M extends Selection.SelectionMode>(
  mode: M,
  selected: Selection.CalendarValue<TDate, M> | undefined,
): TDate | null {
  if (selected == null) return null
  if (mode === 'single') {
    return selected as unknown as TDate
  }
  if (mode === 'range') {
    return (selected as unknown as Selection.DateRange<TDate>).from
  }
  // multi / multi-range: don't auto-focus the first selected item to avoid
  // jumping the user's view unexpectedly.
  return null
}

/**
 * The day the grid's one tab stop sits on: the focused day while a shown month holds it, else the
 * first selected day, today, or the first day that can be picked. Days drawn from a neighbouring
 * month never take it, so two months showing one week still give one stop.
 */
export function resolveFocusTarget<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  months: Grid.ICalendarMonth<TDate>[],
  focused: TDate | null,
): TDate {
  let selected: TDate | undefined
  let today: TDate | undefined
  let first: TDate | undefined
  for (const month of months) {
    for (const week of month.weeks) {
      for (const day of week.days) {
        if (day.isOutside || day.isDisabled) continue
        if (focused !== null && adapter.isSameDay(day.date, focused)) return focused
        if (day.isSelected) selected ??= day.date
        if (day.isToday) today ??= day.date
        first ??= day.date
      }
    }
  }
  return selected ?? today ?? first ?? focused ?? adapter.today()
}

/** `page` moved, if it must be, so its `size` months stay inside `fromDate` and `toDate`, as the nav buttons keep it. */
export function clampPage<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  page: TDate,
  size: number,
  { fromDate, toDate }: { fromDate?: TDate | undefined; toDate?: TDate | undefined },
): TDate {
  const last = toDate === undefined ? undefined : adapter.addMonths(adapter.startOfMonth(toDate), 1 - size)
  if (last !== undefined && adapter.isAfter(page, last)) page = last
  const first = fromDate === undefined ? undefined : adapter.startOfMonth(fromDate)
  if (first !== undefined && adapter.isBefore(page, first)) page = first
  return page
}

export function buildDayProps<TDate>(
  day: Grid.ICalendarDay<TDate>,
  focusedDate: TDate,
  adapter: Adapter.IDateAdapter<TDate>,
  selectDate: (date: TDate, options?: { shiftKey?: boolean }) => void,
  focusDate: (date: TDate) => void,
  onKeyDown: React.KeyboardEventHandler,
  locale?: string,
  isInvalid = false,
): UseCalendar.IDayProps {
  const isFocused = !day.isOutside && adapter.isSameDay(day.date, focusedDate)
  const invalid = isInvalid && (day.isSelected || day.isRangeMiddle) ? true : undefined

  return {
    role: 'gridcell',
    'aria-label': adapter.format(day.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }, locale),
    'aria-selected': day.isSelected,
    'aria-disabled': day.isDisabled || day.isUnavailable,
    'aria-invalid': invalid,
    'aria-current': day.isToday ? 'date' : undefined,
    tabIndex: isFocused ? 0 : -1,
    'data-calendar-day': '',
    'data-selected': day.isSelected ? 'true' : undefined,
    'data-today': day.isToday ? 'true' : undefined,
    'data-disabled': day.isDisabled ? 'true' : undefined,
    'data-unavailable': day.isUnavailable ? 'true' : undefined,
    'data-invalid': invalid && 'true',
    'data-outside-month': day.isOutside ? 'true' : undefined,
    'data-hidden': day.isHidden ? 'true' : undefined,
    'data-range-middle': day.isRangeMiddle ? 'true' : undefined,
    'data-range-start': day.isRangeStart ? 'true' : undefined,
    'data-range-end': day.isRangeEnd ? 'true' : undefined,
    'data-focused': isFocused ? 'true' : undefined,
    'data-weekend': day.isWeekend ? 'true' : undefined,
    onClick: (e?: { shiftKey?: boolean }) => selectDate(day.date, e?.shiftKey ? { shiftKey: true } : undefined),
    onMouseEnter: () => focusDate(day.date),
    onKeyDown,
  }
}

export function buildGridProps(
  headerId: string,
  gridId: string,
  readOnly = false,
  isInvalid = false,
): UseCalendar.IGridProps {
  return {
    role: 'grid',
    'aria-labelledby': headerId,
    'aria-roledescription': 'calendar',
    'aria-readonly': readOnly || undefined,
    'data-readonly': readOnly ? 'true' : undefined,
    'data-invalid': isInvalid ? 'true' : undefined,
    'data-calendar-grid': gridId,
  }
}

export function buildNavProps(
  direction: 'prev' | 'next',
  canGoPrevious: boolean,
  canGoNext: boolean,
  goToPrevious: () => void,
  goToNext: () => void,
  prevLabel?: string,
  nextLabel?: string,
): UseCalendar.INavProps {
  return {
    'aria-label': direction === 'prev' ? (prevLabel ?? 'Go to previous month') : (nextLabel ?? 'Go to next month'),
    disabled: direction === 'prev' ? !canGoPrevious : !canGoNext,
    onClick: direction === 'prev' ? goToPrevious : goToNext,
  }
}

export function buildHeaderProps(headerId: string): UseCalendar.IHeaderProps {
  return {
    id: headerId,
    'aria-live': 'polite',
  }
}

/**
 * The first shown month after paging every shown month in `direction`, kept so no page starts
 * before `fromDate`'s month or ends after `toDate`'s, or `null` when no page is left that way.
 */
export function pageTarget<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  month: TDate,
  direction: 'prev' | 'next',
  size: number,
  { fromDate, toDate }: { fromDate?: TDate | undefined; toDate?: TDate | undefined },
): TDate | null {
  const start = adapter.startOfMonth(month)
  if (direction === 'next') {
    const target = adapter.addMonths(start, size)
    if (toDate === undefined) return target
    const last = adapter.addMonths(adapter.startOfMonth(toDate), 1 - size)
    if (!adapter.isAfter(last, start)) return null
    return adapter.isAfter(target, last) ? last : target
  }
  const target = adapter.addMonths(start, -size)
  if (fromDate === undefined) return target
  const first = adapter.startOfMonth(fromDate)
  if (!adapter.isBefore(first, start)) return null
  return adapter.isBefore(target, first) ? first : target
}

/** The first month of the page of `size` months, counted from `start`, that holds `date`. */
export function pageHolding<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  start: TDate,
  size: number,
  date: TDate,
): TDate {
  let page = adapter.startOfMonth(start)
  while (adapter.isAfter(date, adapter.endOfMonth(adapter.addMonths(page, size - 1))))
    page = adapter.addMonths(page, size)
  while (adapter.isBefore(date, page)) page = adapter.addMonths(page, -size)
  return page
}
