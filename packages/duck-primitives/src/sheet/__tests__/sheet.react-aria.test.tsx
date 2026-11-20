// From React Aria, packages/react-aria-components/test/Sheet.test.js. Apache 2.0, see
// src/__tests__/react-aria/LICENSE; changed to drive this sheet, its React Aria parts taken out. Left out: its enter
// scroll, view timelines, swipe animations, overscroll padding and snap markers, which have no counterpart here.

import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { clickOutside, freshDom, wait } from '../../__tests__/dom'
import { Sheet, SheetContent, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger } from '../index'

freshDom()

function Panel({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetContent aria-describedby={undefined}>
        <SheetTitle>{title}</SheetTitle>
        {children}
      </SheetContent>
    </SheetPortal>
  )
}

const sheets = () => screen.queryAllByRole('dialog', { hidden: true }).map((dialog) => dialog.textContent)

describe('React Aria sheet', () => {
  it('closes on Escape and gives focus back to its trigger', async () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <Panel title="Filters" />
      </Sheet>,
    )
    act(() => screen.getByText('Open').focus())
    fireEvent.click(screen.getByText('Open'))
    await wait(0)

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
    await wait(0)

    expect([sheets(), document.activeElement?.textContent]).toEqual([[], 'Open'])
  })

  it('closes on a press outside it', async () => {
    render(
      <>
        <button type="button">Outside</button>
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <Panel title="Filters" />
        </Sheet>
      </>,
    )
    await wait(0)

    await clickOutside(screen.getByText('Outside'))

    expect(sheets()).toEqual([])
  })

  it('closes only the topmost of two sheets on Escape', async () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <Panel title="Outer">
          <Sheet>
            <SheetTrigger>Nested</SheetTrigger>
            <Panel title="Inner" />
          </Sheet>
        </Panel>
      </Sheet>,
    )
    await wait(0)
    fireEvent.click(screen.getByText('Nested'))
    await wait(0)

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
    await wait(0)

    expect(sheets()).toEqual(['OuterNested'])
  })
})
