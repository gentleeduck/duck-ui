import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import { Popover, PopoverClose, PopoverContent, PopoverPortal, PopoverTrigger } from '../index'

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

  it('has aria-controls linking to content', () => {
    const { container } = renderPopover()
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!
    expect(trigger.getAttribute('aria-controls')).toBeTruthy()
  })

  it('calls onOpenChange on trigger click', () => {
    const handler = mock(() => {})
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
    const handler = mock(() => {})
    const { container } = renderPopover({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!
    fireEvent.click(trigger)
    expect(handler).toHaveBeenCalledWith(true)
    fireEvent.click(trigger)
    expect(handler).toHaveBeenCalledWith(false)
  })

  it('defaults to ltr direction', () => {
    const { container } = renderPopover()
    expect(container.querySelector('[data-slot="popover-trigger"]')?.getAttribute('dir')).toBe('ltr')
  })

  it('supports rtl direction', () => {
    const { container } = renderPopover({ dir: 'rtl' })
    expect(container.querySelector('[data-slot="popover-trigger"]')?.getAttribute('dir')).toBe('rtl')
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
