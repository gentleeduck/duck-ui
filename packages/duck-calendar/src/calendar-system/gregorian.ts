/**
 * Pure helpers for proleptic Gregorian arithmetic.
 *
 * Shared by every non-Gregorian calendar system (Jalaali, Hijri, Hebrew) so the
 * `[31, 28/29, 31, 30, ...]` table and the leap-year rule live in exactly one place.
 */

/**
 * Returns `true` when `y` is a Gregorian leap year (divisible by 4 but not 100,
 * unless also divisible by 400).
 */
export function isGregorianLeap(y: number): boolean {
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)
}

/**
 * Returns the number of days in a Gregorian month.
 *
 * @param gy - Gregorian year
 * @param gm - 1-indexed Gregorian month (1 = January, 12 = December)
 * @returns Days in the month (28-31)
 */
export function gregorianMonthLength(gy: number, gm: number): number {
  if (gm === 2) return isGregorianLeap(gy) ? 29 : 28
  return gm === 4 || gm === 6 || gm === 9 || gm === 11 ? 30 : 31
}
