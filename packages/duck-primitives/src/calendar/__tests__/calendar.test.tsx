import { NativeAdapter } from '@gentleduck/calendar'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DirectionProvider } from '../../direction'
import { Calendar } from '../calendar'
import { CalendarDay } from '../day'
import { CalendarGrid } from '../grid'
import { CalendarHeader } from '../header'
import { CalendarMonthView } from '../month-view'
import { CalendarNav, CalendarNextButton, CalendarPrevButton, CalendarViewTrigger } from '../nav'
import { CalendarWeekdays } from '../weekdays'
import { CalendarYearView } from '../year-view'

const adapter = new NativeAdapter()
const march2026 = new Date(2026, 2, 1)

function renderCalendar(props: Record<string, unknown> = {}, children?: React.ReactNode) {
  return render(
    <Calendar adapter={adapter} mode="single" defaultMonth={march2026} {...props}>
      {children}
    </Calendar>,
  )
}

describe('Calendar (root)', () => {
  it('renders with role="application" and aria-label="Calendar"', () => {
    const { container } = renderCalendar({}, <span>child</span>)
    const el = container.querySelector('[data-slot="calendar"]')
    expect(el).not.toBeNull()
    expect(el?.getAttribute('role')).toBe('application')
    expect(el?.getAttribute('aria-label')).toBe('Calendar')
  })

  it('has data-slot="calendar"', () => {
    const { container } = renderCalendar()
    expect(container.querySelector('[data-slot="calendar"]')).not.toBeNull()
  })

  it('has data-view attribute matching the default viewMode ("days")', () => {
    const { container } = renderCalendar()
    const el = container.querySelector('[data-slot="calendar"]')
    expect(el?.getAttribute('data-view')).toBe('days')
  })

  it('renders children', () => {
    const { container } = renderCalendar({}, <span data-testid="child">hello</span>)
    expect(container.querySelector('[data-testid="child"]')?.textContent).toBe('hello')
  })

  it("writes the locale's direction on the root, so the grid lays out the way its arrow keys move", async () => {
    const { container } = renderCalendar({ locale: { direction: 'rtl' } }, <CalendarGrid />)
    const first = within(container).getByRole('gridcell', { name: 'Sunday, March 1, 2026' })
    act(() => first.focus())

    fireEvent.keyDown(first, { key: 'ArrowLeft' })
    await new Promise((resolve) => requestAnimationFrame(resolve))

    expect(container.querySelector('[data-slot="calendar"]')?.getAttribute('dir')).toBe('rtl')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Monday, March 2, 2026')
  })

  it('reads its direction from a DirectionProvider, and moves the arrow keys with it', async () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <Calendar adapter={adapter} mode="single" defaultMonth={march2026}>
          <CalendarGrid />
        </Calendar>
      </DirectionProvider>,
    )
    const first = within(container).getByRole('gridcell', { name: 'Sunday, March 1, 2026' })
    act(() => first.focus())

    fireEvent.keyDown(first, { key: 'ArrowLeft' })
    await new Promise((resolve) => requestAnimationFrame(resolve))

    expect(container.querySelector('[data-slot="calendar"]')?.getAttribute('dir')).toBe('rtl')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Monday, March 2, 2026')
  })

  it('takes the locale direction over the provider', () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <Calendar adapter={adapter} mode="single" defaultMonth={march2026} locale={{ direction: 'ltr' }} />
      </DirectionProvider>,
    )

    expect(container.querySelector('[data-slot="calendar"]')?.getAttribute('dir')).toBe('ltr')
  })

  it('takes a dir given to it over the provider, for the arrow keys as well as the layout', async () => {
    const { container } = render(
      <DirectionProvider dir="ltr">
        <Calendar adapter={adapter} mode="single" defaultMonth={march2026} dir="rtl">
          <CalendarGrid />
        </Calendar>
      </DirectionProvider>,
    )
    const first = within(container).getByRole('gridcell', { name: 'Sunday, March 1, 2026' })
    act(() => first.focus())

    fireEvent.keyDown(first, { key: 'ArrowLeft' })
    await new Promise((resolve) => requestAnimationFrame(resolve))

    expect([
      container.querySelector('[data-slot="calendar"]')?.getAttribute('dir'),
      document.activeElement?.getAttribute('aria-label'),
    ]).toEqual(['rtl', 'Monday, March 2, 2026'])
  })
})

describe('CalendarHeader', () => {
  it('renders month/year text by default (March 2026)', () => {
    const { container } = renderCalendar({}, <CalendarHeader />)
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header).not.toBeNull()
    expect(header?.textContent).toContain('March')
    expect(header?.textContent).toContain('2026')
  })

  it('has data-slot="calendar-header"', () => {
    const { container } = renderCalendar({}, <CalendarHeader />)
    expect(container.querySelector('[data-slot="calendar-header"]')).not.toBeNull()
  })

  it('has aria-live="polite"', () => {
    const { container } = renderCalendar({}, <CalendarHeader />)
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.getAttribute('aria-live')).toBe('polite')
  })

  it('custom formatMonth prop overrides the title', () => {
    const customFormat = () => 'Custom Title'
    const { container } = renderCalendar({}, <CalendarHeader formatMonth={customFormat} />)
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.textContent).toBe('Custom Title')
  })

  it('renders children when provided instead of title', () => {
    const { container } = renderCalendar(
      {},
      <CalendarHeader>
        <span>Override</span>
      </CalendarHeader>,
    )
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.textContent).toBe('Override')
  })

  it("names the month in the calendar's locale", () => {
    const { container } = renderCalendar({ locale: { locale: 'de-DE' } }, <CalendarHeader />)

    expect(container.querySelector('[data-slot="calendar-header"]')?.textContent).toBe('M\u00e4rz 2026')
  })
})

