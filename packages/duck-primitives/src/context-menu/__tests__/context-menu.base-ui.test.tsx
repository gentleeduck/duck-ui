// From Base UI, packages/react/src/context-menu/{trigger,root}/*.test.tsx. MIT, see src/__tests__/base-ui/LICENSE.
// Left out: the mouse up after a right press, which Base UI times and cancels, Tab and Shift+Tab closing the menu,
// where Radix keeps them inside it, and its backdrops, which have no counterpart.

import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuPortal, ContextMenuTrigger } from '../index'

freshDom()

function Example({ disabled, onOpenChange }: { disabled?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger disabled={disabled}>Right click me</ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent>
          <ContextMenuItem>Edit</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenu>
  )
}

const target = () => screen.getByText('Right click me')
const isOpen = () => screen.queryByRole('menu') !== null
const touch = (type: 'pointerDown' | 'pointerMove' | 'pointerUp', x = 10, y = 10, pointerId = 1) =>
  fireEvent[type](target(), { pointerType: 'touch', pointerId, clientX: x, clientY: y })

describe('Base UI context menu trigger', () => {
  it('opens on a context menu event, telling onOpenChange', () => {
    const onOpenChange = vi.fn()
    render(<Example onOpenChange={onOpenChange} />)

    fireEvent.contextMenu(target())

    expect([isOpen(), onOpenChange.mock.calls]).toEqual([true, [[true]]])
  })

  it('stays shut on a context menu event while disabled, leaving the browser its own menu', () => {
    render(<Example disabled />)

    const notPrevented = fireEvent.contextMenu(target())

    expect([isOpen(), notPrevented]).toEqual([false, true])
  })
})

describe('Base UI context menu long press', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens on a long press of a finger', () => {
    render(<Example />)

    touch('pointerDown')
    act(() => vi.advanceTimersByTime(700))

    expect(isOpen()).toBe(true)
  })

  it('gives up the press once the finger moves past its threshold, and keeps it for a smaller move', () => {
    const { unmount } = render(<Example />)
    touch('pointerDown')
    touch('pointerMove', 14, 14)
    act(() => vi.advanceTimersByTime(700))
    const small = isOpen()
    unmount()
    render(<Example />)

    touch('pointerDown')
    touch('pointerMove', 40, 10)
    act(() => vi.advanceTimersByTime(700))

    expect([small, isOpen()]).toEqual([true, false])
  })

  it('gives up the press once the finger lifts', () => {
    render(<Example />)

    touch('pointerDown')
    touch('pointerUp')
    act(() => vi.advanceTimersByTime(700))

    expect(isOpen()).toBe(false)
  })

  it('gives up the press once a second finger comes down', () => {
    render(<Example />)

    touch('pointerDown', 10, 10, 1)
    act(() => vi.advanceTimersByTime(300))
    touch('pointerDown', 60, 60, 2)
    act(() => vi.advanceTimersByTime(700))

    expect(isOpen()).toBe(false)
  })

  it('stays shut on a long press while disabled', () => {
    render(<Example disabled />)

    touch('pointerDown')
    act(() => vi.advanceTimersByTime(700))

    expect(isOpen()).toBe(false)
  })
})
