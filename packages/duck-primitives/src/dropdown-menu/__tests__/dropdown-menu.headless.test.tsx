// From Headless UI, packages/@headlessui-react/src/components/menu/menu.test.tsx. MIT, see
// src/__tests__/headless/LICENSE. Its Menu is a dropdown menu here. Left out, as Radix behaves otherwise: ArrowUp on
// the trigger opening on the last item, Tab closing the menu where Radix keeps it, Enter or Space with no item
// highlighted closing it, a disabled item refusing to show the focus code gives it, which Radix marks, and a
// programmatic click on the trigger opening it, where Radix opens on the pointer down. Its render props, `as`, `static` and `unmount`, Transition, and the role="none" it gives the
// wrappers between items have no counterpart here.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from '../index'

freshDom()

type Item = string | { label: string; disabled: true }

function Menu({
  items = ['Item A', 'Item B', 'Item C'],
  disabled,
  onSelect,
}: {
  items?: Item[]
  disabled?: boolean
  onSelect?: (label: string) => void
}) {
  return (
    <>
      <button type="button">Outside</button>
      <DropdownMenu>
        <DropdownMenuTrigger disabled={disabled}>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            {items.map((item) => {
              const label = typeof item === 'string' ? item : item.label
              return (
                <DropdownMenuItem key={label} disabled={typeof item !== 'string'} onSelect={() => onSelect?.(label)}>
                  {label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </>
  )
}

const trigger = () => screen.getByText('Trigger')
const isOpen = () => screen.queryByRole('menu') !== null
const active = () =>
  document.activeElement?.getAttribute('role') === 'menuitem' ? document.activeElement.textContent : null
const off = (label: string) => ({ label, disabled: true }) as const

async function openWith(key: string) {
  act(() => trigger().focus())
  fireEvent.keyDown(trigger(), { key })
  await wait(0)
}

async function press(key: string) {
  fireEvent.keyDown(document.activeElement ?? document.body, { key })
  await wait(0)
}

describe('Headless UI menu safe guards', () => {
  it('renders closed without crashing', () => {
    render(<Menu />)

    expect([trigger().getAttribute('aria-expanded'), isOpen()]).toEqual(['false', false])
  })
})

describe('Headless UI menu opening from the keyboard', () => {
  for (const [name, key] of [
    ['Enter', 'Enter'],
    ['Space', ' '],
    ['ArrowDown', 'ArrowDown'],
  ]) {
    it(`opens on ${name} with its first item active`, async () => {
      render(<Menu />)

      await openWith(key)

      expect([isOpen(), active()]).toEqual([true, 'Item A'])
    })

    it(`stays closed on ${name} while its trigger is disabled`, async () => {
      render(<Menu disabled />)

      await openWith(key)

      expect(isOpen()).toBe(false)
    })

    it(`opens on ${name} with no item active when it has none`, async () => {
      render(<Menu items={[]} />)

      await openWith(key)

      expect([isOpen(), active()]).toEqual([true, null])
    })

    it(`opens on ${name} on its first item that is not disabled, past several that are`, async () => {
      render(<Menu items={[off('Item A'), off('Item B'), 'Item C', 'Item D']} />)

      await openWith(key)

      expect(active()).toBe('Item C')
    })

    it(`opens on ${name} with no item active when every item is disabled`, async () => {
      render(<Menu items={[off('Item A'), off('Item B')]} />)

      await openWith(key)

      expect([isOpen(), active()]).toEqual([true, null])
    })
  }
})

describe('Headless UI menu keys while open', () => {
  for (const [name, key] of [
    ['Enter', 'Enter'],
    ['Space', ' '],
  ]) {
    it(`runs the active item on ${name} and closes, giving focus back to its trigger`, async () => {
      const onSelect = vi.fn()
      render(<Menu onSelect={onSelect} />)
      await openWith('Enter')
      await press('ArrowDown')

      await press(key)

      expect([onSelect.mock.calls, isOpen(), document.activeElement]).toEqual([[['Item B']], false, trigger()])
    })
  }

  it('closes on Escape, giving focus back to its trigger', async () => {
    render(<Menu />)
    await openWith('Enter')

    await press('Escape')

    expect([isOpen(), document.activeElement]).toEqual([false, trigger()])
  })

  it('moves down on ArrowDown and up on ArrowUp, past disabled items', async () => {
    render(<Menu items={['Item A', off('Item B'), 'Item C', 'Item D']} />)
    await openWith('Enter')

    const seen: Array<string | null> = []
    for (const key of ['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp']) {
      await press(key)
      seen.push(active())
    }

    expect(seen).toEqual(['Item C', 'Item D', 'Item C', 'Item A'])
  })

  it('stays on its one item that is not disabled on ArrowUp and ArrowDown', async () => {
    render(<Menu items={[off('Item A'), 'Item B', off('Item C')]} />)
    await openWith('Enter')

    const seen: Array<string | null> = []
    for (const key of ['ArrowDown', 'ArrowUp']) {
      await press(key)
      seen.push(active())
    }

    expect(seen).toEqual(['Item B', 'Item B'])
  })

  for (const [keys, edge] of [
    [['End', 'PageDown'], 'last'],
    [['Home', 'PageUp'], 'first'],
  ] as const) {
    for (const key of keys) {
      it(`moves to the ${edge} item on ${key}, past disabled items`, async () => {
        const items =
          edge === 'last' ? ['Item A', 'Item B', 'Item C', off('Item D')] : [off('Item A'), 'Item B', 'Item C']
        render(<Menu items={items} />)
        await openWith('Enter')
        if (edge === 'first') await press('ArrowDown')

        await press(key)

        expect(active()).toBe(edge === 'last' ? 'Item C' : 'Item B')
      })

      it(`stays on the one item that is not disabled on ${key}`, async () => {
        render(<Menu items={edge === 'last' ? ['Item A', off('Item B')] : [off('Item A'), 'Item B']} />)
        await openWith('Enter')

        await press(key)

        expect(active()).toBe(edge === 'last' ? 'Item A' : 'Item B')
      })
    }
  }
})

describe('Headless UI menu typeahead', () => {
  const people = ['Alice', 'Bob', 'Charlie', 'Bob Dylan']

  async function type(text: string) {
    for (const key of text) fireEvent.keyDown(document.activeElement ?? document.body, { key })
    await wait(0)
  }

  it('moves to the item a whole word names', async () => {
    render(<Menu items={people} />)
    await openWith('Enter')

    await type('charlie')

    expect(active()).toBe('Charlie')
  })

  it('moves to the item the start of a word names', async () => {
    render(<Menu items={people} />)
    await openWith('Enter')

    await type('ch')

    expect(active()).toBe('Charlie')
  })

  it('takes a search with a space in it', async () => {
    render(<Menu items={people} />)
    await openWith('Enter')

    await type('bob d')

    expect(active()).toBe('Bob Dylan')
  })

  it('passes over a disabled item', async () => {
    render(<Menu items={['Alice', off('Bob'), 'Charlie']} />)
    await openWith('Enter')

    await type('b')

    expect(active()).toBe('Alice')
  })

  it('matches whatever the case', async () => {
    render(<Menu items={people} />)
    await openWith('Enter')

    await type('BOB')

    expect(active()).toBe('Bob')
  })

  it('moves on to the next match on the same letter typed again', async () => {
    render(<Menu items={people} />)
    await openWith('Enter')

    await type('b')
    const first = active()
    await new Promise((resolve) => setTimeout(resolve, 1100))
    await type('b')

    expect([first, active()]).toEqual(['Bob', 'Bob Dylan'])
  })

  it('stays on its item while the letters typed still match it', async () => {
    render(<Menu items={people} />)
    await openWith('Enter')

    const seen: Array<string | null> = []
    for (const key of 'bob') {
      await type(key)
      seen.push(active())
    }

    expect(seen).toEqual(['Bob', 'Bob', 'Bob'])
  })
})

describe('Headless UI menu with the mouse', () => {
  const press = (target: Element, init: { button?: number; ctrlKey?: boolean } = {}) =>
    fireEvent.pointerDown(target, { button: 0, ctrlKey: false, pointerType: 'mouse', ...init })

  it('opens on a press of its trigger, and closes on the next', async () => {
    render(<Menu />)

    press(trigger())
    const opened = isOpen()
    press(trigger())

    expect([opened, isOpen()]).toEqual([true, false])
  })

  it('stays closed on a right press, and while its trigger is disabled', () => {
    const { unmount } = render(<Menu />)
    press(trigger(), { button: 2 })
    const right = isOpen()
    unmount()
    render(<Menu disabled />)

    press(trigger())

    expect([right, isOpen()]).toEqual([false, false])
  })

  it('closes on a press outside it, and does nothing on one while closed', async () => {
    render(<Menu />)
    press(screen.getByText('Outside'))
    const closed = isOpen()
    press(trigger())

    press(screen.getByText('Outside'))
    await wait(0)

    expect([closed, isOpen()]).toEqual([false, false])
  })

  it('closes and opens another on a press of that menu trigger', async () => {
    render(
      <>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger>First</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem>One</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger>Second</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem>Two</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </>,
    )
    press(screen.getByText('First'))

    press(screen.getByText('Second'))
    await wait(0)

    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Two'])
  })

  it('makes the item the pointer moves over active, and none once it leaves, passing over a disabled item', async () => {
    render(<Menu items={['Item A', off('Item B'), 'Item C']} />)
    press(trigger())
    await wait(0)
    const item = (label: string) => screen.getByText(label)
    const move = (label: string) => fireEvent.pointerMove(item(label), { pointerType: 'mouse' })

    move('Item C')
    const hovered = active()
    move('Item B')
    const overDisabled = active()
    fireEvent.pointerLeave(item('Item C'), { pointerType: 'mouse' })

    expect([hovered, overDisabled, active()]).toEqual(['Item C', null, null])
  })

  it('runs an item clicked and closes, and does nothing on a click of a disabled item', async () => {
    const onSelect = vi.fn()
    render(<Menu items={['Item A', off('Item B')]} onSelect={onSelect} />)
    press(trigger())
    await wait(0)

    fireEvent.click(screen.getByText('Item B'))
    const afterDisabled = isOpen()
    fireEvent.click(screen.getByText('Item A'))

    expect([afterDisabled, onSelect.mock.calls, isOpen()]).toEqual([true, [['Item A']], false])
  })

  it('makes an item active when it takes focus', async () => {
    render(<Menu />)
    press(trigger())
    await wait(0)

    act(() => screen.getByText('Item C').focus())

    expect(active()).toBe('Item C')
  })
})

describe('Headless UI menu items changing', () => {
  it('keeps the order of its items after one is taken out and put back', async () => {
    const menu = (hide: boolean) => <Menu items={hide ? ['Item A', 'Item C'] : ['Item A', 'Item B', 'Item C']} />
    const { rerender } = render(menu(false))
    await openWith('Enter')
    rerender(menu(true))
    rerender(menu(false))

    const seen: Array<string | null> = []
    for (const key of ['ArrowDown', 'ArrowDown']) {
      await press(key)
      seen.push(active())
    }

    expect(seen).toEqual(['Item B', 'Item C'])
  })
})
