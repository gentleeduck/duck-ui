import { beforeEach, describe, expect, it } from 'vitest'

import { HebrewAdapter } from '../hebrew-adapter'

describe('HebrewAdapter', () => {
  let adapter: HebrewAdapter

  beforeEach(() => {
    adapter = new HebrewAdapter()
  })

  describe('create and getters', () => {
    it('creates a date from Hebrew year, 0-indexed month, day', () => {
      // 1 Tishrei 5786 (month 0 = Tishrei)
      const d = adapter.create(5786, 0, 1)
      expect(adapter.getYear(d)).toBe(5786)
      expect(adapter.getMonth(d)).toBe(0)
      expect(adapter.getDate(d)).toBe(1)
    })

    it('month is 0-indexed (0 = Tishrei)', () => {
      const d = adapter.create(5786, 5, 1) // Adar
      expect(adapter.getMonth(d)).toBe(5)
    })

    it('returns the correct Hebrew day', () => {
      const d = adapter.create(5786, 0, 15) // 15 Tishrei 5786
      expect(adapter.getDate(d)).toBe(15)
    })

    it('round-trips through Gregorian correctly', () => {
      // 1 Tishrei 5786 = Sep 23, 2025 (verified against Intl)
      const d = adapter.create(5786, 0, 1)
      const native = adapter.toDate(d)
      expect(native.getFullYear()).toBe(2025)
      expect(native.getMonth()).toBe(8) // September
      expect(native.getDate()).toBe(23)
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
      expect(adapter.isValid(adapter.create(5786, 0, 1))).toBe(true)
    })

    it('returns false for an invalid date', () => {
      expect(adapter.isValid(adapter.fromDate(new Date('not a date')))).toBe(false)
    })
  })

  describe('isSameDay', () => {
    it('same date returns true', () => {
      const a = adapter.create(5786, 0, 1)
      const b = adapter.create(5786, 0, 1)
      expect(adapter.isSameDay(a, b)).toBe(true)
    })

    it('different day returns false', () => {
      expect(adapter.isSameDay(adapter.create(5786, 0, 1), adapter.create(5786, 0, 2))).toBe(false)
    })
  })

  describe('isSameMonth', () => {
    it('same Hebrew month returns true', () => {
      expect(adapter.isSameMonth(adapter.create(5786, 0, 1), adapter.create(5786, 0, 30))).toBe(true)
    })

    it('different Hebrew month returns false', () => {
      expect(adapter.isSameMonth(adapter.create(5786, 0, 1), adapter.create(5786, 1, 1))).toBe(false)
    })

    it('same month different year returns false', () => {
      expect(adapter.isSameMonth(adapter.create(5786, 0, 1), adapter.create(5785, 0, 1))).toBe(false)
    })
  })

  describe('isBefore / isAfter', () => {
    it('earlier date is before later date', () => {
      expect(adapter.isBefore(adapter.create(5786, 0, 1), adapter.create(5786, 0, 2))).toBe(true)
    })

    it('same date: isBefore returns false', () => {
      const d = adapter.create(5786, 0, 1)
      expect(adapter.isBefore(d, adapter.create(5786, 0, 1))).toBe(false)
    })

    it('later date is after earlier date', () => {
      expect(adapter.isAfter(adapter.create(5786, 0, 2), adapter.create(5786, 0, 1))).toBe(true)
    })

    it('same date: isAfter returns false', () => {
      const d = adapter.create(5786, 0, 1)
      expect(adapter.isAfter(d, adapter.create(5786, 0, 1))).toBe(false)
    })
  })

  describe('startOfMonth', () => {
    it('returns day 1 of the Hebrew month', () => {
      const d = adapter.startOfMonth(adapter.create(5786, 0, 15))
      expect(adapter.getDate(d)).toBe(1)
      expect(adapter.getMonth(d)).toBe(0)
      expect(adapter.getYear(d)).toBe(5786)
    })
  })

  describe('endOfMonth', () => {
    it('Tishrei has 30 days', () => {
      const d = adapter.endOfMonth(adapter.create(5786, 0, 1))
      expect(adapter.getDate(d)).toBe(30)
    })

    it('Tevet has 29 days', () => {
      const d = adapter.endOfMonth(adapter.create(5786, 3, 1)) // month 3 = Tevet
      expect(adapter.getDate(d)).toBe(29)
    })
  })

  describe('addDays', () => {
    it('adds positive days', () => {
      const d = adapter.addDays(adapter.create(5786, 0, 1), 10)
      expect(adapter.getDate(d)).toBe(11)
    })

    it('subtracts days', () => {
      const d = adapter.addDays(adapter.create(5786, 0, 15), -5)
      expect(adapter.getDate(d)).toBe(10)
    })

    it('crosses month boundaries', () => {
      const d = adapter.addDays(adapter.create(5786, 0, 30), 1)
      expect(adapter.getMonth(d)).toBe(1) // Cheshvan
      expect(adapter.getDate(d)).toBe(1)
    })
  })

  describe('addMonths', () => {
    it('advances one month', () => {
      const d = adapter.addMonths(adapter.create(5786, 0, 15), 1)
      expect(adapter.getMonth(d)).toBe(1)
      expect(adapter.getYear(d)).toBe(5786)
    })

    it('wraps across year boundary', () => {
      const d = adapter.addMonths(adapter.create(5786, 11, 1), 1) // Elul + 1
      expect(adapter.getYear(d)).toBe(5787)
      expect(adapter.getMonth(d)).toBe(0) // Tishrei
    })

    it('goes backward', () => {
      const d = adapter.addMonths(adapter.create(5786, 0, 15), -1) // Tishrei - 1
      expect(adapter.getYear(d)).toBe(5785)
    })

    it('clamps day to shorter month', () => {
      // Tishrei has 30 days, Tevet has 29
      const d = adapter.addMonths(adapter.create(5786, 0, 30), 3) // Tishrei -> Tevet
      expect(adapter.getDate(d)).toBe(29)
    })
  })

  describe('addYears', () => {
    it('adds one year', () => {
      const d = adapter.addYears(adapter.create(5786, 0, 1), 1)
      expect(adapter.getYear(d)).toBe(5787)
      expect(adapter.getMonth(d)).toBe(0)
    })

    it('subtracts one year', () => {
      const d = adapter.addYears(adapter.create(5786, 0, 1), -1)
      expect(adapter.getYear(d)).toBe(5785)
    })
  })

  describe('getDayOfWeek', () => {
    it('returns 0-6', () => {
      const d = adapter.create(5786, 0, 1)
      expect(adapter.getDayOfWeek(d)).toBeGreaterThanOrEqual(0)
      expect(adapter.getDayOfWeek(d)).toBeLessThanOrEqual(6)
    })
  })

  describe('startOfWeek', () => {
    it('walks back to Sunday (weekStartDay=0)', () => {
      const d = adapter.startOfWeek(adapter.create(5786, 0, 5), 0)
      expect(adapter.getDayOfWeek(d)).toBe(0)
    })
  })

  describe('format', () => {
    it('formats with Hebrew calendar extension', () => {
      const d = adapter.create(5786, 0, 1)
      const result = adapter.format(d, { month: 'long' })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('accepts a custom locale', () => {
      const d = adapter.create(5786, 0, 1)
      const result = adapter.format(d, { month: 'long' }, 'en-US')
      expect(typeof result).toBe('string')
    })

    it('does not duplicate calendar extension', () => {
      const d = adapter.create(5786, 0, 1)
      const result = adapter.format(d, { month: 'long' }, 'en-US-u-ca-hebrew')
      expect(typeof result).toBe('string')
    })
  })

  describe('leap years', () => {
    // 5784 is a leap year (cycle position 8)
    it('leap year has 13 months', () => {
      const leapAdapter = new HebrewAdapter()
      // Month 12 (Elul, 0-indexed) should exist in leap year
      const d = leapAdapter.create(5784, 12, 1)
      expect(leapAdapter.getYear(d)).toBe(5784)
      expect(leapAdapter.getMonth(d)).toBe(12)
    })

    it('common year has 12 months', () => {
      // 5786 is common (not leap)
      // Month 11 (Elul, 0-indexed) should be the last month
      const d = adapter.create(5786, 11, 1)
      expect(adapter.getMonth(d)).toBe(11)
    })

    it('getMonthsInYear returns 13 for leap year', () => {
      const d = adapter.create(5784, 0, 1)
      expect(adapter.getMonthsInYear(d)).toBe(13)
    })

    it('getMonthsInYear returns 12 for common year', () => {
      const d = adapter.create(5786, 0, 1)
      expect(adapter.getMonthsInYear(d)).toBe(12)
    })
  })

  describe('round-trip validation', () => {
    it('round-trips correctly for an entire Hebrew year', () => {
      const fmt = new Intl.DateTimeFormat('en-US-u-ca-hebrew', { day: 'numeric' })
      let failures = 0
      // Test Hebrew year 5786: Sep 23 2025 -> Sep 2026
      for (let d = new Date(2025, 8, 23); d < new Date(2026, 8, 23); d.setDate(d.getDate() + 1)) {
        const intlDay = Number.parseInt(fmt.format(d))
        const h = adapter.fromDate(d)
        const ourDay = adapter.getDate(h)
        if (ourDay !== intlDay) failures++
      }
      expect(failures).toBe(0)
    })
  })

  describe('toDate / fromDate', () => {
    it('round-trips through native Date', () => {
      const original = adapter.create(5786, 5, 15)
      const native = adapter.toDate(original)
      const back = adapter.fromDate(native)
      expect(adapter.isSameDay(original, back)).toBe(true)
    })
  })

  describe('time', () => {
    it('setTime preserves date', () => {
      const d = adapter.create(5786, 0, 15)
      const withTime = adapter.setTime(d, 14, 30, 45)
      expect(adapter.getYear(withTime)).toBe(5786)
      expect(adapter.getMonth(withTime)).toBe(0)
      expect(adapter.getDate(withTime)).toBe(15)
      expect(adapter.getHours(withTime)).toBe(14)
      expect(adapter.getMinutes(withTime)).toBe(30)
      expect(adapter.getSeconds(withTime)).toBe(45)
    })
  })

  // Intl names each date from its own Hebrew calendar, so it checks the month a date lands in.
  describe('against Intl', () => {
    const name = (date: Date) => adapter.format(date, { year: 'numeric', month: 'long', day: 'numeric' }, 'en')

    it("moves a year by the month, so a leap year's Adar I and Adar II both become Adar and Nisan stays Nisan", () => {
      const moves: [Date, number][] = [
        [adapter.create(5784, 7, 10), 1],
        [adapter.create(5786, 6, 10), 1],
        [adapter.create(5787, 8, 10), -1],
        [adapter.create(5786, 5, 10), 1],
        [adapter.create(5784, 5, 10), 1],
        [adapter.create(5784, 6, 10), 1],
        [adapter.create(5784, 5, 30), 1],
      ]

      expect(moves.map(([date, years]) => `${name(date)} -> ${name(adapter.addYears(date, years))}`)).toEqual([
        '10 Nisan 5784 -> 10 Nisan 5785',
        '10 Nisan 5786 -> 10 Nisan 5787',
        '10 Iyar 5787 -> 10 Iyar 5786',
        '10 Adar 5786 -> 10 Adar II 5787',
        '10 Adar I 5784 -> 10 Adar 5785',
        '10 Adar II 5784 -> 10 Adar 5785',
        '30 Adar I 5784 -> 29 Adar 5785',
      ])
    })

    it('moves 235 months, one 19-year cycle, to the same day 19 years on', () => {
      const date = adapter.create(5786, 0, 15)

      expect([name(adapter.addMonths(date, 235)), name(adapter.addMonths(date, -236))]).toEqual([
        '15 Tishri 5805',
        '15 Elul 5766',
      ])
    })

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

      expect(Object.fromEntries(Object.entries(results).map(([method, day]) => [method, name(day)]))).toEqual({
        fromDate: '10 Adar I 3808',
        startOfMonth: '1 Adar I 3808',
        endOfMonth: '30 Adar I 3808',
        startOfWeek: '9 Adar I 3808',
        addDays: '11 Adar I 3808',
        addMonths: '10 Adar II 3808',
        addYears: '10 Adar 3809',
        setTime: '10 Adar I 3808',
      })
    })
  })
})
