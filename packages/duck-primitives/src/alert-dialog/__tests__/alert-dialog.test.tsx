import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
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
  createAlertDialogScope,
} from '../index'

freshDom()

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
    const handler = vi.fn(() => {})
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

  it('stays modal when told otherwise, hiding the page behind it', async () => {
    renderAlertDialog({ modal: false, defaultOpen: true })
    await wait(0)

    expect(screen.getByText('Delete').closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('takes a role passed to its content over alertdialog', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent role="dialog">
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    )

    expect(screen.getByRole('dialog').getAttribute('data-slot')).toBe('dialog-content')
  })

  it('hands its parts the scope it is given', async () => {
    const useAlertDialogScope = createAlertDialogScope()
    function Scoped() {
      const scope = useAlertDialogScope(undefined)
      return (
        <AlertDialog {...scope} defaultOpen>
          <AlertDialogContent {...scope}>
            <AlertDialogTitle {...scope}>Delete the flock?</AlertDialogTitle>
            <AlertDialogDescription {...scope}>Every duck goes with it.</AlertDialogDescription>
            <AlertDialogCancel {...scope}>Keep</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      )
    }

    render(<Scoped />)
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('Keep'))
  })

  it('names each part in React DevTools', () => {
    expect([
      AlertDialog.displayName,
      AlertDialogTrigger.displayName,
      AlertDialogPortal.displayName,
      AlertDialogOverlay.displayName,
      AlertDialogContent.displayName,
      AlertDialogTitle.displayName,
      AlertDialogDescription.displayName,
      AlertDialogAction.displayName,
      AlertDialogCancel.displayName,
    ]).toEqual([
      'AlertDialog',
      'AlertDialogTrigger',
      'AlertDialogPortal',
      'AlertDialogOverlay',
      'AlertDialogContent',
      'AlertDialogTitle',
      'AlertDialogDescription',
      'AlertDialogAction',
      'AlertDialogCancel',
    ])
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

function renderOpenAlertDialog(description?: React.ReactNode) {
  render(
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogTitle>Delete</AlertDialogTitle>
        {description}
        <AlertDialogCancel>Cancel</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>,
  )
}

describe('AlertDialog warnings in development', () => {
  const nodeEnv = process.env.NODE_ENV
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    process.env.NODE_ENV = 'development'
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
    process.env.NODE_ENV = nodeEnv
  })

  const descriptionWarnings = () =>
    warn.mock.calls.filter(([message]) => String(message).includes('requires a description'))

  it('warns when the content has no description, naming the part to render', () => {
    renderOpenAlertDialog()

    expect(String(descriptionWarnings()[0]?.[0])).toContain('Render `AlertDialogDescription` inside it')
  })

  it('errors when the content has no title, naming the alert dialog parts', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>,
      )

      expect(String(error.mock.calls[0]?.[0])).toMatch(/^`AlertDialogContent` requires a `AlertDialogTitle`/)
    } finally {
      error.mockRestore()
    }
  })

  it('stays quiet when the content has one', () => {
    renderOpenAlertDialog(<AlertDialogDescription>This cannot be undone.</AlertDialogDescription>)

    expect(descriptionWarnings()).toEqual([])
  })
})

describe('AlertDialog outside', () => {
  it('stays open when the pointer is pressed outside it', async () => {
    render(
      <>
        <AlertDialog defaultOpen>
          <AlertDialogPortal>
            <AlertDialogContent>
              <AlertDialogTitle>Delete the flock?</AlertDialogTitle>
              <AlertDialogDescription>Every duck goes with it.</AlertDialogDescription>
              <AlertDialogCancel>Keep</AlertDialogCancel>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
        <button type="button">Outside</button>
      </>,
    )
    await wait(0)

    const outside = screen.getByText('Outside')
    fireEvent.pointerDown(outside)
    fireEvent.mouseDown(outside)
    fireEvent.mouseUp(outside)
    fireEvent.click(outside)
    await wait(0)

    expect(screen.queryByRole('alertdialog')).not.toBeNull()
  })
})

describe('AlertDialog focus targets', () => {
  function Focused(contentProps: React.ComponentProps<typeof AlertDialogContent>) {
    return (
      <>
        <AlertDialog>
          <AlertDialogTrigger>Delete</AlertDialogTrigger>
          <AlertDialogPortal>
            <AlertDialogContent {...contentProps}>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              <input aria-label="Type the name" />
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
        <input aria-label="Search" />
      </>
    )
  }

  async function open(props: React.ComponentProps<typeof AlertDialogContent> = {}) {
    render(<Focused {...props} />)
    act(() => screen.getByText('Delete').focus())
    fireEvent.click(screen.getByText('Delete'))
    await wait(0)
  }

  const field = (label: string) => ({
    get current() {
      return screen.queryByLabelText<HTMLInputElement>(label)
    },
  })

  it('runs an onOpenAutoFocus of its own before focusing the cancel button', async () => {
    const onOpenAutoFocus = vi.fn()

    await open({ onOpenAutoFocus })

    expect(onOpenAutoFocus).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(screen.getByText('Cancel'))
  })

  it('focuses the cancel button on open', async () => {
    await open()

    expect(document.activeElement).toBe(screen.getByText('Cancel'))
  })

  it('focuses the element initialFocus names on open rather than the cancel button', async () => {
    await open({ initialFocus: field('Type the name') })

    expect(document.activeElement).toBe(screen.getByLabelText('Type the name'))
  })

  it('leaves focus on the trigger when initialFocus is false', async () => {
    await open({ initialFocus: false })

    expect(document.activeElement).toBe(screen.getByText('Delete'))
  })

  it('focuses the element finalFocus names on close rather than the trigger', async () => {
    await open({ finalFocus: field('Search') })

    fireEvent.click(screen.getByText('Confirm'))
    await wait(0)

    expect(document.activeElement).toBe(screen.getByLabelText('Search'))
  })
})
