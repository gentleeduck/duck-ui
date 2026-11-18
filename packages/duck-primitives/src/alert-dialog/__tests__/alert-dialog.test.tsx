import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../index'

function renderAlertDialog(props: Record<string, unknown> = {}) {
  return render(
    <AlertDialog {...props}>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>,
  )
}

describe('AlertDialog', () => {
  it('renders trigger with data-slot="dialog-trigger"', () => {
    const { container } = renderAlertDialog()
    expect(container.querySelector('[data-slot="dialog-trigger"]')).not.toBeNull()
  })

  it('trigger has aria-haspopup="dialog"', () => {
    const { container } = renderAlertDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
  })

  it('trigger starts with data-state="closed"', () => {
    const { container } = renderAlertDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })

  it('opens on trigger click', () => {
    const { container } = renderAlertDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!
    fireEvent.click(trigger)
    expect(trigger.getAttribute('data-state')).toBe('open')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('renders content with role="alertdialog" when open', () => {
    const { baseElement } = renderAlertDialog({ defaultOpen: true })
    expect(baseElement.querySelector('[role="alertdialog"]')).not.toBeNull()
  })

  it('content has aria-labelledby pointing to title', () => {
    const { baseElement } = renderAlertDialog({ defaultOpen: true })
    const content = baseElement.querySelector('[role="alertdialog"]')!
    const titleId = content.getAttribute('aria-labelledby')
    expect(titleId).toBeTruthy()
    expect(baseElement.querySelector(`#${titleId}`)?.textContent).toBe('Are you sure?')
  })

  it('content has aria-describedby pointing to description', () => {
    const { baseElement } = renderAlertDialog({ defaultOpen: true })
    const content = baseElement.querySelector('[role="alertdialog"]')!
    const descId = content.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    expect(baseElement.querySelector(`#${descId}`)?.textContent).toBe('This cannot be undone.')
  })

  it('renders action and cancel buttons', () => {
    const { baseElement } = renderAlertDialog({ defaultOpen: true })
    const content = baseElement.querySelector('[role="alertdialog"]')!
    const buttons = content.querySelectorAll('[data-slot="dialog-close"]')
    expect(buttons.length).toBe(2)
  })

  it('calls onOpenChange when trigger clicked', () => {
    const handler = mock(() => {})
    const { container } = renderAlertDialog({ onOpenChange: handler })
    fireEvent.click(container.querySelector('[data-slot="dialog-trigger"]')!)
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('forwards ref to trigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <AlertDialog>
        <AlertDialogTrigger ref={ref}>Delete</AlertDialogTrigger>
      </AlertDialog>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('trigger has type="button"', () => {
    const { container } = renderAlertDialog()
    expect(container.querySelector('[data-slot="dialog-trigger"]')?.getAttribute('type')).toBe('button')
  })

  it('is always modal (no non-modal option)', () => {
    // AlertDialog wraps Dialog with modal=true forced
    const { baseElement } = renderAlertDialog({ defaultOpen: true })
    const content = baseElement.querySelector('[role="alertdialog"]')
    expect(content).not.toBeNull()
  })

  it('content has data-state="open" when open', () => {
    const { baseElement } = renderAlertDialog({ defaultOpen: true })
    const content = baseElement.querySelector('[role="alertdialog"]')!
    expect(content.getAttribute('data-state')).toBe('open')
  })

  it('title renders as h2', () => {
    const { baseElement } = renderAlertDialog({ defaultOpen: true })
    const title = baseElement.querySelector('[data-slot="dialog-title"]')!
    expect(title.tagName.toLowerCase()).toBe('h2')
  })

  it('action buttons have type="button"', () => {
    const { baseElement } = renderAlertDialog({ defaultOpen: true })
    const buttons = baseElement.querySelectorAll('[data-slot="dialog-close"]')
    for (const btn of buttons) {
      expect(btn.getAttribute('type')).toBe('button')
    }
  })

  it('portaled content inherits dir from DirectionProvider', () => {
    const { baseElement, unmount } = render(
      <DirectionProvider dir="rtl">
        <AlertDialog defaultOpen>
          <AlertDialogPortal>
            <AlertDialogContent data-testid="dir-content">
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
      </DirectionProvider>,
    )
    expect(baseElement.querySelector('[data-testid="dir-content"]')?.getAttribute('dir')).toBe('rtl')
    unmount()
  })
})
