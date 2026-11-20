// From react-day-picker, examples/{Keyboard,MultipleMonths,Range,RangeResetSelection,Disabled,DisabledSelectedDate}
// .test.tsx. MIT, see src/__tests__/react-day-picker/LICENSE. Its `disableNavigation` is a fromDate and toDate here.
// Left out, as this calendar behaves otherwise: Shift with an arrow key turning a month or a year, where Shift only
// turns a year with PageUp and PageDown; a second click on a range's first day ending it there, where it clears it;
// and `required`, `min` and `max`, which have no counterpart.

import { NativeAdapter } from '@gentleduck/calendar'
import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { Calendar } from '../calendar'
import { CalendarDay } from '../day'
import { CalendarGrid } from '../grid'
import { CalendarHeader } from '../header'
import { CalendarPrevButton } from '../nav'

freshDom()

const adapter = new NativeAdapter()
const frame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)))
const focused = () => document.activeElement?.getAttribute('aria-label')
const heading = () => document.querySelector('[data-slot="calendar-header"]')?.textContent

function Example(props: Partial<React.ComponentProps<typeof Calendar>>) {
  return (
    <Calendar adapter={adapter} mode="single" defaultMonth={new Date(2026, 2, 1)} {...(props as object)}>
      <CalendarHeader />
      <CalendarGrid>{(cell) => <CalendarDay day={cell} />}</CalendarGrid>
    </Calendar>
  )
}

async function press(from: string, key: string, shiftKey = false) {
  const day = screen.getByRole('gridcell', { name: from })
  act(() => day.focus())
  fireEvent.keyDown(day, { key, shiftKey })
  await frame()
}

describe('react-day-picker keyboard, from the first day of the month', () => {
  const first = 'Sunday, March 1, 2026'

  it('shows the month before and focuses its last day on ArrowLeft', async () => {
    render(<Example />)

    await press(first, 'ArrowLeft')

    expect([heading(), focused()]).toEqual(['February 2026', 'Saturday, February 28, 2026'])
  })

  it('stays in the month and focuses the day a week on, on ArrowDown', async () => {
    render(<Example />)

    await press(first, 'ArrowDown')

    expect([heading(), focused()]).toEqual(['March 2026', 'Sunday, March 8, 2026'])
  })

  it('shows the month before on ArrowUp, on the day a week back', async () => {
    render(<Example />)

    await press(first, 'ArrowUp')

    expect([heading(), focused()]).toEqual(['February 2026', 'Sunday, February 22, 2026'])
  })

  it('turns a month on PageUp and PageDown, keeping the day', async () => {
    render(<Example />)

    await press(first, 'PageUp')
    const back = [heading(), focused()]
    await press('Sunday, February 1, 2026', 'PageDown')
    await press(first, 'PageDown')

    expect([back, [heading(), focused()]]).toEqual([
      ['February 2026', 'Sunday, February 1, 2026'],
      ['April 2026', 'Wednesday, April 1, 2026'],
    ])
  })

  it('turns a year on Shift with PageUp and PageDown, keeping the day', async () => {
    render(<Example />)

    await press(first, 'PageUp', true)
    const back = [heading(), focused()]
    await press('Saturday, March 1, 2025', 'PageDown', true)
    await press(first, 'PageDown', true)

    expect([back, [heading(), focused()]]).toEqual([
      ['March 2025', 'Saturday, March 1, 2025'],
      ['March 2027', 'Monday, March 1, 2027'],
    ])
  })

  it('goes to the start of the week on Home and its end on End', async () => {
    render(<Example />)

    await press('Wednesday, March 11, 2026', 'Home')
    const home = focused()
    await press('Wednesday, March 11, 2026', 'End')

    expect([home, focused()]).toEqual(['Sunday, March 8, 2026', 'Saturday, March 14, 2026'])
  })

  it('goes to Monday on Home and Sunday on End in a week starting on Monday', async () => {
    render(<Example locale={{ weekStartDay: 1 }} />)

    await press('Wednesday, March 11, 2026', 'Home')
    const home = focused()
    await press('Wednesday, March 11, 2026', 'End')

    expect([home, focused()]).toEqual(['Monday, March 9, 2026', 'Sunday, March 15, 2026'])
  })
})

