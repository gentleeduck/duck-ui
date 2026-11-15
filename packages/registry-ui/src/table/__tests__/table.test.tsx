import { afterEach, describe, expect, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { act, cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import {
  MotionTable,
  MotionTableRow,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '..'

afterEach(cleanup)

const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

function opacity(element: Element) {
  return Number((element as HTMLElement).style.opacity || 1)
}

const parts = [
  ['Table', Table, 'TABLE', 'table'],
  ['TableHeader', TableHeader, 'THEAD', 'table-header'],
  ['TableBody', TableBody, 'TBODY', 'table-body'],
  ['TableFooter', TableFooter, 'TFOOT', 'table-footer'],
  ['TableRow', TableRow, 'TR', 'table-row'],
  ['TableHead', TableHead, 'TH', 'table-head'],
  ['TableCell', TableCell, 'TD', 'table-cell'],
  ['TableCaption', TableCaption, 'CAPTION', 'table-caption'],
] as const

describe('registry-ui Table', () => {
  test.each(parts)('%s renders its element with its slot, a className, props and the ref', (_, Part, tag, slot) => {
    const ref = React.createRef<HTMLElement>()
    const Any = Part as React.ElementType

    render(<Any className="custom" data-testid="part" ref={ref} title="hint" />)
    const element = screen.getByTestId('part')

    expect(element.tagName).toBe(tag)
    expect(element.dataset.slot).toBe(slot)
    expect(element.classList.contains('custom')).toBe(true)
    expect(element.title).toBe('hint')
    expect(ref.current).toBe(element)
  })

  test('a head is a column header unless told it heads a row', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead scope="row">Ada</TableHead>
            <TableCell>Analyst</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(screen.getByRole('columnheader', { name: 'Name' }).getAttribute('scope')).toBe('col')
    expect(screen.getByRole('rowheader', { name: 'Ada' }).getAttribute('scope')).toBe('row')
  })

  test('a head spaces itself vertically, so a header row needs no class for it', () => {
    render(<TableHead>Name</TableHead>)

    expect(screen.getByText('Name').className.split(' ')).toContain('py-2')
  })

  test('a head or cell holding a native checkbox drops its end padding, as one with a role="checkbox" does', () => {
    render(
      <>
        <TableHead>Head</TableHead>
        <TableCell>Cell</TableCell>
      </>,
    )

    for (const text of ['Head', 'Cell']) {
      const classes = screen.getByText(text).className.split(' ')
      expect(classes).toContain('[&:has([type=checkbox])]:pe-0')
      expect(classes).toContain('[&:has([role=checkbox])]:pe-0')
    }
  })

  test('the scrolling wrapper takes the direction from the provider, and an explicit dir wins', () => {
    const { rerender } = render(
      <DirectionProvider dir="rtl">
        <Table data-testid="table" />
      </DirectionProvider>,
    )

    expect(screen.getByTestId('table').parentElement?.getAttribute('dir')).toBe('rtl')
    expect(screen.getByTestId('table').parentElement?.className).toBe('relative w-full overflow-auto')

    rerender(
      <DirectionProvider dir="rtl">
        <Table data-testid="table" dir="ltr" />
      </DirectionProvider>,
    )

    expect(screen.getByTestId('table').parentElement?.getAttribute('dir')).toBe('ltr')
  })
})

describe('registry-ui MotionTable', () => {
  test('wraps the table in an entering wrapper with the direction, and forwards the ref to the table', async () => {
    const ref = React.createRef<HTMLTableElement>()

    render(
      <DirectionProvider dir="rtl">
        <MotionTable className="custom" data-testid="table" ref={ref} />
      </DirectionProvider>,
    )
    const table = screen.getByTestId('table')
    const wrapper = table.parentElement as HTMLElement

    expect(ref.current).toBe(table)
    expect(table.dataset.slot).toBe('table')
    expect(table.classList.contains('custom')).toBe(true)
    expect(wrapper.getAttribute('dir')).toBe('rtl')
    expect(opacity(wrapper)).toBe(0)

    for (let step = 0; step < 10; step++) await wait(100)

    expect(opacity(wrapper)).toBe(1)
  })

  test('a row enters 50ms behind the one before it, inside a plain Table too, and keeps index off the DOM', async () => {
    const ref = React.createRef<HTMLTableRowElement>()

    render(
      <Table>
        <TableBody>
          <MotionTableRow className="custom" data-testid="first" ref={ref}>
            <TableCell>First</TableCell>
          </MotionTableRow>
          <MotionTableRow data-testid="late" index={20}>
            <TableCell>Late</TableCell>
          </MotionTableRow>
        </TableBody>
      </Table>,
    )
    const first = screen.getByTestId('first')
    const late = screen.getByTestId('late')

    expect(ref.current).toBe(first)
    expect(first.dataset.slot).toBe('table-row')
    expect(first.classList.contains('custom')).toBe(true)
    expect(late.hasAttribute('index')).toBe(false)

    for (let step = 0; step < 4; step++) await wait(100)

    expect(opacity(first)).toBeGreaterThan(0)
    expect(opacity(late)).toBe(0)

    for (let step = 0; step < 18; step++) await wait(100)

    expect(opacity(late)).toBe(1)
  })
})