describe('CalendarNav', () => {
  it('renders prev and next buttons by default', () => {
    const { container } = renderCalendar({}, <CalendarNav />)
    const buttons = container.querySelectorAll('[data-slot="calendar-nav-button"]')
    expect(buttons.length).toBe(2)
  })

  it('buttons have data-slot="calendar-nav-button"', () => {
    const { container } = renderCalendar({}, <CalendarNav />)
    const buttons = container.querySelectorAll('[data-slot="calendar-nav-button"]')
    expect(buttons[0]?.getAttribute('data-slot')).toBe('calendar-nav-button')
    expect(buttons[1]?.getAttribute('data-slot')).toBe('calendar-nav-button')
  })

  it('prev button has aria-label "Go to previous month"', () => {
    const { container } = renderCalendar({}, <CalendarNav />)
    const prev = container.querySelector('[data-direction="prev"]')
    expect(prev?.getAttribute('aria-label')).toBe('Go to previous month')
  })

  it('next button has aria-label "Go to next month"', () => {
    const { container } = renderCalendar({}, <CalendarNav />)
    const next = container.querySelector('[data-direction="next"]')
    expect(next?.getAttribute('aria-label')).toBe('Go to next month')
  })

  it('prev button is disabled when at fromDate boundary', () => {
    const { container } = renderCalendar({ fromDate: march2026 }, <CalendarNav />)
    const prev = container.querySelector('[data-direction="prev"]') as HTMLButtonElement | null
    expect(prev?.disabled).toBe(true)
  })

  it('next button is disabled when at toDate boundary', () => {
    const { container } = renderCalendar({ toDate: new Date(2026, 2, 31) }, <CalendarNav />)
    const next = container.querySelector('[data-direction="next"]') as HTMLButtonElement | null
    expect(next?.disabled).toBe(true)
  })

  it('click prev changes month backward', () => {
    const { container } = renderCalendar(
      {},
      <>
        <CalendarHeader />
        <CalendarNav />
      </>,
    )
    const prev = container.querySelector('[data-direction="prev"]') as HTMLButtonElement
    fireEvent.click(prev)
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.textContent).toContain('February')
    expect(header?.textContent).toContain('2026')
  })

  it('click next changes month forward', () => {
    const { container } = renderCalendar(
      {},
      <>
        <CalendarHeader />
        <CalendarNav />
      </>,
    )
    const next = container.querySelector('[data-direction="next"]') as HTMLButtonElement
    fireEvent.click(next)
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.textContent).toContain('April')
    expect(header?.textContent).toContain('2026')
  })

  it('is named as the calendar navigation', () => {
    const { container } = renderCalendar({}, <CalendarNav />)

    expect(within(container).getByRole('navigation').getAttribute('aria-label')).toBe('Calendar navigation')
  })
})

describe('CalendarPrevButton / CalendarNextButton', () => {
  it('renders standalone prev button', () => {
    const { container } = renderCalendar({}, <CalendarPrevButton />)
    const btn = container.querySelector('[data-slot="calendar-nav-button"][data-direction="prev"]')
    expect(btn).not.toBeNull()
  })

  it('renders standalone next button', () => {
    const { container } = renderCalendar({}, <CalendarNextButton />)
    const btn = container.querySelector('[data-slot="calendar-nav-button"][data-direction="next"]')
    expect(btn).not.toBeNull()
  })

  it('calls its own onClick and still turns the month', () => {
    const onClick = vi.fn()
    const { container } = renderCalendar(
      {},
      <>
        <CalendarHeader />
        <CalendarPrevButton onClick={onClick} />
      </>,
    )

    fireEvent.click(within(container).getByRole('button', { name: 'Go to previous month' }))

    expect([onClick.mock.calls.length, container.querySelector('[data-slot="calendar-header"]')?.textContent]).toEqual([
      1,
      'February 2026',
    ])
  })
})

describe('CalendarViewTrigger', () => {
  it('opens the view it names, marking itself active while that view shows', () => {
    const { container } = renderCalendar(
      {},
      <>
        <CalendarViewTrigger view="years">Year</CalendarViewTrigger>
        <CalendarViewTrigger view="months">Month</CalendarViewTrigger>
      </>,
    )
    const { getAllByRole, getByText } = within(container)
    const read = () => [
      container.querySelector('[data-slot="calendar"]')?.getAttribute('data-view'),
      ...getAllByRole('button').map((button) => button.getAttribute('data-state')),
    ]
    const shown = [read()]

    fireEvent.click(getByText('Year'))
    shown.push(read())
    fireEvent.click(getByText('Month'))
    shown.push(read())

    expect(shown).toEqual([
      ['days', 'inactive', 'inactive'],
      ['years', 'active', 'inactive'],
      ['months', 'inactive', 'active'],
    ])
  })

  it('is a button of its own type that leaves a click it was given a chance to cancel', () => {
    const { container } = renderCalendar(
      {},
      <CalendarViewTrigger view="years" onClick={(event) => event.preventDefault()}>
        Year
      </CalendarViewTrigger>,
    )

    const trigger = within(container).getByText('Year')
    fireEvent.click(trigger)

    expect([
      trigger.getAttribute('type'),
      trigger.getAttribute('data-slot'),
      container.querySelector('[data-slot="calendar"]')?.getAttribute('data-view'),
    ]).toEqual(['button', 'calendar-view-trigger', 'days'])
  })
})

