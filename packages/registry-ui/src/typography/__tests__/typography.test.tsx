import { afterEach, describe, expect, mock, test } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import {
  MotionTypographyBlockquote,
  MotionTypographyH1,
  MotionTypographyH2,
  MotionTypographyH3,
  MotionTypographyH4,
  MotionTypographyInlineCode,
  MotionTypographyLarge,
  MotionTypographyLead,
  MotionTypographyList,
  MotionTypographyListItem,
  MotionTypographyMuted,
  MotionTypographyP,
  MotionTypographySmall,
  MotionTypographyTable,
  TypographyBlockquote,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyInlineCode,
  TypographyLarge,
  TypographyLead,
  TypographyList,
  TypographyMuted,
  TypographyP,
  TypographySmall,
  TypographyTable,
  TypographyTd,
  TypographyTh,
  TypographyTr,
} from '..'

afterEach(cleanup)

const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

type IPart = React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLElement> & { index?: number } & React.RefAttributes<HTMLElement>
>

const inRow = (node: React.ReactNode) => (
  <table>
    <tbody>
      <tr>{node}</tr>
    </tbody>
  </table>
)
const inBody = (node: React.ReactNode) => (
  <table>
    <tbody>{node}</tbody>
  </table>
)
const alone = (node: React.ReactNode) => node

// Each part, the element it renders, its slot, and a class only its level carries.
const PARTS: [string, unknown, string, string, (node: React.ReactNode) => React.ReactNode][] = [
  ['TypographyH1', TypographyH1, 'H1', 'typography-h1', 'text-4xl', alone],
  ['TypographyH2', TypographyH2, 'H2', 'typography-h2', 'border-b', alone],
  ['TypographyH3', TypographyH3, 'H3', 'typography-h3', 'text-2xl', alone],
  ['TypographyH4', TypographyH4, 'H4', 'typography-h4', 'text-xl', alone],
  ['TypographyP', TypographyP, 'P', 'typography-p', 'leading-7', alone],
  ['TypographyBlockquote', TypographyBlockquote, 'BLOCKQUOTE', 'typography-blockquote', 'border-s-2', alone],
  ['TypographyList', TypographyList, 'UL', 'typography-list', 'list-disc', alone],
  ['TypographyInlineCode', TypographyInlineCode, 'CODE', 'typography-inline-code', 'font-mono', alone],
  ['TypographyLead', TypographyLead, 'P', 'typography-lead', 'text-xl', alone],
  ['TypographyLarge', TypographyLarge, 'DIV', 'typography-large', 'text-lg', alone],
  ['TypographySmall', TypographySmall, 'SMALL', 'typography-small', 'leading-none', alone],
  ['TypographyMuted', TypographyMuted, 'P', 'typography-muted', 'text-muted-foreground', alone],
  ['TypographyTr', TypographyTr, 'TR', 'typography-tr', 'even:bg-muted', inBody],
  ['TypographyTh', TypographyTh, 'TH', 'typography-th', 'font-bold', inRow],
  ['TypographyTd', TypographyTd, 'TD', 'typography-td', 'px-4', inRow],
  ['MotionTypographyH1', MotionTypographyH1, 'H1', 'typography-h1', 'text-4xl', alone],
  ['MotionTypographyH2', MotionTypographyH2, 'H2', 'typography-h2', 'border-b', alone],
  ['MotionTypographyH3', MotionTypographyH3, 'H3', 'typography-h3', 'text-2xl', alone],
  ['MotionTypographyH4', MotionTypographyH4, 'H4', 'typography-h4', 'text-xl', alone],
  ['MotionTypographyP', MotionTypographyP, 'P', 'typography-p', 'leading-7', alone],
  [
    'MotionTypographyBlockquote',
    MotionTypographyBlockquote,
    'BLOCKQUOTE',
    'typography-blockquote',
    'border-s-2',
    alone,
  ],
  ['MotionTypographyInlineCode', MotionTypographyInlineCode, 'CODE', 'typography-inline-code', 'font-mono', alone],
  ['MotionTypographyLead', MotionTypographyLead, 'P', 'typography-lead', 'text-xl', alone],
  ['MotionTypographyLarge', MotionTypographyLarge, 'DIV', 'typography-large', 'text-lg', alone],
  ['MotionTypographySmall', MotionTypographySmall, 'SMALL', 'typography-small', 'leading-none', alone],
  ['MotionTypographyMuted', MotionTypographyMuted, 'P', 'typography-muted', 'text-muted-foreground', alone],
  ['MotionTypographyListItem', MotionTypographyListItem, 'LI', 'typography-list-item', 'custom', alone],
].map(([name, part, tag, slot, level, wrap]) => [name, part, tag, slot, level, wrap] as never)

