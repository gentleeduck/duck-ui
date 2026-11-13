import { jalaaliMonthLength, toGregorian, toJalaali } from '../calendar-system'
import type { Adapter } from './adapter.types'
import {
  createConversionCache,
  formatWithCalendar,
  localDate,
  nativeToday,
  startOfDay,
  withTime,
} from './adapter.utils'

const persianCache = createConversionCache((date: Date) =>
  toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate()),
)

/** Persian (Jalaali / Solar Hijri) calendar-aware adapter backed by native `Date`. */
export class PersianAdapter implements Adapter.IDateAdapter<Date> {
  readonly maxYear = 3176
  private readonly locale: string

  constructor(locale = 'fa-IR') {
    this.locale = locale
  }

  today(): Date {
    return nativeToday()
  }

  /**
   * Creates a date from Persian calendar parts.
   *
   * @param year  - Persian year (e.g. 1404)
   * @param month - **0-indexed** Persian month (0 = Farvardin, 11 = Esfand)
   * @param day   - Day of the Persian month (1-31)
   */
  create(year: number, month: number, day: number): Date {
    const { gy, gm, gd } = toGregorian(year, month + 1, day)
    return localDate(gy, gm - 1, gd)
  }

  isValid(date: Date): boolean {
    return !isNaN(date.getTime())
  }

  /** Convert a native Date to its Jalaali parts (cached per-instance). */
  private persian(date: Date): { jy: number; jm: number; jd: number } {
    return persianCache.get(this, date)
  }

  getYear(date: Date): number {
    return this.persian(date).jy
  }

  /** 0-indexed Persian month (0 = Farvardin). */
  getMonth(date: Date): number {
    return this.persian(date).jm - 1
  }

  getDate(date: Date): number {
    return this.persian(date).jd
  }

  isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  /** Compares in Persian calendar space, not Gregorian. */
  isSameMonth(a: Date, b: Date): boolean {
    const ja = this.persian(a)
    const jb = this.persian(b)
    return ja.jy === jb.jy && ja.jm === jb.jm
  }

  isBefore(a: Date, b: Date): boolean {
    return a.getTime() < b.getTime()
  }

  isAfter(a: Date, b: Date): boolean {
    return a.getTime() > b.getTime()
  }

  /** First Gregorian day of the Persian month that contains `date`. */
  startOfMonth(date: Date): Date {
    const { jy, jm } = this.persian(date)
    const { gy, gm, gd } = toGregorian(jy, jm, 1)
    return localDate(gy, gm - 1, gd)
  }

  /** Last Gregorian day of the Persian month that contains `date`. */
  endOfMonth(date: Date): Date {
    const { jy, jm } = this.persian(date)
    const len = jalaaliMonthLength(jy, jm)
    const { gy, gm, gd } = toGregorian(jy, jm, len)
    return localDate(gy, gm - 1, gd)
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

  /** Persian month arithmetic with day clamping for the 30/31-day asymmetry. */
  addMonths(date: Date, count: number): Date {
    const { jy, jm, jd } = this.persian(date)
    const totalMonths = jy * 12 + (jm - 1) + count
    const newJy = Math.floor(totalMonths / 12)
    // ((n % d) + d) % d handles negative modulo correctly.
    const newJm = (((totalMonths % 12) + 12) % 12) + 1
    const maxDay = jalaaliMonthLength(newJy, newJm)
    const newJd = Math.min(jd, maxDay)
    const { gy, gm, gd } = toGregorian(newJy, newJm, newJd)
    return localDate(gy, gm - 1, gd)
  }

  /** Esfand 30 in a leap year clamps to 29 in a non-leap year. */
  addYears(date: Date, count: number): Date {
    const { jy, jm, jd } = this.persian(date)
    const newJy = jy + count
    const maxDay = jalaaliMonthLength(newJy, jm)
    const newJd = Math.min(jd, maxDay)
    const { gy, gm, gd } = toGregorian(newJy, jm, newJd)
    return localDate(gy, gm - 1, gd)
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

  /**
   * Formats using `Intl.DateTimeFormat` with the Persian calendar extension.
   * Appends `-u-ca-persian-nu-arabext` to the locale tag for correct rendering.
   */
  format(date: Date, options: Intl.DateTimeFormatOptions, locale?: string): string {
    return formatWithCalendar(date, options, this.locale, 'persian', locale, 'arabext')
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
