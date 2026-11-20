// From Base UI, packages/react/src/tooltip/{root,trigger,provider}/*.test.tsx. MIT, see
// src/__tests__/base-ui/LICENSE. Base UI's `delay` is `delayDuration` here, its `timeout` `skipDelayDuration`.
// Left out: its handles, payload, actionsRef, `keepMounted`, `trackCursorAxis`, `preventUnmountOnClose` and
// cancelable event details, which have no counterpart.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from '../index'

freshDom()

function Tip({ name = 'Trigger', ...props }: React.ComponentProps<typeof Tooltip> & { name?: string }) {
  return (
    <Tooltip {...props}>
      <TooltipTrigger>{name}</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>{name} tip</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}

function Example({ provider, ...props }: React.ComponentProps<typeof Tip> & { provider?: object }) {
  return (
    <TooltipProvider delayDuration={0} {...provider}>
      <Tip {...props} />
    </TooltipProvider>
  )
}

const trigger = (name = 'Trigger') => screen.getByRole('button', { name })
const isOpen = (name = 'Trigger') => screen.queryByRole('tooltip', { name: `${name} tip` }) !== null
const hover = (name = 'Trigger', pointerType = 'mouse') =>
  act(() => void fireEvent.pointerMove(trigger(name), { pointerType }))
const unhover = (name = 'Trigger') =>
  act(() => void fireEvent.pointerLeave(trigger(name), { pointerType: 'mouse', clientX: 500, clientY: 500 }))
const tick = (ms = 0) => act(() => vi.advanceTimersByTime(ms))

describe('Base UI tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('opening and closing', () => {
    it('opens on hover', () => {
      render(<Example />)

      hover()
      tick()

      expect(isOpen()).toBe(true)
    })

    it('stays closed while a touch pointer moves over its trigger', () => {
      render(<Example />)

      hover('Trigger', 'touch')
      tick()

      expect(isOpen()).toBe(false)
    })

    it('opens on focus and closes on blur', () => {
      render(<Example />)

      act(() => trigger().focus())
      const opened = isOpen()
      act(() => trigger().blur())

      expect([opened, isOpen()]).toEqual([true, false])
    })

    it('tells onOpenChange once, and nothing again on a hover while open', () => {
      const onOpenChange = vi.fn()
      render(<Example onOpenChange={onOpenChange} />)

      hover()
      tick()
      hover()
      tick()

      expect(onOpenChange.mock.calls).toEqual([[true]])
    })

    it('does not open once its trigger unmounts during the open delay', () => {
      const { rerender } = render(<Example provider={{ delayDuration: 300 }} />)
      hover()
      tick(100)

      rerender(<TooltipProvider delayDuration={300}>{null}</TooltipProvider>)
      tick(300)

      expect(screen.queryByRole('tooltip')).toBeNull()
    })

    it('stays closed as focus comes back to its trigger with the window, once Escape closed it', () => {
      render(<Example />)
      act(() => trigger().focus())
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

  describe('delays', () => {
    it('waits for the delay of its provider, and takes a delay of its own over it', () => {
      const { unmount } = render(<Example provider={{ delayDuration: 300 }} />)
      hover()
      tick(299)
      const early = isOpen()
      tick(1)
      const fromProvider = isOpen()
      unmount()
      render(<Example provider={{ delayDuration: 300 }} delayDuration={50} />)

      hover()
      tick(50)

      expect([early, fromProvider, isOpen()]).toEqual([false, true, true])
    })

    it('waits for its close delay once the pointer leaves, taking the latest one given', () => {
      const { rerender } = render(<Example closeDelay={100} disableHoverableContent />)
      hover()
      tick()
      rerender(<Example closeDelay={200} disableHoverableContent />)

      unhover()
      tick(199)
      const lingering = isOpen()
      tick(1)

      expect([lingering, isOpen()]).toEqual([true, false])
    })

    it('opens a tooltip beside it at once while the skip delay runs, and waits again once it has passed', () => {
      render(
        <TooltipProvider delayDuration={300} skipDelayDuration={300}>
          <Tip name="A" disableHoverableContent />
          <Tip name="B" disableHoverableContent />
        </TooltipProvider>,
      )
      hover('A')
      tick(300)
      unhover('A')
      tick()

      hover('B')
      const instant = isOpen('B')
      unhover('B')
      tick(400)
      hover('A')

      expect([instant, isOpen('A')]).toEqual([true, false])
    })
  })

  describe('disabled', () => {
    it('opens on neither hover nor focus, and does not throw beside defaultOpen', () => {
      render(<Example disabled defaultOpen />)

      hover()
      act(() => trigger().focus())
      tick()

      expect(isOpen()).toBe(false)
    })

    it('closes once it becomes disabled while open', () => {
      const { rerender } = render(<Example />)
      hover()
      tick()

      rerender(<Example disabled />)

      expect(isOpen()).toBe(false)
    })
  })

  describe('dismissal', () => {
    it('closes on Escape', () => {
      render(<Example />)
      hover()
      tick()

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(isOpen()).toBe(false)
    })

    it('does not open once its trigger is pressed during the open delay', () => {
      render(<Example provider={{ delayDuration: 300 }} />)
      hover()
      tick(100)

      fireEvent.pointerDown(trigger(), { pointerType: 'mouse' })
      tick(300)

      expect(isOpen()).toBe(false)
    })

    it('closes on a click of its trigger, and opens again on the next hover', () => {
      render(<Example />)
      hover()
      tick()

      fireEvent.pointerDown(trigger(), { pointerType: 'mouse' })
      fireEvent.click(trigger())
      const closed = isOpen()
      unhover()
      hover()
      tick()

      expect([closed, isOpen()]).toEqual([false, true])
    })

    it('stays open on a click of its trigger with disableCloseOnClick', () => {
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger disableCloseOnClick>Trigger</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent>Trigger tip</TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>,
      )
      hover()
      tick()

      fireEvent.pointerDown(trigger(), { pointerType: 'mouse' })
      fireEvent.click(trigger())

      expect(isOpen()).toBe(true)
    })
  })

  describe('in a group', () => {
    it('closes one tooltip as another opens', () => {
      render(
        <TooltipProvider delayDuration={0}>
          <Tip name="A" />
          <Tip name="B" />
        </TooltipProvider>,
      )
      hover('A')
      tick()

      hover('B')
      tick()

      expect([isOpen('A'), isOpen('B')]).toEqual([false, true])
    })

    it('leaves the outer tooltip shut while the pointer is over a trigger nested in its trigger', () => {
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div data-testid="outer">
                Outer
                <Tip name="Inner" />
              </div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent>Outer tip</TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>,
      )

      hover('Inner')
      tick()

      expect([isOpen('Inner'), screen.queryByRole('tooltip', { name: 'Outer tip' })]).toEqual([true, null])
    })
  })
})
