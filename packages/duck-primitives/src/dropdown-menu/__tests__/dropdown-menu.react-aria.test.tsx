// From React Aria, packages/react-aria-components/test/Menu.test.tsx. Apache 2.0, see
// src/__tests__/react-aria/LICENSE; changed to drive this dropdown menu, its React Aria parts taken out. Left out:
// subdialogs, `escapeKeyBehavior`, async loading and the empty state, which have no counterpart here.

import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../index'

freshDom()

function Example({ onSelect }: { onSelect?: (name: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => onSelect?.('Open')}>Open</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <p>Send it to</p>
                <DropdownMenuItem onSelect={() => onSelect?.('Email')}>Email</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

const trigger = () => screen.getByText('Menu')
const press = (target: Element, type: 'pointerDown' | 'pointerUp', init = {}) =>
  fireEvent[type](target, { button: 0, ctrlKey: false, pointerType: 'mouse', ...init })

async function openSubmenu() {
  act(() => trigger().focus())
  fireEvent.keyDown(trigger(), { key: 'Enter' })
  await wait(0)
  const share = screen.getByRole('menuitem', { name: 'Share' })
  act(() => share.focus())
  fireEvent.keyDown(share, { key: 'ArrowRight' })
  await wait(0)
}

describe('React Aria menu submenus', () => {
  it('closes the whole menu on Escape in a submenu, giving focus back to the root trigger', async () => {
    render(<Example />)
    await openSubmenu()

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
    await wait(0)

    expect([screen.queryAllByRole('menu'), document.activeElement]).toEqual([[], trigger()])
  })

  it('stays open on a click on an element inside a submenu that is not an item', async () => {
    render(<Example />)
    await openSubmenu()

    press(screen.getByText('Send it to'), 'pointerDown')
    fireEvent.click(screen.getByText('Send it to'))
    await wait(0)

    expect(screen.getAllByRole('menu')).toHaveLength(2)
  })
})

describe('React Aria menu presses', () => {
  it('runs the item a press of the trigger is dragged onto and released over', async () => {
    const onSelect = vi.fn()
    render(<Example onSelect={onSelect} />)
    press(trigger(), 'pointerDown')
    await wait(0)

    fireEvent.pointerMove(screen.getByText('Open'), { pointerType: 'mouse' })
    press(screen.getByText('Open'), 'pointerUp')

    expect([onSelect.mock.calls, screen.queryAllByRole('menu')]).toEqual([[['Open']], []])
  })
})
