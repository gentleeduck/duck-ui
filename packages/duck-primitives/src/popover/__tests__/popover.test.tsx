import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { describe, expect, it, vi } from 'vitest'
import {
  clickOutside,
  freshDom,
  pageChangesOnClose,
  scrollable,
  scrolls,
  untilScrollLocked,
  wait,
} from '../../__tests__/dom'
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '../../dialog'
import { DirectionProvider } from '../../direction'
import { useFocusScopeBranch } from '../../focus-scope'
import {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
} from '../index'

freshDom()

function renderPopover(props: Record<string, unknown> = {}) {
  return render(
    <Popover {...props}>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent>Popover content</PopoverContent>
      </PopoverPortal>
    </Popover>,
  )
}

describe('Popover', () => {
  it('renders trigger with data-slot="popover-trigger"', () => {
    const { container } = renderPopover()
    expect(container.querySelector('[data-slot="popover-trigger"]')).not.toBeNull()
  })

  it('trigger has aria-haspopup="dialog"', () => {
    const { container } = renderPopover()
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
  })

  it('trigger has aria-expanded=false when closed', () => {
    const { container } = renderPopover()
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })

  it('trigger toggles aria-expanded on click', () => {
    const { container } = renderPopover()
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('calls onOpenChange on trigger click', () => {
    const handler = vi.fn(() => {})
    const { container } = renderPopover({ onOpenChange: handler })
    fireEvent.click(container.querySelector('[data-slot="popover-trigger"]')!)
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('trigger has type="button"', () => {
    const { container } = renderPopover()
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!
    expect(trigger.getAttribute('type')).toBe('button')
  })

  it('forwards ref to trigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Popover>
        <PopoverTrigger ref={ref}>Open</PopoverTrigger>
      </Popover>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('toggles closed on second click', () => {
    const handler = vi.fn(() => {})
    const { container } = renderPopover({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!
    fireEvent.click(trigger)
    expect(handler).toHaveBeenCalledWith(true)
    fireEvent.click(trigger)
    expect(handler).toHaveBeenCalledWith(false)
  })

  it('puts a dir given to the root on the content and leaves the trigger to the page', () => {
    renderPopover({ dir: 'rtl', defaultOpen: true })

    expect(screen.getByText('Open').hasAttribute('dir')).toBe(false)
    expect(screen.getByRole('dialog').getAttribute('dir')).toBe('rtl')
  })

  it('gives portaled content the direction of <html dir> when nothing else sets one', () => {
    document.documentElement.dir = 'rtl'
    try {
      renderPopover({ defaultOpen: true })

      expect(screen.getByRole('dialog').getAttribute('dir')).toBe('rtl')
    } finally {
      document.documentElement.dir = ''
    }
  })

  it('passes className to trigger', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger className="my-popover-trigger">Open</PopoverTrigger>
      </Popover>,
    )
    expect(container.querySelector('.my-popover-trigger')).not.toBeNull()
  })
})

describe('PopoverClose', () => {
  it('renders with data-slot="popover-close"', () => {
    const { baseElement } = render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverClose>X</PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>,
    )
    expect(baseElement.querySelector('[data-slot="popover-close"]')).not.toBeNull()
  })

  it('close button has type="button"', () => {
    const { baseElement } = render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverClose>X</PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>,
    )
    expect(baseElement.querySelector('[data-slot="popover-close"]')?.getAttribute('type')).toBe('button')
  })

  it('close button forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverClose ref={ref}>X</PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('portaled content inherits dir from DirectionProvider', () => {
    const { baseElement, unmount } = render(
      <DirectionProvider dir="rtl">
        <Popover defaultOpen>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverPortal>
            <PopoverContent data-testid="dir-content">Popover content</PopoverContent>
          </PopoverPortal>
        </Popover>
      </DirectionProvider>,
    )
    const content = baseElement.querySelector('[data-testid="dir-content"]')
    expect(content?.getAttribute('dir')).toBe('rtl')
    expect(content?.closest('[data-slot="popper-content-wrapper"]')?.getAttribute('dir')).toBe('rtl')
    unmount()
  })
})

async function openPopover({
  modal,
  ...contentProps
}: { modal?: boolean } & React.ComponentProps<typeof PopoverContent> = {}) {
  render(
    <>
      <Popover modal={modal}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent {...contentProps}>
          Content
          <PopoverArrow data-testid="arrow" />
        </PopoverContent>
      </Popover>
      <button type="button">Outside</button>
    </>,
  )
  const trigger = screen.getByText('Open')
  fireEvent.click(trigger)
  await wait(0)
  return { trigger, outside: screen.getByText('Outside') }
}

const isOpen = () => screen.queryByText('Content') !== null

describe('Popover parts', () => {
  it('renders its arrow inside open content', async () => {
    await openPopover()

    expect(screen.getByTestId('arrow')).toBeTruthy()
  })

  it("names the popper's measurements under the popover's own variables, beside the style it was given", async () => {
    await openPopover({ style: { color: 'teal' } })

    const { style } = screen.getByRole('dialog')
    expect(style.color).toBe('teal')
    expect(
      [
        '--gentleduck-popover-content-transform-origin',
        '--gentleduck-popover-content-available-width',
        '--gentleduck-popover-content-available-height',
        '--gentleduck-popover-trigger-width',
        '--gentleduck-popover-trigger-height',
      ].map((name) => style.getPropertyValue(name)),
    ).toEqual([
      'var(--gentleduck-popper-transform-origin)',
      'var(--gentleduck-popper-available-width)',
      'var(--gentleduck-popper-available-height)',
      'var(--gentleduck-popper-anchor-width)',
      'var(--gentleduck-popper-anchor-height)',
    ])
  })

  it('marks each part with its own data-slot', async () => {
    render(
      <Popover defaultOpen>
        <PopoverAnchor data-testid="anchor" />
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Title</PopoverTitle>
          <PopoverDescription>Description</PopoverDescription>
          <PopoverArrow data-testid="arrow" />
        </PopoverContent>
      </Popover>,
    )
    await wait(0)

    expect(
      [
        screen.getByTestId('anchor'),
        screen.getByTestId('arrow'),
        screen.getByText('Title'),
        screen.getByText('Description'),
      ].map((part) => part.getAttribute('data-slot')),
    ).toEqual(['popover-anchor', 'popover-arrow', 'popover-title', 'popover-description'])
  })

  it('puts focus guards at the edges of the page while open', async () => {
    await openPopover()

    expect(document.querySelectorAll('[data-slot="focus-guard"]')).toHaveLength(2)
  })

  it('hands Escape to onEscapeKeyDown, which can keep it open', async () => {
    await openPopover({ onEscapeKeyDown: (event) => event.preventDefault() })

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect(isOpen()).toBe(true)
  })

  it('keeps every element of a collision boundary list that exists', async () => {
    const boundary = document.createElement('div')
    document.body.append(boundary)

    await openPopover({ collisionBoundary: [boundary, null as never] })

    expect(isOpen()).toBe(true)
    boundary.remove()
  })
})

describe('Popover modal focus on close', () => {
  it('returns focus to the trigger after a primary click outside', async () => {
    const { trigger, outside } = await openPopover({ modal: true })

    await clickOutside(outside)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('leaves focus alone after a right click or a control click outside', async () => {
    for (const click of [{ button: 2 }, { button: 0, ctrlKey: true }]) {
      const { trigger, outside } = await openPopover({ modal: true })

      fireEvent.pointerDown(outside, click)
      await wait(0)

      expect(isOpen()).toBe(false)
      expect(document.activeElement).not.toBe(trigger)
      cleanup()
    }
  })

  it('leaves focus alone after a right click outside, though the trigger had it before opening', async () => {
    render(
      <>
        <Popover modal>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
        <button type="button">Outside</button>
      </>,
    )
    const trigger = screen.getByText('Open')
    act(() => trigger.focus())
    fireEvent.click(trigger)
    await wait(0)

    fireEvent.pointerDown(screen.getByText('Outside'), { button: 2 })
    await wait(0)

    expect([isOpen(), document.activeElement === trigger]).toEqual([false, false])
  })

  it('hands a focus and a press outside to the handlers it was given', async () => {
    const onFocusOutside = vi.fn(() => {})
    const onInteractOutside = vi.fn(() => {})
    const { outside } = await openPopover({ modal: true, onFocusOutside, onInteractOutside })

    fireEvent.focusOut(screen.getByRole('dialog'))
    fireEvent.focusIn(outside)
    const afterFocus = [onFocusOutside.mock.calls.length, onInteractOutside.mock.calls.length]
    await clickOutside(outside)

    expect([afterFocus, onInteractOutside.mock.calls.length, isOpen()]).toEqual([[1, 1], 2, false])
  })

  it('returns focus to the trigger on Escape after a right click outside that was kept from closing it', async () => {
    const { trigger, outside } = await openPopover({
      modal: true,
      onPointerDownOutside: (event) => event.preventDefault(),
    })

    fireEvent.pointerDown(outside, { button: 2 })
    await wait(0)
    const afterPress = isOpen()
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect([afterPress, isOpen(), document.activeElement?.textContent]).toEqual([true, false, 'Open'])
  })

  it('returns focus to the trigger after a pointer down a script dispatched with no button', async () => {
    const { trigger, outside } = await openPopover({ modal: true })

    act(() => {
      outside.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    })
    await wait(0)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })
})

describe('Popover non-modal outside interaction', () => {
  it('stays open when other code stops the click that follows a press outside', async () => {
    const { outside } = await openPopover({ modal: false })
    outside.addEventListener('click', (event) => event.stopPropagation())

    await clickOutside(outside)

    expect(isOpen()).toBe(true)
  })

  it('closes from a press on its trigger rather than closing and opening again', async () => {
    const { trigger } = await openPopover({ modal: false })

    await clickOutside(trigger)

    expect(isOpen()).toBe(false)
  })

  it('stays open when focus moves back to its trigger', async () => {
    const { trigger } = await openPopover({ modal: false })

    act(() => trigger.focus())
    await wait(0)

    expect(isOpen()).toBe(true)
  })

  it('returns focus to the trigger when it closes with no press outside', async () => {
    const { trigger } = await openPopover({ modal: false })

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('returns focus to the trigger on Escape after a press outside that was kept from closing it', async () => {
    const { trigger, outside } = await openPopover({
      modal: false,
      onInteractOutside: (event) => event.preventDefault(),
    })

    await clickOutside(outside, { focus: true })
    const afterPress = isOpen()
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect([afterPress, isOpen(), document.activeElement]).toEqual([true, false, trigger])
  })

  it('closes when focus moves outside with no press', async () => {
    const { outside } = await openPopover({ modal: false })

    act(() => outside.focus())
    await wait(0)

    expect(isOpen()).toBe(false)
  })

  it('closes when focus moves outside once reopened after a press outside closed it', async () => {
    const { trigger, outside } = await openPopover({ modal: false, forceMount: true })

    await clickOutside(outside)
    fireEvent.click(trigger)
    await wait(0)
    act(() => {
      outside.blur()
      outside.focus()
    })
    await wait(0)

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('leaves focus where the user clicked', async () => {
    const { outside } = await openPopover({ modal: false })

    await clickOutside(outside, { focus: true })

    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(outside)
  })

  it('ignores the focus that follows a click outside while the content is still mounted', async () => {
    const onInteractOutside = vi.fn()
    const { outside } = await openPopover({ modal: false, forceMount: true, onInteractOutside })

    await clickOutside(outside, { focus: true })
    act(() => {
      outside.blur()
      outside.focus()
    })

    const events = onInteractOutside.mock.calls.map(([event]) => event as CustomEvent<{ originalEvent: Event }>)
    expect(events.map((event) => [event.detail.originalEvent.type, event.defaultPrevented])).toEqual([
      ['pointerdown', false],
      ['focusin', true],
    ])
  })
})

describe('Popover anchor', () => {
  it('measures from a PopoverAnchor rather than from its trigger', async () => {
    render(
      <Popover>
        <PopoverAnchor data-testid="anchor" />
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    )
    const box = (width: number) => () => DOMRect.fromRect({ x: 0, y: 0, width, height: 20 })
    screen.getByTestId('anchor').getBoundingClientRect = box(120)
    screen.getByText('Open').getBoundingClientRect = box(40)

    fireEvent.click(screen.getByText('Open'))
    await wait(0)
    await wait(0)

    const wrapper = screen.getByText('Content').closest<HTMLElement>('[data-slot="popper-content-wrapper"]')
    expect(wrapper?.style.getPropertyValue('--gentleduck-popper-anchor-width')).toBe('120px')
  })
})

describe('Popover anchor removed', () => {
  function Anchored({ anchored }: { anchored: boolean }) {
    return (
      <Popover>
        {anchored && <PopoverAnchor />}
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )
  }

  it('measures from its trigger again once the PopoverAnchor unmounts', async () => {
    const { rerender } = render(<Anchored anchored />)
    rerender(<Anchored anchored={false} />)
    screen.getByText('Open').getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: 0, width: 40, height: 20 })

    fireEvent.click(screen.getByText('Open'))
    await wait(0)
    await wait(0)

    const wrapper = screen.getByText('Content').closest<HTMLElement>('[data-slot="popper-content-wrapper"]')
    expect(wrapper?.style.getPropertyValue('--gentleduck-popper-anchor-width')).toBe('40px')
  })
})

describe('PopoverPortal', () => {
  it('renders into the container it is given', () => {
    const container = document.createElement('div')
    document.body.append(container)

    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal container={container}>
          <PopoverContent>Content</PopoverContent>
        </PopoverPortal>
      </Popover>,
    )

    expect(container.contains(screen.getByText('Content'))).toBe(true)
    container.remove()
  })

  it('keeps a content kept mounted out of the page while the portal is closed', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent forceMount>Content</PopoverContent>
        </PopoverPortal>
      </Popover>,
    )

    expect(isOpen()).toBe(false)
  })
})

describe('Popover modal overrides', () => {
  it('leaves the page scrolling when lockScroll is false', async () => {
    await openPopover({ modal: true })
    await untilScrollLocked()
    cleanup()

    const { outside } = await openPopover({ modal: true, lockScroll: false })
    await wait(10)

    expect(scrolls(outside)).toBe(true)
  })

  it('lets a pinch zoom through its scroll lock', async () => {
    await openPopover({ modal: true })
    await untilScrollLocked()
    const content = screen.getByRole('dialog')
    // A wheel over a drag selection is let through, and jsdom leaves the selection on the page.
    window.getSelection()?.removeAllRanges()

    const wheel = fireEvent.wheel(content, { deltaY: 10 })
    // RemoveScroll holds each wheel's verdict for 1ms, and a wheel that matches it in that time takes it.
    await wait(5)
    const pinch = fireEvent.wheel(content, { deltaY: 10, ctrlKey: true })

    expect([wheel, pinch]).toEqual([false, true])
  })

  it('keeps focus inside', async () => {
    const { outside } = await openPopover({ modal: true })

    act(() => outside.focus())

    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true)
  })

  it('lets focus leave when trapFocus is false', async () => {
    const { outside } = await openPopover({ modal: true, trapFocus: false })

    act(() => outside.focus())

    expect(document.activeElement).toBe(outside)
  })

  it('leaves pointer events on outside when disableOutsidePointerEvents is false', async () => {
    await openPopover({ modal: true })
    const blocked = document.body.style.pointerEvents
    cleanup()

    await openPopover({ modal: true, disableOutsidePointerEvents: false })

    expect([blocked, document.body.style.pointerEvents]).toEqual(['none', ''])
  })
})

describe('Popover closing', () => {
  it('closes from a close button inside it', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          Pond rules
          <PopoverClose>Done</PopoverClose>
        </PopoverContent>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Done'))

    expect(screen.queryByText('Pond rules')).toBeNull()
  })

  it('keeps a modal popover open when focus is reported outside it while trapped', () => {
    render(
      <>
        <Popover defaultOpen modal>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Pond rules</PopoverContent>
        </Popover>
        <button type="button">Outside</button>
      </>,
    )

    fireEvent.focusOut(screen.getByText('Pond rules'))
    fireEvent.focusIn(screen.getByText('Outside'))

    expect(screen.queryByText('Pond rules')).not.toBeNull()
  })
})

describe('Popover title and description', () => {
  function renderTitled(content: React.ReactNode, contentProps: React.ComponentProps<typeof PopoverContent> = {}) {
    return render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent {...contentProps}>{content}</PopoverContent>
      </Popover>,
    )
  }

  it('lets an aria-labelledby or aria-describedby on the content win over the parts', () => {
    renderTitled(
      <>
        <PopoverTitle>Pond rules</PopoverTitle>
        <PopoverDescription>No diving</PopoverDescription>
      </>,
      { 'aria-labelledby': 'outside-label', 'aria-describedby': 'outside-description' },
    )

    expect(screen.getByRole('dialog').getAttribute('aria-labelledby')).toBe('outside-label')
    expect(screen.getByRole('dialog').getAttribute('aria-describedby')).toBe('outside-description')
  })

  it('points at the id a title or description was given', () => {
    renderTitled(
      <>
        <PopoverTitle id="pond-title">Pond rules</PopoverTitle>
        <PopoverDescription id="pond-description">No diving</PopoverDescription>
      </>,
    )

    expect(screen.getByRole('dialog').getAttribute('aria-labelledby')).toBe('pond-title')
    expect(screen.getByRole('dialog').getAttribute('aria-describedby')).toBe('pond-description')
  })

  it('stops pointing at a title or description once it unmounts', () => {
    const { rerender } = renderTitled(
      <>
        <PopoverTitle>Pond rules</PopoverTitle>
        <PopoverDescription>No diving</PopoverDescription>
      </>,
    )

    rerender(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Pond rules</PopoverContent>
      </Popover>,
    )

    expect(screen.getByRole('dialog').hasAttribute('aria-labelledby')).toBe(false)
    expect(screen.getByRole('dialog').hasAttribute('aria-describedby')).toBe(false)
  })
})