describe('registry-ui Typography parts', () => {
  test.each(PARTS)(
    '%s renders its element and slot, adds its classes to yours, and passes the rest and the ref on',
    (name, part, tag, slot, level, wrap) => {
      const Part = part as IPart
      const ref = React.createRef<HTMLElement>()
      render(
        wrap(
          <Part className="custom" id="part" ref={ref} {...(name.startsWith('Motion') ? { index: 2 } : {})}>
            Text
          </Part>,
        ),
      )
      const node = document.getElementById('part')

      expect(node?.tagName).toBe(tag)
      expect(ref.current).toBe(node)
      expect(node?.getAttribute('data-slot')).toBe(slot)
      expect(node?.classList.contains(level)).toBe(true)
      expect(node?.classList.contains('custom')).toBe(true)
      expect(node?.hasAttribute('index')).toBe(false)
    },
  )

  test.each([
    ['TypographyP', TypographyP],
    ['MotionTypographyP', MotionTypographyP],
  ] as const)('%s spaces itself from the paragraph before, and a margin of your own replaces that', (_, P) => {
    render(
      <>
        <P>First</P>
        <P>Second</P>
        <P className="mt-0">Third</P>
      </>,
    )
    const classes = (text: string) => screen.getByText(text).className.split(' ')

    expect(classes('Second')).toEqual(expect.arrayContaining(['mt-6', 'first:mt-0']))
    expect(classes('Third')).toContain('mt-0')
    expect(classes('Third').filter((name) => name.includes('mt-'))).toEqual(['first:mt-0', 'mt-0'])
  })

  test('a table cell keeps the align it is given, which its classes line the text up with', () => {
    render(
      inRow(
        <>
          <TypographyTh align="center">Name</TypographyTh>
          <TypographyTd align="right">42</TypographyTd>
        </>,
      ),
    )
    const head = screen.getByText('Name')
    const cell = screen.getByText('42')

    expect(head.getAttribute('align')).toBe('center')
    expect(head.classList.contains('[&[align=center]]:text-center')).toBe(true)
    expect(cell.getAttribute('align')).toBe('right')
    expect(cell.classList.contains('[&[align=right]]:text-right')).toBe(true)
  })
})

describe.each([
  ['TypographyTable', TypographyTable],
  ['MotionTypographyTable', MotionTypographyTable],
])('registry-ui %s', (_, Table) => {
  test('the table takes the ref, the class and the props, and the wrapper that scrolls it takes wrapperClassName', () => {
    const ref = React.createRef<HTMLTableElement>()
    render(
      <Table aria-label="Treasury" className="text-sm" ref={ref} wrapperClassName="max-w-md">
        <tbody>
          <tr>
            <td>Empty</td>
          </tr>
        </tbody>
      </Table>,
    )
    const table = screen.getByRole('table', { name: 'Treasury' })
    const wrapper = table.parentElement

    expect(ref.current).toBe(table as HTMLTableElement)
    expect(table.getAttribute('data-slot')).toBe('typography-table')
    expect(Array.from(table.classList)).toEqual(['w-full', 'text-sm'])
    expect(wrapper?.tagName).toBe('DIV')
    expect(Array.from(wrapper?.classList ?? [])).toEqual(['my-6', 'w-full', 'overflow-y-auto', 'max-w-md'])
  })
})

describe('registry-ui MotionTypographyList', () => {
  test('turns each item into a list item that enters after the list, keeping its own props', () => {
    const onClick = mock()
    render(
      <MotionTypographyList className="ms-4" index={2}>
        <li className="font-bold" id="first" onClick={onClick}>
          One
        </li>
        loose text
        <li>Two</li>
      </MotionTypographyList>,
    )
    const list = screen.getByRole('list')
    const first = screen.getByText('One')
    fireEvent.click(first)

    expect(list.getAttribute('data-slot')).toBe('typography-list')
    expect(list.classList.contains('ms-4')).toBe(true)
    expect(screen.getAllByRole('listitem').map((item) => item.getAttribute('data-slot'))).toEqual([
      'typography-list-item',
      'typography-list-item',
    ])
    expect([first.id, first.className]).toEqual(['first', 'font-bold'])
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(list.textContent).toBe('Oneloose textTwo')
  })

  test('each item enters 50ms after the one before it', async () => {
    render(
      <MotionTypographyList>
        {Array.from({ length: 25 }, (_, item) => (
          <li key={item}>{`Item ${item + 1}`}</li>
        ))}
      </MotionTypographyList>,
    )
    for (let step = 0; step < 4; step++) await wait(100)

    expect(Number(screen.getByText('Item 1').style.opacity)).toBeGreaterThan(0)
    expect(Number(screen.getByText('Item 25').style.opacity)).toBe(0)
  })
})

describe('registry-ui Motion typography entrance', () => {
  test('each step of index holds the entrance back by 50ms', async () => {
    render(
      <>
        <MotionTypographyP>First</MotionTypographyP>
        <MotionTypographyP index={20}>Last</MotionTypographyP>
      </>,
    )
    for (let step = 0; step < 4; step++) await wait(100)

    expect(Number(screen.getByText('First').style.opacity)).toBeGreaterThan(0)
    expect(Number(screen.getByText('Last').style.opacity)).toBe(0)

    for (let step = 0; step < 18; step++) await wait(100)

    expect(Number(screen.getByText('Last').style.opacity)).toBe(1)
  })
})
