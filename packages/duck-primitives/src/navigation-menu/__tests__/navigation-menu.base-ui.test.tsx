// From Base UI, packages/react/src/navigation-menu/{root,link,list}/*.test.tsx. MIT, see
// src/__tests__/base-ui/LICENSE. Base UI's `delay` is `delayDuration` here. Left out: its safe polygon, the patient
// click threshold, actionsRef, the activation direction, the backdrop and handles, which have no counterpart.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../index'

freshDom()

function Menu({
  withOverview = true,
  disabled,
  closeOnSelect,
  ...props
}: React.ComponentProps<typeof NavigationMenu> & {
  withOverview?: boolean
  disabled?: boolean
  closeOnSelect?: boolean
}) {
  return (
    <>
      <button type="button">Outside</button>
      <NavigationMenu delayDuration={0} {...props}>
        <NavigationMenuList>
          {withOverview ? (
            <NavigationMenuItem value="overview">
              <NavigationMenuTrigger disabled={disabled}>Overview</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#quick-start" closeOnSelect={closeOnSelect}>
                  Quick start
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : null}
          <NavigationMenuItem value="handbook">
            <NavigationMenuTrigger>Handbook</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#styling" active>
                Styling
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="community">
            <NavigationMenuTrigger>Community</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#forum">Forum</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  )
}

const trigger = (name: string) => screen.getByRole('button', { name })
const openPanel = () =>
  ['Overview', 'Handbook', 'Community'].find(
    (name) => screen.queryByRole('button', { name })?.getAttribute('aria-expanded') === 'true',
  ) ?? null
const hover = (name: string, pointerType = 'mouse') =>
  act(() => {
    fireEvent.pointerEnter(trigger(name), { pointerType })
    fireEvent.pointerMove(trigger(name), { pointerType })
  })
const tick = (ms = 0) => act(() => vi.advanceTimersByTime(ms))

describe('Base UI navigation menu', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('roles', () => {
    it('puts no aria-orientation on its list or its root', () => {
      const { container } = render(<Menu />)

      expect(container.querySelectorAll('[aria-orientation]')).toHaveLength(0)
    })
  })

  describe('opening', () => {
    it('opens on a mouse hover, and not on a touch one', () => {
      const { unmount } = render(<Menu />)
      hover('Overview', 'touch')
      tick()
      const touch = openPanel()
      unmount()
      render(<Menu />)

      hover('Overview')
      tick()

      expect([touch, openPanel()]).toEqual([null, 'Overview'])
    })

    it('opens on a click, whatever the pointer', () => {
      render(<Menu />)

      fireEvent.pointerDown(trigger('Overview'), { pointerType: 'touch' })
      fireEvent.click(trigger('Overview'))

      expect(openPanel()).toBe('Overview')
    })

    it('moves to another item on a click of its trigger, staying open', () => {
      render(<Menu />)
      fireEvent.click(trigger('Overview'))

      fireEvent.click(trigger('Handbook'))

      expect(openPanel()).toBe('Handbook')
    })

    it('waits for its delay before opening on hover, and its close delay before closing', () => {
      render(<Menu delayDuration={300} closeDelay={200} />)

      hover('Overview')
      tick(299)
      const early = openPanel()
      tick(1)
      const opened = openPanel()
      act(() => void fireEvent.pointerLeave(trigger('Overview'), { pointerType: 'mouse' }))
      tick(199)
      const lingering = openPanel()
      tick(1)

      expect([early, opened, lingering, openPanel()]).toEqual([null, 'Overview', 'Overview', null])
    })

    it('opens by no means while its trigger is disabled', () => {
      render(<Menu disabled />)

      hover('Overview')
      tick()
      fireEvent.click(trigger('Overview'))
      act(() => trigger('Overview').focus())
      fireEvent.keyDown(trigger('Overview'), { key: 'Enter' })

      expect(openPanel()).toBeNull()
    })
  })

  describe('value', () => {
    it('starts on its defaultValue, and tells onValueChange each item opened', () => {
      const onValueChange = vi.fn()
      render(<Menu defaultValue="handbook" onValueChange={onValueChange} />)
      const start = openPanel()

      fireEvent.click(trigger('Community'))

      expect([start, onValueChange.mock.calls]).toEqual(['Handbook', [['community']]])
    })

    it('follows a controlled value', () => {
      const { rerender } = render(<Menu value="overview" />)
      const first = openPanel()

      rerender(<Menu value="community" />)

      expect([first, openPanel()]).toEqual(['Overview', 'Community'])
    })
  })

  describe('focus', () => {
    it('gives focus back to its trigger when Escape closes it', () => {
      render(<Menu />)
      act(() => trigger('Overview').focus())
      fireEvent.click(trigger('Overview'))
      act(() => screen.getByText('Quick start').focus())

      fireEvent.keyDown(screen.getByText('Quick start'), { key: 'Escape' })

      expect([openPanel(), document.activeElement]).toEqual([null, trigger('Overview')])
    })

    it('leaves focus where it is when the pointer leaving closes it', () => {
      render(<Menu />)
      act(() => screen.getByText('Outside').focus())
      hover('Overview')
      tick()

      act(() => void fireEvent.pointerLeave(trigger('Overview'), { pointerType: 'mouse' }))
      tick(500)

      expect([openPanel(), document.activeElement?.textContent]).toEqual([null, 'Outside'])
    })
  })

  describe('links', () => {
    it('marks an active link as the current page, and no other', () => {
      render(<Menu defaultValue="handbook" />)

      expect(screen.getByText('Styling').getAttribute('aria-current')).toBe('page')
    })

    it('closes the menu on a click of a link, and keeps it open with closeOnSelect off', () => {
      const { unmount } = render(<Menu defaultValue="overview" />)
      fireEvent.click(screen.getByText('Quick start'))
      const closed = openPanel()
      unmount()
      render(<Menu defaultValue="overview" closeOnSelect={false} />)

      fireEvent.click(screen.getByText('Quick start'))

      expect([closed, openPanel()]).toEqual([null, 'Overview'])
    })

    it('stays open when a link loses focus to nothing, as the window does', () => {
      render(<Menu defaultValue="overview" />)
      act(() => screen.getByText('Quick start').focus())

      fireEvent.blur(screen.getByText('Quick start'), { relatedTarget: null })
      tick()

      expect(openPanel()).toBe('Overview')
    })
  })

  describe('list', () => {
    it('moves on from the focused trigger once an item before it is removed', () => {
      const { rerender } = render(<Menu />)
      act(() => trigger('Handbook').focus())

      rerender(<Menu withOverview={false} />)
      fireEvent.keyDown(trigger('Handbook'), { key: 'ArrowRight' })

      expect(document.activeElement).toBe(trigger('Community'))
    })
  })
})
