import { describe, expect, it } from 'vitest'

import {
  hebrewMonthLength,
  hebrewMonthName,
  hebrewMonthsInYear,
  hebrewToGregorian,
  hebrewYearLength,
  isLeapHebrewYear,
  toHebrew,
} from '../hebrew'

describe('hebrew conversion', () => {
  describe('isLeapHebrewYear', () => {
    it('identifies leap years in the 19-year Metonic cycle (positions 3,6,8,11,14,17,19)', () => {
      // 5784: (5784-1) % 19 + 1 = 5783 % 19 + 1 = 7 + 1 = 8 -> leap
      expect(isLeapHebrewYear(5784)).toBe(true)
      // 5787: (5787-1) % 19 + 1 = 5786 % 19 + 1 = 12 + 1 = 13... wait
      // 5786 % 19 = 304 * 19 + 10 -> 10 + 1 = 11 -> leap
      expect(isLeapHebrewYear(5787)).toBe(true)
    })

    it('identifies common years', () => {
      expect(isLeapHebrewYear(5785)).toBe(false)
      expect(isLeapHebrewYear(5786)).toBe(false)
    })
  })

  describe('hebrewMonthsInYear', () => {
    it('leap year has 13 months', () => {
      expect(hebrewMonthsInYear(5784)).toBe(13)
    })

    it('common year has 12 months', () => {
      expect(hebrewMonthsInYear(5786)).toBe(12)
    })
  })

  describe('hebrewMonthLength', () => {
    it('Tishrei (month 1) always has 30 days', () => {
      expect(hebrewMonthLength(5786, 1)).toBe(30)
      expect(hebrewMonthLength(5784, 1)).toBe(30)
    })

    it('Tevet (month 4) always has 29 days', () => {
      expect(hebrewMonthLength(5786, 4)).toBe(29)
    })

    it('Shevat (month 5) always has 30 days', () => {
      expect(hebrewMonthLength(5786, 5)).toBe(30)
    })

    it('Adar in common year (month 6) has 29 days', () => {
      expect(hebrewMonthLength(5786, 6)).toBe(29)
    })

    it('Adar I in leap year (month 6) has 30 days', () => {
      expect(hebrewMonthLength(5784, 6)).toBe(30)
    })

    it('returns 0 for out-of-range months', () => {
      expect(hebrewMonthLength(5786, 0)).toBe(0)
      expect(hebrewMonthLength(5786, 13)).toBe(0)
      expect(hebrewMonthLength(5784, 14)).toBe(0)
    })
  })

  describe('hebrewMonthName', () => {
    it('names a month by its place in a common year or a leap year', () => {
      expect([5, 6, 7].map((hm) => hebrewMonthName(5786, hm))).toEqual(['Shevat', 'Adar', 'Nisan'])
      expect([6, 7, 8, 13].map((hm) => hebrewMonthName(5784, hm))).toEqual(['Adar I', 'Adar II', 'Nisan', 'Elul'])
    })

    it('names no month the year lacks', () => {
      expect([0, 13].map((hm) => hebrewMonthName(5786, hm))).toEqual([undefined, undefined])
    })
  })

  describe('hebrewYearLength', () => {
    it('returns 353, 354, or 355 for common years', () => {
      const len = hebrewYearLength(5786)
      expect([353, 354, 355]).toContain(len)
    })

    it('returns 383, 384, or 385 for leap years', () => {
      const len = hebrewYearLength(5784)
      expect([383, 384, 385]).toContain(len)
    })
  })

  describe('toHebrew', () => {
    it('converts Rosh Hashanah 5783 (Sep 26 2022) correctly', () => {
      const h = toHebrew(2022, 9, 26)
      expect(h.hy).toBe(5783)
      expect(h.hm).toBe(1) // Tishrei
      expect(h.hd).toBe(1)
    })

    it('converts 1 Tishrei 5786 (Sep 23 2025) correctly', () => {
      const h = toHebrew(2025, 9, 23)
      expect(h.hy).toBe(5786)
      expect(h.hm).toBe(1)
      expect(h.hd).toBe(1)
    })

    it('converts a mid-year date correctly', () => {
      const h = toHebrew(2026, 3, 18)
      expect(h.hy).toBe(5786)
      // Should be in Adar (month 6)  -  verified against Intl
      expect(h.hm).toBe(6)
    })
  })

  describe('hebrewToGregorian', () => {
    it('converts 1 Tishrei 5786 to Sep 23 2025', () => {
      const g = hebrewToGregorian(5786, 1, 1)
      expect(g.gy).toBe(2025)
      expect(g.gm).toBe(9) // September
      expect(g.gd).toBe(23)
    })
  })

  describe('round-trip', () => {
    it('toHebrew -> hebrewToGregorian returns the original date', () => {
      const testDates = [
        [2025, 9, 23],
        [2026, 1, 1],
        [2026, 3, 18],
        [2026, 6, 15],
        [2026, 12, 31],
      ]
      for (const [gy, gm, gd] of testDates) {
        const h = toHebrew(gy!, gm!, gd!)
        const g = hebrewToGregorian(h.hy, h.hm, h.hd)
        expect(g).toEqual({ gy, gm, gd })
      }
    })

    it('validates full year against Intl.DateTimeFormat', () => {
      const fmt = new Intl.DateTimeFormat('en-US-u-ca-hebrew', { day: 'numeric' })
      let failures = 0
      for (let d = new Date(2025, 0, 1); d < new Date(2027, 0, 1); d.setDate(d.getDate() + 1)) {
        const intlDay = Number.parseInt(fmt.format(d))
        const h = toHebrew(d.getFullYear(), d.getMonth() + 1, d.getDate())
        if (h.hd !== intlDay) failures++
      }
      expect(failures).toBe(0)
    })
  })

  describe('refusals and the years around the epoch', () => {
    it('refuses a Gregorian date that does not exist', () => {
      expect(() => toHebrew(2025, 2, 29)).toThrow('Invalid Gregorian date: 2025-2-29')
      expect(() => toHebrew(2025, 0, 1)).toThrow(RangeError)
    })

    it('refuses a Hebrew month the year lacks, or a day past its month', () => {
      expect(() => hebrewToGregorian(5786, 13, 1)).toThrow('Invalid Hebrew date: 5786-13-1')
      expect(() => hebrewToGregorian(5786, 0, 1)).toThrow(RangeError)
      expect(() => hebrewToGregorian(5786, 4, 30)).toThrow(RangeError)
      expect(() => hebrewToGregorian(5786, 1, 0)).toThrow(RangeError)
    })

    it('adds up the months of every year to its length, from 100 years before the epoch to year 10000', () => {
      const wrong: number[] = []
      for (let hy = -100; hy <= 10_000; hy++) {
        let days = 0
        for (let hm = 1; hm <= hebrewMonthsInYear(hy); hm++) days += hebrewMonthLength(hy, hm)
        if (days !== hebrewYearLength(hy)) wrong.push(hy)
      }

      expect(wrong).toEqual([])
    })

    it('keeps the 19-year leap pattern before the first year', () => {
      expect([-2, -1, 0, 1, 3].map(isLeapHebrewYear)).toEqual([true, false, true, false, true])
    })
  })
})

describe('Hebrew years far from the epoch', () => {
  it('reads the weekday of a day before the epoch the right way round, so year 0 keeps its 384 days', () => {
    expect([hebrewYearLength(0), hebrewYearLength(1)]).toEqual([384, 355])
  })

  it('finds the year of a day where Tishrei has drifted far from September, either way', () => {
    const roundTrip = (gy: number) => {
      const { hy, hm, hd } = toHebrew(gy, 1, 1)
      return hebrewToGregorian(hy, hm, hd)
    }

    expect([roundTrip(100000), roundTrip(-200000)]).toEqual([
      { gy: 100000, gm: 1, gd: 1 },
      { gy: -200000, gm: 1, gd: 1 },
    ])
  })
})
