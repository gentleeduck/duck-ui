import { beforeEach, describe, expect, it } from 'vitest'
import { NativeAdapter, PersianAdapter } from '../../adapter'
import { canNavigate, goToMonth, goToNextMonth, goToPrevMonth, goToYear, navigate } from '../navigation'

describe('navigation', () => {
  let adapter: NativeAdapter

  beforeEach(() => {
    adapter = new NativeAdapter()
  })

  describe('navigate', () => {
    describe('month', () => {
      it('next month advances by 1', () => {
        const result = navigate(adapter, adapter.create(2026, 2, 1), 'next', 'month')
        expect(result.getMonth()).toBe(3)
        expect(result.getFullYear()).toBe(2026)
      })

      it('prev month goes back by 1', () => {
        const result = navigate(adapter, adapter.create(2026, 2, 1), 'prev', 'month')
        expect(result.getMonth()).toBe(1)
        expect(result.getFullYear()).toBe(2026)
      })

      it('Dec -> next -> Jan of next year', () => {
        const result = navigate(adapter, adapter.create(2026, 11, 1), 'next', 'month')
        expect(result.getMonth()).toBe(0)
        expect(result.getFullYear()).toBe(2027)
      })

      it('Jan -> prev -> Dec of prev year', () => {
        const result = navigate(adapter, adapter.create(2026, 0, 1), 'prev', 'month')
        expect(result.getMonth()).toBe(11)
        expect(result.getFullYear()).toBe(2025)
      })
    })

    describe('year', () => {
      it('next year advances by 1', () => {
        const result = navigate(adapter, adapter.create(2026, 2, 1), 'next', 'year')
        expect(result.getFullYear()).toBe(2027)
        expect(result.getMonth()).toBe(2)
      })

      it('prev year goes back by 1', () => {
        const result = navigate(adapter, adapter.create(2026, 2, 1), 'prev', 'year')
        expect(result.getFullYear()).toBe(2025)
      })
    })

    describe('decade', () => {
      it('next decade advances by 10 years', () => {
        const result = navigate(adapter, adapter.create(2026, 0, 1), 'next', 'decade')
        expect(result.getFullYear()).toBe(2036)
      })

      it('prev decade goes back by 10 years', () => {
        const result = navigate(adapter, adapter.create(2026, 0, 1), 'prev', 'decade')
        expect(result.getFullYear()).toBe(2016)
      })
    })
  })

  describe('canNavigate', () => {
    it('returns true with no constraints', () => {
      expect(canNavigate(adapter, adapter.create(2026, 2, 1), 'prev', 'month')).toBe(true)
      expect(canNavigate(adapter, adapter.create(2026, 2, 1), 'next', 'month')).toBe(true)
    })

    it('returns true when going prev and only toDate is set', () => {
      expect(
        canNavigate(adapter, adapter.create(2026, 2, 1), 'prev', 'month', {
          toDate: adapter.create(2026, 5, 1),
        }),
      ).toBe(true)
    })

    it('returns true when going next and only fromDate is set', () => {
      expect(
        canNavigate(adapter, adapter.create(2026, 2, 1), 'next', 'month', {
          fromDate: adapter.create(2026, 0, 1),
        }),
      ).toBe(true)
    })

    describe('a year or a decade', () => {
      it('goes to a year with any day inside the bounds, not only its month', () => {
        expect([
          canNavigate(adapter, adapter.create(2026, 2, 1), 'prev', 'year', { fromDate: adapter.create(2025, 5, 15) }),
          canNavigate(adapter, adapter.create(2026, 8, 1), 'next', 'year', { toDate: adapter.create(2027, 2, 15) }),
        ]).toEqual([true, true])
      })

      it('goes to a decade with any year inside the bounds, and no further', () => {
        const date = adapter.create(2026, 2, 1)

        expect([
          canNavigate(adapter, date, 'prev', 'decade', { fromDate: adapter.create(2019, 5, 1) }),
          canNavigate(adapter, date, 'prev', 'decade', { fromDate: adapter.create(2020, 0, 1) }),
          canNavigate(adapter, date, 'next', 'decade', { toDate: adapter.create(2030, 0, 1) }),
          canNavigate(adapter, date, 'next', 'decade', { toDate: adapter.create(2029, 11, 31) }),
        ]).toEqual([true, false, true, false])
      })
    })

    describe('fromDate constraint (prev direction)', () => {
      it('can navigate prev when target month still has days >= fromDate', () => {
        // current: March 2026, fromDate: Feb 15  -  going to Feb is fine (Feb has days after the 15th)
        const result = canNavigate(adapter, adapter.create(2026, 2, 1), 'prev', 'month', {
          fromDate: adapter.create(2026, 1, 15),
        })
        expect(result).toBe(true)
      })

      it('cannot navigate prev when target month ends before fromDate', () => {
        // current: March 2026, fromDate: March 1  -  going to Feb, but Feb ends Feb 28 < March 1
        const result = canNavigate(adapter, adapter.create(2026, 2, 1), 'prev', 'month', {
          fromDate: adapter.create(2026, 2, 1),
        })
        expect(result).toBe(false)
      })

      it('blocks year navigation when prev year is fully before fromDate', () => {
        const result = canNavigate(adapter, adapter.create(2026, 2, 1), 'prev', 'year', {
          fromDate: adapter.create(2026, 0, 1),
        })
        // going to 2025, Dec 31 2025 < Jan 1 2026
        expect(result).toBe(false)
      })

      it('allows year navigation when prev year has days after fromDate', () => {
        const result = canNavigate(adapter, adapter.create(2026, 6, 1), 'prev', 'year', {
          fromDate: adapter.create(2025, 6, 1),
        })
        // going to 2025, Dec 31 2025 >= July 1 2025
        expect(result).toBe(true)
      })
    })

    describe('toDate constraint (next direction)', () => {
      it('can navigate next when target month starts before toDate', () => {
        const result = canNavigate(adapter, adapter.create(2026, 2, 1), 'next', 'month', {
          toDate: adapter.create(2026, 3, 15),
        })
        expect(result).toBe(true)
      })

      it('cannot navigate next when target month starts after toDate', () => {
        // current: March 2026, toDate: March 31  -  going to April, Apr 1 > Mar 31
        const result = canNavigate(adapter, adapter.create(2026, 2, 1), 'next', 'month', {
          toDate: adapter.create(2026, 2, 31),
        })
        expect(result).toBe(false)
      })

      it('blocks year navigation when next year is fully after toDate', () => {
        const result = canNavigate(adapter, adapter.create(2026, 2, 1), 'next', 'year', {
          toDate: adapter.create(2026, 11, 31),
        })
        // going to 2027, Jan 1 2027 > Dec 31 2026
        expect(result).toBe(false)
      })

      it('allows year navigation when next year has days before toDate', () => {
        const result = canNavigate(adapter, adapter.create(2026, 2, 1), 'next', 'year', {
          toDate: adapter.create(2027, 6, 1),
        })
        expect(result).toBe(true)
      })
    })
  })

  describe('goToNextMonth', () => {
    it('advances by 1 month', () => {
      const result = goToNextMonth(adapter, adapter.create(2026, 2, 1))
      expect(result.getMonth()).toBe(3)
    })

    it('wraps Dec -> Jan', () => {
      const result = goToNextMonth(adapter, adapter.create(2026, 11, 1))
      expect(result.getMonth()).toBe(0)
      expect(result.getFullYear()).toBe(2027)
    })
  })

  describe('goToPrevMonth', () => {
    it('goes back 1 month', () => {
      const result = goToPrevMonth(adapter, adapter.create(2026, 2, 1))
      expect(result.getMonth()).toBe(1)
    })

    it('wraps Jan -> Dec', () => {
      const result = goToPrevMonth(adapter, adapter.create(2026, 0, 1))
      expect(result.getMonth()).toBe(11)
      expect(result.getFullYear()).toBe(2025)
    })
  })

  describe('goToMonth', () => {
    it('changes the month, keeps the year', () => {
      const result = goToMonth(adapter, adapter.create(2026, 2, 1), 8) // September
      expect(result.getMonth()).toBe(8)
      expect(result.getFullYear()).toBe(2026)
    })

    it('always returns the 1st of the target month', () => {
      const result = goToMonth(adapter, adapter.create(2026, 2, 17), 0)
      expect(result.getDate()).toBe(1)
    })

    it('handles January (0)', () => {
      expect(goToMonth(adapter, adapter.create(2026, 6, 1), 0).getMonth()).toBe(0)
    })

    it('handles December (11)', () => {
      expect(goToMonth(adapter, adapter.create(2026, 6, 1), 11).getMonth()).toBe(11)
    })
  })

  describe('goToYear', () => {
    it('changes the year, keeps the month', () => {
      const result = goToYear(adapter, adapter.create(2026, 2, 1), 2030)
      expect(result.getFullYear()).toBe(2030)
      expect(result.getMonth()).toBe(2)
    })

    it('always returns the 1st of the month', () => {
      const result = goToYear(adapter, adapter.create(2026, 2, 17), 2030)
      expect(result.getDate()).toBe(1)
    })

    it('handles going backward in years', () => {
      const result = goToYear(adapter, adapter.create(2026, 5, 1), 2000)
      expect(result.getFullYear()).toBe(2000)
      expect(result.getMonth()).toBe(5)
    })
  })

  describe('navigate – year boundary edge cases', () => {
    it('Dec 31 -> next month -> Jan 1 of next year', () => {
      const result = navigate(adapter, adapter.create(2026, 11, 31), 'next', 'month')
      expect(result.getMonth()).toBe(0)
      expect(result.getFullYear()).toBe(2027)
      expect(result.getDate()).toBe(31)
    })

    it('Jan 1 -> prev month -> Dec 1 of prev year', () => {
      const result = navigate(adapter, adapter.create(2027, 0, 1), 'prev', 'month')
      expect(result.getMonth()).toBe(11)
      expect(result.getFullYear()).toBe(2026)
    })

    it('Dec -> next year -> Dec of next year', () => {
      const result = navigate(adapter, adapter.create(2026, 11, 15), 'next', 'year')
      expect(result.getFullYear()).toBe(2027)
      expect(result.getMonth()).toBe(11)
    })

    it('Jan -> prev year -> Jan of prev year', () => {
      const result = navigate(adapter, adapter.create(2026, 0, 15), 'prev', 'year')
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0)
    })

    it('navigate prev decade from year 2005 goes to 1995', () => {
      const result = navigate(adapter, adapter.create(2005, 6, 1), 'prev', 'decade')
      expect(result.getFullYear()).toBe(1995)
      expect(result.getMonth()).toBe(6)
    })

    it('navigate next decade from year 2095 goes to 2105', () => {
      const result = navigate(adapter, adapter.create(2095, 0, 1), 'next', 'decade')
      expect(result.getFullYear()).toBe(2105)
    })
  })

  describe('navigate – day clamping', () => {
    it('Jan 31 -> next month clamps to Feb 28 (non-leap)', () => {
      const result = navigate(adapter, adapter.create(2026, 0, 31), 'next', 'month')
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(28)
    })

    it('Jan 31 -> next month clamps to Feb 29 (leap year)', () => {
      const result = navigate(adapter, adapter.create(2028, 0, 31), 'next', 'month')
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(29)
    })

    it('Mar 31 -> prev month clamps to Feb 28 (non-leap)', () => {
      const result = navigate(adapter, adapter.create(2026, 2, 31), 'prev', 'month')
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(28)
    })

    it('Feb 29 (leap) -> next year clamps to Feb 28 (non-leap)', () => {
      const result = navigate(adapter, adapter.create(2028, 1, 29), 'next', 'year')
      expect(result.getFullYear()).toBe(2029)
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(28)
    })
  })

  describe('canNavigate – tight boundary constraints', () => {
    it('cannot go prev month when fromDate is start of current month', () => {
      const result = canNavigate(adapter, adapter.create(2026, 5, 1), 'prev', 'month', {
        fromDate: adapter.create(2026, 5, 1),
      })
      expect(result).toBe(false)
    })

    it('cannot go next month when toDate is end of current month', () => {
      const result = canNavigate(adapter, adapter.create(2026, 5, 1), 'next', 'month', {
        toDate: adapter.create(2026, 5, 30),
      })
      expect(result).toBe(false)
    })

    it('can go prev month when fromDate is in the previous month', () => {
      const result = canNavigate(adapter, adapter.create(2026, 5, 1), 'prev', 'month', {
        fromDate: adapter.create(2026, 4, 15),
      })
      expect(result).toBe(true)
    })

    it('can go next month when toDate is in the next month', () => {
      const result = canNavigate(adapter, adapter.create(2026, 5, 1), 'next', 'month', {
        toDate: adapter.create(2026, 6, 1),
      })
      expect(result).toBe(true)
    })

    it('canNavigate prev across year boundary with fromDate in Dec of prev year', () => {
      const result = canNavigate(adapter, adapter.create(2027, 0, 1), 'prev', 'month', {
        fromDate: adapter.create(2026, 11, 1),
      })
      expect(result).toBe(true)
    })

    it('canNavigate next across year boundary with toDate in Jan of next year', () => {
      const result = canNavigate(adapter, adapter.create(2026, 11, 1), 'next', 'month', {
        toDate: adapter.create(2027, 0, 15),
      })
      expect(result).toBe(true)
    })

    it('canNavigate prev decade blocked by fromDate', () => {
      const result = canNavigate(adapter, adapter.create(2026, 6, 1), 'prev', 'decade', {
        fromDate: adapter.create(2020, 0, 1),
      })
      // the previous decade, 2010 to 2019, ends before Jan 1 2020
      expect(result).toBe(false)
    })

    it('canNavigate next decade blocked by toDate', () => {
      const result = canNavigate(adapter, adapter.create(2026, 6, 1), 'next', 'decade', {
        toDate: adapter.create(2029, 11, 31),
      })
      // the next decade, 2030 to 2039, starts after Dec 31 2029
      expect(result).toBe(false)
    })

    it('canNavigate prev with both fromDate and toDate, only fromDate matters', () => {
      const result = canNavigate(adapter, adapter.create(2026, 3, 1), 'prev', 'month', {
        fromDate: adapter.create(2026, 2, 1),
        toDate: adapter.create(2026, 8, 1),
      })
      expect(result).toBe(true)
    })

    it('canNavigate next with both fromDate and toDate, only toDate matters', () => {
      const result = canNavigate(adapter, adapter.create(2026, 7, 1), 'next', 'month', {
        fromDate: adapter.create(2026, 2, 1),
        toDate: adapter.create(2026, 8, 15),
      })
      expect(result).toBe(true)
    })

    it('canNavigate returns true for no constraints (decade)', () => {
      expect(canNavigate(adapter, adapter.create(2026, 6, 1), 'prev', 'decade')).toBe(true)
      expect(canNavigate(adapter, adapter.create(2026, 6, 1), 'next', 'decade')).toBe(true)
    })
  })

  describe('goToMonth – edge cases', () => {
    it('going to Feb from a 31-day month gives Feb 1', () => {
      const result = goToMonth(adapter, adapter.create(2026, 0, 31), 1)
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(1)
    })

    it('going to same month is a no-op on month value', () => {
      const result = goToMonth(adapter, adapter.create(2026, 5, 15), 5)
      expect(result.getMonth()).toBe(5)
      expect(result.getDate()).toBe(1)
    })
  })

  describe('goToYear – edge cases', () => {
    it('handles leap year source: Feb keeps month when going to non-leap year', () => {
      const result = goToYear(adapter, adapter.create(2028, 1, 29), 2026)
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(1)
    })

    it('handles distant future year', () => {
      const result = goToYear(adapter, adapter.create(2026, 3, 10), 3000)
      expect(result.getFullYear()).toBe(3000)
      expect(result.getMonth()).toBe(3)
    })

    it('handles very early year', () => {
      const result = goToYear(adapter, adapter.create(2026, 3, 10), 1900)
      expect(result.getFullYear()).toBe(1900)
      expect(result.getMonth()).toBe(3)
    })

    it('going to same year is a no-op on year value', () => {
      const result = goToYear(adapter, adapter.create(2026, 7, 20), 2026)
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(7)
      expect(result.getDate()).toBe(1)
    })
  })

  describe('consecutive navigation', () => {
    it('12 next months returns to same month, next year', () => {
      let date = adapter.create(2026, 3, 15)
      for (let i = 0; i < 12; i++) {
        date = navigate(adapter, date, 'next', 'month')
      }
      expect(date.getMonth()).toBe(3)
      expect(date.getFullYear()).toBe(2027)
    })

    it('12 prev months returns to same month, prev year', () => {
      let date = adapter.create(2026, 3, 15)
      for (let i = 0; i < 12; i++) {
        date = navigate(adapter, date, 'prev', 'month')
      }
      expect(date.getMonth()).toBe(3)
      expect(date.getFullYear()).toBe(2025)
    })

    it('next then prev month is identity', () => {
      const original = adapter.create(2026, 5, 1)
      const forward = navigate(adapter, original, 'next', 'month')
      const back = navigate(adapter, forward, 'prev', 'month')
      expect(back.getMonth()).toBe(original.getMonth())
      expect(back.getFullYear()).toBe(original.getFullYear())
    })

    it('next then prev year is identity', () => {
      const original = adapter.create(2026, 5, 15)
      const forward = navigate(adapter, original, 'next', 'year')
      const back = navigate(adapter, forward, 'prev', 'year')
      expect(back.getFullYear()).toBe(original.getFullYear())
      expect(back.getMonth()).toBe(original.getMonth())
    })
  })
})

describe("canNavigate near an adapter's last year", () => {
  it('moves a decade toward the last year without making a year past it', () => {
    const persian = new PersianAdapter()

    expect(
      canNavigate(persian, persian.create(3165, 0, 1), 'next', 'decade', { toDate: persian.create(3176, 0, 1) }),
    ).toBe(true)
  })
})