describe('CalendarGrid', () => {
  it('starts each week with its ISO week number when asked', () => {
    const { container } = renderCalendar({ showWeekNumber: true }, <CalendarGrid />)
    const weeks = Array.from(container.querySelectorAll('[data-slot="calendar-week"]'), (row) => {
      const cell = row.firstElementChild
      return [cell?.getAttribute('role'), cell?.getAttribute('aria-label'), cell?.textContent]
    })

    expect(weeks).toEqual([10, 11, 12, 13, 14].map((n) => ['rowheader', `Week ${n}`, String(n)]))
    expect(
      container.querySelector('[data-slot="calendar-weekdays"]')?.firstElementChild?.getAttribute('aria-hidden'),
    ).toBe('true')
  })

  it('draws no week numbers by default', () => {
    const { container } = renderCalendar({}, <CalendarGrid />)

    expect(container.querySelectorAll('[data-slot^="calendar-week-number"]').length).toBe(0)
  })

  it('hands readOnly, invalid, unavailable and pageBehavior to the calendar, not the element', () => {
    const { container } = renderCalendar(
      {
        readOnly: true,
        invalid: true,
        unavailable: [new Date(2026, 2, 10)],
        pageBehavior: 'visible',
        numberOfMonths: 2,
      },
      <>
        <CalendarHeader />
        <CalendarNextButton />
        <CalendarGrid />
      </>,
    )
    const root = container.querySelector('[data-slot="calendar"]')
    const grid = container.querySelector('[data-slot="calendar-grid"]')
    const tenth = container.querySelector('[aria-label^="Tuesday, March 10"]')

    expect(['readonly', 'invalid', 'unavailable', 'pagebehavior'].map((name) => root?.hasAttribute(name))).toEqual([
      false,
      false,
      false,
      false,
    ])
    expect([grid?.getAttribute('aria-readonly'), grid?.getAttribute('data-invalid')]).toEqual(['true', 'true'])
    expect(tenth?.getAttribute('data-unavailable')).toBe('true')
    fireEvent.click(container.querySelector('[data-direction="next"]') as HTMLButtonElement)
    expect(container.querySelector('[data-slot="calendar-header"]')?.textContent).toContain('May')
  })

  it('has role="grid"', () => {
    const { container } = renderCalendar({}, <CalendarGrid />)
    const grid = container.querySelector('[data-slot="calendar-grid"]')
    expect(grid?.getAttribute('role')).toBe('grid')
  })

  it('has data-slot="calendar-grid"', () => {
    const { container } = renderCalendar({}, <CalendarGrid />)
    expect(container.querySelector('[data-slot="calendar-grid"]')).not.toBeNull()
  })

  it('has aria-labelledby pointing to header id', () => {
    const { container } = renderCalendar(
      {},
      <>
        <CalendarHeader />
        <CalendarGrid />
      </>,
    )
    const header = container.querySelector('[data-slot="calendar-header"]')
    const grid = container.querySelector('[data-slot="calendar-grid"]')
    const headerId = header?.getAttribute('id')
    expect(headerId).not.toBeNull()
    expect(headerId!.length).toBeGreaterThan(0)
    expect(grid?.getAttribute('aria-labelledby')).toBe(headerId)
  })

  it('draws its weekdays and a day for every day of the shown month', () => {
    const { container } = renderCalendar({}, <CalendarGrid />)
    const days = container.querySelectorAll('[data-slot="calendar-day"]')

    expect(container.querySelectorAll('[data-slot="calendar-weekday"]').length).toBe(7)
    expect(container.querySelectorAll('[data-slot="calendar-grid"] > [role="row"]').length).toBe(6)
    expect(days.length).toBe(35)
    expect(days[0]?.getAttribute('aria-label')).toContain('March 1,')
  })

  it('marks the selected day on the days it draws', () => {
    const { container } = renderCalendar({ defaultSelected: new Date(2026, 2, 15) }, <CalendarGrid />)
    const selected = container.querySelectorAll('[data-slot="calendar-day"][aria-selected="true"]')

    expect(Array.from(selected, (day) => day.textContent)).toEqual(['15'])
  })

  it('draws each day through a function child', () => {
    renderCalendar({}, <CalendarGrid>{(day) => <span data-testid="cell">{day.date.getDate()}</span>}</CalendarGrid>)
    const cells = screen.getAllByTestId('cell')

    expect(cells.length).toBe(35)
    expect(cells[0]?.textContent).toBe('1')
  })

  it('draws the month it is given when several are shown', () => {
    const { container } = renderCalendar({ numberOfMonths: 2 }, <CalendarGrid month={1} />)
    const inMonth = container.querySelectorAll('[data-slot="calendar-day"]:not([data-outside-month])')

    expect(inMonth.length).toBe(30)
    expect(inMonth[0]?.getAttribute('aria-label')).toContain('April 1,')
  })

  it('keeps the content it is given', () => {
    const { container } = renderCalendar(
      {},
      <CalendarGrid>
        <span data-testid="own" />
      </CalendarGrid>,
    )

    expect(screen.getByTestId('own')).not.toBeNull()
    expect(container.querySelector('[data-slot="calendar-day"]')).toBeNull()
  })

  it('takes the props it is given over the ones the calendar sets', () => {
    const { container } = renderCalendar({}, <CalendarGrid aria-labelledby="days" />)

    expect(container.querySelector('[data-slot="calendar-grid"]')?.getAttribute('aria-labelledby')).toBe('days')
  })
})

