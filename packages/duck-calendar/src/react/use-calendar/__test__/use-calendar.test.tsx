import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NativeAdapter } from '../../../adapter'
import type { Selection } from '../../../selection'
import { useCalendar } from '../use-calendar'
import type { UseCalendar } from '../use-calendar.types'

const march2026 = new Date(2026, 2, 1)

function tabStops<M extends Selection.SelectionMode>(calendar: UseCalendar.IUseCalendarReturn<Date, M>) {
  return calendar.state.months
    .flatMap((month) => month.weeks.flatMap((week) => week.days))
    .filter((day) => calendar.getDayProps(day).tabIndex === 0)
    .map((day) => day.date)
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

function Days({ config }: { config: Partial<UseCalendar.IUseCalendarConfig<Date, 'single'>> }) {
  const calendar = useCalendar({
    adapter: new NativeAdapter(),
    mode: 'single' as const,
    defaultMonth: new Date(2020, 5, 1),
    ...config,
  })
  return calendar.state.months
    .flatMap((month) => month.weeks.flatMap((week) => week.days))
    .filter((day) => !day.isOutside)
    .map((day) => (
      <button key={day.date.getTime()} type="button" {...calendar.getDayProps(day)}>
        {day.date.getDate()}
      </button>
    ))
}

describe('useCalendar', () => {
  let adapter: NativeAdapter

  beforeEach(() => {
    adapter = new NativeAdapter()
  })

  describe('uncontrolled month', () => {
    it('defaults to today when no defaultMonth provided', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const }))
      const today = adapter.today()
      expect(adapter.isSameMonth(result.current.state.month, today)).toBe(true)
    })

    it('uses defaultMonth when provided', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))
      expect(adapter.isSameMonth(result.current.state.month, march2026)).toBe(true)
    })

    it('goToNext() advances month by 1', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      act(() => {
        result.current.actions.goToNext()
      })

      expect(result.current.state.month.getMonth()).toBe(3) // April
      expect(result.current.state.month.getFullYear()).toBe(2026)
    })

    it('goToPrevious() goes back 1 month', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      act(() => {
        result.current.actions.goToPrevious()
      })

      expect(result.current.state.month.getMonth()).toBe(1) // February
      expect(result.current.state.month.getFullYear()).toBe(2026)
    })
  })

  describe('controlled month', () => {
    it('uses month prop as the displayed month', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, month: march2026 }))
      expect(adapter.isSameMonth(result.current.state.month, march2026)).toBe(true)
    })

    it('onMonthChange is called when navigating', () => {
      const onMonthChange = vi.fn()
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          month: march2026,
          onMonthChange,
        }),
      )

      act(() => {
        result.current.actions.goToNext()
      })

      expect(onMonthChange).toHaveBeenCalledOnce()
      const nextMonth = onMonthChange.mock.calls[0][0] as Date
      expect(nextMonth.getMonth()).toBe(3) // April
    })
  })

  describe('single selection', () => {
    it('initial value is null', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))
      expect(result.current.state.value).toBeNull()
    })

    it('selectDate(date) selects the date', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      const day = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
      act(() => {
        result.current.actions.selectDate(day.date)
      })

      expect(adapter.isSameDay(result.current.state.value as Date, day.date)).toBe(true)
    })

    it('selectDate(same) deselects (toggles off)', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      const day = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
      act(() => {
        result.current.actions.selectDate(day.date)
      })
      act(() => {
        result.current.actions.selectDate(day.date)
      })

      expect(result.current.state.value).toBeNull()
    })
  })

  describe('range selection', () => {
    it('first click sets from, to is null', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'range' as const, defaultMonth: march2026 }))

      const day = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
      act(() => {
        result.current.actions.selectDate(day.date)
      })

      const range = result.current.state.value as Selection.DateRange<Date>
      expect(range).not.toBeNull()
      expect(adapter.isSameDay(range.from, day.date)).toBe(true)
      expect(range.to).toBeNull()
    })

    it('second click sets to', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'range' as const, defaultMonth: march2026 }))

      const firstDay = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
      const lastDay = result.current.state.weeks[2]!.days.find((d) => !d.isOutside)!

      act(() => {
        result.current.actions.selectDate(firstDay.date)
      })
      act(() => {
        result.current.actions.selectDate(lastDay.date)
      })

      const range = result.current.state.value as Selection.DateRange<Date>
      expect(range).not.toBeNull()
      expect(adapter.isSameDay(range.from, firstDay.date)).toBe(true)
      expect(range.to).not.toBeNull()
      expect(adapter.isSameDay(range.to!, lastDay.date)).toBe(true)
    })
  })

  describe('multi selection', () => {
    it('initial value is empty array', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'multi' as const, defaultMonth: march2026 }))
      expect(result.current.state.value).toEqual([])
    })

    it('click toggles date in/out of array', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'multi' as const, defaultMonth: march2026 }))

      const day = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!

      // Toggle in
      act(() => {
        result.current.actions.selectDate(day.date)
      })

      const selected = result.current.state.value as Date[]
      expect(selected).toHaveLength(1)
      expect(adapter.isSameDay(selected[0]!, day.date)).toBe(true)

      // Toggle out
      act(() => {
        result.current.actions.selectDate(day.date)
      })

      expect(result.current.state.value).toEqual([])
    })
  })

  describe('disabled dates', () => {
    it('selectDate on a disabled date does NOT change value', () => {
      const march5 = new Date(2026, 2, 5)

      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          disabled: [march5],
        }),
      )

      act(() => {
        result.current.actions.selectDate(march5)
      })

      expect(result.current.state.value).toBeNull()
    })

    it('selectDate on a disabled date (predicate) does NOT change value', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          disabled: (date: Date) => date.getDate() === 10,
        }),
      )

      const march10 = new Date(2026, 2, 10)
      act(() => {
        result.current.actions.selectDate(march10)
      })

      expect(result.current.state.value).toBeNull()
    })
  })

  describe('navigation constraints', () => {
    it('canGoNext is false when at toDate boundary', () => {
      const toDate = new Date(2026, 2, 31) // March 31

      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          toDate,
        }),
      )

      expect(result.current.state.canGoNext).toBe(false)
    })

    it('canGoPrevious is false when at fromDate boundary', () => {
      const fromDate = new Date(2026, 2, 1) // March 1

      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          fromDate,
        }),
      )

      expect(result.current.state.canGoPrevious).toBe(false)
    })

    it('goToNext() does nothing when canGoNext is false', () => {
      const toDate = new Date(2026, 2, 31) // March 31

      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          toDate,
        }),
      )

      act(() => {
        result.current.actions.goToNext()
      })

      expect(adapter.isSameMonth(result.current.state.month, march2026)).toBe(true)
    })

    it('goToPrevious() does nothing when canGoPrevious is false', () => {
      const fromDate = new Date(2026, 2, 1)

      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          fromDate,
        }),
      )

      act(() => {
        result.current.actions.goToPrevious()
      })

      expect(adapter.isSameMonth(result.current.state.month, march2026)).toBe(true)
    })
  })

  describe('prop getters', () => {
    describe('getDayProps', () => {
      it('returns role gridcell', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const day = result.current.state.weeks[0]!.days[0]!
        const props = result.current.getDayProps(day)

        expect(props.role).toBe('gridcell')
      })

      it('returns correct aria-selected (false when not selected)', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const day = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
        const props = result.current.getDayProps(day)

        expect(props['aria-selected']).toBe(false)
      })

      it('returns correct aria-selected (true when selected)', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const day = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
        act(() => {
          result.current.actions.selectDate(day.date)
        })

        // After selection, the day in weeks is updated  -  re-find it
        const updatedDay = result.current.state.weeks[0]!.days.find((d) => adapter.isSameDay(d.date, day.date))!
        const props = result.current.getDayProps(updatedDay)

        expect(props['aria-selected']).toBe(true)
      })

      it('returns aria-disabled for disabled dates', () => {
        const march5 = new Date(2026, 2, 5)

        const { result } = renderHook(() =>
          useCalendar({
            adapter,
            mode: 'single' as const,
            defaultMonth: march2026,
            disabled: [march5],
          }),
        )

        const day = result.current.state.weeks.flatMap((w) => w.days).find((d) => adapter.isSameDay(d.date, march5))!
        const props = result.current.getDayProps(day)

        expect(props['aria-disabled']).toBe(true)
      })

      it('returns data-calendar-day attribute', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const day = result.current.state.weeks[0]!.days[0]!
        const props = result.current.getDayProps(day)

        expect(props['data-calendar-day']).toBe('')
      })

      it('returns data-outside-month for outside days', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const outsideDay = result.current.state.weeks.flatMap((w) => w.days).find((d) => d.isOutside)

        if (outsideDay) {
          const props = result.current.getDayProps(outsideDay)
          expect(props['data-outside-month']).toBe('true')
        }
      })

      it('returns onClick and onKeyDown handlers', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const day = result.current.state.weeks[0]!.days[0]!
        const props = result.current.getDayProps(day)

        expect(typeof props.onClick).toBe('function')
        expect(typeof props.onKeyDown).toBe('function')
      })
    })

    describe('getGridProps', () => {
      it('returns role grid and aria-labelledby', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const props = result.current.getGridProps()

        expect(props.role).toBe('grid')
        expect(typeof props['aria-labelledby']).toBe('string')
        expect(props['aria-labelledby'].length).toBeGreaterThan(0)
      })
    })

    describe('getNavProps', () => {
      it('prev returns aria-label Go to previous month', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const props = result.current.getNavProps('prev')

        expect(props['aria-label']).toBe('Go to previous month')
        expect(typeof props.disabled).toBe('boolean')
        expect(typeof props.onClick).toBe('function')
      })

      it('next returns aria-label Go to next month', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const props = result.current.getNavProps('next')

        expect(props['aria-label']).toBe('Go to next month')
      })

      it('prev disabled when at fromDate boundary', () => {
        const { result } = renderHook(() =>
          useCalendar({
            adapter,
            mode: 'single' as const,
            defaultMonth: march2026,
            fromDate: new Date(2026, 2, 1),
          }),
        )

        const props = result.current.getNavProps('prev')
        expect(props.disabled).toBe(true)
      })

      it('next disabled when at toDate boundary', () => {
        const { result } = renderHook(() =>
          useCalendar({
            adapter,
            mode: 'single' as const,
            defaultMonth: march2026,
            toDate: new Date(2026, 2, 31),
          }),
        )

        const props = result.current.getNavProps('next')
        expect(props.disabled).toBe(true)
      })
    })

    describe('getHeaderProps', () => {
      it('returns id and aria-live polite', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const props = result.current.getHeaderProps()

        expect(typeof props.id).toBe('string')
        expect(props.id.length).toBeGreaterThan(0)
        expect(props['aria-live']).toBe('polite')
      })

      it('header id matches grid aria-labelledby', () => {
        const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

        const headerProps = result.current.getHeaderProps()
        const gridProps = result.current.getGridProps()

        expect(gridProps['aria-labelledby']).toBe(headerProps.id)
      })
    })
  })

  describe('state shape', () => {
    it('state.weeks is an array of CalendarWeek objects', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      expect(Array.isArray(result.current.state.weeks)).toBe(true)
      expect(result.current.state.weeks.length).toBeGreaterThan(0)

      for (const week of result.current.state.weeks) {
        expect(week).toHaveProperty('weekNumber')
        expect(week).toHaveProperty('days')
        expect(week.days).toHaveLength(7)
      }
    })

    it('state.weekdays has exactly 7 items', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      expect(result.current.state.weekdays).toHaveLength(7)
      for (const label of result.current.state.weekdays) {
        expect(typeof label).toBe('string')
        expect(label.length).toBeGreaterThan(0)
      }
    })

    it('state.viewMode defaults to days', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      expect(result.current.state.viewMode).toBe('days')
    })

    it('actions.setViewMode(months) changes viewMode', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      act(() => {
        result.current.actions.setViewMode('months')
      })

      expect(result.current.state.viewMode).toBe('months')
    })

    it('actions.setViewMode(years) changes viewMode', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      act(() => {
        result.current.actions.setViewMode('years')
      })

      expect(result.current.state.viewMode).toBe('years')
    })
  })

  describe('focus', () => {
    it('actions.focusDate(date) changes focusedDate', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      const march15 = new Date(2026, 2, 15)
      act(() => {
        result.current.actions.focusDate(march15)
      })

      expect(adapter.isSameDay(result.current.state.focusedDate, march15)).toBe(true)
    })

    it('focusedDate affects getDayProps tabIndex', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026 }))

      const march15 = new Date(2026, 2, 15)
      act(() => {
        result.current.actions.focusDate(march15)
      })

      const allDays = result.current.state.weeks.flatMap((w) => w.days)

      const focusedDay = allDays.find((d) => adapter.isSameDay(d.date, march15))!
      const otherDay = allDays.find((d) => !adapter.isSameDay(d.date, march15))!

      expect(result.current.getDayProps(focusedDay).tabIndex).toBe(0)
      expect(result.current.getDayProps(otherDay).tabIndex).toBe(-1)
    })

    it('focusedDate defaults to selected date when provided', () => {
      const selected = new Date(2026, 2, 15)
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, selected, defaultMonth: march2026 }),
      )
      expect(adapter.isSameDay(result.current.state.focusedDate, selected)).toBe(true)
    })

    it('focusedDate defaults to today when no defaultMonth', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const }))

      const today = adapter.today()
      expect(adapter.isSameDay(result.current.state.focusedDate, today)).toBe(true)
    })
  })

  describe('the tab stop', () => {
    const june2020 = new Date(2020, 5, 1)

    it('sits on the first day of the shown month when today is not in it', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: june2020 }))

      expect(tabStops(result.current)).toEqual([june2020])
      expect(result.current.state.focusedDate).toEqual(june2020)
    })

    it('sits on today when today is shown', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const }))

      const stops = tabStops(result.current)
      expect(stops).toHaveLength(1)
      expect(adapter.isSameDay(stops[0]!, adapter.today())).toBe(true)
    })

    it('goes back to today when the focused day leaves the view', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const }))

      act(() => {
        result.current.actions.focusDate(new Date(2000, 0, 1))
      })

      const stops = tabStops(result.current)
      expect(stops).toHaveLength(1)
      expect(adapter.isSameDay(stops[0]!, adapter.today())).toBe(true)
    })

    it('prefers a shown selection to today', () => {
      const today = adapter.today()
      const other = new Date(today.getFullYear(), today.getMonth(), today.getDate() === 1 ? 2 : 1)
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultSelected: other }))

      act(() => {
        result.current.actions.focusDate(new Date(2000, 0, 1))
      })

      expect(tabStops(result.current)).toEqual([other])
    })

    it('skips days that cannot be picked', () => {
      const disabled = [new Date(2020, 5, 1), new Date(2020, 5, 2)]
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: june2020, disabled }),
      )

      expect(tabStops(result.current)).toEqual([new Date(2020, 5, 3)])
    })

    it('sits on the earliest shown selection in multi mode', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'multi' as const,
          defaultMonth: june2020,
          defaultSelected: [new Date(2020, 5, 20), new Date(2020, 5, 5)],
        }),
      )

      expect(tabStops(result.current)).toEqual([new Date(2020, 5, 5)])
    })

    it('sits on a shown selection in multi mode even when today is shown too', () => {
      const today = adapter.today()
      const other = new Date(today.getFullYear(), today.getMonth(), today.getDate() === 1 ? 2 : 1)
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'multi' as const, defaultSelected: [other] }))

      expect(tabStops(result.current)).toEqual([other])
    })

    it('moves into the month a nav button shows', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: june2020,
          defaultSelected: new Date(2020, 5, 15),
        }),
      )

      act(() => {
        result.current.actions.goToNext()
      })

      expect(tabStops(result.current)).toEqual([new Date(2020, 6, 1)])
    })

    it('is one day when two shown months both draw it', () => {
      const july1 = new Date(2020, 6, 1)
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: june2020, numberOfMonths: 2 }),
      )

      act(() => {
        result.current.actions.focusDate(july1)
      })

      expect(tabStops(result.current)).toEqual([july1])
    })

    it('never sits on a day drawn from the next month', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: june2020 }))

      act(() => {
        result.current.actions.focusDate(new Date(2020, 6, 1))
      })

      expect(tabStops(result.current)).toEqual([june2020])
    })
  })

  describe('moving focus with the keys', () => {
    function DaysWithoutGrid() {
      const calendar = useCalendar({ adapter, mode: 'single' as const, defaultMonth: new Date(2020, 5, 1) })
      return calendar.state.weeks
        .flatMap((week) => week.days)
        .map((day) => (
          <button key={day.date.getTime()} type="button" {...calendar.getDayProps(day)}>
            {day.date.getDate()}
          </button>
        ))
    }

    it('finds the focused day on the page when the grid props are not spread', async () => {
      render(<DaysWithoutGrid />)

      fireEvent.keyDown(screen.getByLabelText(/June 1,/), { key: 'ArrowRight' })
      await new Promise((resolve) => requestAnimationFrame(resolve))

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/June 2,/)
    })

    it('turns to the next month when the keys leave the last day', async () => {
      render(<Days config={{ defaultSelected: new Date(2020, 5, 30) }} />)

      fireEvent.keyDown(screen.getByLabelText(/June 30,/), { key: 'ArrowRight' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/July 1,/)
      expect(screen.queryByLabelText(/June 30,/)).toBeNull()
    })

    it('turns to the previous month when the keys leave the first day', async () => {
      render(<Days config={{}} />)

      fireEvent.keyDown(screen.getByLabelText(/June 1,/), { key: 'ArrowLeft' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/May 31,/)
      expect(screen.queryByLabelText(/June 1,/)).toBeNull()
    })

    it('turns two shown months by one when the keys leave the second', async () => {
      render(<Days config={{ numberOfMonths: 2, defaultSelected: new Date(2020, 6, 31) }} />)

      fireEvent.keyDown(screen.getByLabelText(/July 31,/), { key: 'ArrowRight' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/August 1,/)
      expect(screen.getByLabelText(/July 31,/)).toBeTruthy()
      expect(screen.queryByLabelText(/June 30,/)).toBeNull()
    })

    it('lands on the last of two keys pressed within one frame', async () => {
      render(<Days config={{}} />)

      fireEvent.keyDown(screen.getByLabelText(/June 1,/), { key: 'ArrowRight' })
      fireEvent.keyDown(screen.getByLabelText(/June 2,/), { key: 'ArrowRight' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/June 3,/)
    })

    it('moves focus for a key pressed before strict mode replays the mount effects', async () => {
      const environment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
      const wasActEnvironment = environment.IS_REACT_ACT_ENVIRONMENT
      environment.IS_REACT_ACT_ENVIRONMENT = false
      const container = document.body.appendChild(document.createElement('div'))
      const root = createRoot(container)
      const committed = new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          observer.disconnect()
          resolve()
        })
        observer.observe(container, { childList: true })
      })
      // A render past the scheduler's 5ms slice leaves the mount effects to a later task, as a busy page does.
      function Busy() {
        const end = performance.now() + 10
        let spins = 0
        while (performance.now() < end) spins++
        return spins < 0 ? spins : null
      }

      try {
        root.render(
          <StrictMode>
            <Busy />
            <Days config={{}} />
          </StrictMode>,
        )
        await committed
        within(container)
          .getByLabelText(/June 1,/)
          .dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))
        await nextFrame()
        await nextFrame()

        expect(document.activeElement?.getAttribute('aria-label')).toMatch(/June 2,/)
      } finally {
        root.unmount()
        container.remove()
        environment.IS_REACT_ACT_ENVIRONMENT = wasActEnvironment
      }
    })

    it('moves no focus once it unmounts before the frame does', async () => {
      const first = render(<Days config={{}} />)
      render(<Days config={{ defaultMonth: new Date(2021, 0, 1) }} />)

      fireEvent.keyDown(within(first.container).getByLabelText(/June 1,/), { key: 'ArrowRight' })
      first.unmount()
      await nextFrame()

      expect(document.activeElement).toBe(document.body)
    })
  })

  describe('multiple month display', () => {
    it('state.months contains multiple CalendarMonth entries when numberOfMonths > 1', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026, numberOfMonths: 3 }),
      )

      expect(result.current.state.months).toHaveLength(3)
    })

    it('state.months covers consecutive months', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026, numberOfMonths: 3 }),
      )

      const months = result.current.state.months
      // March, April, May
      expect(adapter.getMonth(months[0]!.month)).toBe(2)
      expect(adapter.getMonth(months[1]!.month)).toBe(3)
      expect(adapter.getMonth(months[2]!.month)).toBe(4)
    })

    it('state.weeks still corresponds to the first month', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026, numberOfMonths: 2 }),
      )

      // state.weeks is the first month's weeks
      expect(result.current.state.weeks).toBe(result.current.state.months[0]!.weeks)
    })

    it('state.months has exactly 1 entry when numberOfMonths is 1', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026, numberOfMonths: 1 }),
      )

      expect(result.current.state.months).toHaveLength(1)
    })

    it('goToNext advances all months when numberOfMonths > 1', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: march2026, numberOfMonths: 2 }),
      )

      act(() => {
        result.current.actions.goToNext()
      })

      // After advancing, first month should be April
      expect(result.current.state.month.getMonth()).toBe(3)
      expect(result.current.state.months).toHaveLength(2)
      expect(adapter.getMonth(result.current.state.months[0]!.month)).toBe(3) // April
      expect(adapter.getMonth(result.current.state.months[1]!.month)).toBe(4) // May
    })
  })

  describe('range selection edge cases', () => {
    it('clicking the same date as from (with no to) deselects the range', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'range' as const, defaultMonth: march2026 }))

      const day = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
      act(() => {
        result.current.actions.selectDate(day.date)
      })

      // Click the same date again while to is null
      act(() => {
        result.current.actions.selectDate(day.date)
      })

      expect(result.current.state.value).toBeNull()
    })

    it('reverse range: clicking a date before from auto-swaps so from < to', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'range' as const, defaultMonth: march2026 }))

      // Pick a later date first
      const laterDay = result.current.state.weeks[2]!.days.find((d) => !d.isOutside)!
      act(() => {
        result.current.actions.selectDate(laterDay.date)
      })

      // Now click an earlier date
      const earlierDay = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
      act(() => {
        result.current.actions.selectDate(earlierDay.date)
      })

      const range = result.current.state.value as Selection.DateRange<Date>
      expect(range).not.toBeNull()
      expect(adapter.isBefore(range.from, range.to!) || adapter.isSameDay(range.from, range.to!)).toBe(true)
    })

    it('third click on a completed range resets and starts a new range', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'range' as const, defaultMonth: march2026 }))

      const day1 = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
      const day2 = result.current.state.weeks[2]!.days.find((d) => !d.isOutside)!
      const day3 = result.current.state.weeks[3]!.days.find((d) => !d.isOutside)!

      // First click: from
      act(() => {
        result.current.actions.selectDate(day1.date)
      })
      // Second click: to
      act(() => {
        result.current.actions.selectDate(day2.date)
      })
      // Third click: resets to a new from
      act(() => {
        result.current.actions.selectDate(day3.date)
      })

      const range = result.current.state.value as Selection.DateRange<Date>
      expect(range).not.toBeNull()
      expect(adapter.isSameDay(range.from, day3.date)).toBe(true)
      expect(range.to).toBeNull()
    })

    it('range getDayProps marks isRangeStart, isRangeEnd, isRangeMiddle', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'range' as const, defaultMonth: march2026 }))

      const allDays = result.current.state.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
      const day1 = allDays[0]!
      const day3 = allDays[2]!

      act(() => {
        result.current.actions.selectDate(day1.date)
      })
      act(() => {
        result.current.actions.selectDate(day3.date)
      })

      const updatedDays = result.current.state.weeks.flatMap((w) => w.days)

      const startDay = updatedDays.find((d) => adapter.isSameDay(d.date, day1.date))!
      const middleDay = updatedDays.find((d) => adapter.isSameDay(d.date, allDays[1]!.date))!
      const endDay = updatedDays.find((d) => adapter.isSameDay(d.date, day3.date))!

      expect(startDay.isRangeStart).toBe(true)
      expect(endDay.isRangeEnd).toBe(true)
      expect(middleDay.isRangeMiddle).toBe(true)
    })
  })

  describe('multi selection edge cases', () => {
    it('can select multiple distinct dates', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'multi' as const, defaultMonth: march2026 }))

      const allDays = result.current.state.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
      const day1 = allDays[0]!
      const day2 = allDays[1]!
      const day3 = allDays[2]!

      act(() => {
        result.current.actions.selectDate(day1.date)
      })
      act(() => {
        result.current.actions.selectDate(day2.date)
      })
      act(() => {
        result.current.actions.selectDate(day3.date)
      })

      const selected = result.current.state.value as Date[]
      expect(selected).toHaveLength(3)
    })

    it('toggling off a middle date preserves the others', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'multi' as const, defaultMonth: march2026 }))

      const allDays = result.current.state.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
      const day1 = allDays[0]!
      const day2 = allDays[1]!
      const day3 = allDays[2]!

      act(() => {
        result.current.actions.selectDate(day1.date)
      })
      act(() => {
        result.current.actions.selectDate(day2.date)
      })
      act(() => {
        result.current.actions.selectDate(day3.date)
      })

      // Toggle off day2
      act(() => {
        result.current.actions.selectDate(day2.date)
      })

      const selected = result.current.state.value as Date[]
      expect(selected).toHaveLength(2)
      expect(selected.some((d) => adapter.isSameDay(d, day1.date))).toBe(true)
      expect(selected.some((d) => adapter.isSameDay(d, day3.date))).toBe(true)
      expect(selected.some((d) => adapter.isSameDay(d, day2.date))).toBe(false)
    })

    it('selecting the same date twice in multi mode returns to empty', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'multi' as const, defaultMonth: march2026 }))

      const day = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!

      act(() => {
        result.current.actions.selectDate(day.date)
      })
      act(() => {
        result.current.actions.selectDate(day.date)
      })

      expect(result.current.state.value).toEqual([])
    })

    it('multi selection marks all selected dates as isSelected in the grid', () => {
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'multi' as const, defaultMonth: march2026 }))

      const allDays = result.current.state.weeks.flatMap((w) => w.days).filter((d) => !d.isOutside)
      const day1 = allDays[0]!
      const day2 = allDays[4]!

      act(() => {
        result.current.actions.selectDate(day1.date)
      })
      act(() => {
        result.current.actions.selectDate(day2.date)
      })

      const updatedDays = result.current.state.weeks.flatMap((w) => w.days)
      const sel1 = updatedDays.find((d) => adapter.isSameDay(d.date, day1.date))!
      const sel2 = updatedDays.find((d) => adapter.isSameDay(d.date, day2.date))!
      const unsel = updatedDays.find(
        (d) => !adapter.isSameDay(d.date, day1.date) && !adapter.isSameDay(d.date, day2.date) && !d.isOutside,
      )!

      expect(sel1.isSelected).toBe(true)
      expect(sel2.isSelected).toBe(true)
      expect(unsel.isSelected).toBe(false)
    })
  })

  describe('disabled dates edge cases', () => {
    it('disabled date array prevents selection in range mode', () => {
      const march5 = new Date(2026, 2, 5)

      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'range' as const,
          defaultMonth: march2026,
          disabled: [march5],
        }),
      )

      act(() => {
        result.current.actions.selectDate(march5)
      })

      expect(result.current.state.value).toBeNull()
    })

    it('disabled date array prevents selection in multi mode', () => {
      const march5 = new Date(2026, 2, 5)

      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'multi' as const,
          defaultMonth: march2026,
          disabled: [march5],
        }),
      )

      act(() => {
        result.current.actions.selectDate(march5)
      })

      expect(result.current.state.value).toEqual([])
    })

    it('multiple dates can be disabled at once', () => {
      const march5 = new Date(2026, 2, 5)
      const march10 = new Date(2026, 2, 10)
      const march15 = new Date(2026, 2, 15)

      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          disabled: [march5, march10, march15],
        }),
      )

      act(() => {
        result.current.actions.selectDate(march5)
      })
      expect(result.current.state.value).toBeNull()

      act(() => {
        result.current.actions.selectDate(march10)
      })
      expect(result.current.state.value).toBeNull()

      act(() => {
        result.current.actions.selectDate(march15)
      })
      expect(result.current.state.value).toBeNull()
    })

    it('non-disabled date can be selected when disabled array exists', () => {
      const march5 = new Date(2026, 2, 5)
      const march7 = new Date(2026, 2, 7)

      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          disabled: [march5],
        }),
      )

      act(() => {
        result.current.actions.selectDate(march7)
      })

      expect(adapter.isSameDay(result.current.state.value as Date, march7)).toBe(true)
    })

    it('disabled predicate with complex logic works correctly', () => {
      // Disable all weekends
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          disabled: (date: Date) => {
            const dow = date.getDay()
            return dow === 0 || dow === 6
          },
        }),
      )

      // March 1, 2026 is a Sunday
      const march1 = new Date(2026, 2, 1)
      act(() => {
        result.current.actions.selectDate(march1)
      })
      expect(result.current.state.value).toBeNull()

      // March 2, 2026 is a Monday
      const march2 = new Date(2026, 2, 2)
      act(() => {
        result.current.actions.selectDate(march2)
      })
      expect(adapter.isSameDay(result.current.state.value as Date, march2)).toBe(true)
    })
  })

  describe('fromDate/toDate boundary edge cases', () => {
    it('both fromDate and toDate restrict navigation to a single month', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          fromDate: new Date(2026, 2, 1),
          toDate: new Date(2026, 2, 31),
        }),
      )

      expect(result.current.state.canGoNext).toBe(false)
      expect(result.current.state.canGoPrevious).toBe(false)
    })

    it('navigating freely when fromDate and toDate are far apart', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          fromDate: new Date(2020, 0, 1),
          toDate: new Date(2030, 11, 31),
        }),
      )

      expect(result.current.state.canGoNext).toBe(true)
      expect(result.current.state.canGoPrevious).toBe(true)
    })

    it('setMonth action changes the displayed month', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
        }),
      )

      const june2026 = new Date(2026, 5, 1)
      act(() => {
        result.current.actions.setMonth(june2026)
      })

      expect(adapter.isSameMonth(result.current.state.month, june2026)).toBe(true)
    })
  })

  describe('fixedWeeks', () => {
    it('fixedWeeks=true always returns exactly 6 weeks', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          fixedWeeks: true,
        }),
      )

      expect(result.current.state.weeks).toHaveLength(6)
    })

    it('fixedWeeks=false may return fewer than 6 weeks', () => {
      // February 2026 starts on Sunday. Without fixedWeeks it should have 4 weeks.
      const feb2026 = new Date(2026, 1, 1)
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: feb2026,
          fixedWeeks: false,
        }),
      )

      expect(result.current.state.weeks.length).toBeLessThanOrEqual(6)
      // Feb 2026 should have fewer than 6 weeks without fixedWeeks
      expect(result.current.state.weeks.length).toBeGreaterThanOrEqual(4)
    })

    it('fixedWeeks=true with February still returns 6 weeks', () => {
      const feb2026 = new Date(2026, 1, 1)
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: feb2026,
          fixedWeeks: true,
        }),
      )

      expect(result.current.state.weeks).toHaveLength(6)
    })

    it('each week in fixedWeeks always has 7 days', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          fixedWeeks: true,
        }),
      )

      for (const week of result.current.state.weeks) {
        expect(week.days).toHaveLength(7)
      }
    })
  })

  describe('onSelect callback', () => {
    it('onSelect is called when a date is selected in single mode', () => {
      const onSelect = vi.fn()
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          onSelect,
        }),
      )

      const day = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
      act(() => {
        result.current.actions.selectDate(day.date)
      })

      expect(onSelect).toHaveBeenCalledOnce()
    })

    it('onSelect is called with null when deselecting in single mode', () => {
      const onSelect = vi.fn()
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          onSelect,
        }),
      )

      const day = result.current.state.weeks[0]!.days.find((d) => !d.isOutside)!
      act(() => {
        result.current.actions.selectDate(day.date)
      })
      act(() => {
        result.current.actions.selectDate(day.date)
      })

      expect(onSelect).toHaveBeenCalledTimes(2)
      expect(onSelect.mock.calls[1]![0]).toBeNull()
    })
  })

  describe('defaultSelected', () => {
    it('defaultSelected pre-selects a date in single mode', () => {
      const march10 = new Date(2026, 2, 10)
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          defaultSelected: march10,
        }),
      )

      expect(adapter.isSameDay(result.current.state.value as Date, march10)).toBe(true)
    })

    it('defaultSelected pre-selects dates in multi mode', () => {
      const march10 = new Date(2026, 2, 10)
      const march15 = new Date(2026, 2, 15)
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'multi' as const,
          defaultMonth: march2026,
          defaultSelected: [march10, march15],
        }),
      )

      const selected = result.current.state.value as Date[]
      expect(selected).toHaveLength(2)
    })
  })

  describe('showOutsideDays', () => {
    it('showOutsideDays=false marks outside days as hidden', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
          showOutsideDays: false,
        }),
      )

      const outsideDays = result.current.state.weeks.flatMap((w) => w.days).filter((d) => d.isOutside)
      for (const day of outsideDays) {
        expect(day.isHidden).toBe(true)
      }
    })

    it('showOutsideDays=true (default) does not hide outside days', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: march2026,
        }),
      )

      const outsideDays = result.current.state.weeks.flatMap((w) => w.days).filter((d) => d.isOutside)
      for (const day of outsideDays) {
        expect(day.isHidden).toBe(false)
      }
    })
  })

  describe('year boundary navigation', () => {
    it('navigating past December wraps to January of next year', () => {
      const dec2026 = new Date(2026, 11, 1)
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: dec2026 }))

      act(() => {
        result.current.actions.goToNext()
      })

      expect(result.current.state.month.getMonth()).toBe(0) // January
      expect(result.current.state.month.getFullYear()).toBe(2027)
    })

    it('navigating before January wraps to December of previous year', () => {
      const jan2026 = new Date(2026, 0, 1)
      const { result } = renderHook(() => useCalendar({ adapter, mode: 'single' as const, defaultMonth: jan2026 }))

      act(() => {
        result.current.actions.goToPrevious()
      })

      expect(result.current.state.month.getMonth()).toBe(11) // December
      expect(result.current.state.month.getFullYear()).toBe(2025)
    })
  })

  describe('the week follows the locale', () => {
    const june2020 = new Date(2020, 5, 1)

    it('names the weekdays from the first day of the locale', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: june2020, locale: { locale: 'de-DE' } }),
      )

      expect(result.current.state.weekdays[0]).toBe(
        new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(june2020),
      )
    })

    it('moves Home to the first day of the locale', async () => {
      render(<Days config={{ locale: { locale: 'de-DE' } }} />)

      fireEvent.keyDown(screen.getByLabelText(/, 1\. Juni/), { key: 'ArrowRight' })
      await nextFrame()
      fireEvent.keyDown(screen.getByLabelText(/, 2\. Juni/), { key: 'Home' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/^Montag, 1\. Juni/)
    })
  })

  describe('paging by the shown months', () => {
    const june2020 = new Date(2020, 5, 1)
    const twoMonths = { mode: 'single' as const, defaultMonth: june2020, numberOfMonths: 2 }

    it('moves the view a whole page with the nav buttons', () => {
      const { result } = renderHook(() => useCalendar({ ...twoMonths, adapter, pageBehavior: 'visible' as const }))

      act(() => result.current.actions.goToNext())
      expect(result.current.state.month).toEqual(new Date(2020, 7, 1))

      act(() => result.current.actions.goToPrevious())
      act(() => result.current.actions.goToPrevious())
      expect(result.current.state.month).toEqual(new Date(2020, 3, 1))
    })

    it('moves the view one month by default', () => {
      const { result } = renderHook(() => useCalendar({ ...twoMonths, adapter }))

      act(() => result.current.actions.goToNext())

      expect(result.current.state.month).toEqual(new Date(2020, 6, 1))
    })

    it('cannot page to a page that starts after toDate', () => {
      const toDate = new Date(2020, 6, 20)
      const paged = renderHook(() => useCalendar({ ...twoMonths, adapter, toDate, pageBehavior: 'visible' as const }))
      const single = renderHook(() => useCalendar({ ...twoMonths, adapter, toDate }))

      expect(paged.result.current.state.canGoNext).toBe(false)
      expect(single.result.current.state.canGoNext).toBe(true)
    })

    it('stops the last page at toDate rather than past it', () => {
      const { result } = renderHook(() =>
        useCalendar({ ...twoMonths, adapter, toDate: new Date(2020, 7, 20), pageBehavior: 'visible' as const }),
      )

      act(() => result.current.actions.goToNext())

      expect(result.current.state.months.map((m) => m.month.getMonth())).toEqual([6, 7])
    })

    it('stops the first page at fromDate, and cannot page back from it', () => {
      const { result } = renderHook(() =>
        useCalendar({ ...twoMonths, adapter, fromDate: new Date(2020, 4, 10), pageBehavior: 'visible' as const }),
      )

      act(() => result.current.actions.goToPrevious())

      expect(result.current.state.months.map((m) => m.month.getMonth())).toEqual([4, 5])
      expect(result.current.state.canGoPrevious).toBe(false)
    })

    it('moves focus and the view a whole page with PageDown', async () => {
      render(<Days config={{ numberOfMonths: 2, pageBehavior: 'visible' }} />)

      fireEvent.keyDown(screen.getByLabelText(/June 1,/), { key: 'PageDown' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/August 1,/)
      expect(screen.queryByLabelText(/June 1,/)).toBeNull()
      expect(screen.getByLabelText(/September 30,/)).toBeTruthy()
    })

    it('keeps a page turned from the keyboard inside toDate, as the nav buttons do', async () => {
      render(
        <Days
          config={{
            numberOfMonths: 2,
            pageBehavior: 'visible',
            fromDate: new Date(2020, 0, 1),
            toDate: new Date(2020, 7, 20),
          }}
        />,
      )

      fireEvent.keyDown(screen.getByLabelText(/June 1,/), { key: 'PageDown' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/August 1,/)
      expect([screen.queryByLabelText(/July 1,/) !== null, screen.queryByLabelText(/September 1,/)]).toEqual([
        true,
        null,
      ])
    })

    it('keeps a page turned back from the keyboard inside fromDate', async () => {
      render(
        <Days
          config={{
            numberOfMonths: 2,
            pageBehavior: 'visible',
            defaultMonth: new Date(2020, 7, 1),
            fromDate: new Date(2020, 6, 10),
            toDate: new Date(2020, 11, 31),
          }}
        />,
      )

      fireEvent.keyDown(screen.getByLabelText(/August 1,/), { key: 'ArrowLeft' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/July 31,/)
      expect([screen.queryByLabelText(/August 31,/) !== null, screen.queryByLabelText(/June 30,/)]).toEqual([
        true,
        null,
      ])
    })

    it('turns a whole page when the keys leave the shown months', async () => {
      render(<Days config={{ numberOfMonths: 2, pageBehavior: 'visible' }} />)

      fireEvent.keyDown(screen.getByLabelText(/June 1,/), { key: 'PageDown' })
      await nextFrame()
      fireEvent.keyDown(screen.getByLabelText(/August 1,/), { key: 'ArrowLeft' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/July 31,/)
      expect(screen.getByLabelText(/June 1,/)).toBeTruthy()
    })

    it('moves focus and the view back a whole page with PageUp', async () => {
      render(<Days config={{ numberOfMonths: 2, pageBehavior: 'visible' }} />)

      fireEvent.keyDown(screen.getByLabelText(/June 1,/), { key: 'PageUp' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/April 1,/)
      expect(screen.getByLabelText(/May 31,/)).toBeTruthy()
      expect(screen.queryByLabelText(/June 1,/)).toBeNull()
    })
  })

  describe('unavailable days', () => {
    const june2020 = new Date(2020, 5, 1)
    const june5 = new Date(2020, 5, 5)
    const june10 = new Date(2020, 5, 10)
    const day = <M extends Selection.SelectionMode>(calendar: UseCalendar.IUseCalendarReturn<Date, M>, date: Date) =>
      calendar.state.weeks.flatMap((week) => week.days).find((d) => adapter.isSameDay(d.date, date))!

    it('marks an unavailable day without disabling it', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: june2020, unavailable: [june10] }),
      )
      const props = result.current.getDayProps(day(result.current, june10))

      expect(day(result.current, june10)).toMatchObject({ isUnavailable: true, isDisabled: false })
      expect(props['aria-disabled']).toBe(true)
      expect(props['data-unavailable']).toBe('true')
    })

    it('refuses to select an unavailable day', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: june2020, unavailable: () => true }),
      )

      act(() => result.current.actions.selectDate(june10))

      expect(result.current.state.value).toBeNull()
    })

    it('lets the arrow keys land on an unavailable day', async () => {
      render(<Days config={{ unavailable: [new Date(2020, 5, 2)] }} />)

      fireEvent.keyDown(screen.getByLabelText(/June 1,/), { key: 'ArrowRight' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/June 2,/)
    })

    it('refuses a range that would span an unavailable day', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'range' as const, defaultMonth: june2020, unavailable: [june5] }),
      )

      act(() => result.current.actions.selectDate(june2020))
      act(() => result.current.actions.selectDate(june10))
      expect(result.current.state.value).toEqual({ from: june2020, to: null })

      act(() => result.current.actions.selectDate(new Date(2020, 5, 4)))
      expect(result.current.state.value).toEqual({ from: june2020, to: new Date(2020, 5, 4) })
    })

    it('refuses a range a Shift-click would complete across an unavailable day', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'range' as const, defaultMonth: june2020, unavailable: [june5] }),
      )

      act(() => result.current.actions.selectDate(june2020))
      act(() => result.current.actions.selectDate(june10, { shiftKey: true }))

      expect(result.current.state.value).toEqual({ from: june2020, to: null })
    })

    it('refuses a range that would span an unavailable day in multi-range mode', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'multi-range' as const, defaultMonth: june2020, unavailable: [june5] }),
      )

      act(() => result.current.actions.selectDate(june10))
      act(() => result.current.actions.selectDate(june2020))

      expect(result.current.state.value).toEqual([{ from: june10, to: null }])
    })
  })

  describe('read only', () => {
    const june2020 = new Date(2020, 5, 1)
    const june3 = new Date(2020, 5, 3)

    it('keeps the selection when a day is picked', () => {
      const { result } = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: june2020,
          defaultSelected: june3,
          readOnly: true,
        }),
      )

      act(() => result.current.actions.selectDate(new Date(2020, 5, 5)))

      expect(result.current.state.value).toEqual(june3)
    })

    it('still moves focus with the keys', async () => {
      render(<Days config={{ readOnly: true }} />)

      fireEvent.keyDown(screen.getByLabelText(/June 1,/), { key: 'ArrowRight' })
      await nextFrame()

      expect(document.activeElement?.getAttribute('aria-label')).toMatch(/June 2,/)
    })

    it('marks the grid read only', () => {
      const readOnly = renderHook(() => useCalendar({ adapter, mode: 'single' as const, readOnly: true }))
      const editable = renderHook(() => useCalendar({ adapter, mode: 'single' as const }))

      expect(readOnly.result.current.getGridProps()).toMatchObject({ 'aria-readonly': true, 'data-readonly': 'true' })
      expect(editable.result.current.getGridProps()['aria-readonly']).toBeUndefined()
    })
  })

  describe('an invalid selection', () => {
    const june2020 = new Date(2020, 5, 1)
    const june3 = new Date(2020, 5, 3)
    const propsOf = <M extends Selection.SelectionMode>(
      calendar: UseCalendar.IUseCalendarReturn<Date, M>,
      date: Date,
    ) =>
      calendar.getDayProps(
        calendar.state.weeks.flatMap((week) => week.days).find((d) => adapter.isSameDay(d.date, date))!,
      )

    it('marks the selected days invalid when asked', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: june2020, selected: june3, invalid: true }),
      )

      expect(result.current.state.isInvalid).toBe(true)
      expect(propsOf(result.current, june3)).toMatchObject({ 'aria-invalid': true, 'data-invalid': 'true' })
      expect(propsOf(result.current, new Date(2020, 5, 4))['aria-invalid']).toBeUndefined()
      expect(result.current.getGridProps()['data-invalid']).toBe('true')
    })

    it('is invalid when the selected day cannot be picked', () => {
      const unavailable = renderHook(() =>
        useCalendar({
          adapter,
          mode: 'single' as const,
          defaultMonth: june2020,
          selected: june3,
          unavailable: [june3],
        }),
      )
      const disabled = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: june2020, selected: june3, disabled: [june3] }),
      )

      expect(unavailable.result.current.state.isInvalid).toBe(true)
      expect(disabled.result.current.state.isInvalid).toBe(true)
    })

    it('is invalid when a selected range spans an unavailable day', () => {
      const selected = { from: june2020, to: new Date(2020, 5, 10) }
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'range' as const, defaultMonth: june2020, selected, unavailable: [june3] }),
      )

      expect(result.current.state.isInvalid).toBe(true)
      expect(propsOf(result.current, new Date(2020, 5, 5))['aria-invalid']).toBe(true)
    })

    it('is invalid when a selected range ends on a disabled day', () => {
      const selected = { from: june2020, to: june3 }
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'range' as const, defaultMonth: june2020, selected, disabled: [june3] }),
      )

      expect(result.current.state.isInvalid).toBe(true)
    })

    it('is invalid when one of several picked days cannot be picked', () => {
      const selected = [new Date(2020, 5, 2), june3]
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'multi' as const, defaultMonth: june2020, selected, disabled: [june3] }),
      )

      expect(result.current.state.isInvalid).toBe(true)
    })

    it('is valid otherwise', () => {
      const { result } = renderHook(() =>
        useCalendar({ adapter, mode: 'single' as const, defaultMonth: june2020, selected: june3 }),
      )

      expect(result.current.state.isInvalid).toBe(false)
      expect(propsOf(result.current, june3)['aria-invalid']).toBeUndefined()
    })
  })
})
