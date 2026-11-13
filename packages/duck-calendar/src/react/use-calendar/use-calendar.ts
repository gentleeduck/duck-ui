import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Grid } from '../../grid'
import { buildCalendarMonth, buildMultiMonth, getLocaleWeekInfo, getLocalizedWeekdays } from '../../grid'
import type { Calendar } from '../../index.types'
import { canNavigate, navigate } from '../../navigation'
import type { Selection } from '../../selection'
import {
  applySelection,
  findUnavailableDay,
  isDateDisabled,
  isDateUnavailable,
  isSelectionInvalid,
  selectDay,
} from '../../selection'
import {
  buildDateDisabledMessage,
  buildDateSelectedMessage,
  buildMonthNavigationMessage,
  buildRangeSelectedMessage,
  useAnnouncer,
} from '../use-announcer'
import { useKeyboard } from '../use-keyboard'
import { useControllableState } from '../utils/use-controllable-state'
import {
  buildDayProps,
  buildGridProps,
  buildHeaderProps,
  buildNavProps,
  emptySelectionValue,
  initialFocusFromSelected,
  pageHolding,
  pageTarget,
  resolveFocusTarget,
} from './use-calendar.libs'
import type { UseCalendar } from './use-calendar.types'

export function useCalendar<TDate, M extends Selection.SelectionMode = 'single'>(
  config: UseCalendar.IUseCalendarConfig<TDate, M>,
): UseCalendar.IUseCalendarReturn<TDate, M> {
  const {
    adapter,
    mode,
    locale,
    month: controlledMonth,
    defaultMonth,
    selected: controlledSelected,
    defaultSelected,
    onSelect,
    onMonthChange,
    numberOfMonths = 1,
    showOutsideDays = true,
    fixedWeeks = false,
    disabled,
    fromDate,
    toDate,
    unavailable,
    readOnly = false,
    invalid = false,
    pageBehavior = 'single',
  } = config
  const pageSize = pageBehavior === 'visible' ? Math.max(1, numberOfMonths) : 1

  const headerId = useId()
  const gridId = useId()

  // Declared early so `announce` is available to selectDate below.
  const announcer = useAnnouncer()
  const { announce } = announcer

  const initialMonth = defaultMonth ?? controlledMonth ?? adapter.today()

  const [month, setMonthState] = useControllableState<TDate>(controlledMonth, initialMonth, onMonthChange)

  const initialValue: Selection.CalendarValue<TDate, M> = defaultSelected ?? emptySelectionValue<TDate, M>(mode)

  const [value, setValue] = useControllableState<Selection.CalendarValue<TDate, M>>(
    controlledSelected,
    initialValue,
    onSelect,
  )

  const [lastFocused, setFocusedDate] = useState<TDate>(
    () => initialFocusFromSelected(mode, controlledSelected ?? defaultSelected) ?? adapter.today(),
  )
  const [viewMode, setViewMode] = useState<Calendar.ViewMode>('days')

  // Callers MUST stabilize `disabled` — inline predicate/literal forces months memo recompute.
  const constraints: Selection.ISelectionConstraints<TDate> = useMemo(
    () => ({ disabled, fromDate, toDate, unavailable }),
    [fromDate, toDate, disabled, unavailable],
  )

  const isDisabledFn = useCallback((date: TDate) => isDateDisabled(adapter, date, constraints), [adapter, constraints])

  // Primitives extracted so memo deps stay stable.
  const localeTag = locale?.locale
  const weekStartDay = locale?.weekStartDay ?? getLocaleWeekInfo(localeTag).firstDay
  const localeDirection = locale?.direction

  const months: Grid.ICalendarMonth<TDate>[] = useMemo(() => {
    const gridConfig = {
      showOutsideDays,
      fixedWeeks,
      locale: { locale: localeTag, weekStartDay, direction: localeDirection },
    }
    const rawMonths =
      numberOfMonths <= 1
        ? [buildCalendarMonth(adapter, month, gridConfig)]
        : buildMultiMonth(adapter, month, numberOfMonths, gridConfig)

    return rawMonths.map((m) => ({
      ...m,
      weeks: applySelection(m.weeks, adapter, mode, value, constraints),
    }))
  }, [
    adapter,
    month,
    mode,
    value,
    constraints,
    showOutsideDays,
    fixedWeeks,
    localeTag,
    weekStartDay,
    localeDirection,
    numberOfMonths,
  ])

  const focusedDate = useMemo(() => resolveFocusTarget(adapter, months, lastFocused), [adapter, months, lastFocused])

  // First month's weeks for backward compat
  const weeks = months[0].weeks

  const weekdays = useMemo(
    () => getLocalizedWeekdays(adapter, localeTag, weekStartDay, 'short'),
    [adapter, localeTag, weekStartDay],
  )

  const nextPage = useMemo(
    () =>
      pageSize === 1
        ? canNavigate(adapter, month, 'next', 'month', { fromDate, toDate })
          ? navigate(adapter, month, 'next', 'month')
          : null
        : pageTarget(adapter, month, 'next', pageSize, { fromDate, toDate }),
    [adapter, month, pageSize, fromDate, toDate],
  )
  const previousPage = useMemo(
    () =>
      pageSize === 1
        ? canNavigate(adapter, month, 'prev', 'month', { fromDate, toDate })
          ? navigate(adapter, month, 'prev', 'month')
          : null
        : pageTarget(adapter, month, 'prev', pageSize, { fromDate, toDate }),
    [adapter, month, pageSize, fromDate, toDate],
  )
  const canGoNext = nextPage !== null
  const canGoPrevious = previousPage !== null

  const goToNext = useCallback(() => {
    if (nextPage !== null) setMonthState(nextPage)
  }, [nextPage, setMonthState])

  const goToPrevious = useCallback(() => {
    if (previousPage !== null) setMonthState(previousPage)
  }, [previousPage, setMonthState])

  const setMonth = useCallback((next: TDate) => setMonthState(next), [setMonthState])

  const selectDate = useCallback(
    (date: TDate, options?: { shiftKey?: boolean }) => {
      if (readOnly) return
      const refuse = (day: TDate) =>
        announce(buildDateDisabledMessage(adapter.format(day, { month: 'long', day: 'numeric' }, localeTag)))
      if (isDisabledFn(date) || isDateUnavailable(adapter, date, constraints)) return refuse(date)
      const open =
        mode === 'range'
          ? (value as Selection.DateRange<TDate> | null)
          : mode === 'multi-range'
            ? (value as Selection.DateRange<TDate>[]).at(-1)
            : undefined
      if (open && open.to === null && !options?.shiftKey) {
        const blocked = findUnavailableDay(adapter, open.from, date, constraints)
        if (blocked !== null) return refuse(blocked)
      }
      setValue(selectDay(adapter, mode, value, date, options))
    },
    [adapter, mode, value, setValue, isDisabledFn, constraints, readOnly, localeTag, announce],
  )

  const isInvalid = useMemo(
    () => invalid || isSelectionInvalid(adapter, mode, value, constraints),
    [invalid, adapter, mode, value, constraints],
  )

  // Announce on month change.
  const prevMonthRef = useRef<TDate | null>(null)
  useEffect(() => {
    if (prevMonthRef.current !== null && !adapter.isSameMonth(prevMonthRef.current, month)) {
      announce(
        buildMonthNavigationMessage(
          adapter.format(month, { month: 'long' }, localeTag),
          adapter.format(month, { year: 'numeric' }, localeTag),
        ),
      )
    }
    prevMonthRef.current = month
  }, [month, adapter, announce, localeTag])

  // Announce on value change
  const prevValueRef = useRef<Selection.CalendarValue<TDate, M> | null>(null)
  useEffect(() => {
    if (prevValueRef.current === value) return
    prevValueRef.current = value

    if (value === null) return

    const fmt = (d: TDate) => adapter.format(d, { month: 'long', day: 'numeric' }, localeTag)

    if (mode === 'single' && value !== null) {
      announce(buildDateSelectedMessage(fmt(value as TDate)))
    } else if (mode === 'range') {
      const range = value as Selection.DateRange<TDate> | null
      if (range?.to) {
        announce(buildRangeSelectedMessage(fmt(range.from), fmt(range.to)))
      }
    }
  }, [value, mode, adapter, announce, localeTag])

  const rafRef = useRef<number>(0)
  // Read when the frame runs rather than cancelled on unmount: StrictMode replays the cleanup on a calendar that
  // stays mounted, and a key pressed before that replay would lose its focus.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleFocusChange = useCallback(
    (date: TDate) => {
      setFocusedDate(date)
      const first = months[0].month
      const last = months[months.length - 1].month
      if (adapter.isBefore(date, adapter.startOfMonth(first)) || adapter.isAfter(date, adapter.endOfMonth(last))) {
        setMonthState(
          pageSize > 1
            ? pageHolding(adapter, first, pageSize, date)
            : adapter.isBefore(date, first)
              ? adapter.startOfMonth(date)
              : adapter.addMonths(adapter.startOfMonth(date), 1 - months.length),
        )
      }
      // Keyboard moves only. Every grid of this calendar carries the same id and a sibling
      // calendar's grids do not; a calendar whose grid lacks the id searches the page.
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        if (!mountedRef.current) return
        const day = '[data-calendar-day][data-focused="true"]'
        const el =
          document.querySelector<HTMLElement>(`[data-calendar-grid="${gridId}"] ${day}`) ??
          document.querySelector<HTMLElement>(day)
        el?.focus({ preventScroll: true })
      })
    },
    [adapter, months, pageSize, setMonthState, gridId],
  )

  const keyboard = useKeyboard({
    focusedDate,
    onFocusChange: handleFocusChange,
    onSelect: selectDate,
    onDismiss: config.onDismiss,
    isDisabled: isDisabledFn,
    adapter,
    weekStartDay,
    pageSize,
    direction: localeDirection,
  })

  const getDayProps = useCallback(
    (day: Grid.ICalendarDay<TDate>) =>
      buildDayProps(day, focusedDate, adapter, selectDate, setFocusedDate, keyboard.onKeyDown, localeTag, isInvalid),
    [focusedDate, adapter, selectDate, keyboard.onKeyDown, localeTag, isInvalid],
  )

  const getGridProps = useCallback(
    () => buildGridProps(headerId, gridId, readOnly, isInvalid),
    [headerId, gridId, readOnly, isInvalid],
  )

  const getNavProps = useCallback(
    (direction: 'prev' | 'next') => buildNavProps(direction, canGoPrevious, canGoNext, goToPrevious, goToNext),
    [canGoPrevious, canGoNext, goToPrevious, goToNext],
  )

  const getHeaderProps = useCallback(() => buildHeaderProps(headerId), [headerId])

  return {
    state: { month, value, focusedDate, viewMode, weeks, months, weekdays, canGoNext, canGoPrevious, isInvalid },
    actions: {
      setMonth,
      setViewMode,
      goToNext,
      goToPrevious,
      selectDate,
      focusDate: setFocusedDate,
    },
    getDayProps,
    getGridProps,
    getNavProps,
    getHeaderProps,
    announcer,
  }
}
