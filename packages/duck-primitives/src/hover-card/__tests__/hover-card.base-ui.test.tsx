// From Base UI, packages/react/src/preview-card/{root,trigger}/*.test.tsx. MIT, see src/__tests__/base-ui/LICENSE.
// Base UI's PreviewCard is a hover card here, its `delay` is `openDelay`. Left out: the hovered line of a trigger
// that wraps, detached triggers and their handles, the payload and the imperative close, which have no counterpart.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { HoverCard, HoverCardContent, HoverCardPortal, HoverCardTrigger } from '../index'

freshDom()

function Example(props: React.ComponentProps<typeof HoverCard>) {
  return (
    <HoverCard openDelay={0} closeDelay={0} {...props}>
      <HoverCardTrigger href="#profile">Trigger</HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent data-testid="popup">Content</HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  )
}

const trigger = () => screen.getByRole('link', { name: 'Trigger' })
const isOpen = () => screen.queryByTestId('popup') !== null
const hover = (enter: boolean) =>
  (enter ? fireEvent.pointerEnter : fireEvent.pointerLeave)(trigger(), { pointerType: 'mouse' })
const tick = (ms = 0) => act(() => vi.advanceTimersByTime(ms))

describe('Base UI preview card', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens on hover and closes once the pointer leaves', () => {
    render(<Example />)

    hover(true)
    tick()
    const opened = isOpen()
    hover(false)
    tick()

    expect([opened, isOpen()]).toEqual([true, false])
  })

  it('opens on focus and closes on blur', () => {
    render(<Example />)

    act(() => trigger().focus())
    tick()
    const opened = isOpen()
    act(() => trigger().blur())
    tick()

    expect([opened, isOpen()]).toEqual([true, false])
  })

  it('tells onOpenChange each change, and nothing again when the trigger is hovered again while open', () => {
    const onOpenChange = vi.fn()
    render(<Example onOpenChange={onOpenChange} />)

    hover(true)
    tick()
    hover(false)
    hover(true)
    tick()

    expect(onOpenChange.mock.calls).toEqual([[true]])
  })

  it('closes once the pointer leaves the trigger after opening by default', () => {
    render(<Example defaultOpen />)

    hover(true)
    hover(false)
    tick()

    expect(isOpen()).toBe(false)
  })

  it('opens after its open delay, and closes after its close delay', () => {
    render(<Example openDelay={300} closeDelay={200} />)

    hover(true)
    tick(299)
    const early = isOpen()
    tick(1)
    const opened = isOpen()
    hover(false)
    tick(199)
    const lingering = isOpen()
    tick(1)

    expect([early, opened, lingering, isOpen()]).toEqual([false, true, true, false])
  })

  it('closes on Escape, and opens again on the next hover', () => {
    render(<Example />)
    hover(true)
    tick()

    fireEvent.keyDown(document, { key: 'Escape' })
    tick()
    const closed = isOpen()
    hover(false)
    hover(true)
    tick()

    expect([closed, isOpen()]).toEqual([false, true])
  })

  it('stays closed as focus comes back to its trigger with the window, once Escape closed it', () => {
    render(<Example />)
    act(() => trigger().focus())
    tick()
    fireEvent.keyDown(document, { key: 'Escape' })
    tick()

    fireEvent.blur(trigger())
    fireEvent.blur(window)
    fireEvent.focus(window)
    fireEvent.focus(trigger())
    tick(50)

    expect(isOpen()).toBe(false)
  })
})
