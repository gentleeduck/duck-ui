import type { Selection } from '@gentleduck/calendar'
import type * as React from 'react'
import type { ICalendarProps, ICalendarSelectionValue } from './calendar.types'

const MAX_CACHE_SIZE = 20

/** Cache Intl.NumberFormat instances to avoid recreating formatters on every render. */
const NUMBER_FORMAT_CACHE = new Map<string, Intl.NumberFormat>()

export function callCalendarSelectHandler(
  mode: Selection.SelectionMode,
  onSelect: NonNullable<ICalendarProps['onSelect']>,
  value: ICalendarSelectionValue,
) {
  switch (mode) {
    case 'range':
      return (onSelect as NonNullable<ICalendarProps.IRange['onSelect']>)(value as ICalendarSelectionValue<'range'>)
    case 'multi':
      return (onSelect as NonNullable<ICalendarProps.IMulti['onSelect']>)(value as ICalendarSelectionValue<'multi'>)
    case 'multi-range':
      return (onSelect as NonNullable<ICalendarProps.IMultiRange['onSelect']>)(
        value as ICalendarSelectionValue<'multi-range'>,
      )
    case 'single':
      return (onSelect as NonNullable<ICalendarProps.ISingle['onSelect']>)(value as ICalendarSelectionValue<'single'>)
  }
}

export function getCachedNumberFormat(locale: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = options ? `${locale}|${JSON.stringify(options)}` : locale
  let fmt = NUMBER_FORMAT_CACHE.get(key)
  if (fmt) {
    // LRU: move to end
    NUMBER_FORMAT_CACHE.delete(key)
    NUMBER_FORMAT_CACHE.set(key, fmt)
    return fmt
  }
  // Evict oldest if at capacity
  if (NUMBER_FORMAT_CACHE.size >= MAX_CACHE_SIZE) {
    for (const oldest of NUMBER_FORMAT_CACHE.keys()) {
      NUMBER_FORMAT_CACHE.delete(oldest)
      break
    }
  }
  fmt = new Intl.NumberFormat(locale, options)
  NUMBER_FORMAT_CACHE.set(key, fmt)
  return fmt
}

// The ones and tens, each a letter, for the days of a month: 1 to 31.
const HEBREW_ONES = '\u05D0\u05D1\u05D2\u05D3\u05D4\u05D5\u05D6\u05D7\u05D8'
const HEBREW_TENS = '\u05D9\u05DB\u05DC'

/** A day of the month in Hebrew numerals: one letter takes a geresh, two take a gershayim before the last. */
export function toHebrewNumeral(day: number): string {
  // 15 and 16 are written 9 + 6 and 9 + 7, since 10 + 5 and 10 + 6 spell the name of God.
  if (day === 15) return '\u05D8\u05F4\u05D5'
  if (day === 16) return '\u05D8\u05F4\u05D6'
  const tens = HEBREW_TENS.charAt(Math.floor(day / 10) - 1)
  const ones = HEBREW_ONES.charAt((day % 10) - 1)
  return tens && ones ? `${tens}\u05F4${ones}` : `${tens}${ones}\u05F3`
}

export function formatDayNumber(day: number, locale?: string): React.ReactNode {
  if (!locale) return day
  if (locale.startsWith('ar')) return getCachedNumberFormat(`${locale}-u-nu-arab`).format(day)
  if (locale.startsWith('he')) return toHebrewNumeral(day)
  return getCachedNumberFormat(locale).format(day)
}
