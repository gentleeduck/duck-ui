// From Headless UI, packages/@headlessui-react/src/components/dialog/dialog.test.tsx. MIT, see
// src/__tests__/headless/LICENSE. Left out: the complaints about missing or mistyped props and the render props, which
// this API has no counterpart for; `static` and `unmount`, which forceMount stands for and dialog.test.tsx tests;
// Transition; a click inside stopping its propagation, which Radix lets bubble; an Escape a focused field cancels,
// which Radix hears first and closes on; and elements a third-party library mounts beside the app, which Headless UI
// treats as part of the dialog and a modal dialog here takes pointer events from.

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { clickOutside, freshDom, wait } from '../../__tests__/dom'
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '../../popover'
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from '../index'

freshDom()

const dialog = () => screen.queryByRole('dialog')
const locked = () => document.body.hasAttribute('data-scroll-locked')

function Contents({ children, ...props }: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogPortal>
      <DialogOverlay data-testid="overlay" />
      <DialogContent aria-describedby={undefined} {...props}>
        <DialogTitle>Contents</DialogTitle>
        {children}
      </DialogContent>
    </DialogPortal>
  )
}

describe('Headless UI dialog safe guards', () => {
  it('renders closed without crashing', () => {
    render(
      <Dialog>
        <DialogTrigger>Trigger</DialogTrigger>
        <Contents />
      </Dialog>,
    )

    expect([screen.getByText('Trigger').getAttribute('aria-expanded'), dialog()]).toEqual(['false', null])
  })
})

describe('Headless UI dialog scroll lock', () => {
  it('keeps the page locked as one dialog hands over to the next, and unlocks it once the last closes', async () => {
    function Example() {
      const [shown, setShown] = React.useState<string | null>(null)
      return (
        <>
          {['d1', 'd2', 'd3'].map((id) => (
            <React.Fragment key={id}>
              <button type="button" onClick={() => setShown(id)}>
                Open {id}
              </button>
              <Dialog open={shown === id} onOpenChange={(open) => setShown(open ? id : null)}>
                <Contents>
                  <button type="button" onClick={() => setShown(null)}>
                    Close {id}
                  </button>
                </Contents>
              </Dialog>
            </React.Fragment>
          ))}
        </>
      )
    }
    render(<Example />)
    const seen = [locked()]

    for (const name of ['Open d1', 'Open d2', 'Open d3', 'Close d3']) {
      fireEvent.click(screen.getByRole('button', { name, hidden: true }))
      await wait(0)
      seen.push(locked())
    }

    expect(seen).toEqual([false, true, true, true, false])
  })
})

describe('Headless UI dialog composition', () => {
  it('opens from inside a popover, which closes, and gives focus back to the popover trigger once it closes', async () => {
    function Example() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <Popover>
            <PopoverTrigger>Open Popover</PopoverTrigger>
            <PopoverPortal>
              <PopoverContent>
                <button type="button" onClick={() => setOpen(true)}>
                  Open dialog
                </button>
              </PopoverContent>
            </PopoverPortal>
          </Popover>
          <Dialog open={open} onOpenChange={setOpen}>
            <Contents>
              <button type="button" onClick={() => setOpen(false)}>
                Close Dialog
              </button>
            </Contents>
          </Dialog>
        </>
      )
    }
    const user = userEvent.setup()
    render(<Example />)

    await user.click(screen.getByText('Open Popover'))
    await user.click(screen.getByText('Open dialog'))
    await wait(0)
    const opened = [screen.queryByText('Open dialog'), dialog() !== null, document.activeElement?.textContent]
    await user.click(screen.getByText('Close Dialog'))
    await wait(0)

    expect(opened).toEqual([null, true, 'Close Dialog'])
    expect([dialog(), document.activeElement?.textContent]).toEqual([null, 'Open Popover'])
  })
})

