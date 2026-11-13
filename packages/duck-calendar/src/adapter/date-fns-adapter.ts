import {
  addDays as dfAddDays,
  addMonths as dfAddMonths,
  addYears as dfAddYears,
  endOfMonth as dfEndOfMonth,
  getDate as dfGetDate,
  getDay as dfGetDay,
  getHours as dfGetHours,
  getMinutes as dfGetMinutes,
  getMonth as dfGetMonth,
  getSeconds as dfGetSeconds,
  getYear as dfGetYear,
  isAfter as dfIsAfter,
  isBefore as dfIsBefore,
  isSameDay as dfIsSameDay,
  isSameMonth as dfIsSameMonth,
  isValid as dfIsValid,
  startOfMonth as dfStartOfMonth,
  startOfWeek as dfStartOfWeek,
  set,
  startOfDay,
} from 'date-fns'
import type { Adapter } from './adapter.types'
import { localDate } from './adapter.utils'
import { getCachedFormatter } from './formatter-cache'

/** Backed by `date-fns`. See {@link Adapter.IDateAdapter} for the contract. */
export class DateFnsAdapter implements Adapter.IDateAdapter<Date> {
  today(): Date {
    return startOfDay(new Date())
  }

  create(year: number, month: number, day: number): Date {
    return localDate(year, month, day)
  }

  isValid(date: Date): boolean {
    return dfIsValid(date)
  }

  isSameDay(a: Date, b: Date): boolean {
    return dfIsSameDay(a, b)
  }

  isSameMonth(a: Date, b: Date): boolean {
    return dfIsSameMonth(a, b)
  }

  isBefore(a: Date, b: Date): boolean {
    return dfIsBefore(a, b)
  }

  isAfter(a: Date, b: Date): boolean {
    return dfIsAfter(a, b)
  }

  startOfMonth(date: Date): Date {
    return dfStartOfMonth(date)
  }

  endOfMonth(date: Date): Date {
    return dfEndOfMonth(date)
  }

  /** Walks backward to the given weekStartDay (0=Sunday). */
  startOfWeek(date: Date, weekStartDay: Adapter.WeekStartDay): Date {
    return dfStartOfWeek(date, { weekStartsOn: weekStartDay })
  }

  addDays(date: Date, count: number): Date {
    return dfAddDays(date, count)
  }

  /** Adds months  -  date-fns handles day clamping automatically. */
  addMonths(date: Date, count: number): Date {
    return dfAddMonths(date, count)
  }

  /** Adds years  -  date-fns handles leap-year clamping automatically. */
  addYears(date: Date, count: number): Date {
    return dfAddYears(date, count)
  }

  getYear(date: Date): number {
    return dfGetYear(date)
  }

  getMonth(date: Date): number {
    return dfGetMonth(date)
  }

  getDate(date: Date): number {
    return dfGetDate(date)
  }

  getDayOfWeek(date: Date): Adapter.WeekStartDay {
    return dfGetDay(date) as Adapter.WeekStartDay
  }

  toDate(date: Date): Date {
    return new Date(date.getTime())
  }

  fromDate(date: Date): Date {
    return startOfDay(date)
  }

  format(date: Date, options: Intl.DateTimeFormatOptions, locale?: string): string {
    return getCachedFormatter(locale, options).format(date)
  }

  getHours(date: Date): number {
    return dfGetHours(date)
  }

  getMinutes(date: Date): number {
    return dfGetMinutes(date)
  }

  getSeconds(date: Date): number {
    return dfGetSeconds(date)
  }

  setTime(date: Date, hour: number, minute: number, second?: number): Date {
    return set(date, { hours: hour, minutes: minute, seconds: second ?? 0 })
  }
}
