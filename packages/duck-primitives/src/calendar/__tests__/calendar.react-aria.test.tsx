// From React Aria, packages/react-aria-components/test/Calendar.test.js. Apache 2.0, see
// src/__tests__/react-aria/LICENSE; changed to drive this calendar, its React Aria parts taken out. Left out: week and
// day views, `weeksInMonth`, custom calendar systems and the month and year dropdowns, which have no counterpart here.

import { NativeAdapter } from '@gentleduck/calendar'
import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { Calendar } from '../calendar'
import { CalendarDay } from '../day'
import { CalendarGrid } from '../grid'

freshDom()

const adapter = new NativeAdapter()
const march2026 = new Date(2026, 2, 1)
const frame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)))
const day = (name: string) => screen.getByRole('gridcell', { name })

function Example(props: Partial<React.ComponentProps<typeof Calendar>>) {
  return (
    <Calendar adapter={adapter} mode="single" defaultMonth={march2026} {...(props as object)}>
      <CalendarGrid>{(cell) => <CalendarDay day={cell} />}</CalendarGrid>
    </Calendar>
  )
}

describe('React Aria calendar', () => {
  it('leaves the selection as it is on Enter over an unavailable day', async () => {
    const onSelect = vi.fn()
    render(<Example defaultSelected={new Date(2026, 2, 9)} unavailable={[new Date(2026, 2, 10)]} onSelect={onSelect} />)
    act(() => day('Monday, March 9, 2026').focus())
    fireEvent.keyDown(day('Monday, March 9, 2026'), { key: 'ArrowRight' })
    await frame()

    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' })

    expect([document.activeElement?.getAttribute('aria-label'), onSelect.mock.calls]).toEqual([
      'Tuesday, March 10, 2026',
      [],
    ])
  })

  it('moves on each repeat of an arrow key held down', async () => {
    render(<Example />)
    act(() => day('Sunday, March 1, 2026').focus())

    fireEvent.keyDown(day('Sunday, March 1, 2026'), { key: 'ArrowRight' })
    await frame()
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight', repeat: true })
    await frame()

    expect(document.activeElement?.getAttribute('aria-label')).toBe('Tuesday, March 3, 2026')
  })

  it('takes no focus when its controlled month changes', () => {
    const { rerender } = render(
      <>
        <button type="button">Elsewhere</button>
        <Example month={march2026} />
      </>,
    )
    act(() => screen.getByText('Elsewhere').focus())

    rerender(
      <>
        <button type="button">Elsewhere</button>
        <Example month={new Date(2026, 3, 1)} />
      </>,
    )

    expect([
      screen.getByRole('gridcell', { name: 'Wednesday, April 1, 2026' }) !== null,
      document.activeElement?.textContent,
    ]).toEqual([true, 'Elsewhere'])
  })

  it('selects several days in multi mode, and lets a second press take one off', () => {
    const onSelect = vi.fn()
    render(<Example mode="multi" onSelect={onSelect} />)

    fireEvent.click(day('Monday, March 2, 2026'))
    fireEvent.click(day('Thursday, March 5, 2026'))
    const both = screen.getAllByRole('gridcell').filter((cell) => cell.getAttribute('aria-selected') === 'true').length
    fireEvent.click(day('Monday, March 2, 2026'))

    expect([
      both,
      screen
        .getAllByRole('gridcell')
        .filter((cell) => cell.getAttribute('aria-selected') === 'true')
        .map((cell) => cell.getAttribute('aria-label')),
    ]).toEqual([2, ['Thursday, March 5, 2026']])
  })

  it('disables the days before fromDate and after toDate, and selects none of them', () => {
    const onSelect = vi.fn()
    render(<Example fromDate={new Date(2026, 2, 5)} toDate={new Date(2026, 2, 20)} onSelect={onSelect} />)

    fireEvent.click(day('Wednesday, March 4, 2026'))
    fireEvent.click(day('Saturday, March 21, 2026'))

    expect([
      day('Wednesday, March 4, 2026').getAttribute('aria-disabled'),
      day('Saturday, March 21, 2026').getAttribute('aria-disabled'),
      day('Thursday, March 5, 2026').getAttribute('aria-disabled'),
      onSelect.mock.calls,
    ]).toEqual(['true', 'true', 'false', []])
  })
})
