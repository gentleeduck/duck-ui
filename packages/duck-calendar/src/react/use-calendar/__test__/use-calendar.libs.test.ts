import { describe, expect, it, vi } from 'vitest'
import { NativeAdapter } from '../../../adapter'
import type { Grid } from '../../../grid'
import { buildDayProps, initialFocusFromSelected, pageTarget, resolveFocusTarget } from '../use-calendar.libs'

const adapter = new NativeAdapter()

function day(date: Date, flags: Partial<Grid.ICalendarDay<Date>> = {}): Grid.ICalendarDay<Date> {
  return {
    date,
    isToday: false,
    isSelected: false,
    isDisabled: false,
    isUnavailable: false,
    isOutside: false,
    isHidden: false,
    isWeekend: false,
    isRangeStart: false,
    isRangeEnd: false,
    isRangeMiddle: false,
    ...flags,
  }
}

const month = (days: Grid.ICalendarDay<Date>[]): Grid.ICalendarMonth<Date> => ({
  month: new Date(2026, 2, 1),
  weeks: [{ weekNumber: 10, days }],
})

describe('initialFocusFromSelected', () => {
  it("focuses a range's start, and nothing for a range not started", () => {
    expect(initialFocusFromSelected<Date, 'range'>('range', { from: new Date(2026, 2, 4), to: null })).toEqual(
      new Date(2026, 2, 4),
    )
    expect(initialFocusFromSelected<Date, 'range'>('range', null)).toBeNull()
  })
})

describe('resolveFocusTarget', () => {
  it('keeps the focused day when no shown day can be picked', () => {
    const focused = new Date(2026, 2, 9)
    const shown = [
      month([day(new Date(2026, 2, 1), { isDisabled: true }), day(new Date(2026, 1, 28), { isOutside: true })]),
    ]

    expect(resolveFocusTarget(adapter, shown, focused)).toBe(focused)
  })

  it('falls back to today when no shown day can be picked and none has taken focus', () => {
    const shown = [month([day(new Date(2026, 2, 1), { isDisabled: true })])]

    expect(adapter.isSameDay(resolveFocusTarget(adapter, shown, null), adapter.today())).toBe(true)
  })
})

describe('buildDayProps', () => {
  it('marks a hidden day and the three parts of a range', () => {
    const props = [
      day(new Date(2026, 2, 1), { isHidden: true, isOutside: true }),
      day(new Date(2026, 2, 2), { isRangeStart: true, isSelected: true }),
      day(new Date(2026, 2, 3), { isRangeMiddle: true }),
      day(new Date(2026, 2, 4), { isRangeEnd: true, isSelected: true }),
    ].map((d) => buildDayProps(d, new Date(2026, 2, 9), adapter, vi.fn(), vi.fn(), vi.fn()))

    expect(
      props.map((p) => [p['data-hidden'], p['data-range-start'], p['data-range-middle'], p['data-range-end']]),
    ).toEqual([
      ['true', undefined, undefined, undefined],
      [undefined, 'true', undefined, undefined],
      [undefined, undefined, 'true', undefined],
      [undefined, undefined, undefined, 'true'],
    ])
  })

  it('selects with shift held or not, and focuses the day under the pointer', () => {
    const date = new Date(2026, 2, 5)
    const selectDate = vi.fn()
    const focusDate = vi.fn()
    const props = buildDayProps(day(date), date, adapter, selectDate, focusDate, vi.fn())

    props.onClick({ shiftKey: true })
    props.onClick()
    props.onMouseEnter()

    expect(selectDate.mock.calls).toEqual([
      [date, { shiftKey: true }],
      [date, undefined],
    ])
    expect(focusDate.mock.calls).toEqual([[date]])
  })
})

describe('pageTarget', () => {
  it('pages a whole page while the bound is further than a page away', () => {
    expect([
      pageTarget(adapter, new Date(2026, 0, 1), 'next', 3, { toDate: new Date(2026, 11, 10) }),
      pageTarget(adapter, new Date(2026, 5, 1), 'prev', 3, { fromDate: new Date(2025, 0, 10) }),
    ]).toEqual([new Date(2026, 3, 1), new Date(2026, 2, 1)])
  })

  it('stops a page of three months at the last page that still ends on toDate', () => {
    const target = pageTarget(adapter, new Date(2026, 0, 1), 'next', 3, { toDate: new Date(2026, 3, 10) })

    expect(target).toEqual(new Date(2026, 1, 1))
  })

  it('stops a page of three months at the first page that starts on fromDate', () => {
    const target = pageTarget(adapter, new Date(2026, 5, 1), 'prev', 3, { fromDate: new Date(2026, 3, 10) })

    expect(target).toEqual(new Date(2026, 3, 1))
  })
})
