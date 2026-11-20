// From Ark UI, packages/react/src/components/dialog/tests/dialog.test.tsx. MIT, see src/__tests__/ark/LICENSE.
// Ark's `lazyMount` and `unmountOnExit` are how content mounts here anyway. Left out: `hideMode`, which has no
// counterpart.

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../index'

freshDom()

function ComponentUnderTest(props: React.ComponentProps<typeof Dialog>) {
  return (
    <Dialog {...props}>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog Description</DialogDescription>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

const dialog = () => screen.queryByRole('dialog')

describe('Ark UI dialog', () => {
  it('has no axe violations while open', async () => {
    render(<ComponentUnderTest defaultOpen />)
    await wait(0)

    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('shows its content once opened', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest />)

    await user.click(screen.getByText('Open Dialog'))

    expect(screen.getByText('Dialog Title')).toBeVisible()
  })

  it('tells onOpenChange when it closes', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ComponentUnderTest defaultOpen onOpenChange={onOpenChange} />)

    await user.click(screen.getByText('Close'))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('mounts its content only while open, and points its trigger at it only then', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest />)
    const before = [dialog(), screen.getByText('Open Dialog').hasAttribute('aria-controls')]

    await user.click(screen.getByText('Open Dialog'))
    const opened = [dialog() !== null, screen.getByText('Open Dialog').getAttribute('aria-controls') === dialog()?.id]
    await user.click(screen.getByText('Close'))

    expect([before, opened, dialog()]).toEqual([[null, false], [true, true], null])
  })

  it('stays open while open is true, and shut while it is false', async () => {
    const shown = render(<ComponentUnderTest open />)
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)
    const open = dialog() !== null
    shown.unmount()
    render(<ComponentUnderTest open={false} />)

    fireEvent.click(screen.getByText('Open Dialog'))

    expect([open, dialog()]).toEqual([true, null])
  })
})
