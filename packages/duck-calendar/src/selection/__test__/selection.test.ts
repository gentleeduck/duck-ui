import { beforeEach, describe, expect, it } from 'vitest'
import { NativeAdapter } from '../../adapter'
import { buildCalendarMonth } from '../../grid'
import type { Selection } from '../selection'
import { applySelection, selectDay } from '../selection'
import { isDateDisabled, isInRange } from '../selection.libs'

describe('selection', () => {
  let adapter: NativeAdapter
  const march2026 = new Date(2026, 2, 1)
  const baseConfig = { showOutsideDays: true, fixedWeeks: false, locale: { weekStartDay: 0 as const } }

  beforeEach(() => {
    adapter = new NativeAdapter()
  })

  describe('selectDay / single', () => {
    it('selects a date when nothing is selected', () => {
      const result = selectDay(adapter, 'single', null, adapter.create(2026, 2, 15))
      expect(result).not.toBeNull()
      expect(adapter.isSameDay(result as Date, adapter.create(2026, 2, 15))).toBe(true)
    })

    it('deselects when the same date is clicked again', () => {
      const date = adapter.create(2026, 2, 15)
      const after = selectDay(adapter, 'single', date, date)
      expect(after).toBeNull()
    })

    it('replaces the selection when a different date is clicked', () => {
      const first = adapter.create(2026, 2, 15)
      const second = adapter.create(2026, 2, 20)
      const result = selectDay(adapter, 'single', first, second)
      expect(adapter.isSameDay(result as Date, second)).toBe(true)
    })
  })

  describe('selectDay / range', () => {
    it('1st click sets from, to is null', () => {
      const result = selectDay(adapter, 'range', null, adapter.create(2026, 2, 10)) as Selection.DateRange<Date>
      expect(result).not.toBeNull()
      expect(adapter.isSameDay(result.from, adapter.create(2026, 2, 10))).toBe(true)
      expect(result.to).toBeNull()
    })

    it('2nd click sets to', () => {
      const partial: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 10), to: null }
      const result = selectDay(adapter, 'range', partial, adapter.create(2026, 2, 20)) as Selection.DateRange<Date>
      expect(adapter.isSameDay(result.from, adapter.create(2026, 2, 10))).toBe(true)
      expect(adapter.isSameDay(result.to!, adapter.create(2026, 2, 20))).toBe(true)
    })

    it('auto-swaps when 2nd click is before from', () => {
      const partial: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 20), to: null }
      const result = selectDay(adapter, 'range', partial, adapter.create(2026, 2, 5)) as Selection.DateRange<Date>
      expect(adapter.isSameDay(result.from, adapter.create(2026, 2, 5))).toBe(true)
      expect(adapter.isSameDay(result.to!, adapter.create(2026, 2, 20))).toBe(true)
    })

    it('3rd click (complete range) resets to new from', () => {
      const complete: Selection.DateRange<Date> = {
        from: adapter.create(2026, 2, 10),
        to: adapter.create(2026, 2, 20),
      }
      const result = selectDay(adapter, 'range', complete, adapter.create(2026, 2, 15)) as Selection.DateRange<Date>
      expect(adapter.isSameDay(result.from, adapter.create(2026, 2, 15))).toBe(true)
      expect(result.to).toBeNull()
    })

    it('clicking same day as from deselects the range', () => {
      const partial: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 15), to: null }
      const result = selectDay(adapter, 'range', partial, adapter.create(2026, 2, 15))
      expect(result).toBeNull()
    })
  })

  describe('selectDay / multi', () => {
    it('adds a date to an empty array', () => {
      const result = selectDay(adapter, 'multi', [], adapter.create(2026, 2, 15)) as Date[]
      expect(result).toHaveLength(1)
      expect(adapter.isSameDay(result[0]!, adapter.create(2026, 2, 15))).toBe(true)
    })

    it('adds a second distinct date', () => {
      const existing = [adapter.create(2026, 2, 15)]
      const result = selectDay(adapter, 'multi', existing, adapter.create(2026, 2, 20)) as Date[]
      expect(result).toHaveLength(2)
    })

    it('removes a date that is already selected', () => {
      const existing = [adapter.create(2026, 2, 15), adapter.create(2026, 2, 20)]
      const result = selectDay(adapter, 'multi', existing, adapter.create(2026, 2, 15)) as Date[]
      expect(result).toHaveLength(1)
      expect(adapter.isSameDay(result[0]!, adapter.create(2026, 2, 20))).toBe(true)
    })

    it('does not add duplicates', () => {
      const existing = [adapter.create(2026, 2, 15)]
      const result = selectDay(adapter, 'multi', existing, adapter.create(2026, 2, 15)) as Date[]
      expect(result).toHaveLength(0) // toggled off
    })

    it('does not mutate the original array', () => {
      const existing = [adapter.create(2026, 2, 15)]
      selectDay(adapter, 'multi', existing, adapter.create(2026, 2, 20))
      expect(existing).toHaveLength(1)
    })
  })

  describe('isInRange', () => {
    it('returns false when to is null', () => {
      expect(isInRange(adapter, adapter.create(2026, 2, 15), { from: adapter.create(2026, 2, 10), to: null })).toBe(
        false,
      )
    })

    it('returns true for the start date (inclusive)', () => {
      const range: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 10), to: adapter.create(2026, 2, 20) }
      expect(isInRange(adapter, adapter.create(2026, 2, 10), range)).toBe(true)
    })

    it('returns true for the end date (inclusive)', () => {
      const range: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 10), to: adapter.create(2026, 2, 20) }
      expect(isInRange(adapter, adapter.create(2026, 2, 20), range)).toBe(true)
    })

    it('returns true for a date in the middle', () => {
      const range: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 10), to: adapter.create(2026, 2, 20) }
      expect(isInRange(adapter, adapter.create(2026, 2, 15), range)).toBe(true)
    })

    it('returns false for a date before the range', () => {
      const range: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 10), to: adapter.create(2026, 2, 20) }
      expect(isInRange(adapter, adapter.create(2026, 2, 9), range)).toBe(false)
    })

    it('returns false for a date after the range', () => {
      const range: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 10), to: adapter.create(2026, 2, 20) }
      expect(isInRange(adapter, adapter.create(2026, 2, 21), range)).toBe(false)
    })

    it('normalises reversed range (from > to)', () => {
      const reversed: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 20), to: adapter.create(2026, 2, 10) }
      expect(isInRange(adapter, adapter.create(2026, 2, 15), reversed)).toBe(true)
      expect(isInRange(adapter, adapter.create(2026, 2, 9), reversed)).toBe(false)
    })
  })

  describe('isDateDisabled', () => {
    it('returns false with empty constraints', () => {
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), {})).toBe(false)
    })

    it('returns true when date is in disabled array', () => {
      const constraints = { disabled: [adapter.create(2026, 2, 15)] }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(true)
    })

    it('returns false when date is not in disabled array', () => {
      const constraints = { disabled: [adapter.create(2026, 2, 16)] }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(false)
    })

    it('returns true when predicate returns true', () => {
      const constraints = { disabled: (d: Date) => d.getDay() === 0 } // disable Sundays
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(true) // Mar 15 = Sunday
    })

    it('returns false when predicate returns false', () => {
      const constraints = { disabled: (d: Date) => d.getDay() === 0 }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 16), constraints)).toBe(false) // Monday
    })

    it('returns true when date is before fromDate', () => {
      const constraints = { fromDate: adapter.create(2026, 2, 15) }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 14), constraints)).toBe(true)
    })

    it('returns false when date equals fromDate', () => {
      const constraints = { fromDate: adapter.create(2026, 2, 15) }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(false)
    })

    it('returns true when date is after toDate', () => {
      const constraints = { toDate: adapter.create(2026, 2, 15) }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 16), constraints)).toBe(true)
    })

    it('returns false when date equals toDate', () => {
      const constraints = { toDate: adapter.create(2026, 2, 15) }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(false)
    })

    it('applies all constraints  -  disabled array + fromDate', () => {
      const constraints = {
        disabled: [adapter.create(2026, 2, 10)],
        fromDate: adapter.create(2026, 2, 5),
      }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 3), constraints)).toBe(true) // before fromDate
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 10), constraints)).toBe(true) // in disabled list
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(false) // fine
    })
  })

  describe('applySelection', () => {
    it('sets isSelected for a single selected date', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const selected = adapter.create(2026, 2, 15)
      const result = applySelection(grid.weeks, adapter, 'single', selected)

      const allDays = result.flatMap((w) => w.days)
      const selectedDays = allDays.filter((d) => d.isSelected)
      expect(selectedDays).toHaveLength(1)
      expect(adapter.isSameDay(selectedDays[0]!.date, selected)).toBe(true)
    })

    it('sets isSelected for all multi-selected dates', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const selected = [adapter.create(2026, 2, 5), adapter.create(2026, 2, 15), adapter.create(2026, 2, 25)]
      const result = applySelection(grid.weeks, adapter, 'multi', selected)

      const allDays = result.flatMap((w) => w.days)
      const selectedDays = allDays.filter((d) => d.isSelected)
      expect(selectedDays).toHaveLength(3)
    })

    it('sets range flags correctly', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const selected: Selection.DateRange<Date> = {
        from: adapter.create(2026, 2, 10),
        to: adapter.create(2026, 2, 15),
      }
      const result = applySelection(grid.weeks, adapter, 'range', selected)
      const allDays = result.flatMap((w) => w.days)

      const startDay = allDays.find((d) => adapter.isSameDay(d.date, adapter.create(2026, 2, 10)))!
      const endDay = allDays.find((d) => adapter.isSameDay(d.date, adapter.create(2026, 2, 15)))!
      const midDay = allDays.find((d) => adapter.isSameDay(d.date, adapter.create(2026, 2, 12)))!

      expect(startDay.isRangeStart).toBe(true)
      expect(startDay.isSelected).toBe(true)
      expect(endDay.isRangeEnd).toBe(true)
      expect(endDay.isSelected).toBe(true)
      expect(midDay.isRangeMiddle).toBe(true)
      expect(midDay.isSelected).toBe(false)
    })

    it('sets isDisabled for dates outside constraints', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const result = applySelection(grid.weeks, adapter, 'single', null, {
        fromDate: adapter.create(2026, 2, 15),
      })
      const allDays = result.flatMap((w) => w.days).filter((d) => !d.isOutside)
      const disabledDays = allDays.filter((d) => d.isDisabled)
      // days 1-14 should be disabled
      expect(disabledDays.length).toBe(14)
    })

    it('does not mutate the original weeks', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const originalFirstDay = grid.weeks[0]!.days[0]!.isSelected
      applySelection(grid.weeks, adapter, 'single', adapter.create(2026, 2, 1))
      expect(grid.weeks[0]!.days[0]!.isSelected).toBe(originalFirstDay)
    })

    it('range with null selected returns no range flags', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const result = applySelection(grid.weeks, adapter, 'range', null)
      const allDays = result.flatMap((w) => w.days)
      expect(allDays.every((d) => !d.isRangeStart && !d.isRangeEnd && !d.isRangeMiddle)).toBe(true)
    })

    it('partial range (to=null) sets only isRangeStart', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const selected: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 10), to: null }
      const result = applySelection(grid.weeks, adapter, 'range', selected)
      const allDays = result.flatMap((w) => w.days)

      const startDay = allDays.find((d) => adapter.isSameDay(d.date, adapter.create(2026, 2, 10)))!
      expect(startDay.isRangeStart).toBe(true)
      expect(startDay.isSelected).toBe(true)
      expect(allDays.every((d) => !d.isRangeMiddle && !d.isRangeEnd)).toBe(true)
    })
  })

  describe('selectDay / multi-range', () => {
    it('starts a new range on first click', () => {
      const result = selectDay(adapter, 'multi-range', [] as Selection.DateRange<Date>[], new Date(2026, 2, 5))
      expect(result).toHaveLength(1)
      expect((result as Selection.DateRange<Date>[])[0]!.to).toBeNull()
    })

    it('completes the range on second click', () => {
      const start: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 5), to: null }]
      const result = selectDay(adapter, 'multi-range', start, new Date(2026, 2, 10)) as Selection.DateRange<Date>[]
      expect(result).toHaveLength(1)
      expect(result[0]!.to).not.toBeNull()
      expect(result[0]!.from.getDate()).toBe(5)
      expect(result[0]!.to!.getDate()).toBe(10)
    })

    it('auto-swaps when end is before start', () => {
      const start: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 10), to: null }]
      const result = selectDay(adapter, 'multi-range', start, new Date(2026, 2, 5)) as Selection.DateRange<Date>[]
      expect(result[0]!.from.getDate()).toBe(5)
      expect(result[0]!.to!.getDate()).toBe(10)
    })

    it('cancels in-progress range when clicking same start', () => {
      const start: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 5), to: null }]
      const result = selectDay(adapter, 'multi-range', start, new Date(2026, 2, 5)) as Selection.DateRange<Date>[]
      expect(result).toHaveLength(0)
    })

    it('starts a new range after completing one', () => {
      const completed: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 5), to: new Date(2026, 2, 10) }]
      const result = selectDay(adapter, 'multi-range', completed, new Date(2026, 2, 20)) as Selection.DateRange<Date>[]
      expect(result).toHaveLength(2)
      expect(result[1]!.from.getDate()).toBe(20)
      expect(result[1]!.to).toBeNull()
    })

    it('shift+click splits a range excluding the clicked day', () => {
      const ranges: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 1), to: new Date(2026, 2, 10) }] // 10 days
      const result = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 5), {
        shiftKey: true,
      }) as Selection.DateRange<Date>[]
      expect(result).toHaveLength(2)
      expect(result[0]!.from.getDate()).toBe(1)
      expect(result[0]!.to!.getDate()).toBe(4)
      expect(result[1]!.from.getDate()).toBe(6)
      expect(result[1]!.to!.getDate()).toBe(10)
    })

    it('shift+click on start shrinks range from left', () => {
      const ranges: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 1), to: new Date(2026, 2, 10) }]
      const result = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 1), {
        shiftKey: true,
      }) as Selection.DateRange<Date>[]
      expect(result).toHaveLength(1)
      expect(result[0]!.from.getDate()).toBe(2)
      expect(result[0]!.to!.getDate()).toBe(10)
    })

    it('shift+click on end shrinks range from right', () => {
      const ranges: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 1), to: new Date(2026, 2, 10) }]
      const result = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 10), {
        shiftKey: true,
      }) as Selection.DateRange<Date>[]
      expect(result).toHaveLength(1)
      expect(result[0]!.from.getDate()).toBe(1)
      expect(result[0]!.to!.getDate()).toBe(9)
    })

    it('shift+click does nothing for ranges <= 5 days', () => {
      const ranges: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 1), to: new Date(2026, 2, 5) }] // exactly 5 days
      const result = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 3), {
        shiftKey: true,
      }) as Selection.DateRange<Date>[]
      expect(result).toHaveLength(1)
      expect(result[0]!.from.getDate()).toBe(1)
      expect(result[0]!.to!.getDate()).toBe(5)
    })

    it('shift+click works for ranges of 6 days', () => {
      const ranges: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 1), to: new Date(2026, 2, 6) }] // 6 days
      const result = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 3), {
        shiftKey: true,
      }) as Selection.DateRange<Date>[]
      expect(result).toHaveLength(2)
    })

    it('merges adjacent ranges (1-5 then 6-9 becomes 1-9)', () => {
      let ranges: Selection.DateRange<Date>[] = []
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 1)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 5)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 6)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 9)) as Selection.DateRange<Date>[]
      expect(ranges).toHaveLength(1)
      expect(ranges[0]!.from.getDate()).toBe(1)
      expect(ranges[0]!.to!.getDate()).toBe(9)
    })

    it('merges overlapping ranges (1-7 then 5-12 becomes 1-12)', () => {
      let ranges: Selection.DateRange<Date>[] = []
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 1)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 7)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 5)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 12)) as Selection.DateRange<Date>[]
      expect(ranges).toHaveLength(1)
      expect(ranges[0]!.from.getDate()).toBe(1)
      expect(ranges[0]!.to!.getDate()).toBe(12)
    })

    it('does not merge non-adjacent ranges (1-5 and 8-12)', () => {
      let ranges: Selection.DateRange<Date>[] = []
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 1)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 5)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 8)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 12)) as Selection.DateRange<Date>[]
      expect(ranges).toHaveLength(2)
    })

    it('accumulates multiple completed ranges', () => {
      let ranges: Selection.DateRange<Date>[] = []
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 1)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 5)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 10)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 15)) as Selection.DateRange<Date>[]
      expect(ranges).toHaveLength(2)
      expect(ranges[0]!.from.getDate()).toBe(1)
      expect(ranges[0]!.to!.getDate()).toBe(5)
      expect(ranges[1]!.from.getDate()).toBe(10)
      expect(ranges[1]!.to!.getDate()).toBe(15)
    })
  })

  describe('applySelection / multi-range', () => {
    it('highlights multiple ranges correctly', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const ranges: Selection.DateRange<Date>[] = [
        { from: adapter.create(2026, 2, 3), to: adapter.create(2026, 2, 6) },
        { from: adapter.create(2026, 2, 15), to: adapter.create(2026, 2, 18) },
      ]
      const result = applySelection(grid.weeks, adapter, 'multi-range', ranges, {})
      const allDays = result.flatMap((w) => w.days)

      const mar3 = allDays.find((d) => d.date.getDate() === 3 && d.date.getMonth() === 2)!
      const mar5 = allDays.find((d) => d.date.getDate() === 5 && d.date.getMonth() === 2)!
      const mar6 = allDays.find((d) => d.date.getDate() === 6 && d.date.getMonth() === 2)!
      const mar15 = allDays.find((d) => d.date.getDate() === 15 && d.date.getMonth() === 2)!
      const mar18 = allDays.find((d) => d.date.getDate() === 18 && d.date.getMonth() === 2)!
      const mar10 = allDays.find((d) => d.date.getDate() === 10 && d.date.getMonth() === 2)!

      expect(mar3.isRangeStart).toBe(true)
      expect(mar5.isRangeMiddle).toBe(true)
      expect(mar6.isRangeEnd).toBe(true)
      expect(mar15.isRangeStart).toBe(true)
      expect(mar18.isRangeEnd).toBe(true)
      expect(mar10.isRangeMiddle).toBe(false)
      expect(mar10.isSelected).toBe(false)
    })
  })

  describe('selectDay / range  -  edge cases', () => {
    it('range with same start and end date has no middle days', () => {
      const partial: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 15), to: null }
      const result = selectDay(adapter, 'range', partial, adapter.create(2026, 2, 15))
      // Clicking the same date as from deselects
      expect(result).toBeNull()
    })

    it('2nd click on same day as from (with complete range) resets to new from', () => {
      const complete: Selection.DateRange<Date> = {
        from: adapter.create(2026, 2, 10),
        to: adapter.create(2026, 2, 20),
      }
      const result = selectDay(adapter, 'range', complete, adapter.create(2026, 2, 10)) as Selection.DateRange<Date>
      // When range is complete, any click resets to a new from
      expect(adapter.isSameDay(result.from, adapter.create(2026, 2, 10))).toBe(true)
      expect(result.to).toBeNull()
    })

    it('range crossing month boundary (March -> April)', () => {
      const partial: Selection.DateRange<Date> = { from: adapter.create(2026, 2, 28), to: null }
      const result = selectDay(adapter, 'range', partial, adapter.create(2026, 3, 5)) as Selection.DateRange<Date>
      expect(adapter.isSameDay(result.from, adapter.create(2026, 2, 28))).toBe(true)
      expect(adapter.isSameDay(result.to!, adapter.create(2026, 3, 5))).toBe(true)
    })

    it('range crossing year boundary (Dec 2025 -> Jan 2026)', () => {
      const partial: Selection.DateRange<Date> = { from: adapter.create(2025, 11, 28), to: null }
      const result = selectDay(adapter, 'range', partial, adapter.create(2026, 0, 5)) as Selection.DateRange<Date>
      expect(result.from.getFullYear()).toBe(2025)
      expect(result.to!.getFullYear()).toBe(2026)
    })

    it('creating a single-day range via applySelection sets both start and end', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const selected: Selection.DateRange<Date> = {
        from: adapter.create(2026, 2, 15),
        to: adapter.create(2026, 2, 15),
      }
      const result = applySelection(grid.weeks, adapter, 'range', selected)
      const allDays = result.flatMap((w) => w.days)
      const day15 = allDays.find((d) => adapter.isSameDay(d.date, adapter.create(2026, 2, 15)))!
      expect(day15.isRangeStart).toBe(true)
      expect(day15.isRangeEnd).toBe(true)
      expect(day15.isSelected).toBe(true)
      expect(day15.isRangeMiddle).toBe(false)
    })
  })

  describe('selectDay / single  -  edge cases', () => {
    it('selecting null then clicking returns a date (not wrapped)', () => {
      const result = selectDay(adapter, 'single', null, adapter.create(2026, 0, 1))
      expect(result).not.toBeNull()
      expect((result as Date).getFullYear()).toBe(2026)
    })

    it('selecting a date then selecting the same date twice returns null', () => {
      const date = adapter.create(2026, 2, 15)
      let result = selectDay(adapter, 'single', null, date)
      result = selectDay(adapter, 'single', result as Date, date)
      expect(result).toBeNull()
    })

    it('rapidly replacing selections always holds the last clicked date', () => {
      let current: Date | null = null
      for (let day = 1; day <= 15; day++) {
        current = selectDay(adapter, 'single', current, adapter.create(2026, 2, day)) as Date
      }
      expect(adapter.isSameDay(current!, adapter.create(2026, 2, 15))).toBe(true)
    })
  })

  describe('selectDay / multi  -  edge cases', () => {
    it('toggling all dates off returns empty array', () => {
      let current = [adapter.create(2026, 2, 1), adapter.create(2026, 2, 2)]
      current = selectDay(adapter, 'multi', current, adapter.create(2026, 2, 1)) as Date[]
      current = selectDay(adapter, 'multi', current, adapter.create(2026, 2, 2)) as Date[]
      expect(current).toHaveLength(0)
    })

    it('adding many dates (31 days) works correctly', () => {
      let current: Date[] = []
      for (let day = 1; day <= 31; day++) {
        current = selectDay(adapter, 'multi', current, adapter.create(2026, 2, day)) as Date[]
      }
      expect(current).toHaveLength(31)
    })

    it('removing a date from the middle preserves other dates in order', () => {
      const existing = [adapter.create(2026, 2, 5), adapter.create(2026, 2, 10), adapter.create(2026, 2, 15)]
      const result = selectDay(adapter, 'multi', existing, adapter.create(2026, 2, 10)) as Date[]
      expect(result).toHaveLength(2)
      expect(adapter.isSameDay(result[0]!, adapter.create(2026, 2, 5))).toBe(true)
      expect(adapter.isSameDay(result[1]!, adapter.create(2026, 2, 15))).toBe(true)
    })

    it('selecting with empty array (null-like start) works', () => {
      const result = selectDay(adapter, 'multi', [], adapter.create(2026, 2, 1)) as Date[]
      expect(result).toHaveLength(1)
    })
  })

  describe('isInRange / edge cases', () => {
    it('single-day range (from === to) includes that day', () => {
      const range: Selection.DateRange<Date> = {
        from: adapter.create(2026, 2, 15),
        to: adapter.create(2026, 2, 15),
      }
      expect(isInRange(adapter, adapter.create(2026, 2, 15), range)).toBe(true)
    })

    it('single-day range excludes adjacent days', () => {
      const range: Selection.DateRange<Date> = {
        from: adapter.create(2026, 2, 15),
        to: adapter.create(2026, 2, 15),
      }
      expect(isInRange(adapter, adapter.create(2026, 2, 14), range)).toBe(false)
      expect(isInRange(adapter, adapter.create(2026, 2, 16), range)).toBe(false)
    })

    it('range spanning month boundary', () => {
      const range: Selection.DateRange<Date> = {
        from: adapter.create(2026, 2, 28),
        to: adapter.create(2026, 3, 5),
      }
      expect(isInRange(adapter, adapter.create(2026, 2, 31), range)).toBe(true)
      expect(isInRange(adapter, adapter.create(2026, 3, 1), range)).toBe(true)
      expect(isInRange(adapter, adapter.create(2026, 2, 27), range)).toBe(false)
      expect(isInRange(adapter, adapter.create(2026, 3, 6), range)).toBe(false)
    })

    it('range spanning year boundary', () => {
      const range: Selection.DateRange<Date> = {
        from: adapter.create(2025, 11, 25),
        to: adapter.create(2026, 0, 5),
      }
      expect(isInRange(adapter, adapter.create(2025, 11, 31), range)).toBe(true)
      expect(isInRange(adapter, adapter.create(2026, 0, 1), range)).toBe(true)
      expect(isInRange(adapter, adapter.create(2025, 11, 24), range)).toBe(false)
    })

    it('very large range (entire year)', () => {
      const range: Selection.DateRange<Date> = {
        from: adapter.create(2026, 0, 1),
        to: adapter.create(2026, 11, 31),
      }
      expect(isInRange(adapter, adapter.create(2026, 5, 15), range)).toBe(true)
      expect(isInRange(adapter, adapter.create(2025, 11, 31), range)).toBe(false)
    })
  })

  describe('isDateDisabled / edge cases', () => {
    it('both fromDate and toDate constrain to a window', () => {
      const constraints = {
        fromDate: adapter.create(2026, 2, 10),
        toDate: adapter.create(2026, 2, 20),
      }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 9), constraints)).toBe(true)
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 10), constraints)).toBe(false)
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(false)
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 20), constraints)).toBe(false)
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 21), constraints)).toBe(true)
    })

    it('disabled predicate + fromDate + toDate all apply', () => {
      const constraints = {
        disabled: (d: Date) => d.getDay() === 0, // disable Sundays
        fromDate: adapter.create(2026, 2, 10),
        toDate: adapter.create(2026, 2, 20),
      }
      // Mar 15 2026 is Sunday, within date window but disabled by predicate
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(true)
      // Mar 16 2026 is Monday, within window and not a Sunday
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 16), constraints)).toBe(false)
      // Mar 9 is before fromDate
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 9), constraints)).toBe(true)
    })

    it('empty disabled array does not disable anything', () => {
      const constraints = { disabled: [] as Date[] }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(false)
    })

    it('disabled predicate that always returns false disables nothing', () => {
      const constraints = { disabled: () => false }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(false)
    })

    it('disabled predicate that always returns true disables everything', () => {
      const constraints = { disabled: () => true }
      expect(isDateDisabled(adapter, adapter.create(2026, 2, 15), constraints)).toBe(true)
      expect(isDateDisabled(adapter, adapter.create(2026, 0, 1), constraints)).toBe(true)
    })
  })

  describe('applySelection / edge cases', () => {
    it('single mode with null selection marks nothing as selected', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const result = applySelection(grid.weeks, adapter, 'single', null)
      const allDays = result.flatMap((w) => w.days)
      expect(allDays.every((d) => !d.isSelected)).toBe(true)
    })

    it('multi mode with empty array marks nothing as selected', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const result = applySelection(grid.weeks, adapter, 'multi', [])
      const allDays = result.flatMap((w) => w.days)
      expect(allDays.every((d) => !d.isSelected)).toBe(true)
    })

    it('multi-range mode with empty array marks nothing', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const result = applySelection(grid.weeks, adapter, 'multi-range', [])
      const allDays = result.flatMap((w) => w.days)
      expect(allDays.every((d) => !d.isSelected && !d.isRangeStart && !d.isRangeEnd && !d.isRangeMiddle)).toBe(true)
    })

    it('disabled constraint + range selection: disabled days are marked but range flags still apply', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const selected: Selection.DateRange<Date> = {
        from: adapter.create(2026, 2, 10),
        to: adapter.create(2026, 2, 20),
      }
      const constraints = { disabled: [adapter.create(2026, 2, 15)] }
      const result = applySelection(grid.weeks, adapter, 'range', selected, constraints)
      const allDays = result.flatMap((w) => w.days)

      const day15 = allDays.find((d) => adapter.isSameDay(d.date, adapter.create(2026, 2, 15)))!
      // Day 15 is disabled AND in the middle of the range
      expect(day15.isDisabled).toBe(true)
      expect(day15.isRangeMiddle).toBe(true)
    })

    it('toDate constraint disables all days after the boundary', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const result = applySelection(grid.weeks, adapter, 'single', null, {
        toDate: adapter.create(2026, 2, 15),
      })
      const allDays = result.flatMap((w) => w.days).filter((d) => !d.isOutside)
      const disabled = allDays.filter((d) => d.isDisabled)
      // Days 16-31 should be disabled = 16 days
      expect(disabled.length).toBe(16)
    })

    it('fromDate + toDate constraining to single day leaves only that day enabled', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const onlyDay = adapter.create(2026, 2, 15)
      const result = applySelection(grid.weeks, adapter, 'single', null, {
        fromDate: onlyDay,
        toDate: onlyDay,
      })
      const inMonth = result.flatMap((w) => w.days).filter((d) => !d.isOutside)
      const enabled = inMonth.filter((d) => !d.isDisabled)
      expect(enabled).toHaveLength(1)
      expect(adapter.isSameDay(enabled[0]!.date, onlyDay)).toBe(true)
    })

    it('applySelection preserves week structure (same number of weeks and days per week)', () => {
      const grid = buildCalendarMonth(adapter, march2026, baseConfig)
      const result = applySelection(grid.weeks, adapter, 'single', adapter.create(2026, 2, 15))
      expect(result).toHaveLength(grid.weeks.length)
      for (let i = 0; i < result.length; i++) {
        expect(result[i]!.days).toHaveLength(7)
        expect(result[i]!.weekNumber).toBe(grid.weeks[i]!.weekNumber)
      }
    })

    it('selecting an outside day in single mode still marks it as selected', () => {
      // Jan 2026 starts on Thursday, so Sun-Wed are outside (December 2025)
      const jan2026 = new Date(2026, 0, 1)
      const grid = buildCalendarMonth(adapter, jan2026, baseConfig)
      const outsideDay = grid.weeks[0]!.days[0]! // A December day
      expect(outsideDay.isOutside).toBe(true)
      const result = applySelection(grid.weeks, adapter, 'single', outsideDay.date)
      const allDays = result.flatMap((w) => w.days)
      const selected = allDays.filter((d) => d.isSelected)
      expect(selected).toHaveLength(1)
      expect(selected[0]!.isOutside).toBe(true)
    })
  })

  describe('selectDay / multi-range  -  additional edge cases', () => {
    it('shift+click outside any range does nothing', () => {
      const ranges: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 1), to: new Date(2026, 2, 10) }]
      const result = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 20), {
        shiftKey: true,
      }) as Selection.DateRange<Date>[]
      expect(result).toHaveLength(1)
      expect(result[0]!.from.getDate()).toBe(1)
      expect(result[0]!.to!.getDate()).toBe(10)
    })

    it('shift+click on in-progress range (to=null) does nothing', () => {
      const ranges: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 5), to: null }]
      const result = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 5), {
        shiftKey: true,
      }) as Selection.DateRange<Date>[]
      // In-progress ranges are skipped in shift+click logic
      expect(result).toHaveLength(1)
      expect(result[0]!.to).toBeNull()
    })

    it('completing a range that overlaps existing range triggers merge', () => {
      let ranges: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 5), to: new Date(2026, 2, 10) }]
      // Start a new range overlapping
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 8)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 15)) as Selection.DateRange<Date>[]
      expect(ranges).toHaveLength(1)
      expect(ranges[0]!.from.getDate()).toBe(5)
      expect(ranges[0]!.to!.getDate()).toBe(15)
    })

    it('three non-adjacent ranges stay separate', () => {
      let ranges: Selection.DateRange<Date>[] = []
      // Range 1: 1-3
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 1)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 3)) as Selection.DateRange<Date>[]
      // Range 2: 10-12
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 10)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 12)) as Selection.DateRange<Date>[]
      // Range 3: 20-22
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 20)) as Selection.DateRange<Date>[]
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 22)) as Selection.DateRange<Date>[]
      expect(ranges).toHaveLength(3)
    })

    it('cancelling an in-progress range preserves completed ranges', () => {
      let ranges: Selection.DateRange<Date>[] = [{ from: new Date(2026, 2, 1), to: new Date(2026, 2, 5) }]
      // Start a new range
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 20)) as Selection.DateRange<Date>[]
      expect(ranges).toHaveLength(2)
      // Cancel it
      ranges = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 20)) as Selection.DateRange<Date>[]
      expect(ranges).toHaveLength(1)
      expect(ranges[0]!.from.getDate()).toBe(1)
      expect(ranges[0]!.to!.getDate()).toBe(5)
    })

    it('puts the ranges in date order once a range before another is completed', () => {
      const ranges = selectDay(
        adapter,
        'multi-range',
        [
          { from: new Date(2026, 2, 20), to: new Date(2026, 2, 22) },
          { from: new Date(2026, 2, 1), to: null },
        ],
        new Date(2026, 2, 3),
      )

      expect(ranges.map((r) => [r.from.getDate(), r.to?.getDate()])).toEqual([
        [1, 3],
        [20, 22],
      ])
    })

    it('keeps the further end when a range is completed inside another, or from the same start', () => {
      const days = (ranges: Selection.DateRange<Date>[]) => ranges.map((r) => [r.from.getDate(), r.to?.getDate()])
      const inside = selectDay(
        adapter,
        'multi-range',
        [
          { from: new Date(2026, 2, 1), to: new Date(2026, 2, 20) },
          { from: new Date(2026, 2, 5), to: null },
        ],
        new Date(2026, 2, 10),
      )
      const sameStart = selectDay(
        adapter,
        'multi-range',
        [
          { from: new Date(2026, 2, 5), to: new Date(2026, 2, 15) },
          { from: new Date(2026, 2, 10), to: null },
        ],
        new Date(2026, 2, 5),
      )

      expect([days(inside), days(sameStart)]).toEqual([[[1, 20]], [[5, 15]]])
    })

    it('shift+click splitting preserves other ranges', () => {
      const ranges: Selection.DateRange<Date>[] = [
        { from: new Date(2026, 2, 1), to: new Date(2026, 2, 5) },
        { from: new Date(2026, 2, 10), to: new Date(2026, 2, 20) },
      ]
      const result = selectDay(adapter, 'multi-range', ranges, new Date(2026, 2, 15), {
        shiftKey: true,
      }) as Selection.DateRange<Date>[]
      // First range preserved, second split into two
      expect(result).toHaveLength(3)
      expect(result[0]!.from.getDate()).toBe(1)
      expect(result[0]!.to!.getDate()).toBe(5)
    })
  })
})
