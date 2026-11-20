// From Ark UI, packages/react/src/components/tooltip/tests/tooltip.test.tsx. MIT, see src/__tests__/ark/LICENSE.
// Ark's `lazyMount` and `unmountOnExit` are how content mounts here anyway; Ark's `closeOnEscape={false}` is
// `onEscapeKeyDown` preventing the default here, and its `interactive={false}` is `disableHoverableContent`. With
// hoverable content the tooltip stays open while the pointer may be crossing to it, as tooltip.test.tsx covers.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from '../index'

freshDom()

function ComponentUnderTest({
  content,
  ...props
}: React.ComponentProps<typeof Tooltip> & { content?: React.ComponentProps<typeof TooltipContent> }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip {...props}>
        <TooltipTrigger>hover me</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent {...content}>content</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}

const tooltip = () => screen.queryByRole('tooltip')

async function hover() {
  act(() => void fireEvent.pointerMove(screen.getByText('hover me'), { pointerType: 'mouse' }))
  await wait(10)
}

describe('Ark UI tooltip', () => {
  it('has no axe violations', async () => {
    const { container } = render(<ComponentUnderTest />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('mounts only once hovered', async () => {
    render(<ComponentUnderTest />)
    const before = tooltip()

    await hover()

    expect([before, tooltip() !== null]).toEqual([null, true])
  })

  it('closes on Escape', async () => {
    render(<ComponentUnderTest />)
    await hover()

    fireEvent.keyDown(document, { key: 'Escape' })
    await wait(10)

    expect(tooltip()).toBeNull()
  })

  it('stays open on Escape when onEscapeKeyDown prevents it', async () => {
    render(<ComponentUnderTest content={{ onEscapeKeyDown: (event) => event.preventDefault() }} />)
    await hover()

    fireEvent.keyDown(document, { key: 'Escape' })
    await wait(10)

    expect(tooltip()).not.toBeNull()
  })

  it('closes once the pointer leaves the trigger for its content, with hoverable content off', async () => {
    render(<ComponentUnderTest disableHoverableContent />)
    await hover()

    act(() => void fireEvent.pointerLeave(screen.getByText('hover me'), { pointerType: 'mouse' }))
    await wait(10)

    expect(tooltip()).toBeNull()
  })
})