describe('CalendarWeekdays', () => {
  it('renders 7 weekday headers', () => {
    const { container } = renderCalendar({}, <CalendarWeekdays />)
    const weekdays = container.querySelectorAll('[data-slot="calendar-weekday"]')
    expect(weekdays.length).toBe(7)
  })

  it('has data-slot="calendar-weekdays"', () => {
    const { container } = renderCalendar({}, <CalendarWeekdays />)
    expect(container.querySelector('[data-slot="calendar-weekdays"]')).not.toBeNull()
  })

  it('weekday cells are <abbr> elements', () => {
    const { container } = renderCalendar({}, <CalendarWeekdays />)
    const weekdays = container.querySelectorAll('[data-slot="calendar-weekday"]')
    for (const wd of weekdays) {
      expect(wd.tagName).toBe('ABBR')
    }
  })

  it('weekday cells have title attribute with the weekday name', () => {
    const { container } = renderCalendar({}, <CalendarWeekdays />)
    const weekdays = container.querySelectorAll('[data-slot="calendar-weekday"]')
    for (const wd of weekdays) {
      expect(wd.getAttribute('title')).toBeTruthy()
    }
  })

  it('custom renderWeekday overrides cell content', () => {
    const { container } = renderCalendar({}, <CalendarWeekdays renderWeekday={(name) => name.toUpperCase()} />)
    const first = container.querySelector('[data-slot="calendar-weekday"]')
    expect(first?.textContent).toBe(first?.textContent?.toUpperCase())
  })

  it('draws the children it is given in place of the weekdays', () => {
    const { container } = renderCalendar(
      {},
      <CalendarWeekdays>
        <span>Week</span>
      </CalendarWeekdays>,
    )
    const row = container.querySelector('[data-slot="calendar-weekdays"]')

    expect([row?.textContent, row?.querySelectorAll('[data-slot="calendar-weekday"]').length]).toEqual(['Week', 0])
  })

  it('hands renderWeekday the position of each weekday', () => {
    const { container } = renderCalendar({}, <CalendarWeekdays renderWeekday={(_, index) => index} />)

    expect(
      Array.from(container.querySelectorAll('[data-slot="calendar-weekday"]'), (cell) => cell.textContent),
    ).toEqual(['0', '1', '2', '3', '4', '5', '6'])
  })
})

describe('CalendarDay', () => {
  it('renders as button with data-slot="calendar-day"', () => {
    const day = {
      date: new Date(2026, 2, 15),
      isToday: false,
      isSelected: false,
      isDisabled: false,
      isOutside: false,
      isHidden: false,
      isWeekend: false,
      isRangeStart: false,
      isRangeEnd: false,
      isRangeMiddle: false,
    }
    const { container } = renderCalendar({}, <CalendarDay day={day} />)
    const btn = container.querySelector('[data-slot="calendar-day"]')
    expect(btn).not.toBeNull()
    expect(btn?.tagName.toLowerCase()).toBe('button')
  })

  it('has role="gridcell" from getDayProps', () => {
    const day = {
      date: new Date(2026, 2, 15),
      isToday: false,
      isSelected: false,
      isDisabled: false,
      isOutside: false,
      isHidden: false,
      isWeekend: false,
      isRangeStart: false,
      isRangeEnd: false,
      isRangeMiddle: false,
    }
    const { container } = renderCalendar({}, <CalendarDay day={day} />)
    const btn = container.querySelector('[data-slot="calendar-day"]')
    expect(btn?.getAttribute('role')).toBe('gridcell')
  })

  it('shows day number as text content', () => {
    const day = {
      date: new Date(2026, 2, 15),
      isToday: false,
      isSelected: false,
      isDisabled: false,
      isOutside: false,
      isHidden: false,
      isWeekend: false,
      isRangeStart: false,
      isRangeEnd: false,
      isRangeMiddle: false,
    }
    const { container } = renderCalendar({}, <CalendarDay day={day} />)
    const btn = container.querySelector('[data-slot="calendar-day"]')
    expect(btn?.textContent).toBe('15')
  })

  it('has aria-selected when selected', () => {
    const day = {
      date: new Date(2026, 2, 15),
      isToday: false,
      isSelected: true,
      isDisabled: false,
      isOutside: false,
      isHidden: false,
      isWeekend: false,
      isRangeStart: false,
      isRangeEnd: false,
      isRangeMiddle: false,
    }
    const { container } = renderCalendar({}, <CalendarDay day={day} />)
    const btn = container.querySelector('[data-slot="calendar-day"]')
    expect(btn?.getAttribute('aria-selected')).toBe('true')
  })

  it('has aria-disabled when disabled', () => {
    const day = {
      date: new Date(2026, 2, 15),
      isToday: false,
      isSelected: false,
      isDisabled: true,
      isOutside: false,
      isHidden: false,
      isWeekend: false,
      isRangeStart: false,
      isRangeEnd: false,
      isRangeMiddle: false,
    }
    const { container } = renderCalendar({}, <CalendarDay day={day} />)
    const btn = container.querySelector('[data-slot="calendar-day"]')
    expect(btn?.getAttribute('aria-disabled')).toBe('true')
  })

  it('has aria-current="date" when today', () => {
    const day = {
      date: new Date(2026, 2, 15),
      isToday: true,
      isSelected: false,
      isDisabled: false,
      isOutside: false,
      isHidden: false,
      isWeekend: false,
      isRangeStart: false,
      isRangeEnd: false,
      isRangeMiddle: false,
    }
    const { container } = renderCalendar({}, <CalendarDay day={day} />)
    const btn = container.querySelector('[data-slot="calendar-day"]')
    expect(btn?.getAttribute('aria-current')).toBe('date')
  })

  it('has data-outside-month when outside current month', () => {
    const day = {
      date: new Date(2026, 1, 28),
      isToday: false,
      isSelected: false,
      isDisabled: false,
      isOutside: true,
      isHidden: false,
      isWeekend: false,
      isRangeStart: false,
      isRangeEnd: false,
      isRangeMiddle: false,
    }
    const { container } = renderCalendar({}, <CalendarDay day={day} />)
    const btn = container.querySelector('[data-slot="calendar-day"]')
    expect(btn?.getAttribute('data-outside-month')).toBe('true')
  })

  it('click selects the date via onClick', () => {
    const onSelect = vi.fn(() => {})
    const day = {
      date: new Date(2026, 2, 15),
      isToday: false,
      isSelected: false,
      isDisabled: false,
      isOutside: false,
      isHidden: false,
      isWeekend: false,
      isRangeStart: false,
      isRangeEnd: false,
      isRangeMiddle: false,
    }
    const { container } = renderCalendar({ onSelect }, <CalendarDay day={day} />)
    const btn = container.querySelector('[data-slot="calendar-day"]') as HTMLButtonElement
    fireEvent.click(btn)
    expect(onSelect).toHaveBeenCalledTimes(1)
    const selectedDate = onSelect.mock.calls[0][0] as Date
    expect(selectedDate.getFullYear()).toBe(2026)
    expect(selectedDate.getMonth()).toBe(2)
    expect(selectedDate.getDate()).toBe(15)
  })

  it('takes the props, handlers and children it is given, and still selects', () => {
    const onClick = vi.fn()
    const onKeyDown = vi.fn()
    const onSelect = vi.fn()
    const { container } = renderCalendar(
      { onSelect },
      <CalendarGrid>
        {(day) => (
          <CalendarDay day={day} aria-label={`Day ${day.date.getDate()}`} onClick={onClick} onKeyDown={onKeyDown}>
            {`(${day.date.getDate()})`}
          </CalendarDay>
        )}
      </CalendarGrid>,
    )
    const fifteenth = within(container).getByRole('gridcell', { name: 'Day 15' })

    fireEvent.click(fifteenth)
    fireEvent.keyDown(fifteenth, { key: 'a' })

    expect([
      fifteenth.textContent,
      onClick.mock.calls.length,
      onKeyDown.mock.calls.length,
      onSelect.mock.calls.length,
    ]).toEqual(['(15)', 1, 1, 1])
  })

  it('moves the tab stop to the day under the mouse', () => {
    const { container } = renderCalendar({}, <CalendarGrid />)
    const twentieth = within(container).getByRole('gridcell', { name: 'Friday, March 20, 2026' })

    fireEvent.mouseEnter(twentieth)

    expect(twentieth.getAttribute('tabindex')).toBe('0')
  })
})