describe('Popover modal content ref', () => {
  it('attaches a ref callback once across renders', () => {
    const attached: (HTMLDivElement | null)[] = []
    const onRef = (node: HTMLDivElement | null) => {
      attached.push(node)
    }
    const view = (label: string) => (
      <Popover defaultOpen modal>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent ref={onRef}>{label}</PopoverContent>
      </Popover>
    )
    const { rerender } = render(view('Pond rules'))

    rerender(view('Pond rules, updated'))

    expect(attached).toHaveLength(1)
    expect(attached[0]).toBe(screen.getByRole('dialog'))
  })
})

describe('Popover non-modal content props', () => {
  it('keeps the modal-only lockScroll off the element', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent lockScroll>Pond rules</PopoverContent>
        </Popover>,
      )

      expect(error.mock.calls.some((call) => call.includes('lockScroll'))).toBe(false)
    } finally {
      error.mockRestore()
    }
  })
})

describe('Popover inside a scroll lock', () => {
  function Stray() {
    return <div data-testid="stray" ref={scrollable} />
  }

  it('scrolls when it is portalled out of a modal dialog', async () => {
    render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
            <Popover>
              <PopoverTrigger>Open</PopoverTrigger>
              <PopoverPortal>
                <PopoverContent data-testid="popover" ref={scrollable}>
                  Content
                </PopoverContent>
              </PopoverPortal>
            </Popover>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    )
    fireEvent.click(screen.getByText('Open'))
    await untilScrollLocked()

    expect(scrolls(screen.getByTestId('popover'))).toBe(true)
  })

  it('lets a popover portalled out of a modal one scroll, and nothing else', async () => {
    render(
      <>
        <Stray />
        <Popover modal>
          <PopoverTrigger>Outer</PopoverTrigger>
          <PopoverContent>
            <Popover>
              <PopoverTrigger>Inner</PopoverTrigger>
              <PopoverPortal>
                <PopoverContent data-testid="inner" ref={scrollable}>
                  Content
                </PopoverContent>
              </PopoverPortal>
            </Popover>
          </PopoverContent>
        </Popover>
      </>,
    )
    fireEvent.click(screen.getByText('Outer'))
    await wait(0)
    fireEvent.click(screen.getByText('Inner'))
    await untilScrollLocked()

    expect(scrolls(screen.getByTestId('inner'))).toBe(true)
    expect(scrolls(screen.getByTestId('stray'))).toBe(false)
  })
})

