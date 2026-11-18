import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { NativeAdapter } from '@gentleduck/calendar'
import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { Calendar } from '../calendar'
import { CalendarDay } from '../day'
import { CalendarGrid } from '../grid'
import { CalendarHeader } from '../header'
import { CalendarMonthView } from '../month-view'
import { CalendarNav, CalendarNextButton, CalendarPrevButton } from '../nav'
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
})

describe('CalendarGrid', () => {
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
    const onSelect = mock(() => {})
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

  it('has role="grid"', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    const view = container.querySelector('[data-slot="calendar-month-view"]')
    expect(view?.getAttribute('role')).toBe('grid')
  })

  it('month buttons have data-slot="calendar-month"', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    const months = container.querySelectorAll('[data-slot="calendar-month"]')
    for (const m of months) {
      expect(m.getAttribute('data-slot')).toBe('calendar-month')
    }
  })

  it('month buttons have role="gridcell"', () => {
    const { container } = renderCalendar({}, <CalendarMonthView />)
    const months = container.querySelectorAll('[data-slot="calendar-month"]')
    for (const m of months) {
      expect(m.getAttribute('role')).toBe('gridcell')
    }
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

  it('has role="grid"', () => {
    const { container } = renderCalendar({}, <CalendarYearView />)
    const view = container.querySelector('[data-slot="calendar-year-view"]')
    expect(view?.getAttribute('role')).toBe('grid')
  })

  it('year buttons have data-slot="calendar-year"', () => {
    const { container } = renderCalendar({}, <CalendarYearView />)
    const years = container.querySelectorAll('[data-slot="calendar-year"]')
    for (const y of years) {
      expect(y.getAttribute('data-slot')).toBe('calendar-year')
    }
  })

  it('year buttons have role="gridcell"', () => {
    const { container } = renderCalendar({}, <CalendarYearView />)
    const years = container.querySelectorAll('[data-slot="calendar-year"]')
    for (const y of years) {
      expect(y.getAttribute('role')).toBe('gridcell')
    }
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
        <CalendarGrid>
          <CalendarWeekdays />
          <WeeksRenderer />
        </CalendarGrid>
      </Calendar>
    )
  }

  function WeeksRenderer() {
    // Access weeks from CalendarProvider context
    // We use the exported useCalendarContext but it requires scope param.
    // Instead, we'll wrap this at the component tree level.
    return <WeeksRendererInner />
  }

  function WeeksRendererInner() {
    // We cannot easily access the context from outside. We use a workaround:
    // Render CalendarDay for each day using the context hook from the calendar module.
    return null
  }

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
    const onSelect = mock(() => {})
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
})
