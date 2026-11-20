// From vaul, test/tests/{base,controlled,nested,with-redirect}.spec.ts and their pages. MIT, see
// src/__tests__/vaul/LICENSE. vaul drives each page in a browser; these render it in jsdom. Its swipe, snap point and
// scaled background cases test what this sheet does not do.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { clickOutside, freshDom } from '../../__tests__/dom'
import * as Sheet from '../index'

freshDom()

const content = () => screen.queryByTestId('content')

function Drawer({
  open,
  onOpenChange,
  defaultOpen,
  children,
}: Pick<React.ComponentProps<typeof Sheet.Root>, 'open' | 'onOpenChange' | 'defaultOpen' | 'children'>) {
  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
      <Sheet.Trigger data-testid="trigger">Open Drawer</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay />
        <Sheet.Content data-testid="content" aria-describedby={undefined}>
          <Sheet.Title>Drawer</Sheet.Title>
          <Sheet.Close data-testid="drawer-close">Close</Sheet.Close>
          {children}
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}

describe('vaul base', () => {
  it('opens from its trigger', () => {
    render(<Drawer />)
    const before = content()

    fireEvent.click(screen.getByTestId('trigger'))

    expect([before, content() !== null]).toEqual([null, true])
  })

  it('closes on a press outside it', async () => {
    render(
      <>
        <button type="button">outside</button>
        <Drawer defaultOpen />
      </>,
    )

    await clickOutside(document.body)

    expect(content()).toBeNull()
  })

  it('closes from its close button', () => {
    render(<Drawer defaultOpen />)

    fireEvent.click(screen.getByTestId('drawer-close'))

    expect(content()).toBeNull()
  })

  it('closes when its owner sets it closed', () => {
    function Controlled() {
      const [open, setOpen] = React.useState(true)
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <button type="button" data-testid="controlled-close" onClick={() => setOpen(false)}>
            Close controlled
          </button>
        </Drawer>
      )
    }
    render(<Controlled />)

    fireEvent.click(screen.getByTestId('controlled-close'))

    expect(content()).toBeNull()
  })

  it('starts open with defaultOpen', () => {
    render(<Drawer defaultOpen />)

    expect(content()).not.toBeNull()
  })
})

describe('vaul controlled', () => {
  it('stays open on a press outside it when given open alone', async () => {
    render(<Drawer open />)

    await clickOutside(document.body)

    expect(content()).not.toBeNull()
  })

  it('closes on a press outside it when given open and onOpenChange', async () => {
    function FullyControlled() {
      const [open, setOpen] = React.useState(true)
      return <Drawer open={open} onOpenChange={setOpen} />
    }
    render(<FullyControlled />)

    await clickOutside(document.body)

    expect(content()).toBeNull()
  })
})

describe('vaul nested', () => {
  it('opens and closes a sheet inside another, leaving the outer one open', () => {
    render(
      <Drawer defaultOpen>
        <Sheet.Root>
          <Sheet.Trigger data-testid="nested-trigger">Open nested</Sheet.Trigger>
          <Sheet.Portal>
            <Sheet.Content data-testid="nested-content" aria-describedby={undefined}>
              <Sheet.Title>Nested</Sheet.Title>
              <Sheet.Close data-testid="nested-close">Close nested</Sheet.Close>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      </Drawer>,
    )

    fireEvent.click(screen.getByTestId('nested-trigger'))
    const opened = screen.queryByTestId('nested-content') !== null
    fireEvent.click(screen.getByTestId('nested-close'))

    expect([opened, screen.queryByTestId('nested-content'), content() !== null]).toEqual([true, null, true])
  })
})

describe('vaul with a redirect', () => {
  it('gives the page back its scroll and its pointer once an open sheet unmounts with the page it was on', async () => {
    const { unmount } = render(<Drawer defaultOpen />)
    await act(async () => {})
    const page = () => [document.body.style.pointerEvents, document.body.hasAttribute('data-scroll-locked')]
    const locked = page()

    unmount()

    expect([locked, page()]).toEqual([
      ['none', true],
      ['', false],
    ])
  })
})
