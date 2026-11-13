import { getCachedFormatter } from './formatter-cache'

/** Fast day-level comparison without allocating Date objects. */
function dateToOrdinal(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

// `new Date` reads a year from 0 to 99 as 1900 to 1999.
export function localDate(year: number, month: number, day: number): Date {
  const date = new Date(year, month, day)
  if (year >= 0 && year < 100) date.setFullYear(year, month, day)
  return date
}

export function startOfDay(date: Date): Date {
  const day = new Date(date.getTime())
  day.setHours(0, 0, 0, 0)
  return day
}

export function withTime(date: Date, hour: number, minute: number, second = 0): Date {
  const day = new Date(date.getTime())
  day.setHours(hour, minute, second, 0)
  return day
}

/**
 * Shared `today()` helper for adapters whose date type is the native `Date`.
 * Returns midnight local time (year/month/day with no time component) so that
 * the returned reference is comparable with other adapters' midnight outputs.
 */
export function nativeToday(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Builds an Intl locale tag with the specified calendar extension.
 * Handles replacing existing `-ca-` tags or appending `-u-ca-<calendar>`.
 */
// Pattern matches `-ca-<value>` segments in a Unicode extension. Calendar subtags
// (e.g. `islamic-civil`) use 3+ char segments; Unicode extension keys are exactly
// 2 chars, so anchoring on `[a-z]{3,}` for continuation segments stops cleanly
// before the next key. Lengths are bounded by valid BCP 47 subtag rules
// (max 8 chars each), eliminating any ReDoS exposure on hostile inputs.
const CA_TAG_REGEX = /-ca-[a-z]{1,8}(?:-[a-z]{3,8}){0,8}/
const NU_TAG_REGEX = /-nu-[a-z]{1,8}(?:-[a-z]{3,8}){0,8}/

export function buildCalendarLocaleTag(locale: string, calendar: string): string {
  const calTag = `-ca-${calendar}`
  if (locale.includes(calTag)) return locale
  if (locale.includes('-ca-')) {
    return locale.replace(CA_TAG_REGEX, calTag)
  }
  if (locale.includes('-u-')) {
    return `${locale}${calTag}`
  }
  return `${locale}-u-ca-${calendar}`
}

/**
 * Creates a single-slot per-adapter-instance cache for Gregorian-to-calendar
 * conversions, keyed by date ordinal.
 *
 * **Hit pattern (intentional):** the 3 sequential calls `getYear` / `getMonth` /
 * `getDate` on the same date hit the cache 2/3 times. Every cursor advance in
 * `buildCalendarMonth` invalidates the slot, so cross-cell sharing only happens
 * for repeated reads on the same cell.
 *
 * **Not** a multi-slot LRU. Two adapter instances on the same page get separate
 * slots (via the `WeakMap` keyed by instance), but a single adapter rendering
 * two months in the same React tree will thrash on every advance. If that
 * becomes a hot path, replace this with an ordinal-keyed LRU.
 */
export function createConversionCache<T>(convert: (date: Date) => T): {
  get(instance: object, date: Date): T
} {
  const map = new WeakMap<object, { ord: number; parts: T }>()
  return {
    get(instance: object, date: Date): T {
      const ord = dateToOrdinal(date)
      const cached = map.get(instance)
      if (cached && cached.ord === ord) return cached.parts
      const parts = convert(date)
      map.set(instance, { ord, parts })
      return parts
    },
  }
}

/**
 * Formats a date using Intl.DateTimeFormat with a specific calendar system.
 * Handles locale tag construction and formatter caching.
 *
 * @param numberingSystem - Optional Unicode numbering system (e.g. 'arabext' for Persian).
 *   Appends `-nu-<value>` to the locale tag if not already present.
 */
export function formatWithCalendar(
  date: Date,
  options: Intl.DateTimeFormatOptions,
  baseLocale: string,
  calendar: string,
  locale?: string,
  numberingSystem?: string,
): string {
  const loc = locale ?? baseLocale
  let tag = buildCalendarLocaleTag(loc, calendar)
  if (numberingSystem) {
    const nuTag = `-nu-${numberingSystem}`
    if (!tag.includes(nuTag)) {
      if (tag.includes('-nu-')) {
        tag = tag.replace(NU_TAG_REGEX, nuTag)
      } else {
        tag = `${tag}${nuTag}`
      }
    }
  }
  return getCachedFormatter(tag, options).format(date)
}
