// From Base UI, packages/react/src/alert-dialog/root/AlertDialogRoot.test.tsx. MIT, see
// src/__tests__/base-ui/LICENSE. Left out: its handles, detached triggers and viewport, which have no counterpart, and
// aria-modal on the popup, which Radix leaves off and hides the rest of the page instead.

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { clickOutside, freshDom, wait } from '../../__tests__/dom'
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

freshDom()

function Example({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <>
      <button type="button">Elsewhere</button>
      <AlertDialog defaultOpen onOpenChange={onOpenChange}>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogOverlay data-testid="overlay" />
          <AlertDialogContent>
            <AlertDialogTitle>Delete the file?</AlertDialogTitle>
            <AlertDialogDescription>It cannot be undone.</AlertDialogDescription>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete it</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  )
}

describe('Base UI alert dialog', () => {
  it('is an alert dialog named by its title and described by its description', async () => {
    render(<Example />)
    await wait(0)
    const dialog = screen.getByRole('alertdialog')

    expect(screen.getByRole('alertdialog', { name: 'Delete the file?' })).toBe(dialog)
    expect(document.getElementById(dialog.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
      'It cannot be undone.',
    )
  })

  it('stays open on a press of its overlay', async () => {
    const onOpenChange = vi.fn()
    render(<Example onOpenChange={onOpenChange} />)
    await wait(0)

    await clickOutside(screen.getByTestId('overlay'))

    expect([screen.queryByRole('alertdialog') !== null, onOpenChange.mock.calls]).toEqual([true, []])
  })

  it('hides the rest of the page from assistive technology while open', async () => {
    render(<Example />)
    await wait(0)

    expect(screen.queryByRole('button', { name: 'Elsewhere' })).toBeNull()
  })
})