describe('CalendarMonthView', () => {
  it('renders 12 month buttons', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    const months = container.querySelectorAll('[data-slot="calendar-month"]')
    expect(months.length).toBe(12)
  })

  it('has data-slot="calendar-month-view"', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    expect(container.querySelector('[data-slot="calendar-month-view"]')).not.toBeNull()
  })

  it('month buttons have data-slot="calendar-month"', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    const months = container.querySelectorAll('[data-slot="calendar-month"]')
    for (const m of months) {
      expect(m.getAttribute('data-slot')).toBe('calendar-month')
    }
  })

  it('draws a grid of rows, three months to a row unless told otherwise', () => {
    const three = renderCalendar({}, <CalendarMonthView />)
    const rowsOf = (view: Element | null) =>
      Array.from(view?.querySelectorAll('[role="row"]') ?? [], (row) =>
        Array.from(row.children, (cell) => cell.getAttribute('role')),
      )

    const view = three.container.querySelector('[data-slot="calendar-month-view"]')
    expect(view?.getAttribute('role')).toBe('grid')
    expect(view?.getAttribute('aria-label')).toBe('2026')
    expect(rowsOf(view)).toEqual(Array(4).fill(Array(3).fill('gridcell')))
    three.unmount()

    const four = renderCalendar({}, <CalendarMonthView columns={4} />)
    expect(rowsOf(four.container.querySelector('[data-slot="calendar-month-view"]'))).toEqual(
      Array(3).fill(Array(4).fill('gridcell')),
    )
  })

  it('lays out three columns when the count it is given cannot make a row', () => {
    const rowsOf = (view: Element | null) =>
      Array.from(view?.querySelectorAll('[role="row"]') ?? [], (row) =>
        Array.from(row.children, (cell) => cell.getAttribute('role')),
      )
    const counts = [0, -2, 2.5].map((columns) => {
      const { container, unmount } = renderCalendar({}, <CalendarMonthView columns={columns} />)
      const rows = rowsOf(container.querySelector('[data-slot="calendar-month-view"]'))
      unmount()
      return rows
    })

    expect(counts).toEqual(Array(3).fill(Array(4).fill(Array(3).fill('gridcell'))))
  })

  it('marks the shown month selected and gives it the one tab stop', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    const cells = Array.from(container.querySelectorAll('[data-slot="calendar-month"]'))

    expect(cells.map((cell) => [cell.getAttribute('aria-selected'), cell.getAttribute('data-selected')])).toEqual(
      cells.map((_, i) => (i === 2 ? ['true', 'true'] : ['false', null])),
    )
    expect(cells.map((cell) => cell.getAttribute('tabindex'))).toEqual(cells.map((_, i) => (i === 2 ? '0' : '-1')))
  })

  it('moves focus with the arrow keys, Home and End, and stops at the edges', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    const focused = () => document.activeElement?.getAttribute('data-month')
    const press = (key: string) => fireEvent.keyDown(document.activeElement as Element, { key })
    ;(container.querySelector('[data-month="2"]') as HTMLButtonElement).focus()

    const path = ['ArrowLeft', 'ArrowDown', 'End', 'Home', 'ArrowUp', 'ArrowUp', 'ArrowLeft'].map((key) => {
      press(key)
      return focused()
    })

    expect(path).toEqual(['1', '4', '5', '3', '0', '0', '0'])
    expect(container.querySelector('[data-month="0"]')?.getAttribute('tabindex')).toBe('0')
  })

  it('ends a short last row at its last month', () => {
    const { container } = renderCalendar({}, <CalendarMonthView columns={5} />)
    const november = container.querySelector('[data-month="10"]') as HTMLButtonElement
    november.focus()

    fireEvent.keyDown(november, { key: 'End' })

    expect(document.activeElement?.getAttribute('data-month')).toBe('11')
  })

  it('moves the tab stop to a month focused another way', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)

    act(() => (container.querySelector('[data-month="8"]') as HTMLButtonElement).focus())

    expect(container.querySelector('[data-month="8"]')?.getAttribute('tabindex')).toBe('0')
    expect(container.querySelector('[data-month="2"]')?.getAttribute('tabindex')).toBe('-1')
  })

  it('swaps left and right in a right-to-left calendar', () => {
    const { container } = renderCalendar({ locale: { direction: 'rtl' } }, <CalendarMonthView />)
    const march = container.querySelector('[data-month="2"]') as HTMLButtonElement
    march.focus()

    fireEvent.keyDown(march, { key: 'ArrowLeft' })

    expect(document.activeElement?.getAttribute('data-month')).toBe('3')
  })

  it('turns the year with PageUp and PageDown, keeping focus on the month', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    const march = container.querySelector('[data-month="2"]') as HTMLButtonElement
    march.focus()

    fireEvent.keyDown(march, { key: 'PageDown' })
    fireEvent.keyDown(document.activeElement as Element, { key: 'PageDown' })
    fireEvent.keyDown(document.activeElement as Element, { key: 'PageUp' })

    expect(container.querySelector('[data-slot="calendar-month-view"]')?.getAttribute('aria-label')).toBe('2027')
    expect(document.activeElement?.getAttribute('data-month')).toBe('2')
  })

  it('leaves a key it does not use to the page, focus included', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    const march = container.querySelector('[data-month="2"]') as HTMLButtonElement
    march.focus()

    const handled = ['Tab', 'a'].map((key) => fireEvent.keyDown(march, { key }))

    expect([handled, document.activeElement === march]).toEqual([[true, true], true])
  })

  it('draws the children it is given in place of the months, keeping its slot, props and ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = renderCalendar(
      {},
      <CalendarMonthView ref={ref} className="quarters">
        <p>Pick a quarter</p>
      </CalendarMonthView>,
    )
    const view = container.querySelector('[data-slot="calendar-month-view"]')

    expect([
      view?.textContent,
      view?.className,
      ref.current === view,
      container.querySelectorAll('[data-slot="calendar-month"]').length,
    ]).toEqual(['Pick a quarter', 'quarters', true, 0])
  })

  it('current month is marked with data-current', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    const current = container.querySelector('[data-slot="calendar-month"][data-current="true"]')
    expect(current).not.toBeNull()
    expect(current?.getAttribute('data-month')).toBe(String(new Date().getMonth()))
  })

  it('click on month changes viewMode to days and updates header', () => {
    const { container } = renderCalendar(
      {},
      <>
        <CalendarHeader />
        <CalendarMonthView />
      </>,
    )
    const juneBtn = container.querySelector('[data-slot="calendar-month"][data-month="5"]') as HTMLButtonElement
    expect(juneBtn).not.toBeNull()
    fireEvent.click(juneBtn)
    const root = container.querySelector('[data-slot="calendar"]')
    expect(root?.getAttribute('data-view')).toBe('days')
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.textContent).toContain('June')
  })

  it("names the months in the calendar's locale", () => {
    const { container } = renderCalendar({ locale: { locale: 'de-DE' } }, <CalendarMonthView />)

    expect(container.querySelector('[data-month="2"]')?.textContent).toBe('M\u00e4rz')
  })

  it('takes ArrowRight to the month before in a right-to-left calendar', () => {
    const { container } = renderCalendar({ locale: { direction: 'rtl' } }, <CalendarMonthView />)
    const march = container.querySelector('[data-month="2"]') as HTMLButtonElement
    act(() => march.focus())

    fireEvent.keyDown(march, { key: 'ArrowRight' })

    expect(document.activeElement?.getAttribute('data-month')).toBe('1')
  })

  it('takes the arrow keys, PageUp and PageDown from the page', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    act(() => (container.querySelector('[data-month="2"]') as HTMLButtonElement).focus())

    const taken = ['ArrowRight', 'PageDown', 'PageUp'].map(
      (key) => !fireEvent.keyDown(document.activeElement as Element, { key }),
    )

    expect(taken).toEqual([true, true, true])
  })

  it('tells assistive technology which month is the current one', () => {
    vi.setSystemTime(new Date(2026, 4, 15))
    try {
      const { container } = renderCalendar({}, <CalendarMonthView />)

      expect(container.querySelector('[aria-current="date"]')?.getAttribute('data-month')).toBe('4')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('CalendarYearView', () => {
  it('renders year buttons', () => {
    const { container } = renderCalendar({}, <CalendarYearView />)
    const years = container.querySelectorAll('[data-slot="calendar-year"]')
    expect(years.length).toBeGreaterThan(0)
  })

  it('has data-slot="calendar-year-view"', () => {
    const { container } = renderCalendar({}, <CalendarYearView />)
    expect(container.querySelector('[data-slot="calendar-year-view"]')).not.toBeNull()
  })

  it('year buttons have data-slot="calendar-year"', () => {
    const { container } = renderCalendar({}, <CalendarYearView />)
    const years = container.querySelectorAll('[data-slot="calendar-year"]')
    for (const y of years) {
      expect(y.getAttribute('data-slot')).toBe('calendar-year')
    }
  })

  it('draws a grid of rows of three years, named by the years it holds', () => {
    const { container } = renderCalendar({}, <CalendarYearView />)
    const view = container.querySelector('[data-slot="calendar-year-view"]')

    expect(view?.getAttribute('role')).toBe('grid')
    expect(view?.getAttribute('aria-label')).toBe('2019 - 2030')
    expect(
      Array.from(view?.querySelectorAll('[role="row"]') ?? [], (row) =>
        Array.from(row.children, (cell) => cell.getAttribute('data-year')),
      ),
    ).toEqual([
      ['2019', '2020', '2021'],
      ['2022', '2023', '2024'],
      ['2025', '2026', '2027'],
      ['2028', '2029', '2030'],
    ])
  })

  it('marks the shown year selected and gives it the one tab stop', () => {
    const { container } = renderCalendar({}, <CalendarYearView />)
    const year = container.querySelector('[data-year="2026"]')

    expect([year?.getAttribute('aria-selected'), year?.getAttribute('tabindex')]).toEqual(['true', '0'])
    expect(container.querySelectorAll('[data-slot="calendar-year"][tabindex="0"]').length).toBe(1)
  })

  it('moves focus with the arrow keys and turns a decade with PageDown', () => {
    const { container } = renderCalendar({}, <CalendarYearView />)
    const year = container.querySelector('[data-year="2026"]') as HTMLButtonElement
    year.focus()

    fireEvent.keyDown(year, { key: 'ArrowRight' })
    const moved = document.activeElement?.getAttribute('data-year')
    fireEvent.keyDown(document.activeElement as Element, { key: 'PageDown' })

    expect([moved, document.activeElement?.getAttribute('data-year')]).toEqual(['2027', '2037'])
    expect(container.querySelector('[data-slot="calendar-year-view"]')?.getAttribute('aria-label')).toBe('2029 - 2040')
  })

  it('draws the children it is given in place of the years, keeping its slot, props and ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = renderCalendar(
      {},
      <CalendarYearView ref={ref} className="decades">
        <p>Pick a decade</p>
      </CalendarYearView>,
    )
    const view = container.querySelector('[data-slot="calendar-year-view"]')

    expect([
      view?.textContent,
      view?.className,
      ref.current === view,
      container.querySelectorAll('[data-slot="calendar-year"]').length,
    ]).toEqual(['Pick a decade', 'decades', true, 0])
  })

  it('current year is marked with data-current', () => {
    const { container } = renderCalendar({}, <CalendarYearView />)
    const current = container.querySelector('[data-slot="calendar-year"][data-current="true"]')
    expect(current).not.toBeNull()
    expect(current?.getAttribute('data-year')).toBe('2026')
  })

  it('click on year changes viewMode to months and updates the month', () => {
    const { container } = renderCalendar(
      {},
      <>
        <CalendarHeader />
        <CalendarYearView />
      </>,
    )
    const yearBtn = container.querySelector('[data-slot="calendar-year"][data-year="2028"]') as HTMLButtonElement
    expect(yearBtn).not.toBeNull()
    fireEvent.click(yearBtn)
    const root = container.querySelector('[data-slot="calendar"]')
    expect(root?.getAttribute('data-view')).toBe('months')
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.textContent).toContain('2028')
  })

  it('takes ArrowLeft to the next year in a right-to-left calendar', () => {
    const { container } = renderCalendar({ locale: { direction: 'rtl' } }, <CalendarYearView />)
    const shown = container.querySelector('[data-year="2026"]') as HTMLButtonElement
    act(() => shown.focus())

    fireEvent.keyDown(shown, { key: 'ArrowLeft' })

    expect(document.activeElement?.getAttribute('data-year')).toBe('2027')
  })
})

