import { describe, expect, it } from 'vitest'

import { isLeapJalaaliYear, jalaaliMonthLength, toGregorian, toJalaali } from '../jalaali'

describe('jalaali conversion', () => {
  describe('toJalaali', () => {
    it('2025-06-12 -> 1404-03-22 (Khordad 22)', () => {
      expect(toJalaali(2025, 6, 12)).toEqual({ jy: 1404, jm: 3, jd: 22 })
    })

    it('2026-03-21 -> 1405-01-01 (Nowruz)', () => {
      expect(toJalaali(2026, 3, 21)).toEqual({ jy: 1405, jm: 1, jd: 1 })
    })

    it('2024-02-29 -> 1402-12-10 (leap day)', () => {
      expect(toJalaali(2024, 2, 29)).toEqual({ jy: 1402, jm: 12, jd: 10 })
    })

    it('2024-03-20 -> 1403-01-01 (Nowruz 1403)', () => {
      expect(toJalaali(2024, 3, 20)).toEqual({ jy: 1403, jm: 1, jd: 1 })
    })

    it('2025-03-20 -> 1403-12-30 (last day of 1403  -  leap year)', () => {
      expect(toJalaali(2025, 3, 20)).toEqual({ jy: 1403, jm: 12, jd: 30 })
    })

    it('2025-03-21 -> 1404-01-01 (Nowruz 1404)', () => {
      expect(toJalaali(2025, 3, 21)).toEqual({ jy: 1404, jm: 1, jd: 1 })
    })
  })

  describe('toGregorian', () => {
    it('1404-03-22 -> 2025-06-12', () => {
      expect(toGregorian(1404, 3, 22)).toEqual({ gy: 2025, gm: 6, gd: 12 })
    })

    it('1405-01-01 -> 2026-03-21 (Nowruz)', () => {
      expect(toGregorian(1405, 1, 1)).toEqual({ gy: 2026, gm: 3, gd: 21 })
    })

    it('1402-12-10 -> 2024-02-29', () => {
      expect(toGregorian(1402, 12, 10)).toEqual({ gy: 2024, gm: 2, gd: 29 })
    })
  })

  describe('roundtrip', () => {
    it('toJalaali -> toGregorian is identity', () => {
      const dates = [
        [2020, 1, 1],
        [2024, 2, 29],
        [2025, 6, 12],
        [2026, 3, 21],
        [2000, 12, 31],
        [1999, 1, 1],
      ] as const
      for (const [gy, gm, gd] of dates) {
        const j = toJalaali(gy, gm, gd)
        const g = toGregorian(j.jy, j.jm, j.jd)
        expect(g).toEqual({ gy, gm, gd })
      }
    })

    it('toGregorian -> toJalaali is identity', () => {
      const dates = [
        [1404, 1, 1],
        [1404, 6, 31],
        [1404, 7, 30],
        [1404, 12, 29],
        [1403, 12, 30], // 1403 is leap
      ] as const
      for (const [jy, jm, jd] of dates) {
        const g = toGregorian(jy, jm, jd)
        const j = toJalaali(g.gy, g.gm, g.gd)
        expect(j).toEqual({ jy, jm, jd })
      }
    })
  })

  describe('isLeapJalaaliYear', () => {
    it('known leap years', () => {
      // 1399, 1403, 1408 are leap
      expect(isLeapJalaaliYear(1399)).toBe(true)
      expect(isLeapJalaaliYear(1403)).toBe(true)
      expect(isLeapJalaaliYear(1408)).toBe(true)
    })

    it('known non-leap years', () => {
      expect(isLeapJalaaliYear(1400)).toBe(false)
      expect(isLeapJalaaliYear(1401)).toBe(false)
      expect(isLeapJalaaliYear(1404)).toBe(false)
    })
  })

  describe('jalaaliMonthLength', () => {
    it('months 1-6 have 31 days', () => {
      for (let m = 1; m <= 6; m++) {
        expect(jalaaliMonthLength(1404, m)).toBe(31)
      }
    })

    it('months 7-11 have 30 days', () => {
      for (let m = 7; m <= 11; m++) {
        expect(jalaaliMonthLength(1404, m)).toBe(30)
      }
    })

    it('month 12 has 29 days in a non-leap year', () => {
      expect(jalaaliMonthLength(1404, 12)).toBe(29)
    })

    it('month 12 has 30 days in a leap year', () => {
      expect(jalaaliMonthLength(1403, 12)).toBe(30)
    })
  })

  describe('edge cases', () => {
    it('year boundary: last day of Esfand -> first day of Farvardin', () => {
      // 1403 is leap, so Esfand has 30 days
      const g = toGregorian(1403, 12, 30)
      const next = toJalaali(g.gy, g.gm, g.gd + 1)
      expect(next).toEqual({ jy: 1404, jm: 1, jd: 1 })
    })

    it('Nowruz falls around March 20-21', () => {
      const g = toGregorian(1404, 1, 1)
      expect(g.gm).toBe(3)
      expect(g.gd).toBeGreaterThanOrEqual(20)
      expect(g.gd).toBeLessThanOrEqual(22)
    })
  })

  describe('refusals and the supported years', () => {
    it('refuses a Gregorian date that does not exist', () => {
      expect(() => toJalaali(2025, 2, 29)).toThrow('Invalid Gregorian date: 2025-2-29')
      expect(() => toJalaali(2025, 13, 1)).toThrow(RangeError)
    })

    it('refuses a Jalaali month or day that does not exist', () => {
      expect(() => toGregorian(1404, 12, 30)).toThrow('Invalid Jalaali date: 1404-12-30')
      expect(() => toGregorian(1404, 0, 1)).toThrow(RangeError)
      expect(() => toGregorian(1404, 7, 31)).toThrow(RangeError)
      expect(jalaaliMonthLength(1404, 0)).toBe(0)
      expect(jalaaliMonthLength(1404, 13)).toBe(0)
    })

    it('ends every supported year the day before the next one starts, and reads both days back', () => {
      const wrong: number[] = []
      for (let jy = -61; jy < 3177; jy++) {
        const length = jalaaliMonthLength(jy, 12)
        const last = toGregorian(jy, 12, length)
        const next = toGregorian(jy + 1, 1, 1)
        const after = new Date(0)
        after.setUTCFullYear(last.gy, last.gm - 1, last.gd + 1)
        const start = new Date(0)
        start.setUTCFullYear(next.gy, next.gm - 1, next.gd)
        const readBack = [toJalaali(last.gy, last.gm, last.gd), toJalaali(next.gy, next.gm, next.gd)]
        if (
          after.getTime() !== start.getTime() ||
          JSON.stringify(readBack) !==
            JSON.stringify([
              { jy, jm: 12, jd: length },
              { jy: jy + 1, jm: 1, jd: 1 },
            ])
        ) {
          wrong.push(jy)
        }
      }

      expect(wrong).toEqual([])
    })

    it('refuses a year outside -61 to 3177 with a RangeError, as it refuses a date', () => {
      expect(() => isLeapJalaaliYear(3178)).toThrow(new RangeError('Invalid Jalaali year 3178'))
      expect(() => isLeapJalaaliYear(-62)).toThrow(RangeError)
      expect(() => toJalaali(3800, 6, 1)).toThrow(RangeError)
      expect(isLeapJalaaliYear(-61)).toBe(true)
      expect(toGregorian(3177, 1, 1)).toEqual({ gy: 3798, gm: 3, gd: 20 })
    })
  })
})
