// From Base UI, packages/react/src/dialog/{root,popup,close,trigger,portal}/*.test.tsx. MIT, see
// src/__tests__/base-ui/LICENSE. Base UI's Popup is the content here. Left out: its handles, detached triggers, the
// payload, `disablePointerDismissal`, `forceRender` on the backdrop, the reasons it hands onOpenChange, drag
// dismissal on touch, and the external scroll lock handoff, which have no counterpart. The count of open nested
// dialogs and the press of a non-main button outside are in dialog.test.tsx.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { clickOutside, freshDom, wait } from '../../__tests__/dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '../../dropdown-menu'
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from '../index'

freshDom()

function Popup({ children, ...props }: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogContent aria-describedby={undefined} {...props}>
        <DialogTitle>Title</DialogTitle>
        {children}
      </DialogContent>
    </DialogPortal>
  )
}

const dialogs = () => screen.queryAllByRole('dialog')

describe('Base UI dialog focus targets', () => {
  it('gives focus on close to the finalFocus it names when initialFocus points outside it', async () => {
    function Example() {
      const outside = React.useRef<HTMLButtonElement>(null)
      const final = React.useRef<HTMLButtonElement>(null)
      return (
        <>
          <button type="button" ref={outside}>
            Outside
          </button>
          <button type="button" ref={final}>
            Final
          </button>
          <Dialog>
            <DialogTrigger>Open</DialogTrigger>
            <Popup initialFocus={outside} finalFocus={final}>
              <DialogClose>Close</DialogClose>
            </Popup>
          </Dialog>
        </>
      )
    }
    render(<Example />)
    fireEvent.click(screen.getByText('Open'))
    await wait(0)

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Final')
  })

  it('gives focus back to its trigger on close when initialFocus points outside it and no finalFocus is given', async () => {
    function Example() {
      const outside = React.useRef<HTMLButtonElement>(null)
      return (
        <>
          <button type="button" ref={outside}>
            Outside
          </button>
          <Dialog>
            <DialogTrigger>Open</DialogTrigger>
            <Popup initialFocus={outside} />
          </Dialog>
        </>
      )
    }
    render(<Example />)
    act(() => screen.getByText('Open').focus())
    fireEvent.click(screen.getByText('Open'))
    await wait(0)

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Open')
  })
})

describe('Base UI dialog parts', () => {
  it('asks to close once from its close button, and not again on a click once closed', async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogPortal forceMount>
          <DialogContent forceMount aria-describedby={undefined}>
            <DialogTitle>Title</DialogTitle>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    )
    await wait(0)

    fireEvent.click(screen.getByText('Close'))
    fireEvent.click(screen.getByText('Close'))

    expect(onOpenChange.mock.calls).toEqual([[false]])
  })

  it('closes from a close button given onClick={undefined}', async () => {
    render(
      <Dialog defaultOpen>
        <Popup>
          <DialogClose onClick={undefined}>Close</DialogClose>
        </Popup>
      </Dialog>,
    )
    await wait(0)

    fireEvent.click(screen.getByText('Close'))

    expect(dialogs()).toEqual([])
  })

  it('stays shut from a disabled trigger', () => {
    render(
      <Dialog>
        <DialogTrigger disabled>Open</DialogTrigger>
        <Popup />
      </Dialog>,
    )

    fireEvent.click(screen.getByText('Open'))

    expect(dialogs()).toEqual([])
  })

  it('renders with a Suspense boundary outside its portal', async () => {
    render(
      <React.Suspense fallback={null}>
        <Dialog defaultOpen>
          <Popup />
        </Dialog>
      </React.Suspense>,
    )
    await wait(0)

    expect(dialogs()).toHaveLength(1)
  })
})