describe('Calendar integration', () => {
  function FullCalendar(props: {
    onSelect?: (val: unknown) => void
    defaultMonth?: Date
    fromDate?: Date
    toDate?: Date
  }) {
    const { onSelect, defaultMonth = march2026, ...rest } = props
    return (
      <Calendar adapter={adapter} mode="single" defaultMonth={defaultMonth} onSelect={onSelect} {...rest}>
        <CalendarHeader />
        <CalendarNav />
        <CalendarGrid />
      </Calendar>
    )
  }

  it('keeps the shown months in view when the keys move inside them', async () => {
    const { container } = render(
      <Calendar adapter={adapter} mode="single" defaultMonth={new Date(2020, 5, 1)} numberOfMonths={3}>
        <CalendarHeader />
        <CalendarGrid />
        <CalendarGrid month={1} />
        <CalendarGrid month={2} />
      </Calendar>,
    )
    const [june, july] = Array.from(container.querySelectorAll('[data-slot="calendar-grid"]'))

    fireEvent.keyDown(june!.querySelector('[tabindex="0"]')!, { key: 'PageDown' })
    await new Promise((resolve) => requestAnimationFrame(resolve))

    expect(container.querySelector('[data-slot="calendar-header"]')?.textContent).toContain('June')
    expect(july!.querySelector('[tabindex="0"]')?.getAttribute('aria-label')).toContain('July 1,')
    expect(july!.contains(document.activeElement)).toBe(true)
    expect(document.activeElement?.getAttribute('tabindex')).toBe('0')
  })

  it('moves the view one month when the keys leave the last month shown', () => {
    const { container } = render(
      <Calendar adapter={adapter} mode="single" defaultMonth={new Date(2020, 5, 1)} numberOfMonths={2}>
        <CalendarHeader />
        <CalendarGrid />
        <CalendarGrid month={1} />
      </Calendar>,
    )
    const stop = () => container.querySelector('[data-slot="calendar-day"][tabindex="0"]')!

    fireEvent.keyDown(stop(), { key: 'PageDown' })
    fireEvent.keyDown(stop(), { key: 'PageDown' })

    expect(container.querySelector('[data-slot="calendar-header"]')?.textContent).toContain('July')
    expect(stop().getAttribute('aria-label')).toContain('August 1,')
  })

  it('moves the view back when the keys leave the first month shown', () => {
    const { container } = render(
      <Calendar adapter={adapter} mode="single" defaultMonth={new Date(2020, 5, 1)} numberOfMonths={2}>
        <CalendarHeader />
        <CalendarGrid />
        <CalendarGrid month={1} />
      </Calendar>,
    )
    const stop = () => container.querySelector('[data-slot="calendar-day"][tabindex="0"]')!

    fireEvent.keyDown(stop(), { key: 'ArrowLeft' })

    expect(container.querySelector('[data-slot="calendar-header"]')?.textContent).toContain('May')
    expect(stop().getAttribute('aria-label')).toContain('May 31,')
  })

  it('moves the tab stop with the arrow keys from the first day shown', () => {
    const { container } = render(<FullCalendar defaultMonth={new Date(2020, 5, 1)} />)
    const stops = () => Array.from(container.querySelectorAll('[data-slot="calendar-day"][tabindex="0"]'))

    expect(stops().map((day) => day.getAttribute('aria-label'))).toEqual([expect.stringContaining('June 1,')])

    fireEvent.keyDown(stops()[0]!, { key: 'ArrowRight' })

    expect(stops().map((day) => day.getAttribute('aria-label'))).toEqual([expect.stringContaining('June 2,')])
  })

  it('full calendar with header, nav, grid, weekdays renders', () => {
    const { container } = render(<FullCalendar />)
    expect(container.querySelector('[data-slot="calendar"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="calendar-header"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="calendar-nav"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="calendar-grid"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="calendar-weekdays"]')).not.toBeNull()
  })

  it('header and grid share the same id for aria-labelledby', () => {
    const { container } = render(<FullCalendar />)
    const header = container.querySelector('[data-slot="calendar-header"]')
    const grid = container.querySelector('[data-slot="calendar-grid"]')
    const headerId = header?.getAttribute('id')
    expect(headerId).not.toBeNull()
    expect(grid?.getAttribute('aria-labelledby')).toBe(headerId)
  })

  it('click next then header renders next month', () => {
    const { container } = render(<FullCalendar />)
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.textContent).toContain('March')

    const next = container.querySelector('[data-direction="next"]') as HTMLButtonElement
    fireEvent.click(next)
    expect(header?.textContent).toContain('April')
    expect(header?.textContent).toContain('2026')
  })

  it('click prev then header renders previous month', () => {
    const { container } = render(<FullCalendar />)
    const prev = container.querySelector('[data-direction="prev"]') as HTMLButtonElement
    fireEvent.click(prev)
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.textContent).toContain('February')
    expect(header?.textContent).toContain('2026')
  })

  it('navigating multiple months updates correctly', () => {
    const { container } = render(<FullCalendar />)
    const next = container.querySelector('[data-direction="next"]') as HTMLButtonElement
    const header = container.querySelector('[data-slot="calendar-header"]')

    fireEvent.click(next)
    fireEvent.click(next)
    fireEvent.click(next)
    expect(header?.textContent).toContain('June')
    expect(header?.textContent).toContain('2026')
  })

  it('clicking a day calls onSelect with the selected date', () => {
    const onSelect = vi.fn(() => {})
    const day = {
      date: new Date(2026, 2, 10),
      isToday: false,
      isSelected: false,
      isDisabled: false,
      isOutside: false,
      isHidden: false,
      isWeekend: false,
      isRangeStart: false,
      isRangeEnd: false,
      isRangeMiddle: false,
    }
    const { container } = render(
      <Calendar adapter={adapter} mode="single" defaultMonth={march2026} onSelect={onSelect}>
        <CalendarDay day={day} />
      </Calendar>,
    )
    const btn = container.querySelector('[data-slot="calendar-day"]') as HTMLButtonElement
    fireEvent.click(btn)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('month view to day view flow works', () => {
    const { container } = render(
      <Calendar adapter={adapter} mode="single" defaultMonth={march2026}>
        <CalendarHeader />
        <CalendarMonthView />
      </Calendar>,
    )
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.textContent).toContain('March')

    const augustBtn = container.querySelector('[data-slot="calendar-month"][data-month="7"]') as HTMLButtonElement
    fireEvent.click(augustBtn)

    const root = container.querySelector('[data-slot="calendar"]')
    expect(root?.getAttribute('data-view')).toBe('days')
    expect(header?.textContent).toContain('August')
  })

  it('year view to month view flow works', () => {
    const { container } = render(
      <Calendar adapter={adapter} mode="single" defaultMonth={march2026}>
        <CalendarHeader />
        <CalendarYearView />
      </Calendar>,
    )
    const header = container.querySelector('[data-slot="calendar-header"]')
    expect(header?.textContent).toContain('2026')

    const yearBtn = container.querySelector('[data-slot="calendar-year"][data-year="2029"]') as HTMLButtonElement
    fireEvent.click(yearBtn)

    const root = container.querySelector('[data-slot="calendar"]')
    expect(root?.getAttribute('data-view')).toBe('months')
    expect(header?.textContent).toContain('2029')
  })

  it('nav buttons are not disabled when no fromDate/toDate constraints', () => {
    const { container } = render(<FullCalendar />)
    const prev = container.querySelector('[data-direction="prev"]') as HTMLButtonElement
    const next = container.querySelector('[data-direction="next"]') as HTMLButtonElement
    expect(prev.disabled).toBe(false)
    expect(next.disabled).toBe(false)
  })

  it('prev is disabled at fromDate, next is disabled at toDate', () => {
    const { container } = render(<FullCalendar fromDate={march2026} toDate={new Date(2026, 2, 31)} />)
    const prev = container.querySelector('[data-direction="prev"]') as HTMLButtonElement
    const next = container.querySelector('[data-direction="next"]') as HTMLButtonElement
    expect(prev.disabled).toBe(true)
    expect(next.disabled).toBe(true)
  })

  it('passes additional DOM props to Calendar root', () => {
    const { container } = render(
      <Calendar adapter={adapter} mode="single" defaultMonth={march2026} className="my-calendar" data-custom="yes">
        <span>child</span>
      </Calendar>,
    )
    const root = container.querySelector('[data-slot="calendar"]')
    expect(root?.getAttribute('class')).toBe('my-calendar')
    expect(root?.getAttribute('data-custom')).toBe('yes')
  })

  it('submits no form it sits in from its buttons', () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    const { container } = render(
      <form onSubmit={onSubmit}>
        <Calendar adapter={adapter} mode="single" defaultMonth={march2026}>
          <CalendarPrevButton />
          <CalendarGrid />
          <CalendarMonthView />
        </Calendar>
      </form>,
    )

    fireEvent.click(within(container).getByRole('button', { name: 'Go to previous month' }))
    fireEvent.click(within(container).getByRole('gridcell', { name: 'Sunday, February 15, 2026' }))
    fireEvent.click(container.querySelector('[data-month="5"]') as HTMLElement)

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