describe('react-day-picker keyboard, from the last day of the month', () => {
  it('shows the month after and focuses its first day on ArrowRight', async () => {
    render(<Example />)

    await press('Tuesday, March 31, 2026', 'ArrowRight')

    expect([heading(), focused()]).toEqual(['April 2026', 'Wednesday, April 1, 2026'])
  })

  it('stays in the month on ArrowUp, on the day a week back', async () => {
    render(<Example />)

    await press('Tuesday, March 31, 2026', 'ArrowUp')

    expect([heading(), focused()]).toEqual(['March 2026', 'Tuesday, March 24, 2026'])
  })
})

describe('react-day-picker keyboard, with navigation held to one month', () => {
  it('keeps the month and focus on the arrow keys out of it', async () => {
    render(<Example fromDate={new Date(2026, 2, 1)} toDate={new Date(2026, 2, 31)} />)

    await press('Sunday, March 1, 2026', 'ArrowLeft')
    const before = [heading(), focused()]
    await press('Tuesday, March 31, 2026', 'ArrowRight')

    expect([before, [heading(), focused()]]).toEqual([
      ['March 2026', 'Sunday, March 1, 2026'],
      ['March 2026', 'Tuesday, March 31, 2026'],
    ])
  })
})

describe('react-day-picker two months', () => {
  it('draws a grid for each, and turns both back on a press of the previous button', () => {
    const shown = () =>
      Array.from(document.querySelectorAll('[data-slot="calendar-grid"]'), (grid) =>
        grid.querySelector('[data-slot="calendar-day"]:not([data-outside-month])')?.getAttribute('aria-label'),
      )
    render(
      <Calendar adapter={adapter} mode="single" defaultMonth={new Date(2026, 10, 1)} numberOfMonths={2}>
        <CalendarPrevButton />
        <CalendarGrid month={0} />
        <CalendarGrid month={1} />
      </Calendar>,
    )
    const first = shown()

    fireEvent.click(screen.getByRole('button', { name: 'Go to previous month' }))

    expect([first, shown()]).toEqual([
      ['Sunday, November 1, 2026', 'Tuesday, December 1, 2026'],
      ['Thursday, October 1, 2026', 'Sunday, November 1, 2026'],
    ])
  })
})

describe('react-day-picker range', () => {
  const selected = () =>
    screen
      .getAllByRole('gridcell')
      .filter((cell) => cell.getAttribute('aria-selected') === 'true')
      .map((cell) => cell.getAttribute('aria-label')?.replace(/, 2026$/, ''))

  it('takes a first click as its start and a later one as its end, and starts again on a third', () => {
    const onSelect = vi.fn()
    render(<Example mode="range" onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('gridcell', { name: 'Monday, March 9, 2026' }))
    fireEvent.click(screen.getByRole('gridcell', { name: 'Wednesday, March 11, 2026' }))
    const range = selected()
    fireEvent.click(screen.getByRole('gridcell', { name: 'Friday, March 20, 2026' }))

    expect([range, selected(), onSelect.mock.calls.at(-1)?.[0]]).toEqual([
      ['Monday, March 9', 'Tuesday, March 10', 'Wednesday, March 11'],
      ['Friday, March 20'],
      { from: new Date(2026, 2, 20), to: null },
    ])
  })

  it('takes a click before its start as the new start, the old one becoming its end', () => {
    const onSelect = vi.fn()
    render(<Example mode="range" onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('gridcell', { name: 'Wednesday, March 11, 2026' }))
    fireEvent.click(screen.getByRole('gridcell', { name: 'Monday, March 9, 2026' }))

    expect(onSelect.mock.calls.at(-1)?.[0]).toEqual({ from: new Date(2026, 2, 9), to: new Date(2026, 2, 11) })
  })
})

describe('react-day-picker disabled days', () => {
  it('still marks a selected day as selected while it is disabled, and no other disabled day', () => {
    render(<Example selected={new Date(2026, 2, 10)} disabled={[new Date(2026, 2, 10), new Date(2026, 2, 11)]} />)
    const state = (name: string) => {
      const cell = screen.getByRole('gridcell', { name })
      return [cell.getAttribute('aria-selected'), cell.getAttribute('aria-disabled')]
    }

    expect([state('Tuesday, March 10, 2026'), state('Wednesday, March 11, 2026')]).toEqual([
      ['true', 'true'],
      ['false', 'true'],
    ])
  })
})
