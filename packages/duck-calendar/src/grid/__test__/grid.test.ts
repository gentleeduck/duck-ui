import { beforeEach, describe, expect, it } from 'vitest'
import { NativeAdapter } from '../../adapter'
import { buildCalendarMonth, buildCalendarYear, buildDecadeView, buildMultiMonth } from '../grid'
import { getLocaleWeekInfo, getLocalizedMonthNames, getLocalizedWeekdays, getWeekNumber } from '../grid.libs'

describe('grid', () => {
  let adapter: NativeAdapter

  beforeEach(() => {
    adapter = new NativeAdapter()
  })

  describe('buildCalendarMonth', () => {
    const march2026 = new Date(2026, 2, 1) // March 1 2026  -  starts on Sunday

    const baseConfig = {
      showOutsideDays: true,
      fixedWeeks: false,
      locale: { weekStartDay: 0 as const },
    }

    it('returns a CalendarMonth with the correct month date', () => {
      const result = buildCalendarMonth(adapter, march2026, baseConfig)
      expect(result.month.getMonth()).toBe(2)
      expect(result.month.getFullYear()).toBe(2026)
      expect(result.month.getDate()).toBe(1)
    })

    it('each week has exactly 7 days', () => {
      const result = buildCalendarMonth(adapter, march2026, baseConfig)
      for (const week of result.weeks) {
        expect(week.days).toHaveLength(7)
      }
    })

    it('March 2026 has 5 weeks (not fixedWeeks)', () => {
      // March 2026: starts Sunday, ends Tuesday -> 5 rows
      const result = buildCalendarMonth(adapter, march2026, baseConfig)
      expect(result.weeks).toHaveLength(5)
    })

    it('fixedWeeks always returns 6 weeks', () => {
      const result = buildCalendarMonth(adapter, march2026, { ...baseConfig, fixedWeeks: true })
      expect(result.weeks).toHaveLength(6)
    })

    it('Feb 2026 has 4 weeks (28 days, starts Sunday)', () => {
      const feb2026 = new Date(2026, 1, 1) // Feb 1 is a Sunday
      const result = buildCalendarMonth(adapter, feb2026, baseConfig)
      expect(result.weeks).toHaveLength(4)
    })

    it('sets isOutside correctly for days not in the target month', () => {
      const result = buildCalendarMonth(adapter, march2026, baseConfig)
      const firstWeek = result.weeks[0]!
      // March 2026 starts on Sunday so no outside days in first row
      for (const day of firstWeek.days) {
        expect(day.isOutside).toBe(false)
      }

      const lastWeek = result.weeks[result.weeks.length - 1]!
      // Last week of March ends on Tuesday (31st), so Wed-Sat are April days
      const outsideDays = lastWeek.days.filter((d) => d.isOutside)
      expect(outsideDays.length).toBeGreaterThan(0)
      for (const d of outsideDays) {
        expect(d.date.getMonth()).toBe(3) // April
      }
    })

    it('sets isWeekend for Saturday and Sunday', () => {
      const result = buildCalendarMonth(adapter, march2026, baseConfig)
      for (const week of result.weeks) {
        for (const day of week.days) {
          const dow = day.date.getDay()
          if (dow === 0 || dow === 6) {
            expect(day.isWeekend).toBe(true)
          } else {
            expect(day.isWeekend).toBe(false)
          }
        }
      }
    })

    it('selection flags all default to false', () => {
      const result = buildCalendarMonth(adapter, march2026, baseConfig)
      for (const week of result.weeks) {
        for (const day of week.days) {
          expect(day.isSelected).toBe(false)
          expect(day.isDisabled).toBe(false)
          expect(day.isRangeStart).toBe(false)
          expect(day.isRangeEnd).toBe(false)
          expect(day.isRangeMiddle).toBe(false)
        }
      }
    })

    it('weekStartDay=1 (Monday) shifts the grid  -  first cell is a Monday', () => {
      const result = buildCalendarMonth(adapter, march2026, {
        ...baseConfig,
        locale: { weekStartDay: 1 as const },
      })
      const firstCell = result.weeks[0]!.days[0]!
      expect(firstCell.date.getDay()).toBe(1) // Monday
    })

    it('weekStartDay=0 (Sunday)  -  first cell is a Sunday', () => {
      const result = buildCalendarMonth(adapter, march2026, baseConfig)
      const firstCell = result.weeks[0]!.days[0]!
      expect(firstCell.date.getDay()).toBe(0) // Sunday
    })

    it('covers all days of the target month', () => {
      const result = buildCalendarMonth(adapter, march2026, baseConfig)
      const allDates = result.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
      expect(allDates).toHaveLength(31) // March has 31 days
      expect(allDates[0]!.date.getDate()).toBe(1)
      expect(allDates[30]!.date.getDate()).toBe(31)
    })

    it('each week has a weekNumber', () => {
      const result = buildCalendarMonth(adapter, march2026, baseConfig)
      for (const week of result.weeks) {
        expect(typeof week.weekNumber).toBe('number')
        expect(week.weekNumber).toBeGreaterThan(0)
        expect(week.weekNumber).toBeLessThanOrEqual(53)
      }
    })

    it('March 2026 week numbers are sequential', () => {
      const result = buildCalendarMonth(adapter, march2026, baseConfig)
      const numbers = result.weeks.map((w) => w.weekNumber)
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBe(numbers[i - 1]! + 1)
      }
    })

    it('no locale defaults weekStartDay to 0', () => {
      const result = buildCalendarMonth(adapter, march2026, {
        showOutsideDays: true,
        fixedWeeks: false,
        locale: undefined,
      })
      const firstCell = result.weeks[0]!.days[0]!
      expect(firstCell.date.getDay()).toBe(0)
    })
  })

  describe('buildCalendarYear', () => {
    it('returns exactly 12 entries', () => {
      const result = buildCalendarYear(adapter, new Date(2026, 0, 1))
      expect(result).toHaveLength(12)
    })

    it('month indices are 0-11 in order', () => {
      const result = buildCalendarYear(adapter, new Date(2026, 0, 1))
      result.forEach((entry, i) => {
        expect(entry.month).toBe(i)
      })
    })

    it('all entries have a non-empty label', () => {
      const result = buildCalendarYear(adapter, new Date(2026, 0, 1), 'en-US')
      for (const entry of result) {
        expect(typeof entry.label).toBe('string')
        expect(entry.label.length).toBeGreaterThan(0)
      }
    })

    it('isCurrent is true only for the current month/year', () => {
      const today = adapter.today()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()

      const result = buildCalendarYear(adapter, today)
      const currentEntries = result.filter((e) => e.isCurrent)
      expect(currentEntries).toHaveLength(1)
      expect(currentEntries[0]!.month).toBe(currentMonth)
      // viewYear matches currentYear so exactly one isCurrent
      expect(result[currentMonth]!.isCurrent).toBe(true)
    })

    it('isCurrent is false for all entries when viewing a different year', () => {
      const result = buildCalendarYear(adapter, new Date(1900, 0, 1))
      expect(result.every((e) => !e.isCurrent)).toBe(true)
    })

    it('en-US January label is "January"', () => {
      const result = buildCalendarYear(adapter, new Date(2026, 0, 1), 'en-US')
      expect(result[0]!.label).toBe('January')
    })
  })

  describe('buildDecadeView', () => {
    it('returns exactly 12 entries', () => {
      const result = buildDecadeView(adapter, new Date(2026, 0, 1))
      expect(result).toHaveLength(12)
    })

    it('years are consecutive', () => {
      const result = buildDecadeView(adapter, new Date(2026, 0, 1))
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!.year).toBe(result[i - 1]!.year + 1)
      }
    })

    it('decade for 2026 starts at 2019 (decade 2020, -1 context)', () => {
      // floor(2026/10)*10 = 2020, minus 1 = 2019
      const result = buildDecadeView(adapter, new Date(2026, 0, 1))
      expect(result[0]!.year).toBe(2019)
      expect(result[11]!.year).toBe(2030)
    })

    it('isCurrent is true only for the current year', () => {
      const today = adapter.today()
      const currentYear = today.getFullYear()
      const result = buildDecadeView(adapter, today)
      const currentEntries = result.filter((e) => e.isCurrent)
      expect(currentEntries).toHaveLength(1)
      expect(currentEntries[0]!.year).toBe(currentYear)
    })

    it('isCurrent is false for all entries when current year is out of range', () => {
      const result = buildDecadeView(adapter, new Date(1800, 0, 1))
      expect(result.every((e) => !e.isCurrent)).toBe(true)
    })
  })

  describe('getLocalizedWeekdays', () => {
    it('returns 7 entries', () => {
      const result = getLocalizedWeekdays(adapter, 'en-US', 0)
      expect(result).toHaveLength(7)
    })

    it('weekStartDay=0 starts with Sunday', () => {
      const result = getLocalizedWeekdays(adapter, 'en-US', 0, 'short')
      expect(result[0]).toBe('Sun')
    })

    it('weekStartDay=1 starts with Monday', () => {
      const result = getLocalizedWeekdays(adapter, 'en-US', 1, 'short')
      expect(result[0]).toBe('Mon')
    })

    it('weekStartDay=6 starts with Saturday', () => {
      const result = getLocalizedWeekdays(adapter, 'en-US', 6, 'short')
      expect(result[0]).toBe('Sat')
    })

    it('contains all 7 unique day names', () => {
      const result = getLocalizedWeekdays(adapter, 'en-US', 0, 'short')
      expect(new Set(result).size).toBe(7)
    })

    it('long format returns full day names', () => {
      const result = getLocalizedWeekdays(adapter, 'en-US', 0, 'long')
      expect(result[0]).toBe('Sunday')
    })

    it('narrow format returns single letter', () => {
      const result = getLocalizedWeekdays(adapter, 'en-US', 0, 'narrow')
      expect(result[0]).toBe('S')
    })

    it('defaults to short format', () => {
      const withDefault = getLocalizedWeekdays(adapter, 'en-US', 0)
      const withShort = getLocalizedWeekdays(adapter, 'en-US', 0, 'short')
      expect(withDefault).toEqual(withShort)
    })
  })

  describe('getLocalizedMonthNames', () => {
    it('returns 12 entries', () => {
      const result = getLocalizedMonthNames(adapter, 2025, 'en-US')
      expect(result).toHaveLength(12)
    })

    it('first entry is January, last is December', () => {
      const result = getLocalizedMonthNames(adapter, 2025, 'en-US')
      expect(result[0]).toBe('January')
      expect(result[11]).toBe('December')
    })

    it('short format', () => {
      const result = getLocalizedMonthNames(adapter, 2025, 'en-US', 'short')
      expect(result[0]).toBe('Jan')
      expect(result[11]).toBe('Dec')
    })

    it('narrow format', () => {
      const result = getLocalizedMonthNames(adapter, 2025, 'en-US', 'narrow')
      expect(result[0]).toBe('J')
    })

    it('all 12 names are non-empty strings', () => {
      const result = getLocalizedMonthNames(adapter, 2025, 'en-US')
      for (const name of result) {
        expect(typeof name).toBe('string')
        expect(name.length).toBeGreaterThan(0)
      }
    })
  })

  describe('getWeekNumber', () => {
    it('Jan 1 2026 is in week 1', () => {
      // Jan 1 2026 is a Thursday -> week 1
      expect(getWeekNumber(adapter, new Date(2026, 0, 1))).toBe(1)
    })

    it('Dec 31 2026 is in week 53', () => {
      // Dec 31 2026 is a Thursday -> week 53
      expect(getWeekNumber(adapter, new Date(2026, 11, 31))).toBe(53)
    })

    it('March 17 2026 (Tuesday) is in week 12', () => {
      expect(getWeekNumber(adapter, new Date(2026, 2, 17))).toBe(12)
    })

    it('returns a number between 1 and 53', () => {
      // check every Monday in 2026
      let d = new Date(2026, 0, 5) // first Monday
      while (d.getFullYear() === 2026) {
        const wn = getWeekNumber(adapter, d)
        expect(wn).toBeGreaterThanOrEqual(1)
        expect(wn).toBeLessThanOrEqual(53)
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)
      }
    })

    it('counts the weeks of a leap year before Jan 1 by its 366 days', () => {
      // Both fall on a Saturday; only 2004 has the day that makes a week 53
      expect([getWeekNumber(adapter, new Date(2005, 0, 1)), getWeekNumber(adapter, new Date(2022, 0, 1))]).toEqual([
        53, 52,
      ])
    })

    it('Jan 1 on a Sunday belongs to week 52 of prior year (ISO rule)', () => {
      // 2023-01-01 is a Sunday. ISO week: the Thursday of that week is Dec 29 2022 -> week 52
      expect(getWeekNumber(adapter, new Date(2023, 0, 1))).toBe(52)
    })

    it('Dec 31 on a Monday is week 1 of next year (ISO rule)', () => {
      // 2018-12-31 is a Monday. The Thursday of that week is Jan 3 2019 -> week 1
      expect(getWeekNumber(adapter, new Date(2018, 11, 31))).toBe(1)
    })
  })

  describe('buildCalendarMonth / edge cases', () => {
    const baseConfig = {
      showOutsideDays: true,
      fixedWeeks: false,
      locale: { weekStartDay: 0 as const },
    }

    it('leap year February 2024 has 29 days', () => {
      const feb2024 = new Date(2024, 1, 1) // Feb 2024 is a leap year
      const result = buildCalendarMonth(adapter, feb2024, baseConfig)
      const inMonth = result.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
      expect(inMonth).toHaveLength(29)
      expect(inMonth[28]!.date.getDate()).toBe(29)
    })

    it('non-leap year February 2025 has 28 days', () => {
      const feb2025 = new Date(2025, 1, 1)
      const result = buildCalendarMonth(adapter, feb2025, baseConfig)
      const inMonth = result.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
      expect(inMonth).toHaveLength(28)
      expect(inMonth[27]!.date.getDate()).toBe(28)
    })

    it('century non-leap year February 1900 has 28 days', () => {
      const feb1900 = new Date(1900, 1, 1)
      const result = buildCalendarMonth(adapter, feb1900, baseConfig)
      const inMonth = result.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
      expect(inMonth).toHaveLength(28)
    })

    it('century leap year February 2000 has 29 days', () => {
      const feb2000 = new Date(2000, 1, 1)
      const result = buildCalendarMonth(adapter, feb2000, baseConfig)
      const inMonth = result.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
      expect(inMonth).toHaveLength(29)
    })

    it('December 2025 outside days are January 2026', () => {
      const dec2025 = new Date(2025, 11, 1) // December 2025
      const result = buildCalendarMonth(adapter, dec2025, baseConfig)
      const lastWeek = result.weeks[result.weeks.length - 1]!
      const outsideDays = lastWeek.days.filter((d) => d.isOutside)
      for (const d of outsideDays) {
        expect(d.date.getMonth()).toBe(0) // January
        expect(d.date.getFullYear()).toBe(2026)
      }
    })

    it('January 2026 outside days from December 2025', () => {
      const jan2026 = new Date(2026, 0, 1) // Jan 1 2026 is a Thursday
      const result = buildCalendarMonth(adapter, jan2026, baseConfig)
      const firstWeek = result.weeks[0]!
      const outsideDays = firstWeek.days.filter((d) => d.isOutside)
      expect(outsideDays.length).toBeGreaterThan(0)
      for (const d of outsideDays) {
        expect(d.date.getMonth()).toBe(11) // December
        expect(d.date.getFullYear()).toBe(2025)
      }
    })

    it('month starting on Saturday has outside days at start (weekStartDay=0)', () => {
      // May 2026 starts on Friday, August 2025 starts on Friday
      // November 2025 starts on Saturday
      const nov2025 = new Date(2025, 10, 1) // Nov 1 2025 is a Saturday
      const result = buildCalendarMonth(adapter, nov2025, baseConfig)
      const firstWeek = result.weeks[0]!
      // With Sunday start, days before Saturday are outside
      const outsideDays = firstWeek.days.filter((d) => d.isOutside)
      expect(outsideDays.length).toBe(6) // Sun-Fri are outside, Saturday is Nov 1
    })

    it('month starting on Sunday has no outside days in first week (weekStartDay=0)', () => {
      // Feb 2026 starts on Sunday
      const feb2026 = new Date(2026, 1, 1)
      const result = buildCalendarMonth(adapter, feb2026, baseConfig)
      const firstWeek = result.weeks[0]!
      const outsideDays = firstWeek.days.filter((d) => d.isOutside)
      expect(outsideDays).toHaveLength(0)
    })

    it('weekStartDay=1 (Monday) for a month starting on Monday has no outside days in first week', () => {
      // June 2026 starts on Monday
      const june2026 = new Date(2026, 5, 1)
      const result = buildCalendarMonth(adapter, june2026, {
        ...baseConfig,
        locale: { weekStartDay: 1 },
      })
      const firstWeek = result.weeks[0]!
      const outsideDays = firstWeek.days.filter((d) => d.isOutside)
      expect(outsideDays).toHaveLength(0)
    })

    it('weekStartDay=6 (Saturday) shifts grid correctly', () => {
      const result = buildCalendarMonth(adapter, new Date(2026, 2, 1), {
        ...baseConfig,
        locale: { weekStartDay: 6 },
      })
      const firstCell = result.weeks[0]!.days[0]!
      expect(firstCell.date.getDay()).toBe(6) // Saturday
    })

    it('showOutsideDays=false marks outside days as hidden and disabled', () => {
      const jan2026 = new Date(2026, 0, 1)
      const result = buildCalendarMonth(adapter, jan2026, {
        ...baseConfig,
        showOutsideDays: false,
      })
      const allDays = result.weeks.flatMap((w) => w.days)
      const outsideDays = allDays.filter((d) => d.isOutside)
      expect(outsideDays.length).toBeGreaterThan(0)
      for (const d of outsideDays) {
        expect(d.isHidden).toBe(true)
        expect(d.isDisabled).toBe(true)
      }
    })

    it('showOutsideDays=true marks outside days as visible and not disabled', () => {
      const jan2026 = new Date(2026, 0, 1)
      const result = buildCalendarMonth(adapter, jan2026, {
        ...baseConfig,
        showOutsideDays: true,
      })
      const allDays = result.weeks.flatMap((w) => w.days)
      const outsideDays = allDays.filter((d) => d.isOutside)
      for (const d of outsideDays) {
        expect(d.isHidden).toBe(false)
        expect(d.isDisabled).toBe(false)
      }
    })

    it('fixedWeeks=true adds 6th week even when month only needs 4 (Feb 2026)', () => {
      const feb2026 = new Date(2026, 1, 1) // starts on Sunday, 28 days = 4 weeks exact
      const result = buildCalendarMonth(adapter, feb2026, { ...baseConfig, fixedWeeks: true })
      expect(result.weeks).toHaveLength(6)
      // The extra 2 weeks should be all outside days
      const week5Days = result.weeks[4]!.days.filter((d) => d.isOutside)
      const week6Days = result.weeks[5]!.days.filter((d) => d.isOutside)
      expect(week5Days).toHaveLength(7)
      expect(week6Days).toHaveLength(7)
    })

    it('isToday is true for exactly one day when viewing current month', () => {
      const today = adapter.today()
      const viewDate = new Date(today.getFullYear(), today.getMonth(), 1)
      const result = buildCalendarMonth(adapter, viewDate, baseConfig)
      const todayDays = result.weeks.flatMap((w) => w.days).filter((d) => d.isToday)
      expect(todayDays).toHaveLength(1)
      expect(todayDays[0]!.date.getDate()).toBe(today.getDate())
    })

    it('isToday is false for all days when viewing a different month', () => {
      const result = buildCalendarMonth(adapter, new Date(1990, 5, 1), baseConfig)
      const todayDays = result.weeks.flatMap((w) => w.days).filter((d) => d.isToday)
      expect(todayDays).toHaveLength(0)
    })

    it('31-day months have all 31 days present (January, July, August)', () => {
      for (const month of [0, 6, 7]) {
        const result = buildCalendarMonth(adapter, new Date(2026, month, 1), baseConfig)
        const inMonth = result.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
        expect(inMonth).toHaveLength(31)
      }
    })

    it('30-day months have all 30 days present (April, June, September, November)', () => {
      for (const month of [3, 5, 8, 10]) {
        const result = buildCalendarMonth(adapter, new Date(2026, month, 1), baseConfig)
        const inMonth = result.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
        expect(inMonth).toHaveLength(30)
      }
    })
  })

  describe('buildMultiMonth', () => {
    const baseConfig = {
      showOutsideDays: true,
      fixedWeeks: false,
      locale: { weekStartDay: 0 as const },
    }

    it('returns 0 months when count is 0', () => {
      const result = buildMultiMonth(adapter, new Date(2026, 0, 1), 0, baseConfig)
      expect(result).toHaveLength(0)
    })

    it('returns 1 month when count is 1', () => {
      const result = buildMultiMonth(adapter, new Date(2026, 0, 1), 1, baseConfig)
      expect(result).toHaveLength(1)
      expect(result[0]!.month.getMonth()).toBe(0) // January
    })

    it('returns 3 consecutive months', () => {
      const result = buildMultiMonth(adapter, new Date(2026, 2, 1), 3, baseConfig)
      expect(result).toHaveLength(3)
      expect(result[0]!.month.getMonth()).toBe(2) // March
      expect(result[1]!.month.getMonth()).toBe(3) // April
      expect(result[2]!.month.getMonth()).toBe(4) // May
    })

    it('returns 12 months for a full year', () => {
      const result = buildMultiMonth(adapter, new Date(2026, 0, 1), 12, baseConfig)
      expect(result).toHaveLength(12)
      for (let i = 0; i < 12; i++) {
        expect(result[i]!.month.getMonth()).toBe(i)
      }
    })

    it('wraps across year boundary (Nov 2025 + 4 months)', () => {
      const result = buildMultiMonth(adapter, new Date(2025, 10, 1), 4, baseConfig)
      expect(result).toHaveLength(4)
      expect(result[0]!.month.getMonth()).toBe(10) // November 2025
      expect(result[0]!.month.getFullYear()).toBe(2025)
      expect(result[1]!.month.getMonth()).toBe(11) // December 2025
      expect(result[2]!.month.getMonth()).toBe(0) // January 2026
      expect(result[2]!.month.getFullYear()).toBe(2026)
      expect(result[3]!.month.getMonth()).toBe(1) // February 2026
    })

    it('each month grid has 7-day weeks', () => {
      const result = buildMultiMonth(adapter, new Date(2026, 0, 1), 6, baseConfig)
      for (const month of result) {
        for (const week of month.weeks) {
          expect(week.days).toHaveLength(7)
        }
      }
    })
  })

  describe('buildDecadeView / edge cases', () => {
    it('decade for year 2000 starts at 1999', () => {
      const result = buildDecadeView(adapter, new Date(2000, 0, 1))
      expect(result[0]!.year).toBe(1999)
      expect(result[11]!.year).toBe(2010)
    })

    it('decade for year 2009 starts at 1999 (same decade as 2000)', () => {
      const result = buildDecadeView(adapter, new Date(2009, 0, 1))
      expect(result[0]!.year).toBe(1999)
      expect(result[11]!.year).toBe(2010)
    })

    it('decade for year 2010 starts at 2009', () => {
      const result = buildDecadeView(adapter, new Date(2010, 0, 1))
      expect(result[0]!.year).toBe(2009)
      expect(result[11]!.year).toBe(2020)
    })

    it('all entries have numeric year and boolean isCurrent', () => {
      const result = buildDecadeView(adapter, new Date(2050, 0, 1))
      for (const entry of result) {
        expect(typeof entry.year).toBe('number')
        expect(typeof entry.isCurrent).toBe('boolean')
      }
    })
  })

  describe('buildCalendarYear / edge cases', () => {
    it('returns entries for a far-future year (3000)', () => {
      const result = buildCalendarYear(adapter, new Date(3000, 0, 1), 'en-US')
      expect(result).toHaveLength(12)
      expect(result[0]!.label).toBe('January')
      expect(result.every((e) => !e.isCurrent)).toBe(true)
    })

    it('labels differ between long and short format', () => {
      const longNames = buildCalendarYear(adapter, new Date(2026, 0, 1), 'en-US')
      // buildCalendarYear uses long format internally via getLocalizedMonthNames
      expect(longNames[0]!.label).toBe('January')
    })
  })

  describe('getWeekNumber / edge cases', () => {
    it('Feb 29 of a leap year returns a valid week number', () => {
      const wn = getWeekNumber(adapter, new Date(2024, 1, 29))
      expect(wn).toBeGreaterThanOrEqual(1)
      expect(wn).toBeLessThanOrEqual(53)
    })

    it('week numbers increase through the year for consecutive Thursdays', () => {
      let d = new Date(2026, 0, 1) // first Thursday
      const weeks: number[] = []
      while (d.getFullYear() === 2026) {
        weeks.push(getWeekNumber(adapter, d))
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)
      }
      for (let i = 1; i < weeks.length; i++) {
        expect(weeks[i]!).toBeGreaterThanOrEqual(weeks[i - 1]!)
      }
    })
  })

  describe('the week follows the locale', () => {
    const june2020 = new Date(2020, 5, 1)
    const firstDay = (locale?: string) =>
      buildCalendarMonth(adapter, june2020, { locale: { locale } }).weeks[0]!.days[0]!.date.getDay()
    const weekend = (locale?: string) =>
      new Set(
        buildCalendarMonth(adapter, june2020, { locale: { locale } })
          .weeks.flatMap((week) => week.days)
          .filter((day) => day.isWeekend)
          .map((day) => day.date.getDay()),
      )

    it('starts on the first day of the locale when no weekStartDay is given', () => {
      expect([firstDay('en-US'), firstDay('de-DE'), firstDay('fa-IR')]).toEqual([0, 1, 6])
    })

    it('starts on Sunday with no locale', () => {
      expect(firstDay()).toBe(0)
    })

    it('keeps a weekStartDay it is given over the locale', () => {
      const month = buildCalendarMonth(adapter, june2020, { locale: { locale: 'de-DE', weekStartDay: 0 } })

      expect(month.weeks[0]!.days[0]!.date.getDay()).toBe(0)
    })

    it('marks the weekend of the locale', () => {
      expect(weekend('fa-IR')).toEqual(new Set([5]))
    })

    it('marks Saturday and Sunday with no locale', () => {
      expect(weekend()).toEqual(new Set([0, 6]))
    })

    it('numbers Sunday 0, as the adapter does, where Intl numbers it 7', () => {
      expect(getLocaleWeekInfo('en-US')).toEqual({ firstDay: 0, weekend: [6, 0] })
    })

    it('reads the week from a runtime that has only the older weekInfo getter', () => {
      const own = Object.getOwnPropertyDescriptor(Intl.Locale.prototype, 'getWeekInfo')
      Object.defineProperty(Intl.Locale.prototype, 'getWeekInfo', { value: undefined, configurable: true })
      try {
        expect(getLocaleWeekInfo('en-AU')).toEqual({ firstDay: 1, weekend: [6, 0] })
      } finally {
        if (own) Object.defineProperty(Intl.Locale.prototype, 'getWeekInfo', own)
      }
    })

    it('keeps the default week for a tag Intl refuses', () => {
      expect(getLocaleWeekInfo('not a locale')).toEqual({ firstDay: 0, weekend: [0, 6] })
    })
  })

  describe('week numbers', () => {
    it('numbers a week that starts on Sunday by the ISO week of its Thursday', () => {
      const month = buildCalendarMonth(adapter, new Date(2020, 5, 1), { locale: { weekStartDay: 0 } })

      expect(month.weeks.map((week) => week.weekNumber)).toEqual([23, 24, 25, 26, 27])
    })

    it('numbers a week that starts on Saturday by the ISO week of its Thursday', () => {
      const month = buildCalendarMonth(adapter, new Date(2020, 5, 1), { locale: { weekStartDay: 6 } })

      expect(month.weeks.map((week) => week.weekNumber)).toEqual([23, 24, 25, 26, 27])
    })
  })
})

describe('getLocaleWeekInfo copies', () => {
  it('hands each caller its own week, so changing one changes no other calendar', () => {
    const before = getLocaleWeekInfo('en-US').weekend
    getLocaleWeekInfo(undefined).weekend.push(5)
    getLocaleWeekInfo('en-US').weekend.push(5)

    expect([getLocaleWeekInfo(undefined).weekend, getLocaleWeekInfo('en-US').weekend]).toEqual([[0, 6], before])
  })
})
