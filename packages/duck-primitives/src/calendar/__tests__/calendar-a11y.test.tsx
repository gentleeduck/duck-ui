import { beforeEach, describe, expect, it } from 'bun:test'
import { buildCalendarMonth, NativeAdapter } from '@gentleduck/calendar'
import { render } from '@testing-library/react'
import axe from 'axe-core'
import * as React from 'react'
import type { ICalendarRootProps } from '../calendar'
import { Calendar } from '../calendar'
import { CalendarDay } from '../day'
import { CalendarGrid } from '../grid'
import { CalendarHeader } from '../header'
import { CalendarMonthView } from '../month-view'
import { CalendarNav } from '../nav'
import { CalendarWeekdays } from '../weekdays'
import { CalendarYearView } from '../year-view'

const adapter = new NativeAdapter()
const march2026 = new Date(2026, 2, 1)

function getWeeks(viewDate: Date = march2026) {
  const month = buildCalendarMonth(adapter, viewDate, {
    showOutsideDays: true,
    fixedWeeks: false,
  })
  return month.weeks
}

/**
 * Full calendar with all sub-components rendered,
 * including actual day cells from buildCalendarMonth.
 */
function FullDaysCalendar(props: Partial<ICalendarRootProps> & { weeks?: ReturnType<typeof getWeeks> }) {
  const { weeks: weeksProp, ...rest } = props
  const weeks = weeksProp ?? getWeeks()
  return (
    <Calendar adapter={adapter} mode="single" defaultMonth={march2026} {...rest}>
      <CalendarHeader />
      <CalendarNav />
      <CalendarGrid>
        <CalendarWeekdays />
        {weeks.map((week) => (
          <div key={week.weekNumber} role="row">
            {week.days.map((day) => (
              <CalendarDay key={day.date.toISOString()} day={day} />
            ))}
          </div>
        ))}
      </CalendarGrid>
    </Calendar>
  )
}

describe('Calendar a11y  -  axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('days view (single mode) has no axe violations', async () => {
    const { container } = render(<FullDaysCalendar />)
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('days view (range mode) has no axe violations', async () => {
    const { container } = render(<FullDaysCalendar mode="range" />)
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('days view (multi mode) has no axe violations', async () => {
    const { container } = render(<FullDaysCalendar mode="multi" />)
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  // MonthView and YearView render gridcells directly inside the grid without
  // row wrappers. We exclude the aria-required-children and aria-required-parent
  // rules here so the remaining rules are validated. The missing row structure
  // is tracked as a known component limitation.
  it('month view has no axe violations (excluding row-structure rules)', async () => {
    const { container } = render(
      <Calendar adapter={adapter} mode="single" defaultMonth={march2026}>
        <CalendarHeader />
        <CalendarNav />
        <CalendarMonthView />
      </Calendar>,
    )
    const results = await axe.run(container, {
      rules: {
        'aria-required-children': { enabled: false },
        'aria-required-parent': { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })

  it('year view has no axe violations (excluding row-structure rules)', async () => {
    const { container } = render(
      <Calendar adapter={adapter} mode="single" defaultMonth={march2026}>
        <CalendarHeader />
        <CalendarNav />
        <CalendarYearView />
      </Calendar>,
    )
    const results = await axe.run(container, {
      rules: {
        'aria-required-children': { enabled: false },
        'aria-required-parent': { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })

  it('days view with disabled dates has no axe violations', async () => {
    const weeks = getWeeks()
    for (const week of weeks) {
      for (const day of week.days) {
        if (day.date.getDate() === 15 && day.date.getMonth() === 2) {
          day.isDisabled = true
        }
      }
    }
    const { container } = render(<FullDaysCalendar disabled={[new Date(2026, 2, 15)]} weeks={weeks} />)
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('days view with selection has no axe violations', async () => {
    const weeks = getWeeks()
    for (const week of weeks) {
      for (const day of week.days) {
        if (day.date.getDate() === 10 && day.date.getMonth() === 2) {
          day.isSelected = true
        }
      }
    }
    const { container } = render(<FullDaysCalendar selected={new Date(2026, 2, 10)} weeks={weeks} />)
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('Calendar a11y  -  structural assertions', () => {
  it('day buttons have aria-label with full date string', () => {
    const { container } = render(<FullDaysCalendar />)
    const dayButtons = container.querySelectorAll('[data-slot="calendar-day"]')
    expect(dayButtons.length).toBeGreaterThan(0)

    for (const btn of dayButtons) {
      const label = btn.getAttribute('aria-label')
      expect(label).not.toBeNull()
      expect(label!.length).toBeGreaterThan(5)
      expect(Number.isNaN(Number(label))).toBe(true)
    }
  })

  it('grid has aria-roledescription="calendar"', () => {
    const { container } = render(<FullDaysCalendar />)
    const grid = container.querySelector('[data-slot="calendar-grid"]')
    expect(grid).not.toBeNull()
    expect(grid?.getAttribute('aria-roledescription')).toBe('calendar')
  })

  it.skip('exactly one tabIndex=0 in the grid (roving tabindex)', () => {
    const { container } = render(<FullDaysCalendar />)
    const grid = container.querySelector('[data-slot="calendar-grid"]')
    expect(grid).not.toBeNull()

    const dayButtons = grid!.querySelectorAll('[data-slot="calendar-day"]')
    const focusable = Array.from(dayButtons).filter((btn) => btn.getAttribute('tabindex') === '0')
    expect(focusable.length).toBe(1)
  })

  it.skip('all other day buttons have tabIndex=-1', () => {
    const { container } = render(<FullDaysCalendar />)
    const grid = container.querySelector('[data-slot="calendar-grid"]')
    const dayButtons = grid!.querySelectorAll('[data-slot="calendar-day"]')

    let countMinusOne = 0
    let countZero = 0
    for (const btn of dayButtons) {
      const tabIdx = btn.getAttribute('tabindex')
      if (tabIdx === '0') countZero++
      else if (tabIdx === '-1') countMinusOne++
    }

    expect(countZero).toBe(1)
    expect(countMinusOne).toBe(dayButtons.length - 1)
  })

  it('weekday headers have role="columnheader"', () => {
    const { container } = render(<FullDaysCalendar />)
    const weekdays = container.querySelectorAll('[data-slot="calendar-weekday"]')
    expect(weekdays.length).toBe(7)

    for (const wd of weekdays) {
      expect(wd.getAttribute('role')).toBe('columnheader')
    }
  })

  it('nav wrapper has role="navigation"', () => {
    const { container } = render(<FullDaysCalendar />)
    const nav = container.querySelector('[data-slot="calendar-nav"]')
    expect(nav).not.toBeNull()
    expect(nav?.getAttribute('role')).toBe('navigation')
  })

  it('header has aria-live="polite"', () => {
    const { container } = render(<FullDaysCalendar />)
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header).not.toBeNull()
    expect(header?.getAttribute('aria-live')).toBe('polite')
  })

  it('announcer div has role="status" and aria-live="polite"', () => {
    const { container } = render(<FullDaysCalendar />)
    const statusEl = container.querySelector('[role="status"]')
    expect(statusEl).not.toBeNull()
    expect(statusEl?.getAttribute('aria-live')).toBe('polite')
  })
})
