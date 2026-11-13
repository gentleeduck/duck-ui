import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { Adapter } from './adapter.types'
import { localDate } from './adapter.utils'
import { getCachedFormatter } from './formatter-cache'

function daysInMonth(year: number, month: number): number {
  return localDate(year, month + 1, 0).getDate()
}

/**
 * Backed by `dayjs`. See {@link Adapter.IDateAdapter} for the contract.
 * dayjs builds month boundaries with `new Date(year, ...)`, which reads a year from 0 to 99 as 1900 to 1999,
 * so the month arithmetic here is its own.
 */
export class DayjsAdapter implements Adapter.IDateAdapter<Dayjs> {
  today(): Dayjs {
    return dayjs().startOf('day')
  }

  create(year: number, month: number, day: number): Dayjs {
    return dayjs(localDate(year, month, day)).startOf('day')
  }

  isValid(date: Dayjs): boolean {
    return date.isValid()
  }

  isSameDay(a: Dayjs, b: Dayjs): boolean {
    return a.isSame(b, 'day')
  }

  isSameMonth(a: Dayjs, b: Dayjs): boolean {
    return a.isSame(b, 'month')
  }

  isBefore(a: Dayjs, b: Dayjs): boolean {
    return a.isBefore(b)
  }

  isAfter(a: Dayjs, b: Dayjs): boolean {
    return a.isAfter(b)
  }

  startOfMonth(date: Dayjs): Dayjs {
    return date.date(1).startOf('day')
  }

  endOfMonth(date: Dayjs): Dayjs {
    return date.date(daysInMonth(date.year(), date.month())).startOf('day')
  }

  startOfWeek(date: Dayjs, weekStartDay: Adapter.WeekStartDay): Dayjs {
    const diff = (date.day() - weekStartDay + 7) % 7
    return date.subtract(diff, 'day').startOf('day')
  }

  addDays(date: Dayjs, count: number): Dayjs {
    return date.add(count, 'day')
  }

  addMonths(date: Dayjs, count: number): Dayjs {
    const months = date.month() + count
    const year = date.year() + Math.floor(months / 12)
    const month = ((months % 12) + 12) % 12
    const moved = date.toDate()
    moved.setFullYear(year, month, Math.min(date.date(), daysInMonth(year, month)))
    return dayjs(moved)
  }

  addYears(date: Dayjs, count: number): Dayjs {
    return this.addMonths(date, count * 12)
  }

  getYear(date: Dayjs): number {
    return date.year()
  }

  getMonth(date: Dayjs): number {
    return date.month()
  }

  getDate(date: Dayjs): number {
    return date.date()
  }

  getDayOfWeek(date: Dayjs): Adapter.WeekStartDay {
    return date.day() as Adapter.WeekStartDay
  }

  toDate(date: Dayjs): Date {
    return date.toDate()
  }

  fromDate(date: Date): Dayjs {
    return dayjs(date).startOf('day')
  }

  format(date: Dayjs, options: Intl.DateTimeFormatOptions, locale?: string): string {
    return getCachedFormatter(locale, options).format(date.toDate())
  }

  getHours(date: Dayjs): number {
    return date.hour()
  }

  getMinutes(date: Dayjs): number {
    return date.minute()
  }

  getSeconds(date: Dayjs): number {
    return date.second()
  }

  setTime(date: Dayjs, hour: number, minute: number, second?: number): Dayjs {
    return date
      .hour(hour)
      .minute(minute)
      .second(second ?? 0)
  }
}
