import { hijriMonthLength, toGregorian, toHijri } from '../calendar-system/hijri'
import type { Adapter } from './adapter.types'
import {
  createConversionCache,
  formatWithCalendar,
  localDate,
  nativeToday,
  startOfDay,
  withTime,
} from './adapter.utils'

const hijriCache = createConversionCache((date: Date) =>
  toHijri(date.getFullYear(), date.getMonth() + 1, date.getDate()),
)

/**
 * Islamic (Hijri tabular) calendar-aware adapter backed by native `Date`.
 * `create(year, month, day)` takes a 0-indexed Hijri month
 * (0 = Muharram, 11 = Dhu al-Hijjah). Default locale: `'ar-SA'`.
 */
export class IslamicAdapter implements Adapter.IDateAdapter<Date> {
  private readonly locale: string

  constructor(locale = 'ar-SA') {
    this.locale = locale
  }

  /** Convert a native Date to its Hijri parts (cached per-instance). */
  private hijri(date: Date): { hy: number; hm: number; hd: number } {
    return hijriCache.get(this, date)
  }

  /** Build a native Date from Hijri parts (month is 1-indexed internally). */
  private fromHijri(hy: number, hm: number, hd: number): Date {
    const { gy, gm, gd } = toGregorian(hy, hm, hd)
    return localDate(gy, gm - 1, gd)
  }

  today(): Date {
    return nativeToday()
  }

  /**
   * Creates a date from Hijri year, month (0-indexed), and day.
   *
   * @param year  - Hijri year (e.g. 1447)
   * @param month - 0-indexed Hijri month (0 = Muharram, 11 = Dhu al-Hijjah)
   * @param day   - Day of the Hijri month (1-30)
   */
  /** `month` is 0-indexed externally; converted to 1-indexed for the Hijri core. */
  create(year: number, month: number, day: number): Date {
    return this.fromHijri(year, month + 1, day)
  }

  isValid(date: Date): boolean {
    return !isNaN(date.getTime())
  }

  isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  isSameMonth(a: Date, b: Date): boolean {
    const ha = this.hijri(a)
    const hb = this.hijri(b)
    return ha.hy === hb.hy && ha.hm === hb.hm
  }

  isBefore(a: Date, b: Date): boolean {
    return a.getTime() < b.getTime()
  }

  isAfter(a: Date, b: Date): boolean {
    return a.getTime() > b.getTime()
  }

  startOfMonth(date: Date): Date {
    const { hy, hm } = this.hijri(date)
    return this.fromHijri(hy, hm, 1)
  }

  endOfMonth(date: Date): Date {
    const { hy, hm } = this.hijri(date)
    return this.fromHijri(hy, hm, hijriMonthLength(hy, hm))
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

  /** Hijri month arithmetic with day clamping for short months. */
  addMonths(date: Date, count: number): Date {
    const { hy, hm, hd } = this.hijri(date)
    const totalMonths = (hy - 1) * 12 + (hm - 1) + count
    const newYear = Math.floor(totalMonths / 12) + 1
    // ((n % d) + d) % d handles negative modulo correctly.
    const newMonth = (((totalMonths % 12) + 12) % 12) + 1
    const maxDay = hijriMonthLength(newYear, newMonth)
    return this.fromHijri(newYear, newMonth, Math.min(hd, maxDay))
  }

  /** Dhu al-Hijjah 30 in a leap year clamps to 29 in a non-leap year. */
  addYears(date: Date, count: number): Date {
    const { hy, hm, hd } = this.hijri(date)
    const newYear = hy + count
    const maxDay = hijriMonthLength(newYear, hm)
    return this.fromHijri(newYear, hm, Math.min(hd, maxDay))
  }

  getYear(date: Date): number {
    return this.hijri(date).hy
  }

  /** 0-indexed Hijri month (0 = Muharram). */
  getMonth(date: Date): number {
    return this.hijri(date).hm - 1
  }

  getDate(date: Date): number {
    return this.hijri(date).hd
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

  /** Appends `-u-ca-islamic` to the locale tag so `Intl` renders Hijri names/numerals. */
  format(date: Date, options: Intl.DateTimeFormatOptions, locale?: string): string {
    return formatWithCalendar(date, options, this.locale, 'islamic', locale)
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
