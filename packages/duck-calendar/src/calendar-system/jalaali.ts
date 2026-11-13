/**
 * Pure math functions for Gregorian <-> Jalaali (Persian / Solar Hijri) conversion.
 *
 * Based on the public-domain algorithm by Kazimierz M. Borkowski and the
 * jalaali-js implementation (MIT). Zero runtime dependencies.
 *
 * The Persian calendar has 12 months:
 *   - Months 1-6 have 31 days
 *   - Months 7-11 have 30 days
 *   - Month 12 has 29 days (30 in a leap year)
 *
 * Leap years follow 33-year cycles, broken at the years in `BREAKS`.
 */

import { gregorianMonthLength } from './gregorian'

const FIRST_YEAR = -61
const PAST_LAST_YEAR = 3178
const BREAKS = [
  9,
  38,
  199,
  426,
  686,
  756,
  818,
  1111,
  1181,
  1210,
  1635,
  2060,
  2097,
  2192,
  2262,
  2324,
  2394,
  2456,
  PAST_LAST_YEAR,
]

/**
 * Calculate Jalaali calendar constants for a given Jalaali year.
 *
 * @param jy - Jalaali year (-61 to 3177)
 * @returns An object with `leap` (0 to 3, where 0 means leap),
 *   `gy` (Gregorian year of the Nowruz), and `march` (March day of Nowruz).
 */
function jalCal(jy: number): { leap: number; gy: number; march: number } {
  if (jy < FIRST_YEAR || jy >= PAST_LAST_YEAR) throw new RangeError(`Invalid Jalaali year ${jy}`)
  const gy = jy + 621
  let leapJ = -14
  let jp = FIRST_YEAR

  let jump = 0
  for (const jm of BREAKS) {
    jump = jm - jp
    if (jy < jm) break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }

  let n = jy - jp

  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150

  const march = 20 + leapJ - leapG

  // Find how many single years have passed since the last leap.
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33
  const leap = mod(mod(n + 1, 33) - 1, 4)

  return { leap, gy, march }
}

/**
 * Convert a Gregorian date to a Jalaali (Persian) date.
 *
 * @param gy - Gregorian year
 * @param gm - Gregorian month (1-indexed, 1 = January)
 * @param gd - Gregorian day
 * @returns Jalaali `{ jy, jm, jd }` (month is 1-indexed)
 */
export function toJalaali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  if (gm < 1 || gm > 12 || gd < 1 || gd > gregorianMonthLength(gy, gm)) {
    throw new RangeError(`Invalid Gregorian date: ${gy}-${gm}-${gd}`)
  }
  return d2j(g2d(gy, gm, gd))
}

/**
 * Convert a Jalaali (Persian) date to a Gregorian date.
 *
 * @param jy - Jalaali year
 * @param jm - Jalaali month (1-indexed, 1 = Farvardin)
 * @param jd - Jalaali day
 * @returns Gregorian `{ gy, gm, gd }` (month is 1-indexed)
 */
export function toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  if (jm < 1 || jm > 12 || jd < 1 || jd > jalaaliMonthLength(jy, jm)) {
    throw new RangeError(`Invalid Jalaali date: ${jy}-${jm}-${jd}`)
  }
  return d2g(j2d(jy, jm, jd))
}

/**
 * Check if a Jalaali year is a leap year.
 *
 * @param jy - Jalaali year
 * @returns `true` if the year is a leap year
 */
export function isLeapJalaaliYear(jy: number): boolean {
  return jalCal(jy).leap === 0
}

/**
 * Get the number of days in a Jalaali month.
 *
 * @param jy - Jalaali year
 * @param jm - Jalaali month (1-indexed, 1 = Farvardin)
 * @returns Number of days (29, 30, or 31)
 */
export function jalaaliMonthLength(jy: number, jm: number): number {
  if (jm < 1 || jm > 12) return 0
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return isLeapJalaaliYear(jy) ? 30 : 29
}

/** Gregorian date -> Julian Day Number */
function g2d(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
  return d
}

/** Julian Day Number -> Gregorian date */
function d2g(jdn: number): { gy: number; gm: number; gd: number } {
  const j = 4 * jdn + 139361631 + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div(mod(j, 1461), 4) * 5 + 308
  const gd = div(mod(i, 153), 5) + 1
  const gm = mod(div(i, 153), 12) + 1
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return { gy, gm, gd }
}

/** Jalaali date -> Julian Day Number */
function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy)
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

/** Julian Day Number -> Jalaali date */
function d2j(jdn: number): { jy: number; jm: number; jd: number } {
  const gy = d2g(jdn).gy
  let jy = gy - 621
  const r = jalCal(jy)
  const jdn1f = g2d(gy, 3, r.march)
  let jd: number
  let jm: number
  let k = jdn - jdn1f
  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31)
      jd = mod(k, 31) + 1
      return { jy, jm, jd }
    } else {
      k -= 186
    }
  } else {
    jy -= 1
    k += 179
    if (r.leap === 1) k += 1
  }
  jm = 7 + div(k, 30)
  jd = mod(k, 30) + 1
  return { jy, jm, jd }
}

/** Integer division (truncates toward zero) */
function div(a: number, b: number): number {
  return ~~(a / b)
}

/** Positive modulus (always >= 0) */
function mod(a: number, b: number): number {
  return ((a % b) + b) % b
}
