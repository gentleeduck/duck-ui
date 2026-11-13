import { beforeEach, describe, expect, it } from 'vitest'

import { IslamicAdapter } from '../islamic-adapter'

describe('IslamicAdapter', () => {
  let adapter: IslamicAdapter

  beforeEach(() => {
    adapter = new IslamicAdapter()
  })

  describe('create and getters', () => {
    it('creates a date from Hijri year, 0-indexed month, day', () => {
      // 1 Muharram 1447 (month 0 = Muharram)
      const d = adapter.create(1447, 0, 1)
      expect(adapter.getYear(d)).toBe(1447)
      expect(adapter.getMonth(d)).toBe(0)
      expect(adapter.getDate(d)).toBe(1)
    })

    it('month is 0-indexed (0 = Muharram, 11 = Dhu al-Hijjah)', () => {
      const d = adapter.create(1447, 11, 1)
      expect(adapter.getMonth(d)).toBe(11)
    })

    it('returns the correct Hijri day', () => {
      const d = adapter.create(1447, 8, 15) // 15 Ramadan 1447
      expect(adapter.getDate(d)).toBe(15)
    })
  })

  describe('today', () => {
    it('returns a valid date', () => {
      expect(adapter.isValid(adapter.today())).toBe(true)
    })

    it('strips time to midnight', () => {
      const t = adapter.today()
      expect(adapter.getHours(t)).toBe(0)
      expect(adapter.getMinutes(t)).toBe(0)
      expect(adapter.getSeconds(t)).toBe(0)
    })
  })

  describe('isValid', () => {
    it('returns true for a valid date', () => {
      expect(adapter.isValid(adapter.create(1447, 0, 1))).toBe(true)
    })

    it('returns false for an invalid date', () => {
      expect(adapter.isValid(adapter.fromDate(new Date('not a date')))).toBe(false)
    })
  })

  describe('isSameDay', () => {
    it('same Gregorian date returns true', () => {
      const a = adapter.create(1447, 0, 1)
      const b = adapter.create(1447, 0, 1)
      expect(adapter.isSameDay(a, b)).toBe(true)
    })

    it('different day returns false', () => {
      expect(adapter.isSameDay(adapter.create(1447, 0, 1), adapter.create(1447, 0, 2))).toBe(false)
    })
  })

  describe('isSameMonth', () => {
    it('same Hijri month returns true', () => {
      expect(adapter.isSameMonth(adapter.create(1447, 0, 1), adapter.create(1447, 0, 30))).toBe(true)
    })

    it('different Hijri month returns false', () => {
      expect(adapter.isSameMonth(adapter.create(1447, 0, 1), adapter.create(1447, 1, 1))).toBe(false)
    })

    it('same month different year returns false', () => {
      expect(adapter.isSameMonth(adapter.create(1447, 0, 1), adapter.create(1446, 0, 1))).toBe(false)
    })
  })

  describe('isBefore', () => {
    it('earlier date is before later date', () => {
      expect(adapter.isBefore(adapter.create(1447, 0, 1), adapter.create(1447, 0, 2))).toBe(true)
    })

    it('same date returns false', () => {
      const d = adapter.create(1447, 0, 1)
      expect(adapter.isBefore(d, adapter.create(1447, 0, 1))).toBe(false)
    })
  })

  describe('isAfter', () => {
    it('later date is after earlier date', () => {
      expect(adapter.isAfter(adapter.create(1447, 0, 2), adapter.create(1447, 0, 1))).toBe(true)
    })

    it('same date returns false', () => {
      const d = adapter.create(1447, 0, 1)
      expect(adapter.isAfter(d, adapter.create(1447, 0, 1))).toBe(false)
    })
  })

  describe('startOfMonth', () => {
    it('returns day 1 of the Hijri month', () => {
      const d = adapter.startOfMonth(adapter.create(1447, 0, 15))
      expect(adapter.getDate(d)).toBe(1)
      expect(adapter.getMonth(d)).toBe(0)
      expect(adapter.getYear(d)).toBe(1447)
    })

    it('already on day 1 returns day 1', () => {
      const d = adapter.startOfMonth(adapter.create(1447, 0, 1))
      expect(adapter.getDate(d)).toBe(1)
    })
  })

  describe('endOfMonth', () => {
    it('returns 30 for a 30-day month (Muharram)', () => {
      const d = adapter.endOfMonth(adapter.create(1447, 0, 15))
      expect(adapter.getDate(d)).toBe(30)
    })

    it('returns 29 for a 29-day month (Safar)', () => {
      const d = adapter.endOfMonth(adapter.create(1447, 1, 10))
      expect(adapter.getDate(d)).toBe(29)
    })

    it('returns 30 for Dhu al-Hijjah in a leap year', () => {
      // 1447 is a leap year
      const d = adapter.endOfMonth(adapter.create(1447, 11, 1))
      expect(adapter.getDate(d)).toBe(30)
    })

    it('returns 29 for Dhu al-Hijjah in a common year', () => {
      // 1448 is not a leap year
      const d = adapter.endOfMonth(adapter.create(1448, 11, 1))
      expect(adapter.getDate(d)).toBe(29)
    })

    it('preserves Hijri month and year', () => {
      const d = adapter.endOfMonth(adapter.create(1447, 8, 15)) // Ramadan
      expect(adapter.getMonth(d)).toBe(8)
      expect(adapter.getYear(d)).toBe(1447)
    })
  })

  describe('addDays', () => {
    it('adds positive days', () => {
      const d = adapter.addDays(adapter.create(1447, 0, 1), 5)
      expect(adapter.getDate(d)).toBe(6)
      expect(adapter.getMonth(d)).toBe(0)
    })

    it('crosses Hijri month boundary', () => {
      // Muharram has 30 days, day 30 + 1 = 1 Safar
      const d = adapter.addDays(adapter.create(1447, 0, 30), 1)
      expect(adapter.getMonth(d)).toBe(1) // Safar
      expect(adapter.getDate(d)).toBe(1)
    })

    it('subtracts days', () => {
      const d = adapter.addDays(adapter.create(1447, 0, 10), -5)
      expect(adapter.getDate(d)).toBe(5)
    })

    it('does not mutate the input', () => {
      const original = adapter.create(1447, 0, 1)
      adapter.addDays(original, 10)
      expect(adapter.getDate(original)).toBe(1)
    })
  })

  describe('addMonths', () => {
    it('adds 1 Hijri month', () => {
      const d = adapter.addMonths(adapter.create(1447, 0, 15), 1)
      expect(adapter.getMonth(d)).toBe(1) // Safar
      expect(adapter.getDate(d)).toBe(15)
      expect(adapter.getYear(d)).toBe(1447)
    })

    it('subtracts 1 Hijri month', () => {
      const d = adapter.addMonths(adapter.create(1447, 1, 15), -1)
      expect(adapter.getMonth(d)).toBe(0)
      expect(adapter.getYear(d)).toBe(1447)
    })

    it('crosses year boundary forward', () => {
      // Dhu al-Hijjah (month 11) + 1 = Muharram next year
      const d = adapter.addMonths(adapter.create(1447, 11, 1), 1)
      expect(adapter.getMonth(d)).toBe(0) // Muharram
      expect(adapter.getYear(d)).toBe(1448)
    })

    it('crosses year boundary backward', () => {
      // Muharram (month 0) - 1 = Dhu al-Hijjah prev year
      const d = adapter.addMonths(adapter.create(1448, 0, 1), -1)
      expect(adapter.getMonth(d)).toBe(11) // Dhu al-Hijjah
      expect(adapter.getYear(d)).toBe(1447)
    })

    it('clamps day when target month is shorter', () => {
      // Muharram day 30, +1 -> Safar has 29 days -> clamp to 29
      const d = adapter.addMonths(adapter.create(1447, 0, 30), 1)
      expect(adapter.getMonth(d)).toBe(1)
      expect(adapter.getDate(d)).toBe(29)
    })

    it('adds multiple months', () => {
      const d = adapter.addMonths(adapter.create(1447, 0, 1), 6)
      expect(adapter.getMonth(d)).toBe(6) // Rajab
      expect(adapter.getYear(d)).toBe(1447)
    })

    it('does not mutate the input', () => {
      const original = adapter.create(1447, 0, 15)
      adapter.addMonths(original, 3)
      expect(adapter.getMonth(original)).toBe(0)
    })
  })

  describe('addYears', () => {
    it('adds 1 Hijri year', () => {
      const d = adapter.addYears(adapter.create(1447, 0, 1), 1)
      expect(adapter.getYear(d)).toBe(1448)
      expect(adapter.getMonth(d)).toBe(0)
      expect(adapter.getDate(d)).toBe(1)
    })

    it('subtracts 1 Hijri year', () => {
      const d = adapter.addYears(adapter.create(1447, 0, 1), -1)
      expect(adapter.getYear(d)).toBe(1446)
    })

    it('clamps Dhu al-Hijjah 30 leap -> 29 common', () => {
      // 1447 is leap, Dhu al-Hijjah has 30 days
      // 1448 is not leap, Dhu al-Hijjah has 29 days
      const d = adapter.addYears(adapter.create(1447, 11, 30), 1)
      expect(adapter.getYear(d)).toBe(1448)
      expect(adapter.getDate(d)).toBe(29)
    })

    it('does not mutate the input', () => {
      const original = adapter.create(1447, 0, 1)
      adapter.addYears(original, 1)
      expect(adapter.getYear(original)).toBe(1447)
    })
  })

  describe('getDayOfWeek', () => {
    it('returns correct weekday for a known date', () => {
      // 1 Muharram 1447 = June 27, 2025 = Friday (5)
      const d = adapter.create(1447, 0, 1)
      expect(adapter.getDayOfWeek(d)).toBe(5)
    })
  })

  describe('toDate / fromDate', () => {
    it('toDate returns a native Date', () => {
      const d = adapter.create(1447, 0, 1)
      expect(adapter.toDate(d)).toBeInstanceOf(Date)
    })

    it('roundtrip preserves the date', () => {
      const original = adapter.create(1447, 8, 15)
      const roundtripped = adapter.fromDate(adapter.toDate(original))
      expect(adapter.isSameDay(original, roundtripped)).toBe(true)
    })
  })

  describe('format', () => {
    it('formats with Islamic calendar by default', () => {
      const d = adapter.create(1447, 0, 1)
      const result = adapter.format(d, { month: 'long', year: 'numeric' })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('accepts a custom locale', () => {
      const d = adapter.create(1447, 0, 1)
      const result = adapter.format(d, { month: 'long' }, 'en-US')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('does not duplicate calendar extension', () => {
      const d = adapter.create(1447, 0, 1)
      // Should not throw when locale already has -u-ca-islamic
      const result = adapter.format(d, { month: 'long' }, 'en-US-u-ca-islamic')
      expect(typeof result).toBe('string')
    })
  })

  describe('startOfWeek', () => {
    it('walks back to the target weekday', () => {
      // 1 Muharram 1447 = June 27, 2025 = Friday (5)
      const d = adapter.create(1447, 0, 1)
      // Walk back to Saturday (6)  -  Saturday is before Friday, so walk back 6 days
      const sat = adapter.startOfWeek(d, 6)
      expect(adapter.getDayOfWeek(sat)).toBe(6)
    })

    it('already on start day returns same date', () => {
      const d = adapter.create(1447, 0, 1) // Friday
      const fri = adapter.startOfWeek(d, 5)
      expect(adapter.isSameDay(d, fri)).toBe(true)
    })
  })

  describe('setTime', () => {
    it('preserves date and sets time', () => {
      const d = adapter.create(1447, 0, 1)
      const result = adapter.setTime(d, 14, 30, 45)
      expect(adapter.getYear(result)).toBe(1447)
      expect(adapter.getMonth(result)).toBe(0)
      expect(adapter.getDate(result)).toBe(1)
      expect(adapter.getHours(result)).toBe(14)
      expect(adapter.getMinutes(result)).toBe(30)
      expect(adapter.getSeconds(result)).toBe(45)
    })

    it('second defaults to 0', () => {
      const d = adapter.create(1447, 0, 1)
      const result = adapter.setTime(d, 10, 15)
      expect(adapter.getSeconds(result)).toBe(0)
    })
  })

  // 7 Dhu al-Hijjah 593 before the Hijra in Intl's islamic-civil, which counts no year 0.
  it('keeps a day in Gregorian year 48 through every method that returns a date', () => {
    const native = new Date(0)
    native.setFullYear(48, 1, 10)
    native.setHours(0, 0, 0, 0)
    const date = adapter.fromDate(native)

    const results = {
      fromDate: date,
      startOfMonth: adapter.startOfMonth(date),
      endOfMonth: adapter.endOfMonth(date),
      startOfWeek: adapter.startOfWeek(date, 0),
      addDays: adapter.addDays(date, 1),
      addMonths: adapter.addMonths(date, 1),
      addYears: adapter.addYears(date, 1),
      setTime: adapter.setTime(date, 9, 5),
    }

    expect([adapter.getYear(date), adapter.getMonth(date), adapter.getDate(date)]).toEqual([-592, 11, 7])
    expect(
      Object.fromEntries(
        Object.entries(results).map(([method, day]) => [
          method,
          [day.getFullYear(), day.getMonth() + 1, day.getDate()].join('-'),
        ]),
      ),
    ).toEqual({
      fromDate: '48-2-10',
      startOfMonth: '48-2-4',
      endOfMonth: '48-3-3',
      startOfWeek: '48-2-9',
      addDays: '48-2-11',
      addMonths: '48-3-10',
      addYears: '49-1-29',
      setTime: '48-2-10',
    })
  })
})
