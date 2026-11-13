import { describe, expect, it } from 'vitest'

import { hijriMonthLength, hijriYearLength, isLeapHijriYear, toGregorian, toHijri } from '../hijri'

describe('hijri conversion', () => {
  describe('isLeapHijriYear', () => {
    it('identifies leap years in the 30-year cycle', () => {
      // Years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29 of each cycle
      expect(isLeapHijriYear(2)).toBe(true)
      expect(isLeapHijriYear(5)).toBe(true)
      expect(isLeapHijriYear(7)).toBe(true)
      expect(isLeapHijriYear(10)).toBe(true)
      expect(isLeapHijriYear(13)).toBe(true)
      expect(isLeapHijriYear(16)).toBe(true)
      expect(isLeapHijriYear(18)).toBe(true)
      expect(isLeapHijriYear(21)).toBe(true)
      expect(isLeapHijriYear(24)).toBe(true)
      expect(isLeapHijriYear(26)).toBe(true)
      expect(isLeapHijriYear(29)).toBe(true)
    })

    it('identifies common years', () => {
      expect(isLeapHijriYear(1)).toBe(false)
      expect(isLeapHijriYear(3)).toBe(false)
      expect(isLeapHijriYear(4)).toBe(false)
      expect(isLeapHijriYear(6)).toBe(false)
      expect(isLeapHijriYear(30)).toBe(false)
    })

    it('works for years in later cycles', () => {
      // Year 1447: (1447-1) % 30 + 1 = 27 -> not in list... wait
      // Actually (1447-1) % 30 = 1446 % 30 = 6, +1 = 7 -> leap
      expect(isLeapHijriYear(1447)).toBe(true)
      // Year 1448: (1448-1) % 30 = 1447 % 30 = 7, +1 = 8 -> not leap
      expect(isLeapHijriYear(1448)).toBe(false)
    })
  })

  describe('hijriMonthLength', () => {
    it('odd months (1,3,5,7,9,11) have 30 days', () => {
      expect(hijriMonthLength(1447, 1)).toBe(30)
      expect(hijriMonthLength(1447, 3)).toBe(30)
      expect(hijriMonthLength(1447, 5)).toBe(30)
      expect(hijriMonthLength(1447, 7)).toBe(30)
      expect(hijriMonthLength(1447, 9)).toBe(30)
      expect(hijriMonthLength(1447, 11)).toBe(30)
    })

    it('even months (2,4,6,8,10) have 29 days', () => {
      expect(hijriMonthLength(1447, 2)).toBe(29)
      expect(hijriMonthLength(1447, 4)).toBe(29)
      expect(hijriMonthLength(1447, 6)).toBe(29)
      expect(hijriMonthLength(1447, 8)).toBe(29)
      expect(hijriMonthLength(1447, 10)).toBe(29)
    })

    it('month 12 has 30 days in leap years', () => {
      expect(hijriMonthLength(1447, 12)).toBe(30) // 1447 is leap
    })

    it('month 12 has 29 days in common years', () => {
      expect(hijriMonthLength(1448, 12)).toBe(29) // 1448 is not leap
    })

    it('returns 0 for invalid month numbers', () => {
      expect(hijriMonthLength(1447, 0)).toBe(0)
      expect(hijriMonthLength(1447, 13)).toBe(0)
    })
  })

  describe('hijriYearLength', () => {
    it('leap year has 355 days', () => {
      expect(hijriYearLength(1447)).toBe(355)
    })

    it('common year has 354 days', () => {
      expect(hijriYearLength(1448)).toBe(354)
    })
  })

  describe('toHijri', () => {
    it('converts 1 Muharram 1447 correctly', () => {
      // 1 Muharram 1447 AH ≈ June 27, 2025 (tabular)
      const { hy, hm, hd } = toHijri(2025, 6, 27)
      expect(hy).toBe(1447)
      expect(hm).toBe(1)
      expect(hd).toBe(1)
    })

    it('converts a Ramadan date', () => {
      // 1 Ramadan 1447 AH: month 9
      // Start from 1 Muharram 1447 = June 27, 2025
      // Months 1-8: 30+29+30+29+30+29+30+29 = 236 days
      // June 27 + 236 = Feb 18, 2026
      const { hy, hm, hd } = toHijri(2026, 2, 18)
      expect(hy).toBe(1447)
      expect(hm).toBe(9)
      expect(hd).toBe(1)
    })

    it('converts January 1, 2025', () => {
      const h = toHijri(2025, 1, 1)
      expect(h.hy).toBe(1446)
      expect(h.hm).toBe(7) // Rajab
      expect(h.hd).toBe(1)
    })
  })

  describe('toGregorian', () => {
    it('converts 1 Muharram 1447 back to Gregorian', () => {
      const { gy, gm, gd } = toGregorian(1447, 1, 1)
      expect(gy).toBe(2025)
      expect(gm).toBe(6)
      expect(gd).toBe(27)
    })

    it('converts 1 Muharram 1446 to Gregorian', () => {
      const { gy, gm, gd } = toGregorian(1446, 1, 1)
      expect(gy).toBe(2024)
      expect(gm).toBe(7)
      expect(gd).toBe(8)
    })

    it('converts 1 Muharram 1448 to Gregorian', () => {
      const { gy, gm, gd } = toGregorian(1448, 1, 1)
      expect(gy).toBe(2026)
      expect(gm).toBe(6)
      expect(gd).toBe(17)
    })
  })

  describe('roundtrip', () => {
    it('Gregorian -> Hijri -> Gregorian preserves the date', () => {
      const dates = [
        [2025, 1, 1],
        [2025, 6, 27],
        [2026, 3, 18],
        [2026, 12, 31],
        [2024, 2, 29],
        [2000, 1, 1],
      ] as const

      for (const [gy, gm, gd] of dates) {
        const h = toHijri(gy, gm, gd)
        const g = toGregorian(h.hy, h.hm, h.hd)
        expect(g, `roundtrip failed for ${gy}-${gm}-${gd}`).toEqual({ gy, gm, gd })
      }
    })

    it('Hijri -> Gregorian -> Hijri preserves the date', () => {
      const dates = [
        [1447, 1, 1],
        [1447, 9, 1],
        [1447, 12, 30],
        [1446, 6, 15],
        [1448, 1, 1],
      ] as const

      for (const [hy, hm, hd] of dates) {
        const g = toGregorian(hy, hm, hd)
        const h = toHijri(g.gy, g.gm, g.gd)
        expect(h, `roundtrip failed for ${hy}-${hm}-${hd}`).toEqual({ hy, hm, hd })
      }
    })
  })

  describe('refusals and years before the first', () => {
    it('refuses a Gregorian date that does not exist', () => {
      expect(() => toHijri(2025, 2, 29)).toThrow(RangeError)
      expect(() => toHijri(2025, 13, 1)).toThrow(RangeError)
      expect(() => toHijri(2025, 1, 0)).toThrow(RangeError)
    })

    it('refuses a Hijri month or day that does not exist', () => {
      expect(() => toGregorian(1447, 0, 1)).toThrow('Invalid Hijri date: 1447-0-1')
      expect(() => toGregorian(1447, 13, 1)).toThrow(RangeError)
      expect(() => toGregorian(1447, 2, 30)).toThrow('Invalid Hijri date: 1447-2-30')
      expect(() => toGregorian(1446, 12, 30)).toThrow(RangeError)
    })

    it('ends every year from 100 years before the first the day before the next one starts', () => {
      const gaps: number[] = []
      for (let hy = -100; hy <= 1500; hy++) {
        const last = toGregorian(hy, 12, hijriMonthLength(hy, 12))
        const next = toGregorian(hy + 1, 1, 1)
        const after = new Date(0)
        after.setUTCFullYear(last.gy, last.gm - 1, last.gd + 1)
        const start = new Date(0)
        start.setUTCFullYear(next.gy, next.gm - 1, next.gd)
        if (after.getTime() !== start.getTime()) gaps.push(hy)
      }

      expect(gaps).toEqual([])
    })

    it('keeps the 30-year leap pattern before the first year', () => {
      expect([-1, 0, 1, 2].map(isLeapHijriYear)).toEqual([true, false, false, true])
      expect(hijriYearLength(-28)).toBe(355)
    })
  })
})
