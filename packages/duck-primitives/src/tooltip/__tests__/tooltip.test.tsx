import { afterEach, beforeEach, describe, expect, it, mock, vi } from 'bun:test'
import { act, createEvent, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { freshDom, scrollable, scrolls, untilScrollLocked, wait } from '../../__tests__/dom'
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '../../dialog'
import { DirectionProvider } from '../../direction'
import { Toggle } from '../../toggle'
import {
  createTooltipScope,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '../index'

freshDom()

function renderTooltip(props: Record<string, unknown> = {}, triggerProps: Record<string, unknown> = {}) {
  return render(
    <TooltipProvider delayDuration={0}>
      <Tooltip {...props}>
        <TooltipTrigger {...triggerProps}>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  )
}

describe('Tooltip', () => {
  // --- Trigger ---

  it('renders trigger with data-slot="tooltip-trigger"', () => {
    const { container } = renderTooltip()
    expect(container.querySelector('[data-slot="tooltip-trigger"]')).not.toBeNull()
  })

  it('trigger has data-state="closed" when closed', () => {
    const { container } = renderTooltip()
    const trigger = container.querySelector('[data-slot="tooltip-trigger"]')!
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })

  it('trigger does not have aria-describedby when closed', () => {
    const { container } = renderTooltip()
    const trigger = container.querySelector('[data-slot="tooltip-trigger"]')!
    expect(trigger.getAttribute('aria-describedby')).toBeNull()
  })

  // --- Open/Close ---

  it('closes on blur', () => {
    const { container } = renderTooltip({ defaultOpen: true })
    const trigger = container.querySelector('[data-slot="tooltip-trigger"]')!
    fireEvent.blur(trigger)
    // After blur, state should transition to closed
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })

  // --- Controlled ---

  it('respects open prop (controlled)', () => {
    const { container } = renderTooltip({ open: true })
    const trigger = container.querySelector('[data-slot="tooltip-trigger"]')!
    expect(trigger.getAttribute('aria-describedby')).toBeTruthy()
  })

  // --- disableCloseOnClick ---

  it('trigger with disableCloseOnClick uses data-tooltip-state instead of data-slot="tooltip-trigger"', () => {
    const { container } = renderTooltip({}, { disableCloseOnClick: true })
    expect(container.querySelector('[data-slot="tooltip-trigger"]')).toBeNull()
    expect(container.querySelector('[data-tooltip-state]')).not.toBeNull()
  })

  it("leaves an asChild child's own data-state and data-slot alone under disableCloseOnClick", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild disableCloseOnClick>
            <Toggle>Bold</Toggle>
          </TooltipTrigger>
          <TooltipContent>Makes the text bold</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    const toggle = screen.getByRole('button', { name: 'Bold' })

    fireEvent.click(toggle)

    expect([toggle.getAttribute('data-state'), toggle.getAttribute('data-slot')]).toEqual(['on', 'toggle'])
    expect(toggle.getAttribute('data-tooltip-state')).toBe('closed')
  })

  it("names the popper's measurements under the tooltip's own variables, beside the style it was given", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent style={{ color: 'teal' }}>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    const { style } = content() as HTMLElement
    expect(style.color).toBe('teal')
    expect(
      [
        '--gentleduck-tooltip-content-transform-origin',
        '--gentleduck-tooltip-content-available-width',
        '--gentleduck-tooltip-content-available-height',
        '--gentleduck-tooltip-trigger-width',
        '--gentleduck-tooltip-trigger-height',
      ].map((name) => style.getPropertyValue(name)),
    ).toEqual([
      'var(--gentleduck-popper-transform-origin)',
      'var(--gentleduck-popper-available-width)',
      'var(--gentleduck-popper-available-height)',
      'var(--gentleduck-popper-anchor-width)',
      'var(--gentleduck-popper-anchor-height)',
    ])
  })

  it('keeps the click handler it was given, and stays open on a click when told to', () => {
    const onClick = mock()
    const onOpenChange = mock()
    renderTooltip({ onOpenChange, open: true }, { disableCloseOnClick: true, onClick })

    fireEvent.click(screen.getByText('Hover me'))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  // --- Provider ---

  it('TooltipProvider renders children', () => {
    const { container } = render(
      <TooltipProvider>
        <span data-testid="child">content</span>
      </TooltipProvider>,
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  // --- Additional hardening ---

  it('trigger renders as a button', () => {
    const { container } = renderTooltip()
    const trigger = container.querySelector('[data-slot="tooltip-trigger"]')!
    expect(trigger.tagName.toLowerCase()).toBe('button')
  })

  it('trigger passes className', () => {
    const { container } = renderTooltip({}, { className: 'my-tooltip-trigger' })
    expect(container.querySelector('.my-tooltip-trigger')).not.toBeNull()
  })

  it('multiple tooltips can coexist', () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>First</TooltipTrigger>
          <TooltipContent>Tooltip 1</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>Second</TooltipTrigger>
          <TooltipContent>Tooltip 2</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    const triggers = container.querySelectorAll('[data-slot="tooltip-trigger"]')
    expect(triggers.length).toBe(2)
    expect(triggers[0]!.textContent).toBe('First')
    expect(triggers[1]!.textContent).toBe('Second')
  })

  it('a press on a trigger with disableCloseOnClick keeps it open, pointer down and up included', async () => {
    const onOpenChange = mock(() => {})
    renderTooltip({ defaultOpen: true, onOpenChange }, { disableCloseOnClick: true })
    await wait(10)
    const trigger = screen.getByText('Hover me')

    fireEvent.pointerDown(trigger)
    fireEvent.pointerUp(trigger)
    fireEvent.click(trigger)
    await wait(10)

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole('tooltip').textContent).toBe('Tooltip text')
  })

  it('a press on a trigger without disableCloseOnClick closes it once', async () => {
    const onOpenChange = mock(() => {})
    renderTooltip({ defaultOpen: true, onOpenChange })
    await wait(10)
    const trigger = screen.getByText('Hover me')

    fireEvent.pointerDown(trigger)
    fireEvent.pointerUp(trigger)
    fireEvent.click(trigger)
    await wait(10)

    expect(onOpenChange.mock.calls).toEqual([[false]])
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('opened with no trigger mounted, it still closes on a press outside', async () => {
    const onOpenChange = mock(() => {})
    render(
      <TooltipProvider>
        <Tooltip onOpenChange={onOpenChange} open>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
        <button type="button">Elsewhere</button>
      </TooltipProvider>,
    )
    await wait(10)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Elsewhere' }))

    expect(onOpenChange.mock.calls).toEqual([[false]])
  })

  it('trigger without disableCloseOnClick closes on click', () => {
    const onOpenChange = mock(() => {})
    const { container } = renderTooltip({ open: true, onOpenChange })
    fireEvent.click(container.querySelector('[data-slot="tooltip-trigger"]')!)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('portaled content inherits dir from DirectionProvider', () => {
    const { baseElement, unmount } = render(
      <DirectionProvider dir="rtl">
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent data-testid="dir-content">Tooltip text</TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      </DirectionProvider>,
    )
    expect(baseElement.querySelector('[data-testid="dir-content"]')?.getAttribute('dir')).toBe('rtl')
    unmount()
  })

  it('puts a dir given to the root on the content and leaves the trigger to the page', () => {
    renderTooltip({ dir: 'rtl', open: true })

    expect(screen.getByText('Hover me').hasAttribute('dir')).toBe(false)
    expect(screen.getByRole('tooltip').getAttribute('dir')).toBe('rtl')
  })

  it('gives the content the direction of <html dir> when nothing else sets one', () => {
    document.documentElement.dir = 'rtl'
    try {
      renderTooltip({ open: true })

      expect(screen.getByRole('tooltip').getAttribute('dir')).toBe('rtl')
    } finally {
      document.documentElement.dir = ''
    }
  })

  it('scrolls when it is portalled out of a modal dialog', async () => {
    render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
            <TooltipProvider>
              <Tooltip open>
                <TooltipTrigger>Hover me</TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent data-testid="tooltip" ref={scrollable}>
                    Tooltip text
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    )
    await untilScrollLocked()

    expect(scrolls(screen.getByTestId('tooltip'))).toBe(true)
  })
})

function renderHoverTooltip({
  delayDuration = 0,
  onOpenChange = mock(),
  ...props
}: React.ComponentProps<typeof Tooltip> & { delayDuration?: number } = {}) {
  const view = render(
    <TooltipProvider delayDuration={delayDuration}>
      <div data-testid="scroller">
        <Tooltip onOpenChange={onOpenChange} {...props}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>,
  )
  return { ...view, onOpenChange, trigger: screen.getByText('Hover me') }
}

const content = () => document.querySelector('[data-slot="tooltip-content"]')

// From the document: jsdom takes a key sent from the element focus leaves as focus-visible only if that element was.
function tabTo(element: HTMLElement) {
  fireEvent.keyDown(document, { key: 'Tab' })
  act(() => element.focus())
}

// jsdom lays nothing out, so each element is given the box a browser would: the trigger above, the content below.
function layOut(trigger: HTMLElement) {
  trigger.getBoundingClientRect = () => new DOMRect(0, 0, 100, 20)
  for (const node of document.querySelectorAll<HTMLElement>('[data-slot="tooltip-content"]')) {
    node.getBoundingClientRect = () => new DOMRect(0, 30, 100, 40)
  }
}

async function openAndLayOut(props: React.ComponentProps<typeof Tooltip> = {}) {
  const view = renderHoverTooltip({ defaultOpen: true, ...props })
  await wait(0)
  layOut(view.trigger)
  return view
}

async function openAndLeaveTrigger(props: React.ComponentProps<typeof Tooltip> = {}) {
  const view = await openAndLayOut(props)
  fireEvent.pointerLeave(view.trigger, { clientX: 50, clientY: 20 })
  return view
}

describe('Tooltip grace area', () => {
  it('stays open while the pointer crosses the gap from the trigger to the content', async () => {
    const { onOpenChange } = await openAndLeaveTrigger()

    fireEvent.pointerMove(document.body, { clientX: 50, clientY: 25 })

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(content()).not.toBeNull()
  })

  it('closes once the pointer strays outside the area between the trigger and the content', async () => {
    const { onOpenChange } = await openAndLeaveTrigger()

    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 300 })

    expect(onOpenChange.mock.calls).toEqual([[false]])
  })

  it('drops the grace area once the pointer reaches the content', async () => {
    const { onOpenChange } = await openAndLeaveTrigger()

    fireEvent.pointerMove(content() as HTMLElement, { clientX: 50, clientY: 40 })
    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 300 })

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes a tooltip a hover opened once the pointer strays outside the area', async () => {
    const view = renderHoverTooltip({ delayDuration: 10 })
    fireEvent.pointerMove(view.trigger, { pointerType: 'mouse' })
    await wait(30)
    layOut(view.trigger)

    fireEvent.pointerLeave(view.trigger, { clientX: 50, clientY: 20 })
    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 300 })
    await wait(0)

    expect(view.onOpenChange.mock.calls).toEqual([[true], [false]])
    expect(content()).toBeNull()
  })

  it('closes on the move that takes the pointer off the trigger and out of the area at once', async () => {
    const view = await openAndLayOut()

    // A browser sends the leave and the move it came with in one task, before React runs an effect.
    act(() => {
      view.trigger.dispatchEvent(createEvent.pointerOut(view.trigger, { clientX: 50, clientY: 20 }))
      view.trigger.dispatchEvent(createEvent.pointerLeave(view.trigger, { clientX: 50, clientY: 20 }))
      document.body.dispatchEvent(createEvent.pointerMove(document.body, { clientX: 300, clientY: 300 }))
    })

    expect(view.onOpenChange.mock.calls).toEqual([[false]])
  })

  it('opens the next trigger in the provider on the move that reaches it', async () => {
    const onOpenChange = mock()
    render(
      <TooltipProvider delayDuration={10}>
        <Tooltip onOpenChange={onOpenChange}>
          <TooltipTrigger>Bold</TooltipTrigger>
          <TooltipContent>Makes the text bold</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>Italic</TooltipTrigger>
          <TooltipContent>Slants the text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    const bold = screen.getByText('Bold')
    const italic = screen.getByText('Italic')
    fireEvent.pointerMove(bold, { pointerType: 'mouse' })
    await wait(30)
    layOut(bold)
    italic.getBoundingClientRect = () => new DOMRect(110, 0, 100, 20)

    act(() => {
      bold.dispatchEvent(createEvent.pointerOut(bold, { clientX: 100, clientY: 10 }))
      bold.dispatchEvent(createEvent.pointerLeave(bold, { clientX: 100, clientY: 10 }))
      italic.dispatchEvent(createEvent.pointerMove(italic, { clientX: 120, clientY: 10, pointerType: 'mouse' }))
    })

    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
    expect(italic.getAttribute('data-state')).toBe('instant-open')
  })

  it('builds a grace area back to the trigger when the pointer leaves the content', async () => {
    const view = renderHoverTooltip({ defaultOpen: true })
    await wait(0)
    layOut(view.trigger)

    fireEvent.pointerLeave(content() as HTMLElement, { clientX: 50, clientY: 30 })
    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 300 })

    expect(view.onOpenChange.mock.calls).toEqual([[false]])
  })

  it('drops the grace area once the pointer comes back onto the trigger', async () => {
    const { trigger, onOpenChange } = await openAndLeaveTrigger()

    fireEvent.pointerMove(trigger, { clientX: 50, clientY: 10 })
    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 300 })

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('keeps one grace area when the pointer leaves the trigger twice', async () => {
    const { trigger, onOpenChange } = await openAndLeaveTrigger()

    fireEvent.pointerLeave(trigger, { clientX: 50, clientY: 20 })
    fireEvent.pointerMove(content() as HTMLElement, { clientX: 50, clientY: 40 })
    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 300 })

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('leaves a trigger the pointer crosses on its way to the content closed', async () => {
    const { bold, italic } = await renderOpenPair()

    fireEvent.pointerLeave(bold, { clientX: 50, clientY: 20 })
    crossGap(italic)
    await wait(10)

    expect(italic.getAttribute('data-state')).toBe('closed')
  })

  it('ends the crossing when the content closes under it, so the next trigger opens', async () => {
    const { bold, italic } = await renderOpenPair()

    fireEvent.pointerLeave(bold, { clientX: 50, clientY: 20 })
    fireEvent.keyDown(document, { key: 'Escape' })
    crossGap(italic)
    await wait(10)

    expect(italic.getAttribute('data-state')).toBe('delayed-open')
  })

  it('starts no crossing from its trigger once its content has closed', async () => {
    const { bold, italic } = await renderOpenPair()

    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.pointerLeave(bold, { clientX: 50, clientY: 20 })
    crossGap(italic)
    await wait(10)

    expect(italic.getAttribute('data-state')).toBe('delayed-open')
  })

  it('starts no crossing from its content once its trigger is gone', async () => {
    const onOpenChange = mock()
    const page = (withTrigger: boolean) => (
      <TooltipProvider delayDuration={0}>
        <Tooltip defaultOpen onOpenChange={onOpenChange}>
          {withTrigger ? <TooltipTrigger>Hover me</TooltipTrigger> : null}
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const view = render(page(true))
    await wait(0)
    layOut(screen.getByText('Hover me'))

    view.rerender(page(false))
    fireEvent.pointerLeave(content() as HTMLElement, { clientX: 50, clientY: 30 })
    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 300 })

    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

async function renderOpenPair() {
  render(
    <TooltipProvider delayDuration={0}>
      <Tooltip defaultOpen>
        <TooltipTrigger>Bold</TooltipTrigger>
        <TooltipContent>Makes the text bold</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>Italic</TooltipTrigger>
        <TooltipContent>Slants the text</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  )
  await wait(0)
  const bold = screen.getByText('Bold')
  layOut(bold)
  return { bold, italic: screen.getByText('Italic') }
}

// A move over the second trigger at a point in the gap between the first trigger and its content.
function crossGap(italic: HTMLElement) {
  fireEvent.pointerMove(italic, { clientX: 50, clientY: 25, pointerType: 'mouse' })
}

describe('Tooltip trigger', () => {
  it('closes when the trigger is clicked down on while open', async () => {
    const { trigger, onOpenChange } = renderHoverTooltip({ defaultOpen: true })

    fireEvent.pointerDown(trigger)

    expect(onOpenChange.mock.calls).toEqual([[false]])
  })

  it('opens for a mouse moving over it and not for a finger', async () => {
    const { trigger, onOpenChange } = renderHoverTooltip()

    fireEvent.pointerMove(trigger, { pointerType: 'touch' })
    await wait(10)
    const afterTouch = onOpenChange.mock.calls.length
    fireEvent.pointerMove(trigger, { pointerType: 'mouse' })
    await wait(10)

    expect([afterTouch, onOpenChange.mock.calls]).toEqual([0, [[true]]])
  })

  it('closes when another tooltip opens', () => {
    const onOpenChange = mock()
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip defaultOpen onOpenChange={onOpenChange}>
          <TooltipTrigger>First</TooltipTrigger>
          <TooltipContent>First tip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>Second</TooltipTrigger>
          <TooltipContent>Second tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    tabTo(screen.getByText('Second'))

    expect([onOpenChange.mock.calls, screen.queryAllByText('Second tip').length > 0]).toEqual([[[false]], true])
  })

  it('opens on keyboard focus', () => {
    const { trigger, onOpenChange } = renderHoverTooltip()

    tabTo(trigger)

    expect(onOpenChange.mock.calls).toEqual([[true]])
  })

  it('closes on leaving the trigger when the content is not hoverable', () => {
    const { trigger, onOpenChange } = renderHoverTooltip({ defaultOpen: true, disableHoverableContent: true })

    fireEvent.pointerLeave(trigger)

    expect(onOpenChange.mock.calls).toEqual([[false]])
  })

  it('cancels a pending delayed open when the pointer leaves first', async () => {
    const { trigger, onOpenChange } = renderHoverTooltip({ delayDuration: 20 })

    fireEvent.pointerMove(trigger)
    fireEvent.pointerLeave(trigger)
    await wait(40)

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('cancels a pending delayed open when the tooltip unmounts', async () => {
    const { trigger, onOpenChange, unmount } = renderHoverTooltip({ delayDuration: 20 })

    fireEvent.pointerMove(trigger)
    unmount()
    await wait(40)

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('does not open on hover or focus while disabled', async () => {
    const { trigger, onOpenChange } = renderHoverTooltip({ disabled: true })

    fireEvent.pointerMove(trigger)
    tabTo(trigger)
    await wait(10)

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(content()).toBeNull()
  })

  it('closes once it is disabled while open', () => {
    const onOpenChange = mock()
    const { rerender } = render(
      <TooltipProvider>
        <Tooltip defaultOpen onOpenChange={onOpenChange}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    rerender(
      <TooltipProvider>
        <Tooltip defaultOpen onOpenChange={onOpenChange} disabled>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(onOpenChange.mock.calls).toEqual([[false]])
    expect(content()).toBeNull()
  })

  it('stays closed while disabled, though its parent holds it open', () => {
    renderHoverTooltip({ open: true, disabled: true })

    expect([content(), screen.getByText('Hover me').hasAttribute('aria-describedby')]).toEqual([null, false])
  })

  it('opens for the next move over its trigger once it is enabled again', async () => {
    const onOpenChange = mock()
    const tooltip = (disabled: boolean) => (
      <TooltipProvider delayDuration={0}>
        <Tooltip onOpenChange={onOpenChange} disabled={disabled}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const { rerender } = render(tooltip(true))
    const trigger = screen.getByText('Hover me')
    fireEvent.pointerMove(trigger)

    rerender(tooltip(false))
    fireEvent.pointerMove(trigger)
    await wait(10)

    expect(onOpenChange.mock.calls).toEqual([[true]])
  })

  it('drops a delayed open that was pending when it was disabled', async () => {
    const onOpenChange = mock()
    const tooltip = (disabled: boolean) => (
      <TooltipProvider delayDuration={20}>
        <Tooltip onOpenChange={onOpenChange} disabled={disabled}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const { rerender } = render(tooltip(false))

    fireEvent.pointerMove(screen.getByText('Hover me'))
    rerender(tooltip(true))
    await wait(40)

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes when an ancestor of the trigger scrolls', async () => {
    const { onOpenChange } = renderHoverTooltip({ defaultOpen: true })

    fireEvent.scroll(screen.getByTestId('scroller'))

    expect(onOpenChange.mock.calls).toEqual([[false]])
  })
})

describe('Tooltip close delay', () => {
  it('waits the close delay before closing when the pointer leaves a trigger whose content is not hoverable', async () => {
    const { trigger, onOpenChange } = renderHoverTooltip({
      closeDelay: 20,
      defaultOpen: true,
      disableHoverableContent: true,
    })

    fireEvent.pointerLeave(trigger)
    expect(onOpenChange).not.toHaveBeenCalled()

    await wait(40)
    expect(onOpenChange.mock.calls).toEqual([[false]])
  })

  it('stays open when the pointer comes back to the trigger within the close delay', async () => {
    const { trigger, onOpenChange } = renderHoverTooltip({ closeDelay: 20, disableHoverableContent: true })
    fireEvent.pointerMove(trigger)
    await wait(0)

    fireEvent.pointerLeave(trigger)
    fireEvent.pointerMove(trigger)
    await wait(40)

    expect(onOpenChange.mock.calls).toEqual([[true]])
  })

  it('drops a pending open when the pointer leaves before it, whatever the close delay', async () => {
    const { trigger, onOpenChange } = renderHoverTooltip({
      closeDelay: 5,
      delayDuration: 20,
      disableHoverableContent: true,
    })

    fireEvent.pointerMove(trigger)
    fireEvent.pointerLeave(trigger)
    await wait(40)

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('waits the close delay once the pointer strays outside the grace area', async () => {
    const { onOpenChange } = await openAndLeaveTrigger({ closeDelay: 20 })

    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 300 })
    expect(onOpenChange).not.toHaveBeenCalled()

    await wait(40)
    expect(onOpenChange.mock.calls).toEqual([[false]])
  })

  it('stays open when the pointer reaches the content within the close delay', async () => {
    const { onOpenChange } = await openAndLeaveTrigger({ closeDelay: 20 })

    fireEvent.pointerMove(document.body, { clientX: 300, clientY: 300 })
    fireEvent.pointerEnter(content() as HTMLElement)
    await wait(40)

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes at once on a press, whatever the close delay', () => {
    const { trigger, onOpenChange } = renderHoverTooltip({ closeDelay: 1000, defaultOpen: true })

    fireEvent.pointerDown(trigger)

    expect(onOpenChange.mock.calls).toEqual([[false]])
  })

  it('drops a pending close when the tooltip unmounts', async () => {
    const { trigger, onOpenChange, unmount } = renderHoverTooltip({
      closeDelay: 20,
      disableHoverableContent: true,
      open: true,
    })

    fireEvent.pointerLeave(trigger)
    unmount()
    await wait(40)

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("takes the close delay from its provider, and its own over the provider's", async () => {
    const onOpenChange = mock()
    const tooltip = (closeDelay?: number) => (
      <TooltipProvider closeDelay={20} delayDuration={0} disableHoverableContent>
        <Tooltip closeDelay={closeDelay} defaultOpen onOpenChange={onOpenChange}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const { rerender } = render(tooltip())

    fireEvent.pointerLeave(screen.getByText('Hover me'))
    expect(onOpenChange).not.toHaveBeenCalled()
    await wait(40)
    expect(onOpenChange.mock.calls).toEqual([[false]])

    onOpenChange.mockClear()
    rerender(tooltip(0))
    tabTo(screen.getByText('Hover me'))
    fireEvent.pointerLeave(screen.getByText('Hover me'))
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })
})

function renderPondTooltip(props: React.ComponentProps<typeof Tooltip> = {}) {
  render(
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip {...props}>
          <TooltipTrigger>Pond</TooltipTrigger>
          <TooltipContent>Ducks only</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <button type="button">Outside</button>
    </>,
  )
}

const isOpen = () => screen.queryAllByText('Ducks only').length > 0

describe('Tooltip focus after a press', () => {
  // A text field matches :focus-visible however it was focused, a press included.
  it('opens on no focus a press gives its text field trigger, and on a later focus no input led to', () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <input aria-label="Pond" />
          </TooltipTrigger>
          <TooltipContent>Ducks only</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    const field = screen.getByLabelText('Pond')

    fireEvent.pointerDown(field)
    act(() => field.focus())
    expect(isOpen()).toBe(false)

    act(() => field.blur())
    act(() => field.focus())
    expect(isOpen()).toBe(true)
  })

  it('stays open when focus moves outside its content', () => {
    renderPondTooltip({ defaultOpen: true })

    act(() => screen.getByText('Outside').focus())

    expect(isOpen()).toBe(true)
  })

  it('stays open when something that does not hold its trigger scrolls', () => {
    renderPondTooltip({ defaultOpen: true })

    fireEvent.scroll(screen.getByText('Outside'))

    expect(isOpen()).toBe(true)
  })

  it('hears a press whose propagation something stopped', () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <input aria-label="Pond" onPointerDown={(event) => event.stopPropagation()} />
          </TooltipTrigger>
          <TooltipContent>Ducks only</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    const field = screen.getByLabelText('Pond')

    fireEvent.keyDown(document, { key: 'Tab' })
    fireEvent.pointerDown(field)
    act(() => field.focus())

    expect(isOpen()).toBe(false)
  })

  it('hears a press in the document its trigger is in, an iframe included', () => {
    const frame = document.body.appendChild(document.createElement('iframe'))
    const frameDocument = frame.contentDocument as Document
    const host = frameDocument.body.appendChild(frameDocument.createElement('div'))
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <input aria-label="Pond" />
          </TooltipTrigger>
          <TooltipContent>Ducks only</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
      { container: host },
    )
    const field = host.querySelector('input') as HTMLInputElement

    fireEvent.keyDown(document, { key: 'Tab' })
    fireEvent.pointerDown(field)
    act(() => field.focus())

    expect(field.getAttribute('data-state')).toBe('closed')
    frame.remove()
  })
})

describe('Tooltip delays', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const pass = (ms: number) => act(() => void vi.advanceTimersByTime(ms))
  const hover = (trigger: HTMLElement) => fireEvent.pointerMove(trigger, { pointerType: 'mouse' })
  // A tooltip opens once per hover, so the pointer leaves before it comes back.
  const hoverAgain = (trigger: HTMLElement) => {
    fireEvent.pointerLeave(trigger)
    hover(trigger)
  }
  const state = (trigger: HTMLElement) => trigger.getAttribute('data-state')

  function renderOne(provider: Omit<React.ComponentProps<typeof TooltipProvider>, 'children'>, root = {}) {
    const onOpenChange = mock()
    render(
      <TooltipProvider {...provider}>
        <div data-testid="scroller">
          <Tooltip onOpenChange={onOpenChange} {...root}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>,
    )
    return { onOpenChange, trigger: screen.getByText('Hover me') }
  }

  function renderTwo() {
    render(
      <TooltipProvider delayDuration={100} skipDelayDuration={300}>
        <Tooltip>
          <TooltipTrigger>Bold</TooltipTrigger>
          <TooltipContent>Makes the text bold</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>Italic</TooltipTrigger>
          <TooltipContent>Slants the text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    return { bold: screen.getByText('Bold'), italic: screen.getByText('Italic') }
  }

  it('waits 700ms before opening by default', () => {
    const { trigger } = renderOne({})

    hover(trigger)
    pass(699)
    const before = state(trigger)
    pass(1)

    expect([before, state(trigger)]).toEqual(['closed', 'delayed-open'])
  })

  it("takes its own delay over the provider's", () => {
    const { trigger } = renderOne({ delayDuration: 500 }, { delayDuration: 100 })

    hover(trigger)
    pass(100)

    expect(state(trigger)).toBe('delayed-open')
  })

  it('opens at once within the skip delay after it closes, and waits again once that has passed', () => {
    const { trigger } = renderOne({ delayDuration: 100, skipDelayDuration: 300 })
    const states = []

    hover(trigger)
    pass(100)
    states.push(state(trigger))
    fireEvent.click(trigger)
    pass(299)
    hoverAgain(trigger)
    states.push(state(trigger))
    fireEvent.click(trigger)
    pass(300)
    hoverAgain(trigger)
    states.push(state(trigger))
    pass(100)
    states.push(state(trigger))

    expect(states).toEqual(['delayed-open', 'instant-open', 'closed', 'delayed-open'])
  })

  it('waits again once the skip delay is turned off while a tooltip is open', () => {
    const page = (skipDelayDuration: number) => (
      <TooltipProvider delayDuration={100} skipDelayDuration={skipDelayDuration}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const view = render(page(300))
    const trigger = screen.getByText('Hover me')

    hover(trigger)
    pass(100)
    view.rerender(page(0))
    fireEvent.click(trigger)
    pass(1)
    hoverAgain(trigger)
    const before = state(trigger)
    pass(100)

    expect([before, state(trigger)]).toEqual(['closed', 'delayed-open'])
  })

  it('keeps skipping the delay while a tooltip it opened at once is showing', () => {
    const { bold, italic } = renderTwo()

    hover(bold)
    pass(100)
    fireEvent.click(bold)
    pass(100)
    hover(italic)
    const italicOpened = state(italic)
    pass(250)
    fireEvent.click(italic)
    hoverAgain(bold)

    expect([italicOpened, state(bold)]).toEqual(['instant-open', 'instant-open'])
  })

  it('counts the skip delay from the last tooltip to close', () => {
    const { bold, italic } = renderTwo()

    hover(bold)
    pass(100)
    tabTo(italic)
    pass(200)
    act(() => italic.blur())
    pass(150)
    hoverAgain(bold)

    expect(state(bold)).toBe('instant-open')
  })

  it('stays closed after a click until the pointer leaves the trigger and comes back', () => {
    const { trigger, onOpenChange } = renderOne({ delayDuration: 100 })

    hover(trigger)
    pass(100)
    fireEvent.click(trigger)
    hover(trigger)
    pass(100)

    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  it('stays open when the pointer comes back within the close delay and the open waits again', () => {
    const { trigger, onOpenChange } = renderOne({
      delayDuration: 100,
      closeDelay: 50,
      skipDelayDuration: 0,
      disableHoverableContent: true,
    })

    hover(trigger)
    pass(100)
    fireEvent.pointerLeave(trigger)
    pass(10)
    hover(trigger)
    pass(200)

    expect(onOpenChange.mock.calls).toEqual([[true]])
  })

  it('closes after its close delay with the pointer on content that is not hoverable', () => {
    const { trigger, onOpenChange } = renderOne(
      { delayDuration: 0, closeDelay: 50, disableHoverableContent: true },
      { defaultOpen: true },
    )

    fireEvent.pointerLeave(trigger)
    fireEvent.pointerEnter(content() as HTMLElement)
    pass(50)

    expect(onOpenChange.mock.calls).toEqual([[false]])
  })

  it('stays open each time it opens with an id given to its content', () => {
    const onOpenChange = mock()
    render(
      <TooltipProvider delayDuration={100}>
        <Tooltip onOpenChange={onOpenChange}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent id="pond-tip">Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    const trigger = screen.getByText('Hover me')

    hover(trigger)
    pass(100)
    fireEvent.click(trigger)
    hoverAgain(trigger)

    expect([onOpenChange.mock.calls, trigger.getAttribute('aria-describedby')]).toEqual([
      [[true], [false], [true]],
      'pond-tip',
    ])
  })

  it('names the id a content given through asChild keeps for its own', () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent asChild>
            <p id="pond-tip">Tooltip text</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect([
      screen.getByText('Hover me').getAttribute('aria-describedby'),
      document.getElementById('pond-tip')?.getAttribute('role'),
    ]).toEqual(['pond-tip', 'tooltip'])
  })

  it('stops hearing scrolls once it closes, so a scroll leaves the next delayed open alone', () => {
    const { trigger, onOpenChange } = renderOne({ delayDuration: 20, skipDelayDuration: 0 }, { defaultOpen: true })

    fireEvent.click(trigger)
    hover(trigger)
    fireEvent.scroll(screen.getByTestId('scroller'))
    pass(20)

    expect(onOpenChange.mock.calls).toEqual([[false], [true]])
  })
})

describe('Tooltip parts', () => {
  it("runs the trigger's own pointer, focus and blur handlers", () => {
    const handlers = {
      onPointerMove: mock(),
      onPointerLeave: mock(),
      onPointerDown: mock(),
      onFocus: mock(),
      onBlur: mock(),
    }
    renderTooltip({}, handlers)
    const trigger = screen.getByText('Hover me')

    fireEvent.pointerMove(trigger)
    fireEvent.pointerLeave(trigger)
    fireEvent.pointerDown(trigger)
    fireEvent.focus(trigger)
    fireEvent.blur(trigger)

    expect(Object.values(handlers).map((handler) => handler.mock.calls.length)).toEqual([1, 1, 1, 1, 1])
  })

  it("runs the content's own pointer enter, outside press and escape handlers", async () => {
    const onPointerEnter = mock()
    const onPointerDownOutside = mock((event: Event) => event.preventDefault())
    const onEscapeKeyDown = mock()
    const onOpenChange = mock()
    render(
      <>
        <TooltipProvider>
          <Tooltip defaultOpen onOpenChange={onOpenChange}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent
              onEscapeKeyDown={onEscapeKeyDown}
              onPointerDownOutside={onPointerDownOutside}
              onPointerEnter={onPointerEnter}>
              Tooltip text
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <button type="button">Outside</button>
      </>,
    )
    await wait(10)

    fireEvent.pointerEnter(content() as HTMLElement)
    fireEvent.pointerDown(screen.getByText('Outside'))
    const openAfterPress = content() !== null
    fireEvent.keyDown(document, { key: 'Escape' })

    expect([
      onPointerEnter.mock.calls.length,
      onPointerDownOutside.mock.calls.length,
      openAfterPress,
      onEscapeKeyDown.mock.calls.length,
      onOpenChange.mock.calls,
    ]).toEqual([1, 1, true, 1, [[false]]])
  })

  it('lets props given to the trigger and the content override their own attributes', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger data-slot="help">Hover me</TooltipTrigger>
          <TooltipContent data-slot="hint">Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect([
      screen.getByText('Hover me').getAttribute('data-slot'),
      screen.getByRole('tooltip').getAttribute('data-slot'),
    ]).toEqual(['help', 'hint'])
  })

  it('places its content above the trigger by default', () => {
    renderTooltip({ open: true })

    expect(content()?.getAttribute('data-side')).toBe('top')
  })

  it('portals its content into the container it is given', () => {
    const host = document.body.appendChild(document.createElement('div'))
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipPortal container={host}>
            <TooltipContent>Tooltip text</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(host.querySelector('[data-slot="tooltip-content"]')).not.toBeNull()
    host.remove()
  })

  it("keeps closed content in the page under its own forceMount or its portal's", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>One</TooltipTrigger>
          <TooltipContent forceMount>First tip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>Two</TooltipTrigger>
          <TooltipPortal forceMount>
            <TooltipContent>Second tip</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(
      [...document.querySelectorAll('[data-slot="tooltip-content"]')].map((node) => [
        node.textContent,
        node.getAttribute('data-state'),
      ]),
    ).toEqual([
      ['First tip', 'closed'],
      ['Second tip', 'closed'],
    ])
  })

  it('marks its arrow', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>
            Tooltip text
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(document.querySelector('[data-slot="tooltip-arrow"]')).not.toBeNull()
  })
})

describe('Tooltip scope', () => {
  it('hands its parts the scope it is given', () => {
    const useScope = createTooltipScope()
    function Scoped() {
      const scope = useScope(undefined)
      return (
        <TooltipProvider {...scope}>
          <Tooltip {...scope}>
            <TooltipTrigger {...scope}>Hover me</TooltipTrigger>
            <TooltipPortal forceMount {...scope}>
              <TooltipContent {...scope}>
                Tooltip text
                <TooltipArrow {...scope} />
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      )
    }
    render(<Scoped />)

    expect([screen.getByText('Hover me').getAttribute('data-state'), content()?.getAttribute('data-state')]).toEqual([
      'closed',
      'closed',
    ])
  })
})
