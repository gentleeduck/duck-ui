import type { Adapter } from '../adapter'

export namespace Grid {
  /** A single day cell in the calendar grid. */
  export interface ICalendarDay<TDate> {
    /** The date this cell represents. */
    date: TDate
    /** Whether this date is today. */
    isToday: boolean
    /** Whether this date is selected. Filled by `applySelection()`. */
    isSelected: boolean
    /** Whether this date is disabled (constraints). Filled by `applySelection()`. */
    isDisabled: boolean
    /** Whether this date stays focusable but cannot be picked. Filled by `applySelection()`. */
    isUnavailable: boolean
    /** Whether this date belongs to the previous or next month. */
    isOutside: boolean
    /** Whether this day should be hidden (outside day when `showOutsideDays` is false). */
    isHidden: boolean
    /** Whether this date is Saturday or Sunday. */
    isWeekend: boolean
    /** Whether this date is the start of a selected range. Filled by `applySelection()`. */
    isRangeStart: boolean
    /** Whether this date is the end of a selected range. */
    isRangeEnd: boolean
    /** Whether this date is between the start and end of a selected range. */
    isRangeMiddle: boolean
  }

  /** A single row (week) in the calendar grid. */
  export interface ICalendarWeek<TDate> {
    /** ISO week number. */
    weekNumber: number
    /** The 7 days in this week. Always exactly 7 items. */
    days: ICalendarDay<TDate>[]
  }

  /** A full month grid ready to render. */
  export interface ICalendarMonth<TDate> {
    /** The first day of this month. */
    month: TDate
    /** The weeks in this month (5 or 6 depending on `fixedWeeks`). */
    weeks: ICalendarWeek<TDate>[]
  }

  /** How a locale's week runs, Sunday = 0. */
  export interface IWeekInfo {
    firstDay: Adapter.WeekStartDay
    weekend: number[]
  }

  /** A month entry for the year picker view. */
  export interface IYearEntry {
    /** Month index, 0-indexed (Jan = 0). */
    month: number
    /** Localized month name. */
    label: string
    /** Whether this is the current month. */
    isCurrent: boolean
  }

  /** A year entry for the decade picker view. */
  export interface IDecadeEntry {
    /** Full year number. */
    year: number
    /** Whether this is the current year. */
    isCurrent: boolean
  }
}
