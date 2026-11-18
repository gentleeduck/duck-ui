import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from '../index'

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

  it.skip('opens on focus', () => {
    const onOpenChange = mock(() => {})
    const { container } = renderTooltip({ onOpenChange })
    const trigger = container.querySelector('[data-slot="tooltip-trigger"]')!
    fireEvent.focus(trigger)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

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
})
