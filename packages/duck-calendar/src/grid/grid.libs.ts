import type { Adapter } from '../adapter'
import { isGregorianLeap } from '../calendar-system/gregorian'
import type { Grid } from './grid.types'

type IntlWeekInfo = { firstDay: number; weekend: number[] }

const DEFAULT_WEEK: Grid.IWeekInfo = { firstDay: 0, weekend: [0, 6] }
const WEEK_INFO = new Map<string, Grid.IWeekInfo>()

/**
 * The first day and the weekend of `locale`'s week, read from `Intl.Locale`. With no locale, or a
 * runtime that cannot describe it, the week starts on Sunday and its weekend is Saturday and Sunday.
 */
export function getLocaleWeekInfo(locale: string | undefined): Grid.IWeekInfo {
  if (!locale) return DEFAULT_WEEK
  let info = WEEK_INFO.get(locale)
  if (info) return info
  info = DEFAULT_WEEK
  try {
    const intl = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => IntlWeekInfo; weekInfo?: IntlWeekInfo }
    const week = intl.getWeekInfo?.() ?? intl.weekInfo
    if (week)
      info = {
        firstDay: (week.firstDay % 7) as Grid.IWeekInfo['firstDay'],
        weekend: week.weekend.map((day) => day % 7),
      }
  } catch {
    // An invalid tag throws here; it keeps the default week, as the formatters fall back too.
  }
  WEEK_INFO.set(locale, info)
  return info
}

/**
 * Returns 7 localized weekday names starting from `weekStartDay`.
 *
 * @param adapter      - Any DateAdapter instance (used only for date construction).
 * @param locale       - BCP 47 locale tag. Falls back to runtime default.
 * @param weekStartDay - The day the week starts on (0 = Sunday).
 * @param format       - Intl weekday format. Defaults to `'short'`.
 */
export function getLocalizedWeekdays<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  locale: string | undefined,
  weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0,
  format: 'long' | 'short' | 'narrow' = 'short',
): string[] {
  // Use a known Gregorian Sunday (Jan 5 2025) via fromDate to avoid calendar-system issues
  const KNOWN_SUNDAY = adapter.fromDate(new Date(2025, 0, 5))

  return Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (weekStartDay + i) % 7
    const date = adapter.addDays(KNOWN_SUNDAY, dayIndex)
    return adapter.format(date, { weekday: format }, locale)
  })
}

/**
 * Returns localized month names for the given year.
 *
 * Queries the adapter for the actual month count via `getMonthsInYear()`
 * to support calendar systems with variable months (e.g. Hebrew leap years
 * with 13 months). Falls back to 12 for adapters that don't implement it.
 *
 * @param adapter - Any DateAdapter instance.
 * @param year    - The year to query month count for.
 * @param locale  - BCP 47 locale tag. Falls back to runtime default.
 * @param format  - Intl month format. Defaults to `'long'`.
 */
export function getLocalizedMonthNames<TDate>(
  adapter: Adapter.IDateAdapter<TDate>,
  year: number,
  locale: string | undefined,
  format: 'long' | 'short' | 'narrow' = 'long',
): string[] {
  const probe = adapter.create(year, 0, 1)
  const monthCount = adapter.getMonthsInYear?.(probe) ?? 12

  return Array.from({ length: monthCount }, (_, month) => {
    const date = adapter.create(year, month, 1)
    return adapter.format(date, { month: format }, locale)
  })
}

// Cumulative day-of-year offsets at the start of each month (0-indexed).
const NON_LEAP_OFFSETS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
const LEAP_OFFSETS = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]

/**
 * Computes the ISO 8601 week number for a given date.
 * Week 1 is the week containing the first Thursday of the year.
 *
 * Pure integer arithmetic on the date's `(year, month, day)` triple  -  no
 * intermediate `Date` allocations. The previous implementation allocated two
 * native `Date` objects per call (plus one via `adapter.toDate`); this version
 * touches only the native `Date` returned by `adapter.toDate`.
 *
 * @param adapter - Any DateAdapter instance.
 * @param date    - The date to compute the week number for.
 */
export function getWeekNumber<TDate>(adapter: Adapter.IDateAdapter<TDate>, date: TDate): number {
  const native = adapter.toDate(date)
  const y = native.getFullYear()
  const m = native.getMonth() // 0-indexed
  const d = native.getDate()
  const jsDow = native.getDay() // 0=Sun..6=Sat
  const isoDow = jsDow === 0 ? 7 : jsDow

  // Ordinal day-of-year for the current date.
  const offsets = isGregorianLeap(y) ? LEAP_OFFSETS : NON_LEAP_OFFSETS
  const dayOfYear = offsets[m] + d

  // Day-of-year of the nearest Thursday (same ISO week as `date`).
  // This may land in y-1 (week 52/53) or y+1 (week 1).
  const thursdayDayOfYear = dayOfYear + 4 - isoDow

  if (thursdayDayOfYear < 1) {
    // Thursday is in the previous year; count weeks from there.
    const prevYear = y - 1
    const prevYearDays = isGregorianLeap(prevYear) ? 366 : 365
    return Math.ceil((thursdayDayOfYear + prevYearDays) / 7)
  }
  const currentYearDays = isGregorianLeap(y) ? 366 : 365
  if (thursdayDayOfYear > currentYearDays) {
    // Thursday is in the next year  -  always week 1.
    return Math.ceil((thursdayDayOfYear - currentYearDays) / 7)
  }
  return Math.ceil(thursdayDayOfYear / 7)
}