describe('Popover modal focus trap', () => {
  function Branch() {
    const [node, setNode] = React.useState<HTMLElement | null>(null)
    useFocusScopeBranch(node)
    return ReactDOM.createPortal(
      <div ref={setNode}>
        <button type="button">Branch</button>
      </div>,
      document.body,
    )
  }

  it('leaves a branch portalled out of it to screen readers', async () => {
    render(
      <Popover modal>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <button type="button">Inside</button>
          <Branch />
        </PopoverContent>
      </Popover>,
    )
    fireEvent.click(screen.getByText('Open'))
    await wait(0)

    expect(screen.getByText('Branch').closest('[aria-hidden="true"]')).toBeNull()
  })

  it('lets focus into a branch portalled out of it', async () => {
    render(
      <Popover modal>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <button type="button">Inside</button>
          <Branch />
        </PopoverContent>
      </Popover>,
    )
    fireEvent.click(screen.getByText('Open'))
    await wait(0)

    act(() => screen.getByText('Branch').focus())

    expect(document.activeElement).toBe(screen.getByText('Branch'))
  })
})

describe('Popover kept mounted', () => {
  it('hides the page from a screen reader only while a modal one is open', async () => {
    const { trigger, outside } = await openPopover({ modal: true, forceMount: true })
    const hidden = () => outside.closest('[aria-hidden="true"]') !== null

    const whileOpen = hidden()
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect([whileOpen, trigger.getAttribute('aria-expanded'), hidden()]).toEqual([true, 'false', false])
  })
})