describe('Base UI dialog modal', () => {
  it('hides the rest of the page while modal, and leaves it while not', async () => {
    const page = (modal: boolean) => (
      <>
        <button type="button">Elsewhere</button>
        <Dialog defaultOpen modal={modal}>
          <Popup />
        </Dialog>
      </>
    )
    const { unmount } = render(page(true))
    await wait(0)
    const hidden = screen.queryByRole('button', { name: 'Elsewhere' })
    unmount()
    render(page(false))
    await wait(0)

    expect([hidden, screen.queryByRole('button', { name: 'Elsewhere' }) !== null]).toEqual([null, true])
  })
})

describe('Base UI dialog dismissal', () => {
  it('closes sibling dialogs open together one per Escape, the newest first', async () => {
    render(
      <>
        <Dialog defaultOpen>
          <Popup aria-label="First" />
        </Dialog>
        <Dialog defaultOpen>
          <Popup aria-label="Second" />
        </Dialog>
      </>,
    )
    await wait(0)

    fireEvent.keyDown(document.body, { key: 'Escape' })
    await wait(0)
    const left = screen.queryAllByRole('dialog', { hidden: true }).map((dialog) => dialog.getAttribute('aria-label'))
    fireEvent.keyDown(document.body, { key: 'Escape' })
    await wait(0)

    expect([left, screen.queryAllByRole('dialog', { hidden: true })]).toEqual([['First'], []])
  })

  it('closes only a menu opened inside it on a press outside the menu', async () => {
    render(
      <Dialog defaultOpen>
        <Popup>
          <DropdownMenu>
            <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent>
                <DropdownMenuItem>Item</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </Popup>
      </Dialog>,
    )
    await wait(0)
    fireEvent.pointerDown(screen.getByText('Menu'), { button: 0, ctrlKey: false, pointerType: 'mouse' })
    await wait(0)
    const opened = screen.queryByRole('menu', { hidden: true }) !== null

    await clickOutside(screen.getByText('Title'))

    expect([
      opened,
      screen.queryByRole('menu', { hidden: true }),
      screen.queryAllByRole('dialog', { hidden: true }).length,
    ]).toEqual([true, null, 1])
  })

  it('closes a dialog opened from a menu on Escape, leaving the menu open', async () => {
    function Example() {
      const [open, setOpen] = React.useState(false)
      return (
        <DropdownMenu defaultOpen modal={false}>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  setOpen(true)
                }}>
                Open dialog
              </DropdownMenuItem>
              <Dialog open={open} onOpenChange={setOpen}>
                <Popup />
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      )
    }
    render(<Example />)
    await wait(0)
    fireEvent.click(screen.getByText('Open dialog'))
    await wait(0)
    const opened = screen.queryAllByRole('dialog', { hidden: true }).length

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect([
      opened,
      screen.queryAllByRole('dialog', { hidden: true }).length,
      screen.queryByRole('menu', { hidden: true }) !== null,
    ]).toEqual([1, 0, true])
  })

  it('closes on a press outside once the focused element inside it is taken away by a press', async () => {
    function Removing() {
      const [shown, setShown] = React.useState(true)
      return shown ? (
        <button type="button" onPointerDown={() => setShown(false)}>
          Remove me
        </button>
      ) : null
    }
    render(
      <>
        <div data-testid="outside">outside</div>
        <Dialog defaultOpen modal={false}>
          <Popup>
            <Removing />
          </Popup>
        </Dialog>
      </>,
    )
    await wait(0)
    act(() => screen.getByText('Remove me').focus())

    fireEvent.pointerDown(screen.getByText('Remove me'))
    await wait(0)
    const kept = dialogs().length
    await clickOutside(screen.getByTestId('outside'))

    expect([kept, dialogs()]).toEqual([1, []])
  })

  it('closes on a press outside a closed shadow root it renders in', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const root = host.attachShadow({ mode: 'closed' })
    const container = root.appendChild(document.createElement('div'))
    render(
      <Dialog defaultOpen modal={false}>
        <DialogPortal container={container}>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
      { container },
    )
    await wait(0)
    const outside = document.body.appendChild(document.createElement('button'))

    await clickOutside(outside)

    expect(container.querySelector('[role="dialog"]')).toBeNull()
    host.remove()
    outside.remove()
  })
})