describe('Headless UI dialog keys', () => {
  function WithField({ onKeyDown }: { onKeyDown?: React.KeyboardEventHandler<HTMLInputElement> }) {
    return (
      <Dialog>
        <DialogTrigger>Trigger</DialogTrigger>
        <Contents>
          <input aria-label="Name" onKeyDown={onKeyDown} />
        </Contents>
      </Dialog>
    )
  }

  it('closes on Escape while a field in it has focus', async () => {
    render(<WithField />)
    fireEvent.click(screen.getByText('Trigger'))
    await wait(0)
    act(() => screen.getByLabelText('Name').focus())

    fireEvent.keyDown(screen.getByLabelText('Name'), { key: 'Escape' })

    expect(dialog()).toBeNull()
  })

  it('cycles Tab from the element initialFocus names', async () => {
    const user = userEvent.setup()
    function Example() {
      const initial = React.useRef<HTMLInputElement>(null)
      return (
        <Dialog>
          <DialogTrigger>Trigger</DialogTrigger>
          <Contents initialFocus={initial}>
            <button type="button">a</button>
            <input aria-label="b" ref={initial} />
          </Contents>
        </Dialog>
      )
    }
    render(<Example />)
    await user.click(screen.getByText('Trigger'))
    await wait(0)
    const stops = [document.activeElement?.getAttribute('aria-label')]

    for (let step = 0; step < 3; step++) {
      await user.tab()
      stops.push(document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent)
    }

    expect(stops).toEqual(['b', 'a', 'b', 'a'])
  })

  it('keeps focus in it on Tab and Shift+Tab when it holds one element that takes focus', async () => {
    const user = userEvent.setup()
    render(
      <Dialog defaultOpen>
        <Contents>
          <button type="button">Only</button>
        </Contents>
      </Dialog>,
    )
    await wait(0)

    await user.tab()
    const forwards = document.activeElement?.textContent
    await user.tab({ shift: true })

    expect([forwards, document.activeElement?.textContent]).toEqual(['Only', 'Only'])
  })
})

describe('Headless UI dialog with the mouse', () => {
  it('submits a form inside it', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <Dialog defaultOpen>
        <Contents>
          <form onSubmit={onSubmit}>
            <input aria-label="Name" defaultValue="Ada" />
            <button type="submit">Submit</button>
          </form>
        </Contents>
      </Dialog>,
    )

    await user.click(screen.getByText('Submit'))

    expect([onSubmit.mock.calls.length, dialog() !== null]).toEqual([1, true])
  })

  it('stays open on a press of an element its own press removes', async () => {
    function Example() {
      const wrapper = React.useRef<HTMLDivElement>(null)
      return (
        <Dialog defaultOpen>
          <Contents>
            <div ref={wrapper}>
              <button type="button" onMouseDown={() => wrapper.current?.remove()}>
                Inside
              </button>
            </div>
          </Contents>
        </Dialog>
      )
    }
    const user = userEvent.setup()
    render(<Example />)
    await wait(0)

    await user.click(screen.getByText('Inside'))
    await wait(0)

    expect(dialog()).not.toBeNull()
  })

  it('stays open on a press inside a shadow root inside it', async () => {
    function Shadowed() {
      const host = React.useRef<HTMLDivElement>(null)
      React.useLayoutEffect(() => {
        const root = host.current?.attachShadow({ mode: 'open' })
        const button = document.createElement('button')
        button.textContent = 'Shadow button'
        root?.append(button)
      }, [])
      return <div ref={host} data-testid="host" />
    }
    render(
      <Dialog defaultOpen>
        <Contents>
          <Shadowed />
        </Contents>
      </Dialog>,
    )
    await wait(0)
    const button = screen.getByTestId('host').shadowRoot?.querySelector('button')

    if (button) await clickOutside(button)

    expect([button?.textContent, dialog() !== null]).toEqual(['Shadow button', true])
  })

  it('closes on a press on its overlay, and stays open on a press inside it', async () => {
    render(
      <Dialog defaultOpen>
        <Contents>
          <button type="button">Inside</button>
        </Contents>
      </Dialog>,
    )
    await wait(0)

    await clickOutside(screen.getByText('Inside'))
    const inside = dialog() !== null
    await clickOutside(screen.getByTestId('overlay'))

    expect([inside, dialog()]).toEqual([true, null])
  })

  it('stays open when it opened on the mouse up of the press that then clicks outside it', async () => {
    function Example() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button type="button" onMouseUpCapture={() => setOpen((value) => !value)}>
            Trigger
          </button>
          <Dialog open={open} onOpenChange={setOpen} modal={false}>
            <Contents>
              <button type="button">Inside</button>
            </Contents>
          </Dialog>
        </>
      )
    }
    const user = userEvent.setup()
    render(<Example />)

    await user.click(screen.getByText('Trigger'))
    await wait(0)
    const opened = dialog() !== null
    await user.click(screen.getByText('Inside'))
    await wait(0)

    expect([opened, dialog() !== null]).toEqual([true, true])
  })

  it('stays open on a press that starts inside it and ends outside, and closes on the next press outside', async () => {
    render(
      <>
        <div data-testid="outside">this thing</div>
        <Dialog defaultOpen modal={false}>
          <Contents>
            <button type="button">Inside</button>
          </Contents>
        </Dialog>
      </>,
    )
    await wait(0)
    const inside = screen.getByText('Inside')
    const outside = screen.getByTestId('outside')

    fireEvent.pointerDown(inside, { button: 0 })
    fireEvent.mouseDown(inside)
    fireEvent.pointerUp(outside, { button: 0 })
    fireEvent.mouseUp(outside)
    fireEvent.click(document.body)
    await wait(0)
    const dragged = dialog() !== null
    await clickOutside(outside)

    expect([dragged, dialog()]).toEqual([true, null])
  })
})