describe('Popover giving the page back on close', () => {
  it('removes a modal content before it gives the page back its pointer events', () => {
    renderPopover({ defaultOpen: true, modal: true })

    const changes = pageChangesOnClose(screen.getByRole('dialog'), () =>
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' }),
    )

    expect(changes[0]).toBe('content removed')
    expect(changes).toContain('body style')
  })
})

describe('Popover focus targets', () => {
  function Focused({ modal, ...contentProps }: { modal: boolean } & React.ComponentProps<typeof PopoverContent>) {
    return (
      <>
        <Popover modal={modal}>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent {...contentProps}>
            <button type="button">First</button>
            <input aria-label="Name" />
          </PopoverContent>
        </Popover>
        <input aria-label="Search" />
      </>
    )
  }

  async function open(props: { modal: boolean } & React.ComponentProps<typeof PopoverContent>) {
    render(<Focused {...props} />)
    act(() => screen.getByText('Open').focus())
    fireEvent.click(screen.getByText('Open'))
    await wait(0)
  }

  async function close() {
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)
  }

  const nameField = {
    get current() {
      return screen.queryByLabelText<HTMLInputElement>('Name')
    },
  }
  const searchField = {
    get current() {
      return screen.queryByLabelText<HTMLInputElement>('Search')
    },
  }

  it('focuses the element initialFocus names on open rather than the first one', async () => {
    for (const modal of [true, false]) {
      await open({ modal, initialFocus: nameField })

      expect(document.activeElement).toBe(screen.getByLabelText('Name'))
      cleanup()
    }
  })

  it('leaves focus on the trigger when initialFocus is false', async () => {
    for (const modal of [true, false]) {
      await open({ modal, initialFocus: false })

      expect(document.activeElement).toBe(screen.getByText('Open'))
      cleanup()
    }
  })

  it('focuses the element finalFocus names on close rather than the trigger', async () => {
    for (const modal of [true, false]) {
      await open({ modal, finalFocus: searchField })

      await close()

      expect(document.activeElement).toBe(screen.getByLabelText('Search'))
      cleanup()
    }
  })

  it('moves focus nowhere on close when finalFocus is false', async () => {
    for (const modal of [true, false]) {
      await open({ modal, finalFocus: false })

      await close()

      expect(document.activeElement).toBe(document.body)
      cleanup()
    }
  })

  it('lets an auto focus handler that prevents the default win over the targets', async () => {
    await open({
      modal: true,
      initialFocus: nameField,
      finalFocus: searchField,
      onOpenAutoFocus: (event) => event.preventDefault(),
      onCloseAutoFocus: (event) => event.preventDefault(),
    })
    expect(document.activeElement).toBe(screen.getByText('Open'))

    await close()

    expect(document.activeElement).toBe(screen.getByText('Open'))
  })
})
