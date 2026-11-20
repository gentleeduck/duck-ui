// From Base UI, packages/react/src/menubar/Menubar.test.tsx. MIT, see src/__tests__/base-ui/LICENSE. Base UI's
// `loopFocus` is `loop` here. Left out: its touch cooldowns and scroll lock, `closeOnClick`, portal ownership and
// filterable menus, which have no counterpart.

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { clickOutside, freshDom, wait } from '../../__tests__/dom'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../index'

freshDom()

function Example({ disabledFirst, ...props }: React.ComponentProps<typeof Menubar> & { disabledFirst?: boolean }) {
  return (
    <>
      <button type="button">Before</button>
      <Menubar {...props}>
        <MenubarMenu value="file">
          <MenubarTrigger disabled={disabledFirst}>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarItem>Open</MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarPortal>
                  <MenubarSubContent>
                    <MenubarItem>Email</MenubarItem>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Zoom</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    </>
  )
}

const trigger = (name: string) => screen.getByRole('menuitem', { name, hidden: true })
const press = (name: string) =>
  fireEvent.pointerDown(trigger(name), { button: 0, ctrlKey: false, pointerType: 'mouse' })
const openMenu = () => screen.queryByRole('menu')?.textContent ?? null
const key = async (pressed: string) => {
  fireEvent.keyDown(document.activeElement ?? document.body, { key: pressed })
  await wait(0)
}

describe('Base UI menubar roles', () => {
  it('is a menubar with its orientation, and its triggers menu items', () => {
    render(<Example orientation="vertical" />)
    const bar = screen.getByRole('menubar')

    expect([bar.getAttribute('aria-orientation'), trigger('File').getAttribute('role')]).toEqual([
      'vertical',
      'menuitem',
    ])
  })
})

describe('Base UI menubar with the mouse', () => {
  it('opens a menu on a press of its trigger, and closes it on the next', async () => {
    render(<Example />)

    press('File')
    await wait(0)
    const opened = openMenu()
    press('File')
    await wait(0)

    expect([opened, openMenu()]).toEqual(['NewOpenShare', null])
  })

  it('moves to the menu the pointer enters while one is open, and opens none on hover while none is', async () => {
    render(<Example />)
    fireEvent.pointerEnter(trigger('Edit'), { pointerType: 'mouse' })
    await wait(0)
    const none = openMenu()

    press('File')
    await wait(0)
    fireEvent.pointerEnter(trigger('Edit'), { pointerType: 'mouse' })
    await wait(0)

    expect([none, openMenu()]).toEqual([null, 'Undo'])
  })

  it('closes the whole tree on one press outside once a submenu is open', async () => {
    render(<Example />)
    press('File')
    await wait(0)
    act(() => screen.getByRole('menuitem', { name: 'Share' }).focus())
    await key('ArrowRight')
    const sub = screen.queryByRole('menuitem', { name: 'Email' }) !== null

    await clickOutside(screen.getByText('Before'))

    expect([sub, screen.queryAllByRole('menu')]).toEqual([true, []])
  })
})

describe('Base UI menubar keys', () => {
  it('moves between triggers on the arrow keys, and to the ends on Home and End', async () => {
    render(<Example />)
    act(() => trigger('File').focus())

    const seen: Array<string | null | undefined> = []
    for (const pressed of ['ArrowRight', 'ArrowRight', 'Home', 'End', 'ArrowLeft']) {
      await key(pressed)
      seen.push(document.activeElement?.textContent)
    }

    expect(seen).toEqual(['Edit', 'View', 'File', 'View', 'Edit'])
  })

  it('moves between triggers on ArrowDown and ArrowUp when vertical', async () => {
    render(<Example orientation="vertical" />)
    act(() => trigger('File').focus())

    await key('ArrowDown')
    const down = document.activeElement?.textContent
    await key('ArrowUp')

    expect([down, document.activeElement?.textContent]).toEqual(['Edit', 'File'])
  })

  it('opens a menu on Space, moving through it with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<Example />)
    act(() => trigger('File').focus())

    await user.keyboard(' ')
    await wait(0)
    const first = document.activeElement?.textContent
    await key('ArrowDown')

    expect([first, document.activeElement?.textContent]).toEqual(['New', 'Open'])
  })

  it('opens a submenu on ArrowRight, and closes it on ArrowLeft, back on its trigger', async () => {
    render(<Example />)
    press('File')
    await wait(0)
    act(() => screen.getByRole('menuitem', { name: 'Share' }).focus())

    await key('ArrowRight')
    const opened = document.activeElement?.textContent
    await key('ArrowLeft')

    expect([opened, document.activeElement?.textContent]).toEqual(['Email', 'Share'])
  })

  it('takes the keyboard after a menu opens on a press', async () => {
    render(<Example />)
    press('File')
    await wait(0)

    await key('ArrowDown')

    expect(document.activeElement?.getAttribute('role')).toBe('menuitem')
  })

  for (const loop of [true, false]) {
    it(`goes ${loop ? 'round from the last trigger to the first' : 'no further than the last trigger'} with loop ${loop}`, async () => {
      render(<Example loop={loop} />)
      act(() => trigger('View').focus())

      await key('ArrowRight')
      const forward = document.activeElement?.textContent
      act(() => trigger('File').focus())
      await key('ArrowLeft')

      expect([forward, document.activeElement?.textContent]).toEqual(loop ? ['File', 'View'] : ['View', 'File'])
    })
  }
})

describe('Base UI menubar disabled', () => {
  it('disables its triggers while disabled', () => {
    render(<Example disabled />)

    expect(['File', 'Edit', 'View'].map((name) => trigger(name).hasAttribute('data-disabled'))).toEqual([
      true,
      true,
      true,
    ])
  })

  it('stays reachable by Tab while its first trigger is disabled', async () => {
    const user = userEvent.setup()
    render(<Example disabledFirst />)
    act(() => screen.getByText('Before').focus())

    await user.tab()

    expect(document.activeElement?.textContent).toBe('Edit')
  })
})
