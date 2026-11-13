/**
 * Pure math functions for Gregorian <-> Islamic (Hijri) calendar conversion.
 *
 * Uses the **tabular Islamic calendar** algorithm  -  algorithmic and deterministic,
 * not observation-based. This is the civil tabular calendar (Type II, Friday epoch), Intl's `islamic-civil`.
 *
 * Islamic epoch: July 16, 622 CE (Julian) = July 19, 622 CE (proleptic Gregorian).
 *
 * @module
 */

import { gregorianMonthLength } from './gregorian'

/** Leap years within the 30-year Islamic cycle. */
const LEAP_YEARS = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29]

/**
 * Islamic month names (1-indexed by position).
 */
export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Ula',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
]

/**
 * Check if a Hijri year is a leap year.
 *
 * In the 30-year tabular cycle, years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29
 * are leap years (Dhu al-Hijjah has 30 days instead of 29).
 *
 * @param hy - Hijri year
 * @returns `true` if the year is a leap year
 */
export function isLeapHijriYear(hy: number): boolean {
  return LEAP_YEARS.includes(((((hy - 1) % 30) + 30) % 30) + 1)
}

/**
 * Get the number of days in a Hijri month.
 *
 * Odd months (1, 3, 5, 7, 9, 11) have 30 days.
 * Even months (2, 4, 6, 8, 10) have 29 days.
 * Month 12 (Dhu al-Hijjah) has 29 days in common years and 30 in leap years.
 *
 * @param hy - Hijri year
 * @param hm - Hijri month (1-indexed, 1 = Muharram, 12 = Dhu al-Hijjah)
 * @returns Number of days in the month
 */
export function hijriMonthLength(hy: number, hm: number): number {
  if (hm < 1 || hm > 12) return 0
  if (hm === 12) return isLeapHijriYear(hy) ? 30 : 29
  // Odd months = 30 days, even months = 29 days
  return hm % 2 === 1 ? 30 : 29
}

/**
 * Get the total number of days in a Hijri year.
 *
 * @param hy - Hijri year
 * @returns 355 for leap years, 354 for common years
 */
export function hijriYearLength(hy: number): number {
  return isLeapHijriYear(hy) ? 355 : 354
}

/**
 * Convert a Gregorian date to a Julian Day Number (JDN).
 *
 * @param gy - Gregorian year
 * @param gm - Gregorian month (1-indexed, 1 = January)
 * @param gd - Gregorian day
 * @returns Julian Day Number
 */
function gregorianToJdn(gy: number, gm: number, gd: number): number {
  const a = Math.floor((14 - gm) / 12)
  const y = gy + 4800 - a
  const m = gm + 12 * a - 3
  return (
    gd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  )
}

/**
 * Convert a Julian Day Number (JDN) to a Gregorian date.
 *
 * @param jdn - Julian Day Number
 * @returns Gregorian year, month (1-indexed), and day
 */
function jdnToGregorian(jdn: number): { gy: number; gm: number; gd: number } {
  const a = jdn + 32044
  const b = Math.floor((4 * a + 3) / 146097)
  const c = a - Math.floor((146097 * b) / 4)
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor((1461 * d) / 4)
  const m = Math.floor((5 * e + 2) / 153)
  const gd = e - Math.floor((153 * m + 2) / 5) + 1
  const gm = m + 3 - 12 * Math.floor(m / 10)
  const gy = 100 * b + d - 4800 + Math.floor(m / 10)
  return { gy, gm, gd }
}

/**
 * Convert a Hijri date to a Julian Day Number (JDN).
 *
 * @param hy - Hijri year
 * @param hm - Hijri month (1-indexed)
 * @param hd - Hijri day
 * @returns Julian Day Number
 */
function hijriToJdn(hy: number, hm: number, hd: number): number {
  return Math.floor((11 * hy + 3) / 30) + 354 * hy + 30 * hm - Math.floor((hm - 1) / 2) + hd + 1948440 - 385
}

/**
 * Convert a Julian Day Number (JDN) to a Hijri date.
 *
 * Implements the closed-form tabular Islamic algorithm (Type II, Friday epoch).
 * The constants 10631, 354, 10985, 5316, 17719, 5670, 15238, 709 encode the 30-year
 * leap cycle (10631 days per cycle = 19 * 354 + 11 * 355) and Karl Palmen's tabular
 * month-length formula.
 *
 * Source: Hatcher, D.A. (1986), "Generalized Equations for Julian Day Numbers and
 * Calendar Dates", QJRAS 27, 312-316. Also implemented in the SPSS / Kazimierz M.
 * Borkowski reference code and matches the W3C tabular Islamic calendar.
 *
 * @param jdn - Julian Day Number
 * @returns Hijri year, month (1-indexed), and day
 */
function jdnToHijri(jdn: number): { hy: number; hm: number; hd: number } {
  const l = jdn - 1948440 + 10632
  const n = Math.floor((l - 1) / 10631)
  const remainder = l - 10631 * n + 354
  const j =
    Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
    Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238)
  const adjustedRemainder =
    remainder -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29
  const hm = Math.floor((24 * adjustedRemainder) / 709)
  const hd = adjustedRemainder - Math.floor((709 * hm) / 24)
  const hy = 30 * n + j - 30
  return { hy, hm, hd }
}

/**
 * Convert a Gregorian date to a Hijri (Islamic) date.
 *
 * @param gy - Gregorian year
 * @param gm - Gregorian month (1-indexed, 1 = January)
 * @param gd - Gregorian day
 * @returns Hijri year, month (1-indexed), and day
 *
 * @example
 * ```ts
 * toHijri(2026, 6, 27) // -> { hy: 1448, hm: 1, hd: 11 }
 * ```
 */
export function toHijri(gy: number, gm: number, gd: number): { hy: number; hm: number; hd: number } {
  if (gm < 1 || gm > 12 || gd < 1 || gd > gregorianMonthLength(gy, gm)) {
    throw new RangeError(`Invalid Gregorian date: ${gy}-${gm}-${gd}`)
  }
  const jdn = gregorianToJdn(gy, gm, gd)
  return jdnToHijri(jdn)
}

/**
 * Convert a Hijri (Islamic) date to a Gregorian date.
 *
 * @param hy - Hijri year
 * @param hm - Hijri month (1-indexed, 1 = Muharram)
 * @param hd - Hijri day
 * @returns Gregorian year, month (1-indexed), and day
 *
 * @example
 * ```ts
 * toGregorian(1448, 1, 1) // -> { gy: 2026, gm: 6, gd: 17 }
 * ```
 */
export function toGregorian(hy: number, hm: number, hd: number): { gy: number; gm: number; gd: number } {
  // Validate month before using it to compute day bounds
  if (hm < 1 || hm > 12) {
    throw new RangeError(`Invalid Hijri date: ${hy}-${hm}-${hd}`)
  }
  if (hd < 1 || hd > hijriMonthLength(hy, hm)) {
    throw new RangeError(`Invalid Hijri date: ${hy}-${hm}-${hd}`)
  }
  const jdn = hijriToJdn(hy, hm, hd)
  return jdnToGregorian(jdn)
}
