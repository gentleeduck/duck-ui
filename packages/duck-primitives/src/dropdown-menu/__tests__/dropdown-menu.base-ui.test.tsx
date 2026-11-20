// From Base UI, packages/react/src/menu/{root,checkbox-item,checkbox-item-indicator,radio-group}/*.test.tsx. MIT,
// see src/__tests__/base-ui/LICENSE. Base UI's Menu is a dropdown menu here. Left out, as Radix behaves otherwise:
// Escape in a submenu leaving its parent open, Tab and Shift+Tab closing the menu, and disabled items among those the
// arrow keys reach, and an item indicator outside a checkbox or radio item throwing, where Radix renders it unchecked.
// Its `openOnHover`, `closeParentOnEsc`, `highlightItemOnHover`, actionsRef, handles and
// cancelable event details have no counterpart.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clickOutside, freshDom, wait } from '../../__tests__/dom'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../index'

freshDom()

const open = async () => {
  fireEvent.pointerDown(screen.getByText('Open'), { button: 0, ctrlKey: false, pointerType: 'mouse' })
  await wait(0)
}

describe('Base UI menu nested', () => {
  function Nested() {
    return (
      <>
        <button type="button">Outside</button>
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem>Cut</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Deeper</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem>Deepest</DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </>
    )
  }

  async function openSub(name: string) {
    const sub = screen.getByRole('menuitem', { name })
    act(() => sub.focus())
    fireEvent.keyDown(sub, { key: 'ArrowRight' })
    await wait(0)
  }

  it('closes every level on a press outside the deepest submenu', async () => {
    render(<Nested />)
    await open()
    await openSub('More')
    await openSub('Deeper')
    const levels = screen.getAllByRole('menu').length

    await clickOutside(screen.getByText('Outside'))

    expect([levels, screen.queryAllByRole('menu')]).toEqual([3, []])
  })

  describe('opening a submenu on hover', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('opens a submenu once the pointer moves over its trigger', async () => {
      render(<Nested />)
      fireEvent.pointerDown(screen.getByText('Open'), { button: 0, ctrlKey: false, pointerType: 'mouse' })
      await act(async () => {
        vi.advanceTimersByTime(0)
      })
      const more = screen.getByRole('menuitem', { name: 'More' })

      fireEvent.pointerMove(more, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(200))
      const opened = screen.queryByRole('menuitem', { name: 'Deeper' }) !== null

      expect(opened).toBe(true)
    })
  })
})

describe('Base UI menu checkbox and radio items', () => {
  it('checks a checkbox item on a click, telling onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    function Checkbox() {
      const [checked, setChecked] = React.useState(false)
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={checked}
                onCheckedChange={(next) => {
                  setChecked(next)
                  onCheckedChange(next)
                }}
                onSelect={(event) => event.preventDefault()}>
                Show grid
                <DropdownMenuItemIndicator>on</DropdownMenuItemIndicator>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      )
    }
    render(<Checkbox />)
    await open()
    const item = screen.getByRole('menuitemcheckbox')

    fireEvent.click(item)

    expect([item.getAttribute('aria-checked'), onCheckedChange.mock.calls, screen.queryByText('on') !== null]).toEqual([
      'true',
      [[true]],
      true,
    ])
  })

  it('gives a radio group the group role, and checks the radio item clicked', async () => {
    function Radios() {
      const [value, setValue] = React.useState('a')
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
                <DropdownMenuRadioItem value="a" onSelect={(event) => event.preventDefault()}>
                  A
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="b" onSelect={(event) => event.preventDefault()}>
                  B
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      )
    }
    render(<Radios />)
    await open()

    fireEvent.click(screen.getByRole('menuitemradio', { name: 'B' }))

    expect([
      screen.getByRole('group').getAttribute('role'),
      screen.getAllByRole('menuitemradio').map((item) => item.getAttribute('aria-checked')),
    ]).toEqual(['group', ['false', 'true']])
  })
})
