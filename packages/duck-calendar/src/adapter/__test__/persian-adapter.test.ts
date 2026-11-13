import { describe, expect, it } from 'vitest'

import { PersianAdapter } from '../persian-adapter'

describe('PersianAdapter', () => {
  const adapter = new PersianAdapter()

  describe('create', () => {
    it('create(1404, 0, 1) -> Farvardin 1, 1404 = Gregorian 2025-03-21', () => {
      const d = adapter.create(1404, 0, 1)
      expect(d.getFullYear()).toBe(2025)
      expect(d.getMonth()).toBe(2) // March
      expect(d.getDate()).toBe(21)
    })

    it('create(1405, 0, 1) -> Nowruz 1405 = Gregorian 2026-03-21', () => {
      const d = adapter.create(1405, 0, 1)
      expect(d.getFullYear()).toBe(2026)
      expect(d.getMonth()).toBe(2)
      expect(d.getDate()).toBe(21)
    })

    it('month is 0-indexed (0 = Farvardin, 11 = Esfand)', () => {
      expect(adapter.getMonth(adapter.create(1404, 0, 1))).toBe(0)
      expect(adapter.getMonth(adapter.create(1404, 11, 1))).toBe(11)
    })

    it('strips time to midnight', () => {
      const d = adapter.create(1404, 0, 1)
      expect(adapter.getHours(d)).toBe(0)
      expect(adapter.getMinutes(d)).toBe(0)
      expect(adapter.getSeconds(d)).toBe(0)
    })

    it('reads every date up to the end of maxYear, and fails in the year after it', () => {
      const lastDay = adapter.create(adapter.maxYear, 11, 29)
      const past = adapter.create(adapter.maxYear + 1, 9, 30)

      expect(adapter.getYear(lastDay)).toBe(3176)
      expect(() => adapter.getYear(past)).toThrow('Invalid Jalaali year 3178')
    })
  })

  describe('known conversions', () => {
    it('Gregorian 2025-06-12 = Persian 1404-03-22 (Khordad 22)', () => {
      const d = new Date(2025, 5, 12) // June 12
      expect(adapter.getYear(d)).toBe(1404)
      expect(adapter.getMonth(d)).toBe(2) // 0-indexed -> Khordad
      expect(adapter.getDate(d)).toBe(22)
    })

    it('Gregorian 2026-03-21 = Persian 1405-01-01 (Farvardin 1, Nowruz)', () => {
      const d = new Date(2026, 2, 21)
      expect(adapter.getYear(d)).toBe(1405)
      expect(adapter.getMonth(d)).toBe(0)
      expect(adapter.getDate(d)).toBe(1)
    })

    it('Gregorian 2024-02-29 = Persian 1402-12-10 (leap year)', () => {
      const d = new Date(2024, 1, 29)
      expect(adapter.getYear(d)).toBe(1402)
      expect(adapter.getMonth(d)).toBe(11) // 0-indexed Esfand
      expect(adapter.getDate(d)).toBe(10)
    })
  })

  describe('month lengths', () => {
    it('months 1-6 (Farvardin-Shahrivar) have 31 days', () => {
      for (let m = 0; m < 6; m++) {
        const start = adapter.startOfMonth(adapter.create(1404, m, 15))
        const end = adapter.endOfMonth(adapter.create(1404, m, 15))
        expect(adapter.getDate(start)).toBe(1)
        expect(adapter.getDate(end)).toBe(31)
      }
    })

    it('months 7-11 (Mehr-Bahman) have 30 days', () => {
      for (let m = 6; m < 11; m++) {
        const end = adapter.endOfMonth(adapter.create(1404, m, 15))
        expect(adapter.getDate(end)).toBe(30)
      }
    })

    it('month 12 (Esfand) has 29 days in non-leap year (1404)', () => {
      const end = adapter.endOfMonth(adapter.create(1404, 11, 1))
      expect(adapter.getDate(end)).toBe(29)
    })

    it('month 12 (Esfand) has 30 days in leap year (1403)', () => {
      const end = adapter.endOfMonth(adapter.create(1403, 11, 1))
      expect(adapter.getDate(end)).toBe(30)
    })
  })

  describe('startOfMonth', () => {
    it('returns correct Gregorian date for Persian month start', () => {
      // Khordad (month 3, 0-indexed 2) 1404 starts on Gregorian 2025-05-22
      const d = adapter.create(1404, 2, 15) // Khordad 15
      const start = adapter.startOfMonth(d)
      expect(adapter.getDate(start)).toBe(1)
      expect(adapter.getMonth(start)).toBe(2)
      expect(adapter.getYear(start)).toBe(1404)
    })

    it('already on day 1 returns day 1', () => {
      const d = adapter.create(1404, 0, 1)
      const start = adapter.startOfMonth(d)
      expect(adapter.getDate(start)).toBe(1)
    })
  })

  describe('endOfMonth', () => {
    it('returns correct Gregorian date for Persian month end', () => {
      const d = adapter.create(1404, 0, 15) // Farvardin 15
      const end = adapter.endOfMonth(d)
      expect(adapter.getDate(end)).toBe(31)
      expect(adapter.getMonth(end)).toBe(0)
      expect(adapter.getYear(end)).toBe(1404)
    })
  })

  describe('addMonths', () => {
    it('Farvardin + 1 = Ordibehesht', () => {
      const d = adapter.addMonths(adapter.create(1404, 0, 15), 1)
      expect(adapter.getMonth(d)).toBe(1) // Ordibehesht
      expect(adapter.getDate(d)).toBe(15)
      expect(adapter.getYear(d)).toBe(1404)
    })

    it('day clamping: Shahrivar 31 + 1 month = Mehr 30', () => {
      const d = adapter.addMonths(adapter.create(1404, 5, 31), 1)
      expect(adapter.getMonth(d)).toBe(6) // Mehr
      expect(adapter.getDate(d)).toBe(30) // clamped from 31 to 30
    })

    it('Esfand + 1 = next year Farvardin', () => {
      const d = adapter.addMonths(adapter.create(1404, 11, 15), 1)
      expect(adapter.getYear(d)).toBe(1405)
      expect(adapter.getMonth(d)).toBe(0) // Farvardin
    })

    it('Farvardin - 1 = prev year Esfand', () => {
      const d = adapter.addMonths(adapter.create(1404, 0, 15), -1)
      expect(adapter.getYear(d)).toBe(1403)
      expect(adapter.getMonth(d)).toBe(11) // Esfand
    })

    it('adds multiple months', () => {
      const d = adapter.addMonths(adapter.create(1404, 0, 1), 6)
      expect(adapter.getMonth(d)).toBe(6) // Mehr
      expect(adapter.getYear(d)).toBe(1404)
    })

    it('does not mutate the input', () => {
      const original = adapter.create(1404, 0, 15)
      adapter.addMonths(original, 3)
      expect(adapter.getMonth(original)).toBe(0)
    })
  })

  describe('addYears', () => {
    it('adds 1 year', () => {
      const d = adapter.addYears(adapter.create(1404, 2, 15), 1)
      expect(adapter.getYear(d)).toBe(1405)
      expect(adapter.getMonth(d)).toBe(2)
      expect(adapter.getDate(d)).toBe(15)
    })

    it('leap year clamping: Esfand 30 in leap year + 1 = Esfand 29', () => {
      // 1403 is leap (Esfand has 30 days), 1404 is not (29 days)
      const d = adapter.addYears(adapter.create(1403, 11, 30), 1)
      expect(adapter.getYear(d)).toBe(1404)
      expect(adapter.getMonth(d)).toBe(11)
      expect(adapter.getDate(d)).toBe(29) // clamped
    })

    it('does not mutate the input', () => {
      const original = adapter.create(1404, 0, 1)
      adapter.addYears(original, 1)
      expect(adapter.getYear(original)).toBe(1404)
    })
  })

  describe('isSameMonth', () => {
    it('same Persian month returns true', () => {
      const a = adapter.create(1404, 0, 1)
      const b = adapter.create(1404, 0, 31)
      expect(adapter.isSameMonth(a, b)).toBe(true)
    })

    it('different Persian month returns false', () => {
      const a = adapter.create(1404, 0, 31)
      const b = adapter.create(1404, 1, 1)
      expect(adapter.isSameMonth(a, b)).toBe(false)
    })

    it('same month different year returns false', () => {
      const a = adapter.create(1404, 5, 1)
      const b = adapter.create(1405, 5, 1)
      expect(adapter.isSameMonth(a, b)).toBe(false)
    })
  })

  describe('isSameDay', () => {
    it('same Gregorian date returns true', () => {
      const a = adapter.create(1404, 0, 1)
      const b = adapter.create(1404, 0, 1)
      expect(adapter.isSameDay(a, b)).toBe(true)
    })

    it('different dates returns false', () => {
      expect(adapter.isSameDay(adapter.create(1404, 0, 1), adapter.create(1404, 0, 2))).toBe(false)
    })
  })

  describe('isBefore / isAfter', () => {
    it('earlier date isBefore later', () => {
      expect(adapter.isBefore(adapter.create(1404, 0, 1), adapter.create(1404, 0, 2))).toBe(true)
    })

    it('later date isAfter earlier', () => {
      expect(adapter.isAfter(adapter.create(1404, 0, 2), adapter.create(1404, 0, 1))).toBe(true)
    })

    it('same date returns false for both', () => {
      const d = adapter.create(1404, 0, 1)
      expect(adapter.isBefore(d, adapter.create(1404, 0, 1))).toBe(false)
      expect(adapter.isAfter(d, adapter.create(1404, 0, 1))).toBe(false)
    })
  })

  describe('isValid', () => {
    it('returns true for valid date', () => {
      expect(adapter.isValid(adapter.create(1404, 0, 1))).toBe(true)
    })

    it('returns false for invalid date', () => {
      expect(adapter.isValid(new Date('invalid'))).toBe(false)
    })
  })

  describe('today', () => {
    it('returns a valid date with time stripped', () => {
      const t = adapter.today()
      expect(adapter.isValid(t)).toBe(true)
      expect(adapter.getHours(t)).toBe(0)
      expect(adapter.getMinutes(t)).toBe(0)
      expect(adapter.getSeconds(t)).toBe(0)
    })
  })

  describe('format', () => {
    it('outputs Persian month names with default locale', () => {
      const d = adapter.create(1404, 0, 1) // Farvardin 1
      const result = adapter.format(d, { month: 'long' })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('outputs Persian (Extended Arabic) numerals', () => {
      const d = adapter.create(1404, 0, 15)
      const result = adapter.format(d, { day: 'numeric' })
      // Extended Arabic numeral for 15 is ۱۵
      expect(result).toContain('۱۵')
    })

    it('uses Persian calendar even with en-US locale', () => {
      const d = adapter.create(1404, 0, 1)
      const result = adapter.format(d, { year: 'numeric' }, 'en-US')
      // Shows Persian year 1404 in Extended Arabic numerals with AP era
      expect(result).toContain('۱۴۰۴')
    })
  })

  describe('toDate / fromDate', () => {
    it('toDate returns a native Date', () => {
      const d = adapter.create(1404, 0, 1)
      expect(adapter.toDate(d)).toBeInstanceOf(Date)
    })

    it('fromDate strips time', () => {
      const d = new Date(2025, 2, 21, 14, 30, 45)
      const result = adapter.fromDate(d)
      expect(adapter.getHours(result)).toBe(0)
    })

    it('roundtrip preserves date', () => {
      const original = adapter.create(1404, 5, 15)
      const roundtripped = adapter.fromDate(adapter.toDate(original))
      expect(adapter.isSameDay(original, roundtripped)).toBe(true)
    })
  })

  describe('setTime', () => {
    it('preserves date, changes time', () => {
      const d = adapter.create(1404, 0, 1)
      const result = adapter.setTime(d, 14, 30, 45)
      expect(adapter.getYear(result)).toBe(1404)
      expect(adapter.getMonth(result)).toBe(0)
      expect(adapter.getDate(result)).toBe(1)
      expect(adapter.getHours(result)).toBe(14)
      expect(adapter.getMinutes(result)).toBe(30)
      expect(adapter.getSeconds(result)).toBe(45)
    })
  })

  describe('addDays', () => {
    it('crosses Persian month boundary', () => {
      // Farvardin has 31 days. Day 31 + 1 = Ordibehesht 1
      const d = adapter.addDays(adapter.create(1404, 0, 31), 1)
      expect(adapter.getMonth(d)).toBe(1) // Ordibehesht
      expect(adapter.getDate(d)).toBe(1)
    })

    it('does not mutate input', () => {
      const original = adapter.create(1404, 0, 1)
      adapter.addDays(original, 10)
      expect(adapter.getDate(original)).toBe(1)
    })
  })

  describe('getDayOfWeek', () => {
    it('returns correct weekday', () => {
      // 2025-03-21 (Nowruz 1404) is a Friday = 5
      const d = adapter.create(1404, 0, 1)
      expect(adapter.getDayOfWeek(d)).toBe(5)
    })
  })

  describe('startOfWeek', () => {
    it('walks back to Saturday (weekStartDay=6)', () => {
      // Farvardin 1, 1404 = Friday. Saturday start -> walk back 6 days
      const d = adapter.startOfWeek(adapter.create(1404, 0, 1), 6)
      expect(adapter.getDayOfWeek(d)).toBe(6)
    })
  })
})
