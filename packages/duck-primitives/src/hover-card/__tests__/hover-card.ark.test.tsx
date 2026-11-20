// From Ark UI, packages/react/src/components/hover-card/tests/hover-card.test.tsx. MIT, see src/__tests__/ark/LICENSE.
// Ark's `lazyMount` and `unmountOnExit` are how content mounts here anyway.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import { HoverCard, HoverCardContent, HoverCardPortal, HoverCardTrigger } from '../index'

freshDom()

function ComponentUnderTest(props: React.ComponentProps<typeof HoverCard>) {
  return (
    <HoverCard openDelay={0} closeDelay={0} {...props}>
      <HoverCardTrigger href="#profile">Hover me</HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent>Content</HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  )
}

const hover = async (enter: boolean) => {
  const event = enter ? fireEvent.pointerEnter : fireEvent.pointerLeave
  act(() => void event(screen.getByText('Hover me'), { pointerType: 'mouse' }))
  await wait(20)
}

describe('Ark UI hover card', () => {
  it('has no axe violations', async () => {
    const { container } = render(<ComponentUnderTest />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('opens on hover, mounting its content only then, and closes once the pointer leaves', async () => {
    render(<ComponentUnderTest />)
    const before = screen.queryByText('Content')

    await hover(true)
    const opened = screen.queryByText('Content') !== null
    await hover(false)

    expect([before, opened, screen.queryByText('Content')]).toEqual([null, true, null])
  })

  it('tells onOpenChange as it opens', async () => {
    const onOpenChange = vi.fn()
    render(<ComponentUnderTest onOpenChange={onOpenChange} />)

    await hover(true)

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('starts open with defaultOpen', () => {
    render(<ComponentUnderTest defaultOpen />)

    expect(screen.getByText('Content')).toBeVisible()
  })
})
