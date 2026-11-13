import {
  hebrewMonthLength,
  hebrewMonthsInYear,
  hebrewToGregorian,
  isLeapHebrewYear,
  toHebrew,
} from '../calendar-system/hebrew'
import type { Adapter } from './adapter.types'
import {
  createConversionCache,
  formatWithCalendar,
  localDate,
  nativeToday,
  startOfDay,
  withTime,
} from './adapter.utils'

const hebrewCache = createConversionCache((date: Date) =>
  toHebrew(date.getFullYear(), date.getMonth() + 1, date.getDate()),
)

// The month a place in one year names, at its place in another. A leap year's Adar I and Adar II are both Adar
// in a common year, a common year's Adar is Adar II in a leap year, and the months after Adar move one place.
function sameMonthPlace(hy: number, hm: number, year: number): number {
  const leap = isLeapHebrewYear(hy)
  if (hm <= 5 || leap === isLeapHebrewYear(year)) return hm
  return leap ? Math.max(6, hm - 1) : hm + 1
}

/**
 * Hebrew calendar-aware adapter backed by native `Date`.
 * `create(year, month, day)` takes a 0-indexed Hebrew month (0 = Tishrei,
 * 5 = Adar I, 6 = Adar II in leap years, 12 = Elul). Default locale: `'he-IL'`.
 */
export class HebrewAdapter implements Adapter.IDateAdapter<Date> {
  private readonly locale: string

  constructor(locale = 'he-IL') {
    this.locale = locale
  }

  /** Convert a native Date to its Hebrew parts (cached per-instance). */
  private hebrew(date: Date): { hy: number; hm: number; hd: number } {
    return hebrewCache.get(this, date)
  }

  /** Build a native Date from Hebrew parts (month is 1-indexed internally). */
  private fromHebrew(hy: number, hm: number, hd: number): Date {
    const { gy, gm, gd } = hebrewToGregorian(hy, hm, hd)
    return localDate(gy, gm - 1, gd)
  }

  today(): Date {
    return nativeToday()
  }

  /**
   * Creates a date from Hebrew year, month (0-indexed), and day.
   *
   * @param year  - Hebrew year (e.g. 5786)
   * @param month - 0-indexed Hebrew month (0 = Tishrei, 12 = Elul)
   * @param day   - Day of the Hebrew month (1-30)
   */
  create(year: number, month: number, day: number): Date {
    return this.fromHebrew(year, month + 1, day)
  }

  isValid(date: Date): boolean {
    return !isNaN(date.getTime())
  }

  isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  isSameMonth(a: Date, b: Date): boolean {
    const ha = this.hebrew(a)
    const hb = this.hebrew(b)
    return ha.hy === hb.hy && ha.hm === hb.hm
  }

  isBefore(a: Date, b: Date): boolean {
    return a.getTime() < b.getTime()
  }

  isAfter(a: Date, b: Date): boolean {
    return a.getTime() > b.getTime()
  }

  startOfMonth(date: Date): Date {
    const { hy, hm } = this.hebrew(date)
    return this.fromHebrew(hy, hm, 1)
  }

  endOfMonth(date: Date): Date {
    const { hy, hm } = this.hebrew(date)
    return this.fromHebrew(hy, hm, hebrewMonthLength(hy, hm))
  }

  startOfWeek(date: Date, weekStartDay: Adapter.WeekStartDay): Date {
    const d = startOfDay(date)
    const diff = (d.getDay() - weekStartDay + 7) % 7
    d.setDate(d.getDate() - diff)
    return d
  }

  addDays(date: Date, count: number): Date {
    const d = startOfDay(date)
    d.setDate(d.getDate() + count)
    return d
  }

  addMonths(date: Date, count: number): Date {
    const { hy, hm, hd } = this.hebrew(date)
    // 19-year Metonic cycle: 235 months across 19 years. Use that to jump in cycle
    // chunks for very large `count`, then walk year-by-year for the residual.
    // Result is at most ~14 iterations regardless of `count` (previously O(count)).
    let totalMonths = hm - 1 + count
    let newYear = hy

    if (totalMonths >= 235 || totalMonths <= -235) {
      // Each full Metonic cycle covers exactly 235 months and 19 years.
      const cycles = Math.trunc(totalMonths / 235)
      newYear += cycles * 19
      totalMonths -= cycles * 235
    }

    if (totalMonths >= 0) {
      while (totalMonths >= hebrewMonthsInYear(newYear)) {
        totalMonths -= hebrewMonthsInYear(newYear)
        newYear++
      }
    } else {
      while (totalMonths < 0) {
        newYear--
        totalMonths += hebrewMonthsInYear(newYear)
      }
    }

    const newMonth = totalMonths + 1
    const maxDay = hebrewMonthLength(newYear, newMonth)
    return this.fromHebrew(newYear, newMonth, Math.min(hd, maxDay))
  }

  addYears(date: Date, count: number): Date {
    const { hy, hm, hd } = this.hebrew(date)
    const newYear = hy + count
    const newMonth = sameMonthPlace(hy, hm, newYear)
    const maxDay = hebrewMonthLength(newYear, newMonth)
    return this.fromHebrew(newYear, newMonth, Math.min(hd, maxDay))
  }

  getYear(date: Date): number {
    return this.hebrew(date).hy
  }

  getMonth(date: Date): number {
    return this.hebrew(date).hm - 1
  }

  getMonthsInYear(date: Date): number {
    return hebrewMonthsInYear(this.hebrew(date).hy)
  }

  getDate(date: Date): number {
    return this.hebrew(date).hd
  }

  getDayOfWeek(date: Date): Adapter.WeekStartDay {
    return date.getDay() as Adapter.WeekStartDay
  }

  toDate(date: Date): Date {
    return new Date(date.getTime())
  }

  fromDate(date: Date): Date {
    return startOfDay(date)
  }

  format(date: Date, options: Intl.DateTimeFormatOptions, locale?: string): string {
    return formatWithCalendar(date, options, this.locale, 'hebrew', locale)
  }

  getHours(date: Date): number {
    return date.getHours()
  }

  getMinutes(date: Date): number {
    return date.getMinutes()
  }

  getSeconds(date: Date): number {
    return date.getSeconds()
  }

  setTime(date: Date, hour: number, minute: number, second?: number): Date {
    return withTime(date, hour, minute, second)
  }
}
