// From Ark UI, packages/react/src/components/menu/tests/menu.test.tsx. MIT, see src/__tests__/ark/LICENSE.
// Ark's Menu is a dropdown menu here, and its context trigger a context menu. Its `lazyMount` and `unmountOnExit`
// are how content mounts here anyway. Left out: `positioning.placement`, which is `side` and `align` here and
// popper.test.tsx covers, and a value forwarded through the context trigger, which has no counterpart.

import { fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuTrigger,
} from '../../context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../index'

freshDom()

function ComponentUnderTest({
  onSelect,
  ...props
}: React.ComponentProps<typeof DropdownMenu> & { onSelect?: (value: string) => void }) {
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>JS Frameworks</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onSelect?.('react')}>React</DropdownMenuItem>
            <DropdownMenuItem disabled onSelect={() => onSelect?.('solid')}>
              Solid
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>CSS Frameworks</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Panda</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

const open = async () => {
  fireEvent.pointerDown(screen.getByText('Open menu'), { button: 0, ctrlKey: false, pointerType: 'mouse' })
  await wait(0)
}

describe('Ark UI menu', () => {
  it('has no axe violations while open', async () => {
    render(<ComponentUnderTest />)
    await open()

    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations()
  })

  it('marks a disabled item for assistive technology, and runs nothing on a click of it', async () => {
    const onSelect = vi.fn()
    render(<ComponentUnderTest onSelect={onSelect} />)
    await open()
    const solid = screen.getByRole('menuitem', { name: 'Solid' })

    fireEvent.click(solid)

    expect([solid.getAttribute('aria-disabled'), solid.hasAttribute('data-disabled'), onSelect.mock.calls]).toEqual([
      'true',
      true,
      [],
    ])
  })

  it('gives a group the group role, named by its label', async () => {
    render(<ComponentUnderTest />)
    await open()

    expect(screen.getByRole('group').getAttribute('role')).toBe('group')
  })

  it('follows an owner that controls it, mounting its content only while open', async () => {
    const { rerender } = render(<ComponentUnderTest open={false} />)
    const before = screen.queryByRole('menu')

    rerender(<ComponentUnderTest open />)
    await wait(0)

    expect([before, screen.queryByRole('menu') !== null]).toEqual([null, true])
  })

  it('opens on a context menu event', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuItem>Edit</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>,
    )

    fireEvent.contextMenu(screen.getByText('Right click me'))
    await wait(0)

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeVisible()
  })

  it('opens a submenu from its trigger', async () => {
    render(<ComponentUnderTest />)
    await open()

    const sub = screen.getByRole('menuitem', { name: 'CSS Frameworks' })
    sub.focus()
    fireEvent.keyDown(sub, { key: 'ArrowRight' })
    await wait(0)

    expect(screen.getByRole('menuitem', { name: 'Panda' })).toBeVisible()
  })

  it('checks the radio item picked', async () => {
    function Radios() {
      const [value, setValue] = React.useState('react')
      return (
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
                <DropdownMenuRadioItem value="react">React</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="solid">Solid</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      )
    }
    render(<Radios />)
    await wait(0)

    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Solid' }))
    fireEvent.pointerDown(screen.getByText('Open menu'), { button: 0, ctrlKey: false, pointerType: 'mouse' })
    await wait(0)

    expect(screen.getByRole('menuitemradio', { name: 'Solid' }).getAttribute('aria-checked')).toBe('true')
  })
})
