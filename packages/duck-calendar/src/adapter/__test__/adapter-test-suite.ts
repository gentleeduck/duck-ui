import { beforeEach, describe, expect, it } from 'vitest'

import type { Adapter } from '../adapter.types'

/**
 * Shared parameterized test suite for any DateAdapter implementation.
 *
 * Call this from your adapter's test file to verify it conforms to the
 * DateAdapter contract. Every adapter must pass every test.
 *
 * @param name          - Display name shown in the test runner (e.g. "NativeAdapter").
 * @param createAdapter - Factory that returns a fresh adapter instance per test.
 * @param createDate    - Factory that builds the adapter's date type from calendar parts.
 */
export function runAdapterTests<TDate>(
  name: string,
  createAdapter: () => Adapter.IDateAdapter<TDate>,
  createDate: (year: number, month: number, day: number, hour?: number, minute?: number, second?: number) => TDate,
) {
  describe(name, () => {
    let adapter: Adapter.IDateAdapter<TDate>

    beforeEach(() => {
      adapter = createAdapter()
    })

    describe('today', () => {
      it('returns a valid date', () => {
        expect(adapter.isValid(adapter.today())).toBe(true)
      })

      it('strips time to midnight (hours/minutes/seconds are 0)', () => {
        const t = adapter.today()
        expect(adapter.getHours(t)).toBe(0)
        expect(adapter.getMinutes(t)).toBe(0)
        expect(adapter.getSeconds(t)).toBe(0)
      })

      it('matches the current calendar date', () => {
        const now = new Date()
        const t = adapter.today()
        expect(adapter.getYear(t)).toBe(now.getFullYear())
        expect(adapter.getMonth(t)).toBe(now.getMonth())
        expect(adapter.getDate(t)).toBe(now.getDate())
      })
    })

    describe('create', () => {
      it('creates a valid date from year, month, day', () => {
        const d = adapter.create(2026, 2, 17)
        expect(adapter.isValid(d)).toBe(true)
        expect(adapter.getYear(d)).toBe(2026)
        expect(adapter.getMonth(d)).toBe(2)
        expect(adapter.getDate(d)).toBe(17)
      })

      it('month is 0-indexed (0 = January)', () => {
        expect(adapter.getMonth(adapter.create(2026, 0, 1))).toBe(0)
        expect(adapter.getMonth(adapter.create(2026, 11, 31))).toBe(11)
      })

      it('strips time to midnight', () => {
        const d = adapter.create(2026, 0, 1)
        expect(adapter.getHours(d)).toBe(0)
        expect(adapter.getMinutes(d)).toBe(0)
        expect(adapter.getSeconds(d)).toBe(0)
      })
    })

    describe('isValid', () => {
      it('returns true for a valid date', () => {
        expect(adapter.isValid(adapter.create(2026, 2, 17))).toBe(true)
      })

      it('returns false for an invalid date', () => {
        expect(adapter.isValid(adapter.fromDate(new Date('not a date')))).toBe(false)
      })
    })

    describe('isSameDay', () => {
      it('same date returns true', () => {
        const a = adapter.create(2026, 2, 17)
        const b = adapter.create(2026, 2, 17)
        expect(adapter.isSameDay(a, b)).toBe(true)
      })

      it('different day returns false', () => {
        expect(adapter.isSameDay(adapter.create(2026, 2, 17), adapter.create(2026, 2, 18))).toBe(false)
      })

      it('different month returns false', () => {
        expect(adapter.isSameDay(adapter.create(2026, 2, 17), adapter.create(2026, 3, 17))).toBe(false)
      })

      it('different year returns false', () => {
        expect(adapter.isSameDay(adapter.create(2026, 2, 17), adapter.create(2025, 2, 17))).toBe(false)
      })

      it('ignores time component', () => {
        const a = createDate(2026, 2, 17, 8, 0, 0)
        const b = createDate(2026, 2, 17, 23, 59, 59)
        expect(adapter.isSameDay(a, b)).toBe(true)
      })
    })

    describe('isSameMonth', () => {
      it('same month returns true', () => {
        expect(adapter.isSameMonth(adapter.create(2026, 2, 1), adapter.create(2026, 2, 31))).toBe(true)
      })

      it('different month returns false', () => {
        expect(adapter.isSameMonth(adapter.create(2026, 2, 17), adapter.create(2026, 3, 17))).toBe(false)
      })

      it('same month different year returns false', () => {
        expect(adapter.isSameMonth(adapter.create(2026, 2, 17), adapter.create(2025, 2, 17))).toBe(false)
      })

      it('ignores day', () => {
        expect(adapter.isSameMonth(adapter.create(2026, 5, 1), adapter.create(2026, 5, 30))).toBe(true)
      })
    })

    describe('isBefore', () => {
      it('earlier date isBefore later date', () => {
        expect(adapter.isBefore(adapter.create(2026, 0, 1), adapter.create(2026, 0, 2))).toBe(true)
      })

      it('same date returns false', () => {
        const d = adapter.create(2026, 0, 1)
        expect(adapter.isBefore(d, adapter.create(2026, 0, 1))).toBe(false)
      })

      it('later date isBefore earlier date returns false', () => {
        expect(adapter.isBefore(adapter.create(2026, 0, 2), adapter.create(2026, 0, 1))).toBe(false)
      })

      it('works across months', () => {
        expect(adapter.isBefore(adapter.create(2026, 0, 31), adapter.create(2026, 1, 1))).toBe(true)
      })

      it('works across years', () => {
        expect(adapter.isBefore(adapter.create(2025, 11, 31), adapter.create(2026, 0, 1))).toBe(true)
      })
    })

    describe('isAfter', () => {
      it('later date isAfter earlier date', () => {
        expect(adapter.isAfter(adapter.create(2026, 0, 2), adapter.create(2026, 0, 1))).toBe(true)
      })

      it('same date returns false', () => {
        const d = adapter.create(2026, 0, 1)
        expect(adapter.isAfter(d, adapter.create(2026, 0, 1))).toBe(false)
      })

      it('earlier date isAfter later date returns false', () => {
        expect(adapter.isAfter(adapter.create(2026, 0, 1), adapter.create(2026, 0, 2))).toBe(false)
      })

      it('works across months', () => {
        expect(adapter.isAfter(adapter.create(2026, 1, 1), adapter.create(2026, 0, 31))).toBe(true)
      })

      it('works across years', () => {
        expect(adapter.isAfter(adapter.create(2026, 0, 1), adapter.create(2025, 11, 31))).toBe(true)
      })
    })

    describe('startOfMonth', () => {
      it('returns day 1', () => {
        const d = adapter.startOfMonth(adapter.create(2026, 2, 17))
        expect(adapter.getDate(d)).toBe(1)
        expect(adapter.getMonth(d)).toBe(2)
        expect(adapter.getYear(d)).toBe(2026)
      })

      it('already on day 1 returns day 1', () => {
        const d = adapter.startOfMonth(adapter.create(2026, 2, 1))
        expect(adapter.getDate(d)).toBe(1)
      })

      it('preserves month and year', () => {
        const d = adapter.startOfMonth(adapter.create(2026, 11, 25))
        expect(adapter.getMonth(d)).toBe(11)
        expect(adapter.getYear(d)).toBe(2026)
      })
    })

    describe('endOfMonth', () => {
      it('returns last day of a 31-day month (March)', () => {
        expect(adapter.getDate(adapter.endOfMonth(adapter.create(2026, 2, 1)))).toBe(31)
      })

      it('returns last day of a 30-day month (April)', () => {
        expect(adapter.getDate(adapter.endOfMonth(adapter.create(2026, 3, 1)))).toBe(30)
      })

      it('February non-leap year returns 28', () => {
        expect(adapter.getDate(adapter.endOfMonth(adapter.create(2026, 1, 1)))).toBe(28)
      })

      it('February leap year returns 29', () => {
        expect(adapter.getDate(adapter.endOfMonth(adapter.create(2024, 1, 1)))).toBe(29)
      })

      it('preserves month and year', () => {
        const d = adapter.endOfMonth(adapter.create(2026, 6, 15))
        expect(adapter.getMonth(d)).toBe(6)
        expect(adapter.getYear(d)).toBe(2026)
      })
    })

    describe('startOfWeek', () => {
      // 2026-03-17 is a Tuesday (dayOfWeek = 2)

      it('weekStartDay=0 (Sunday): walks back to Sunday', () => {
        const tuesday = adapter.create(2026, 2, 17)
        const d = adapter.startOfWeek(tuesday, 0)
        expect(adapter.getDayOfWeek(d)).toBe(0)
        expect(adapter.getDate(d)).toBe(15) // Mar 15 is Sunday
      })

      it('weekStartDay=1 (Monday): walks back to Monday', () => {
        const tuesday = adapter.create(2026, 2, 17)
        const d = adapter.startOfWeek(tuesday, 1)
        expect(adapter.getDayOfWeek(d)).toBe(1)
        expect(adapter.getDate(d)).toBe(16) // Mar 16 is Monday
      })

      it('already on start day returns same date', () => {
        const monday = adapter.create(2026, 2, 16)
        const d = adapter.startOfWeek(monday, 1)
        expect(adapter.getDate(d)).toBe(16)
      })

      it('Sunday with weekStartDay=1 walks back 6 days', () => {
        const sunday = adapter.create(2026, 2, 15)
        const d = adapter.startOfWeek(sunday, 1)
        expect(adapter.getDate(d)).toBe(9) // Mon Mar 9
      })

      it('crosses month boundary when needed', () => {
        const wednesday = adapter.create(2026, 3, 1) // Apr 1 is Wednesday
        const d = adapter.startOfWeek(wednesday, 0)
        expect(adapter.getMonth(d)).toBe(2) // walks back to March
      })
    })

    describe('addDays', () => {
      it('adds positive days', () => {
        const d = adapter.addDays(adapter.create(2026, 2, 17), 5)
        expect(adapter.getDate(d)).toBe(22)
      })

      it('adds negative days (subtract)', () => {
        const d = adapter.addDays(adapter.create(2026, 2, 17), -5)
        expect(adapter.getDate(d)).toBe(12)
      })

      it('crosses month boundary', () => {
        const d = adapter.addDays(adapter.create(2026, 2, 30), 2) // Mar 30 + 2 = Apr 1
        expect(adapter.getMonth(d)).toBe(3)
        expect(adapter.getDate(d)).toBe(1)
      })

      it('crosses year boundary', () => {
        const d = adapter.addDays(adapter.create(2026, 11, 31), 1)
        expect(adapter.getYear(d)).toBe(2027)
        expect(adapter.getMonth(d)).toBe(0)
        expect(adapter.getDate(d)).toBe(1)
      })

      it('adding 0 days returns the same date', () => {
        const d = adapter.addDays(adapter.create(2026, 2, 17), 0)
        expect(adapter.getDate(d)).toBe(17)
        expect(adapter.getMonth(d)).toBe(2)
      })

      it('does not mutate the input', () => {
        const original = adapter.create(2026, 2, 17)
        adapter.addDays(original, 10)
        expect(adapter.getDate(original)).toBe(17)
      })
    })

    describe('addMonths', () => {
      it('adds 1 month', () => {
        const d = adapter.addMonths(adapter.create(2026, 0, 15), 1)
        expect(adapter.getMonth(d)).toBe(1)
        expect(adapter.getDate(d)).toBe(15)
      })

      it('subtracts 1 month', () => {
        const d = adapter.addMonths(adapter.create(2026, 2, 15), -1)
        expect(adapter.getMonth(d)).toBe(1)
      })

      it('Dec + 1 = Jan next year', () => {
        const d = adapter.addMonths(adapter.create(2026, 11, 1), 1)
        expect(adapter.getYear(d)).toBe(2027)
        expect(adapter.getMonth(d)).toBe(0)
      })

      it('Jan - 1 = Dec prev year', () => {
        const d = adapter.addMonths(adapter.create(2026, 0, 1), -1)
        expect(adapter.getYear(d)).toBe(2025)
        expect(adapter.getMonth(d)).toBe(11)
      })

      it('day clamping: Jan 31 + 1 month = Feb 28 (non-leap)', () => {
        const d = adapter.addMonths(adapter.create(2026, 0, 31), 1)
        expect(adapter.getMonth(d)).toBe(1)
        expect(adapter.getDate(d)).toBe(28)
      })

      it('day clamping: Jan 31 + 1 month = Feb 29 (leap year)', () => {
        const d = adapter.addMonths(adapter.create(2024, 0, 31), 1)
        expect(adapter.getMonth(d)).toBe(1)
        expect(adapter.getDate(d)).toBe(29)
      })

      it('adds multiple months', () => {
        const d = adapter.addMonths(adapter.create(2026, 0, 15), 6)
        expect(adapter.getMonth(d)).toBe(6)
        expect(adapter.getYear(d)).toBe(2026)
      })

      it('does not mutate the input', () => {
        const original = adapter.create(2026, 0, 31)
        adapter.addMonths(original, 1)
        expect(adapter.getMonth(original)).toBe(0)
        expect(adapter.getDate(original)).toBe(31)
      })
    })

    describe('addYears', () => {
      it('adds 1 year', () => {
        const d = adapter.addYears(adapter.create(2026, 2, 17), 1)
        expect(adapter.getYear(d)).toBe(2027)
        expect(adapter.getMonth(d)).toBe(2)
        expect(adapter.getDate(d)).toBe(17)
      })

      it('subtracts 1 year', () => {
        const d = adapter.addYears(adapter.create(2026, 2, 17), -1)
        expect(adapter.getYear(d)).toBe(2025)
      })

      it('Feb 29 in leap year + 1 = Feb 28', () => {
        const d = adapter.addYears(adapter.create(2024, 1, 29), 1)
        expect(adapter.getYear(d)).toBe(2025)
        expect(adapter.getMonth(d)).toBe(1)
        expect(adapter.getDate(d)).toBe(28)
      })

      it('Feb 29 leap to leap keeps 29', () => {
        const d = adapter.addYears(adapter.create(2024, 1, 29), 4)
        expect(adapter.getYear(d)).toBe(2028)
        expect(adapter.getDate(d)).toBe(29)
      })

      it('adds multiple years', () => {
        const d = adapter.addYears(adapter.create(2026, 2, 17), 10)
        expect(adapter.getYear(d)).toBe(2036)
      })

      it('does not mutate the input', () => {
        const original = adapter.create(2024, 1, 29)
        adapter.addYears(original, 1)
        expect(adapter.getYear(original)).toBe(2024)
        expect(adapter.getDate(original)).toBe(29)
      })
    })

    describe('getYear', () => {
      it('returns the full year', () => {
        expect(adapter.getYear(adapter.create(2026, 2, 17))).toBe(2026)
      })

      it('works for different centuries', () => {
        expect(adapter.getYear(adapter.create(1999, 0, 1))).toBe(1999)
      })
    })

    describe('getMonth', () => {
      it('returns 0-indexed month', () => {
        expect(adapter.getMonth(adapter.create(2026, 0, 1))).toBe(0)
        expect(adapter.getMonth(adapter.create(2026, 11, 1))).toBe(11)
      })

      it('returns correct month for mid-year', () => {
        expect(adapter.getMonth(adapter.create(2026, 6, 15))).toBe(6)
      })
    })

    describe('getDate', () => {
      it('returns day of month', () => {
        expect(adapter.getDate(adapter.create(2026, 2, 17))).toBe(17)
      })

      it('returns 1 for first day', () => {
        expect(adapter.getDate(adapter.create(2026, 0, 1))).toBe(1)
      })

      it('returns 31 for last day of 31-day month', () => {
        expect(adapter.getDate(adapter.create(2026, 0, 31))).toBe(31)
      })
    })

    describe('getDayOfWeek', () => {
      it('returns 2 for Tuesday March 17 2026', () => {
        expect(adapter.getDayOfWeek(adapter.create(2026, 2, 17))).toBe(2)
      })

      it('returns 0 for Sunday', () => {
        expect(adapter.getDayOfWeek(adapter.create(2026, 2, 15))).toBe(0)
      })

      it('returns 6 for Saturday', () => {
        expect(adapter.getDayOfWeek(adapter.create(2026, 2, 14))).toBe(6)
      })

      it('returns 1 for Monday', () => {
        expect(adapter.getDayOfWeek(adapter.create(2026, 2, 16))).toBe(1)
      })
    })

    describe('getMonthsInYear', () => {
      it('returns 12 by default (or adapter-specific count)', () => {
        const d = adapter.create(2026, 0, 1)
        const count = adapter.getMonthsInYear?.(d) ?? 12
        expect(count).toBeGreaterThanOrEqual(12)
        expect(count).toBeLessThanOrEqual(13)
      })
    })

    describe('getHours', () => {
      it('returns correct hour from datetime', () => {
        const d = createDate(2026, 2, 17, 14, 30, 45)
        expect(adapter.getHours(d)).toBe(14)
      })

      it('returns 0 for midnight', () => {
        const d = createDate(2026, 2, 17, 0, 0, 0)
        expect(adapter.getHours(d)).toBe(0)
      })
    })

    describe('getMinutes', () => {
      it('returns correct minutes from datetime', () => {
        const d = createDate(2026, 2, 17, 14, 30, 45)
        expect(adapter.getMinutes(d)).toBe(30)
      })

      it('returns 0 when no minutes', () => {
        const d = createDate(2026, 2, 17, 14, 0, 0)
        expect(adapter.getMinutes(d)).toBe(0)
      })
    })

    describe('getSeconds', () => {
      it('returns correct seconds from datetime', () => {
        const d = createDate(2026, 2, 17, 14, 30, 45)
        expect(adapter.getSeconds(d)).toBe(45)
      })

      it('returns 0 when no seconds', () => {
        const d = createDate(2026, 2, 17, 14, 30, 0)
        expect(adapter.getSeconds(d)).toBe(0)
      })
    })

    describe('setTime', () => {
      it('preserves date, changes time', () => {
        const d = adapter.create(2026, 2, 17)
        const result = adapter.setTime(d, 14, 30, 45)
        expect(adapter.getYear(result)).toBe(2026)
        expect(adapter.getMonth(result)).toBe(2)
        expect(adapter.getDate(result)).toBe(17)
        expect(adapter.getHours(result)).toBe(14)
        expect(adapter.getMinutes(result)).toBe(30)
        expect(adapter.getSeconds(result)).toBe(45)
      })

      it('setting seconds is optional (defaults to 0)', () => {
        const d = adapter.create(2026, 2, 17)
        const result = adapter.setTime(d, 10, 15)
        expect(adapter.getHours(result)).toBe(10)
        expect(adapter.getMinutes(result)).toBe(15)
        expect(adapter.getSeconds(result)).toBe(0)
      })

      it('does not mutate the input', () => {
        const original = adapter.create(2026, 2, 17)
        adapter.setTime(original, 14, 30, 45)
        expect(adapter.getHours(original)).toBe(0)
      })
    })

    describe('toDate', () => {
      it('returns a native Date instance', () => {
        const d = adapter.create(2026, 2, 17)
        const result = adapter.toDate(d)
        expect(result).toBeInstanceOf(Date)
      })

      it('preserves calendar date', () => {
        const d = adapter.create(2026, 2, 17)
        const result = adapter.toDate(d)
        expect(result.getFullYear()).toBe(2026)
        expect(result.getMonth()).toBe(2)
        expect(result.getDate()).toBe(17)
      })
    })

    describe('fromDate', () => {
      it('strips time from a Date with time set', () => {
        const d = new Date(2026, 2, 17, 14, 30, 45, 500)
        const result = adapter.fromDate(d)
        expect(adapter.getHours(result)).toBe(0)
        expect(adapter.getMinutes(result)).toBe(0)
        expect(adapter.getSeconds(result)).toBe(0)
      })

      it('preserves the calendar date', () => {
        const d = new Date(2026, 2, 17, 23, 59)
        const result = adapter.fromDate(d)
        expect(adapter.getYear(result)).toBe(2026)
        expect(adapter.getMonth(result)).toBe(2)
        expect(adapter.getDate(result)).toBe(17)
      })
    })

    describe('toDate / fromDate roundtrip', () => {
      it('roundtrip: toDate then fromDate gives same day', () => {
        const original = adapter.create(2026, 7, 25)
        const roundtripped = adapter.fromDate(adapter.toDate(original))
        expect(adapter.isSameDay(original, roundtripped)).toBe(true)
      })

      it('roundtrip preserves year, month, day', () => {
        const original = adapter.create(2024, 1, 29)
        const roundtripped = adapter.fromDate(adapter.toDate(original))
        expect(adapter.getYear(roundtripped)).toBe(2024)
        expect(adapter.getMonth(roundtripped)).toBe(1)
        expect(adapter.getDate(roundtripped)).toBe(29)
      })
    })

    describe('format', () => {
      it('format with { month: "long" } in en-US returns "March"', () => {
        const d = adapter.create(2026, 2, 17)
        const result = adapter.format(d, { month: 'long' }, 'en-US')
        expect(result).toBe('March')
      })

      it('format with { month: "long" } in ar-SA returns Arabic month name', () => {
        const d = adapter.create(2026, 2, 17)
        const result = adapter.format(d, { month: 'long' }, 'ar-SA')
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
        // Should not be the English name
        expect(result).not.toBe('March')
        // Should contain non-ASCII characters (Arabic script)
        // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional ASCII range check
        expect(/[^\u0000-\u007F]/.test(result)).toBe(true)
      })

      it('format gracefully handles unknown locale by falling back', () => {
        const d = adapter.create(2026, 2, 17)
        const result = adapter.format(d, { month: 'long' }, 'xx-XX')
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })

      it('format with { day: "numeric" } returns day number as string', () => {
        const d = adapter.create(2026, 2, 17)
        const result = adapter.format(d, { day: 'numeric' }, 'en-US')
        expect(result).toBe('17')
      })

      it('format with { year: "numeric", month: "long" } returns full string', () => {
        const d = adapter.create(2026, 2, 17)
        const result = adapter.format(d, { year: 'numeric', month: 'long' }, 'en-US')
        expect(result).toBe('March 2026')
      })

      it('uses runtime locale when locale is omitted', () => {
        const d = adapter.create(2026, 2, 17)
        expect(typeof adapter.format(d, { month: 'short' })).toBe('string')
      })
    })
  })
}
