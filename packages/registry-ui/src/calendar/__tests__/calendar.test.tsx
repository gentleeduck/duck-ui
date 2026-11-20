import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Calendar } from '../calendar'
import type { ICalendarProps } from '../calendar.types'
import { MotionCalendar } from '../motion-calendar'

const march2026 = new Date(2026, 2, 1)

const firstWeekday = (html: string) => html.match(/role="columnheader"[^>]*>([^<]*)</)?.[1]
const weekdays = (html: string) => Array.from(html.matchAll(/role="columnheader"[^>]*>([^<]*)</g), (m) => m[1])
const dayText = (html: string, day: number) =>
  html.match(new RegExp(`data-day="${new Date(2026, 2, day).toLocaleDateString()}"[^>]*>([^<]*)<`))?.[1]
const focusedCells = (container: HTMLElement) => container.querySelectorAll('[role="gridcell"][data-focused="true"]')

afterEach(cleanup)
const buttonFor = (html: string, label: string) =>
  html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0]

describe.each([
  ['Calendar', Calendar],
  ['MotionCalendar', MotionCalendar],
] as const)('registry-ui %s', (_, Component) => {
  const draw = (props: ICalendarProps = {}) =>
    renderToStaticMarkup(<Component defaultMonth={march2026} showDropdowns={false} {...props} />)

  test('starts each week with its ISO week number when asked', () => {
    const html = draw({ showWeekNumber: true })
    const weeks = Array.from(html.matchAll(/role="rowheader" aria-label="Week (\d+)"/g), (m) => Number(m[1]))

    expect(weeks).toEqual([10, 11, 12, 13, 14])
    expect(html).toMatch(/role="row"[^>]*><div aria-hidden="true"/)
  })

  test('draws no week numbers by default', () => {
    expect(draw()).not.toContain('rowheader')
  })

  test("starts the week on the locale's first day, or the day it is given", () => {
    const monday = new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(new Date(2026, 2, 2))

    expect([
      firstWeekday(draw()),
      firstWeekday(draw({ weekStartDay: 1 })),
      firstWeekday(draw({ locale: 'de-DE' })),
    ]).toEqual(['Sun', 'Mon', monday])
  })

  test('marks unavailable days, and hands readOnly and invalid to the grid', () => {
    const html = draw({
      selected: new Date(2026, 2, 12),
      unavailable: [new Date(2026, 2, 10)],
      readOnly: true,
      invalid: true,
    })

    expect(buttonFor(html, 'Tuesday, March 10, 2026')).toContain('data-unavailable="true"')
    expect(html.match(/data-unavailable="true"/g)?.length).toBe(1)
    expect(html).toContain('aria-readonly="true"')
    expect(buttonFor(html, 'Thursday, March 12, 2026')).toMatch(/aria-invalid="true".*bg-destructive/)
  })

  test('cannot page past toDate when the whole view pages', () => {
    const next = (props: ICalendarProps) =>
      buttonFor(draw({ numberOfMonths: 2, toDate: new Date(2026, 3, 20), ...props }), 'Go to next month')

    expect([next({ pageBehavior: 'visible' }), next({})].map((button) => / disabled=""/.test(button ?? ''))).toEqual([
      true,
      false,
    ])
  })

  test('draws days, week numbers and the year in Eastern Arabic numerals for Arabic, without the article on a weekday', () => {
    const html = draw({ locale: 'ar-EG', showWeekNumber: true, showDropdowns: true })

    expect(dayText(html, 12)).toBe('١٢')
    expect(html).toMatch(/role="rowheader" aria-label="Week 10"[^>]*>١٠</)
    expect(html).toMatch(/aria-expanded="false"[^>]*><span dir="auto">٢٠٢٦</)
    expect(weekdays(html).some((day) => day?.startsWith('ال'))).toBe(false)
  })

  test('draws days in Hebrew numerals and weekdays without the word for day', () => {
    const html = draw({ locale: 'he-IL' })

    expect([1, 10, 15, 16, 21, 30].map((day) => dayText(html, day))).toEqual(['א׳', 'י׳', 'ט״ו', 'ט״ז', 'כ״א', 'ל׳'])
    expect(weekdays(html).some((day) => day?.includes('יום'))).toBe(false)
  })

  test('cuts a Persian weekday to two letters', () => {
    expect(weekdays(draw({ locale: 'fa-IR' })).every((day) => day?.length === 2)).toBe(true)
  })

  test.each([
    ['single', [12], new Date(2026, 2, 12)],
    ['multi', [10, 12], [new Date(2026, 2, 10), new Date(2026, 2, 12)]],
    ['range', [10, 12], { from: new Date(2026, 2, 10), to: new Date(2026, 2, 12) }],
    ['multi-range', [10, 12], [{ from: new Date(2026, 2, 10), to: new Date(2026, 2, 12) }]],
  ] as const)('hands onSelect the %s value the clicked days make', (mode, days, expected) => {
    const onSelect = vi.fn()
    render(<Component defaultMonth={march2026} showDropdowns={false} {...({ mode, onSelect } as ICalendarProps)} />)

    for (const day of days) fireEvent.click(screen.getByRole('button', { name: new RegExp(`March ${day}, 2026`) }))

    expect(onSelect.mock.calls.at(-1)?.[0]).toEqual(expected)
  })

  test('draws the header renderHeader returns, and pages the grid with the handlers it is given', async () => {
    render(
      <Component
        defaultMonth={march2026}
        fromDate={march2026}
        renderHeader={({ title, goToPrevMonth, goToNextMonth, isPrevDisabled }) => (
          <div>
            <button type="button" disabled={isPrevDisabled} onClick={goToPrevMonth}>
              Back
            </button>
            <span>{title}</span>
            <button type="button" onClick={goToNextMonth}>
              On
            </button>
          </div>
        )}
      />,
    )
    expect(screen.getByRole('button', { name: 'Back' })).toHaveProperty('disabled', true)

    fireEvent.click(screen.getByRole('button', { name: 'On' }))
    expect(screen.getByText('April 2026')).toBeTruthy()
    expect(await screen.findByRole('button', { name: /April 15, 2026/ })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('March 2026')).toBeTruthy()
  })

  test('rings the focused day only while the keyboard is in use', () => {
    const { container } = render(<Component defaultMonth={march2026} selected={new Date(2026, 2, 12)} />)
    const calendar = container.querySelector<HTMLElement>('[data-slot="calendar"]') as HTMLElement
    expect(focusedCells(container)).toHaveLength(0)

    fireEvent.keyDown(calendar, { key: 'Shift' })
    expect(focusedCells(container)).toHaveLength(1)

    fireEvent.pointerDown(calendar)
    expect(focusedCells(container)).toHaveLength(0)

    fireEvent.keyDown(calendar, { key: 'Shift' })
    fireEvent.click(screen.getByRole('button', { name: /March 20, 2026/ }))
    expect(focusedCells(container)).toHaveLength(0)
  })

  test('picks a month and then a year from the header, each list closing on its pick', () => {
    const onMonthChange = vi.fn()
    render(<Component defaultMonth={march2026} onMonthChange={onMonthChange} yearRange={{ from: 2020, to: 2032 }} />)

    fireEvent.click(screen.getByRole('button', { name: 'Mar', expanded: false }))
    fireEvent.click(screen.getByRole('button', { name: 'Jun' }))
    expect(screen.getByRole('button', { name: 'Jun', expanded: false })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '2026', expanded: false }))
    fireEvent.click(screen.getByRole('button', { name: '2030' }))
    expect(screen.getByRole('button', { name: '2030', expanded: false })).toBeTruthy()
    expect(onMonthChange.mock.calls.at(-1)?.[0]).toEqual(new Date(2030, 5, 1))
  })

  test('opens one header list at a time', () => {
    render(<Component defaultMonth={march2026} yearRange={{ from: 2020, to: 2032 }} />)

    fireEvent.click(screen.getByRole('button', { name: 'Mar', expanded: false }))
    fireEvent.click(screen.getByRole('button', { name: '2026', expanded: false }))

    expect(screen.getByRole('button', { name: 'Mar', expanded: false })).toBeTruthy()
    expect(screen.getByRole('button', { name: '2026', expanded: true })).toBeTruthy()
  })

  test('draws only the years near the one shown, and the years scrolled to', () => {
    render(<Component defaultMonth={march2026} yearRange={{ from: 2000, to: 2040 }} />)
    const trigger = screen.getByRole('button', { name: '2026', expanded: false })
    expect(screen.queryByRole('button', { name: '2000' })).toBeNull()

    fireEvent.click(trigger)
    fireEvent.scroll(trigger.parentElement?.querySelector('[data-state="open"]') as Element, {
      target: { scrollTop: 0 },
    })

    expect(screen.getByRole('button', { name: '2000' })).toBeTruthy()
  })

  test('closes an open list on a pointer down outside it, and keeps one inside from reaching a popover', () => {
    const onOutsidePointerDown = vi.fn()
    render(
      // biome-ignore lint/a11y/noStaticElementInteractions: stands in for a popover listening for a dismiss
      <div onPointerDown={onOutsidePointerDown}>
        <Component defaultMonth={march2026} />
      </div>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mar', expanded: false }))
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Jun' }))
    expect(screen.getByRole('button', { name: 'Mar', expanded: true })).toBeTruthy()
    expect(onOutsidePointerDown).not.toHaveBeenCalled()

    fireEvent.pointerDown(document.body)
    expect(screen.getByRole('button', { name: 'Mar', expanded: false })).toBeTruthy()
  })
})
