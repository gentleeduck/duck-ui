// From Base UI, packages/react/src/avatar/fallback/AvatarFallback.test.tsx. MIT, see src/__tests__/base-ui/LICENSE.
// Base UI's `delay` is `delayMs` here. Its image load and error cases, and the fallback after a loaded image unmounts,
// are in avatar.radix.test.tsx; its `keepMounted` cases and the hydration of a cached image have no counterpart.

import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { Avatar, AvatarFallback, AvatarImage } from '../index'

freshDom()

const avatar = (delayMs?: number) => (
  <Avatar>
    <AvatarImage alt="avatar" />
    <AvatarFallback delayMs={delayMs}>AC</AvatarFallback>
  </Avatar>
)
const shown = () => screen.queryByText('AC') !== null

describe('Base UI avatar fallback delay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the fallback once its delay has passed', () => {
    render(avatar(100))
    const early = shown()

    act(() => vi.advanceTimersByTime(100))

    expect([early, shown()]).toEqual([false, true])
  })

  it('shows the fallback at once with a delay of 0', () => {
    render(avatar(0))

    expect(shown()).toBe(true)
  })

  it('shows the fallback once its delay changes to 0', () => {
    const { rerender } = render(avatar(100))

    rerender(avatar(0))
    act(() => vi.advanceTimersByTime(0))

    expect(shown()).toBe(true)
  })

  it('keeps a shown fallback shown when a delay is given later', () => {
    const { rerender } = render(avatar())

    rerender(avatar(100))

    expect(shown()).toBe(true)
  })

  it('keeps a shown fallback shown as its delay goes from a number to none and back', () => {
    const { rerender } = render(avatar(100))
    act(() => vi.advanceTimersByTime(100))

    rerender(avatar())
    rerender(avatar(100))

    expect(shown()).toBe(true)
  })
})
