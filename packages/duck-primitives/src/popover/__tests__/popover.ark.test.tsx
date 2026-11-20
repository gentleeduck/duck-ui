// From Ark UI, packages/react/src/components/popover/tests/popover.test.tsx. MIT, see src/__tests__/ark/LICENSE.
// Ark's `lazyMount` and `unmountOnExit` are how content mounts here anyway.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import { Popover, PopoverClose, PopoverContent, PopoverPortal, PopoverTrigger } from '../index'

freshDom()

function ComponentUnderTest(props: React.ComponentProps<typeof Popover>) {
  return (
    <Popover {...props}>
      <PopoverTrigger>click me</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent aria-label="Panel">
          <input aria-label="Name" />
          <PopoverClose>close</PopoverClose>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}

const panel = () => screen.queryByRole('dialog', { name: 'Panel' })

describe('Ark UI popover', () => {
  it('has no axe violations', async () => {
    const { container } = render(<ComponentUnderTest />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('opens and closes, mounting its content only while open', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest />)
    const before = panel()

    await user.click(screen.getByText('click me'))
    const opened = panel() !== null
    await user.click(screen.getByText('close'))

    expect([before, opened, panel()]).toEqual([null, true, null])
  })

  it('focuses its first element that takes focus on open', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest />)

    await user.click(screen.getByText('click me'))
    await wait(0)

    expect(document.activeElement).toBe(screen.getByLabelText('Name'))
  })

  it('follows an owner that controls it', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen((value) => !value)}>
            toggle
          </button>
          <ComponentUnderTest open={open} onOpenChange={setOpen} />
        </>
      )
    }
    render(<Controlled />)

    await user.click(screen.getByText('toggle'))
    const opened = panel() !== null
    await user.click(screen.getByText('close'))

    expect([opened, panel()]).toEqual([true, null])
  })

  it('starts open with defaultOpen, and points its trigger at its content only while open', () => {
    render(<ComponentUnderTest defaultOpen />)

    expect(screen.getByText('click me').getAttribute('aria-controls')).toBe(panel()?.id)
  })
})
