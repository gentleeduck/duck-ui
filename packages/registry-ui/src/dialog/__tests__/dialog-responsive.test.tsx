import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import {
  DialogCloseResponsive,
  DialogContentResponsive,
  DialogDescriptionResponsive,
  DialogFooterResponsive,
  DialogHeaderResponsive,
  DialogResponsive,
  DialogTitleResponsive,
  DialogTriggerResponsive,
} from '../dialog-responsive'

let wide = true
const { matchMedia } = window

beforeEach(() => {
  const media = (query: string) => ({
    addEventListener: () => {},
    matches: wide,
    media: query,
    removeEventListener: () => {},
  })
  Object.assign(globalThis, { matchMedia: media })
  Object.assign(window, { matchMedia: media })
})

// The stub answers every query, prefers-reduced-motion too, so a motion test in a later file would skip its animation.
afterEach(() => {
  cleanup()
  wide = true
  Object.assign(globalThis, { matchMedia })
  Object.assign(window, { matchMedia })
})

function Share() {
  return (
    <DialogResponsive>
      <DialogTriggerResponsive>Share</DialogTriggerResponsive>
      <DialogContentResponsive>
        <DialogHeaderResponsive>
          <DialogTitleResponsive>Share the pond</DialogTitleResponsive>
          <DialogDescriptionResponsive>Anyone with the link can visit.</DialogDescriptionResponsive>
        </DialogHeaderResponsive>
        <DialogFooterResponsive>
          <DialogCloseResponsive>Done</DialogCloseResponsive>
        </DialogFooterResponsive>
      </DialogContentResponsive>
    </DialogResponsive>
  )
}

const slots = () =>
  Array.from(document.querySelectorAll('[role="dialog"] [data-slot], [role="dialog"][data-slot]'), (node) =>
    node.getAttribute('data-slot'),
  )

describe('registry-ui DialogResponsive', () => {
  test('opens a dialog on a wide screen, named and described, and closes from its close button', async () => {
    render(<Share />)

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    await act(async () => {})

    const dialog = screen.getByRole('dialog', { name: 'Share the pond' })
    expect(dialog.getAttribute('aria-describedby')).toBe(screen.getByText('Anyone with the link can visit.').id)
    expect(slots().filter((slot) => slot?.startsWith('drawer'))).toEqual([])
    expect(slots()[0]).toBe('dialog-content')

    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    await act(async () => {})

    expect(document.querySelectorAll('[role="dialog"]').length).toBe(0)
  })

  test('opens a drawer on a narrow screen, named and described, and closes from its close button', async () => {
    wide = false
    render(<Share />)

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    await act(async () => {})

    const drawer = screen.getByRole('dialog', { name: 'Share the pond' })
    expect(drawer.getAttribute('aria-describedby')).toBe(screen.getByText('Anyone with the link can visit.').id)
    expect(slots()).toEqual([
      'drawer-content',
      'drawer-header',
      'drawer-title',
      'drawer-description',
      'drawer-footer',
      'drawer-close',
    ])

    fireEvent.click(screen.getByRole('button', { name: 'Done' }))

    expect(drawer.getAttribute('data-state')).toBe('closed')
  })
})
