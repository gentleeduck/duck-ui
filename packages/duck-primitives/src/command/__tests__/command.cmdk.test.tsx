// From cmdk, test/*.test.ts and test/pages/*.tsx. MIT, see src/__tests__/cmdk/LICENSE.
// cmdk drives each page in a browser; these render the same page in jsdom, reading a filtered item as hidden, where
// cmdk takes it out of the page. cmdk's `value` is both what an item is searched by and what it is picked as; here
// `textValue` is searched and `value` is picked, so an item cmdk gives a value is given both.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../index'

freshDom()

// jsdom has no scrollIntoView, which the list calls to keep the highlighted item in view.
Element.prototype.scrollIntoView ??= () => {}

const input = () => screen.getByRole('combobox')
const type = (search: string) => fireEvent.change(input(), { target: { value: search } })
const press = (key: string, modifiers: { altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } = {}) =>
  fireEvent.keyDown(input(), { key, ...modifiers })
const shown = () =>
  screen
    .getAllByRole('option', { hidden: true })
    .filter((item) => !item.hidden)
    .map((item) => item.getAttribute('data-value'))
const highlighted = () => document.querySelector('[data-highlighted]')?.getAttribute('data-value') ?? null
const group = (heading: string) =>
  screen.getAllByRole('group', { hidden: true }).find((node) => node.textContent?.startsWith(heading))

describe('cmdk basic behavior', () => {
  function Page({ onSelect }: { onSelect?: (value: string) => void }) {
    return (
      <Command className="root">
        <CommandInput placeholder="Search..." className="input" />
        <CommandList className="list">
          <CommandEmpty className="empty">No results.</CommandEmpty>
          <CommandItem value="item" keywords={['key']} onSelect={onSelect} className="item">
            Item
          </CommandItem>
          <CommandItem value="xxx" textValue="xxx" className="item">
            Value
          </CommandItem>
        </CommandList>
      </Command>
    )
  }

  it('forwards the input props', () => {
    render(<Page />)

    expect(input().getAttribute('placeholder')).toBe('Search...')
  })

  it('prefers the item value prop over its text', () => {
    render(<Page />)

    expect(screen.getByText('Value').getAttribute('data-value')).toBe('xxx')
  })

  it('calls onSelect on click', () => {
    const onSelect = vi.fn()
    render(<Page onSelect={onSelect} />)

    fireEvent.click(screen.getByText('Item'))

    expect(onSelect).toHaveBeenCalledWith('item')
  })

  it('highlights the first item by default', () => {
    render(<Page />)

    expect(highlighted()).toBe('item')
  })

  it('highlights the first item when the search changes', () => {
    render(<Page />)
    press('ArrowDown')

    type('x')

    expect(highlighted()).toBe('xxx')
  })

  it('filters the items as the search changes', () => {
    render(<Page />)

    type('item')

    expect(shown()).toEqual(['item'])
  })

  it('filters the items by their keywords', () => {
    render(<Page />)

    type('key')

    expect(shown()).toEqual(['item'])
  })

  it('shows the empty state when nothing matches', () => {
    render(<Page />)

    type('aaa')

    expect([shown(), screen.getByText('No results.').hidden]).toEqual([[], false])
  })

  it('applies a className to each part', () => {
    const { container } = render(<Page />)

    expect(
      ['.root', '.input', '.list', '.item', '.empty'].map((part) => container.querySelector(part) !== null),
    ).toEqual([true, true, true, true, true])
  })
})

describe('cmdk numeric values', () => {
  function Page() {
    return (
      <Command>
        <CommandInput />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandItem value="removed" textValue="removed">
            To be removed
          </CommandItem>
          <CommandItem value="foo.bar112.value" textValue="foo.bar112.value">
            Not to be removed
          </CommandItem>
        </CommandList>
      </Command>
    )
  }

  it('filters on a numeric search', () => {
    render(<Page />)

    type('112')

    expect(shown()).toEqual(['foo.bar112.value'])
  })

  it('filters on a search that is not numeric', () => {
    render(<Page />)

    type('bar')

    expect(shown()).toEqual(['foo.bar112.value'])
  })
})

describe('cmdk keybinds', () => {
  function Page({ vimBindings }: { vimBindings?: boolean }) {
    return (
      <Command vimBindings={vimBindings}>
        <CommandInput />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandItem value="disabled" disabled>
            Disabled
          </CommandItem>
          <CommandItem value="first">First</CommandItem>
          <CommandGroup heading="Letters">
            <CommandItem value="A">A</CommandItem>
            <CommandItem value="B">B</CommandItem>
            <CommandItem value="Z">Z</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Fruits">
            <CommandItem value="Apple">Apple</CommandItem>
            <CommandItem value="Banana">Banana</CommandItem>
            <CommandItem value="Orange">Orange</CommandItem>
            <CommandItem value="Dragon Fruit" disabled>
              Dragon Fruit
            </CommandItem>
            <CommandItem value="Pear">Pear</CommandItem>
          </CommandGroup>
          <CommandItem value="last">Last</CommandItem>
          <CommandItem value="disabled-3" disabled>
            Disabled 3
          </CommandItem>
        </CommandList>
      </Command>
    )
  }

  const walk = (steps: [string, Parameters<typeof press>[1]?][]) =>
    steps.map(([key, modifiers]) => {
      press(key, modifiers)
      return highlighted()
    })

  it('moves the highlight on ArrowDown and ArrowUp', () => {
    render(<Page />)

    expect(walk([['ArrowDown'], ['ArrowUp']])).toEqual(['A', 'first'])
  })

  it('jumps to the first and last items on Meta with an arrow', () => {
    render(<Page />)

    expect(
      walk([
        ['ArrowDown', { metaKey: true }],
        ['ArrowUp', { metaKey: true }],
      ]),
    ).toEqual(['last', 'first'])
  })

  it('jumps to the next and previous group on Alt with an arrow', () => {
    render(<Page />)

    expect(
      walk([
        ['ArrowDown', { altKey: true }],
        ['ArrowDown', { altKey: true }],
        ['ArrowUp', { altKey: true }],
        ['ArrowUp', { altKey: true }],
      ]),
    ).toEqual(['A', 'Apple', 'A', 'first'])
  })

  for (const [down, up] of [
    ['j', 'k'],
    ['n', 'p'],
  ]) {
    it(`moves the highlight on Ctrl+${down} and Ctrl+${up}`, () => {
      render(<Page />)

      expect(
        walk([
          [down, { ctrlKey: true }],
          [up, { ctrlKey: true }],
        ]),
      ).toEqual(['A', 'first'])
    })

    it(`jumps to the first and last items on Meta+Ctrl+${down} and Meta+Ctrl+${up}`, () => {
      render(<Page />)

      expect(
        walk([
          [down, { ctrlKey: true, metaKey: true }],
          [up, { ctrlKey: true, metaKey: true }],
        ]),
      ).toEqual(['last', 'first'])
    })

    it(`jumps to the next and previous group on Alt+Ctrl+${down} and Alt+Ctrl+${up}`, () => {
      render(<Page />)

      expect(
        walk([
          [down, { altKey: true, ctrlKey: true }],
          [down, { altKey: true, ctrlKey: true }],
          [up, { altKey: true, ctrlKey: true }],
          [up, { altKey: true, ctrlKey: true }],
        ]),
      ).toEqual(['A', 'Apple', 'A', 'first'])
    })

    it(`leaves Ctrl+${down} and Ctrl+${up} alone with vimBindings off`, () => {
      render(<Page vimBindings={false} />)

      expect(
        walk([
          [down, { ctrlKey: true }],
          [up, { ctrlKey: true }],
        ]),
      ).toEqual(['first', 'first'])
    })
  }
})

describe('cmdk props', () => {
  function Page({
    shouldFilter = true,
    filter,
    initialValue = 'ant',
  }: {
    shouldFilter?: boolean
    filter?: (value: string, search: string) => number
    initialValue?: string
  }) {
    const [value, setValue] = React.useState(initialValue)
    const [search, setSearch] = React.useState('')
    return (
      <>
        <div data-testid="value">{value}</div>
        <button type="button" onClick={() => setValue('anteater')}>
          Change value
        </button>
        <button type="button" onClick={() => setSearch('eat')}>
          Change search value
        </button>
        <Command shouldFilter={shouldFilter} value={value} onValueChange={setValue} filter={filter}>
          <CommandInput value={search} onChange={(event) => setSearch(event.target.value)} />
          <CommandList>
            <CommandItem value="ant">ant</CommandItem>
            <CommandItem value="anteater">anteater</CommandItem>
          </CommandList>
        </Command>
      </>
    )
  }

  it('keeps every item with filtering off', () => {
    render(<Page shouldFilter={false} />)

    type('xxx')

    expect(shown()).toEqual(['ant', 'anteater'])
  })

  it('matches by a custom filter', () => {
    render(<Page filter={(value, search) => (!search || value.endsWith(search) ? 1 : 0)} />)

    type('eater')

    expect(shown()).toEqual(['anteater'])
  })

  it('follows a controlled value', () => {
    render(<Page />)
    const before = highlighted()

    fireEvent.click(screen.getByRole('button', { name: 'Change value' }))

    expect([before, highlighted()]).toEqual(['ant', 'anteater'])
  })

  it('clears the controlled value while nothing matches, and takes it back once something does', () => {
    render(<Page />)
    const value = () => screen.getByTestId('value').textContent

    type('d')
    const cleared = value()
    type('ant')

    expect([cleared, value()]).toEqual(['', 'ant'])
  })

  it('follows a controlled search', () => {
    render(<Page />)

    fireEvent.click(screen.getByRole('button', { name: 'Change search value' }))

    expect([shown(), highlighted()]).toEqual([['anteater'], 'anteater'])
  })

  it('keeps the highlight on the value it started with', () => {
    render(<Page initialValue="anteater" />)

    expect(highlighted()).toBe('anteater')
  })
})

describe('cmdk items', () => {
  function Page() {
    const [unmount, setUnmount] = React.useState(false)
    const [mount, setMount] = React.useState(false)
    const [many, setMany] = React.useState(false)
    const [forceMount, setForceMount] = React.useState(false)
    return (
      <>
        <button type="button" onClick={() => setMount(!mount)}>
          Toggle item B
        </button>
        <button type="button" onClick={() => setUnmount(!unmount)}>
          Toggle item A
        </button>
        <button type="button" onClick={() => setMany(!many)}>
          Toggle many items
        </button>
        <button type="button" onClick={() => setForceMount(!forceMount)}>
          Force mount item A
        </button>
        <Command>
          <CommandInput />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            {!unmount && (
              <CommandItem value="A" forceMount={forceMount}>
                A
              </CommandItem>
            )}
            {many && (
              <>
                <CommandItem value="1">1</CommandItem>
                <CommandItem value="2">2</CommandItem>
                <CommandItem value="3">3</CommandItem>
              </>
            )}
            {mount && <CommandItem value="B">B</CommandItem>}
          </CommandList>
        </Command>
      </>
    )
  }
  const toggle = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

  it('shows an item mounted under a search it matches', () => {
    render(<Page />)
    type('b')

    toggle('Toggle item B')

    expect(shown()).toEqual(['B'])
  })

  it('hides an item mounted under a search it does not match', () => {
    render(<Page />)
    type('z')

    toggle('Toggle item B')

    expect([shown(), screen.getByText('No results.').hidden]).toEqual([[], false])
  })

  it('highlights the next item when the highlighted one unmounts', () => {
    render(<Page />)
    toggle('Toggle item B')
    const before = highlighted()

    toggle('Toggle item A')

    expect([before, highlighted()]).toEqual(['A', 'B'])
  })

  it('shows the empty state when the only match unmounts', () => {
    render(<Page />)
    type('a')

    toggle('Toggle item A')

    expect(screen.getByText('No results.').hidden).toBe(false)
  })

  it('highlights an item mounted as the only match', () => {
    render(<Page />)
    toggle('Toggle item A')
    type('b')

    toggle('Toggle item B')

    expect([shown(), highlighted()]).toEqual([['B'], 'B'])
  })

  it('keeps the highlight where it is as items mount', () => {
    render(<Page />)
    press('ArrowDown')
    const before = highlighted()

    toggle('Toggle many items')

    expect([before, highlighted()]).toEqual(['A', 'A'])
  })

  it('shows a forceMount item whatever the search', () => {
    render(<Page />)
    toggle('Force mount item A')

    type('z')

    expect(shown()).toEqual(['A'])
  })

  it('filters again by the text of an item that renders again', () => {
    function Counter() {
      const [count, setCount] = React.useState(0)
      return (
        <>
          <button type="button" onClick={() => setCount((value) => value + 1)}>
            Increment count
          </button>
          <Command>
            <CommandInput />
            <CommandList>
              <CommandItem value={`Item A ${count}`}>Item A {count}</CommandItem>
              <CommandItem value={`Item B ${count}`}>Item B {count}</CommandItem>
            </CommandList>
          </Command>
        </>
      )
    }
    render(<Counter />)
    type('2')
    const increment = () => fireEvent.click(screen.getByRole('button', { name: 'Increment count' }))

    act(increment)
    const once = shown()
    act(increment)

    expect([once, shown()]).toEqual([[], ['Item A 2', 'Item B 2']])
  })
})

describe('cmdk groups', () => {
  function Page() {
    const [search, setSearch] = React.useState('')
    const [forceMount, setForceMount] = React.useState(false)
    return (
      <>
        <button type="button" onClick={() => setForceMount(!forceMount)}>
          Force mount Group Letters
        </button>
        <Command>
          <CommandInput value={search} onChange={(event) => setSearch(event.target.value)} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Animals">
              <CommandItem value="Giraffe">Giraffe</CommandItem>
              <CommandItem value="Chicken">Chicken</CommandItem>
            </CommandGroup>
            <CommandGroup forceMount={forceMount} heading="Letters">
              <CommandItem value="A">A</CommandItem>
              <CommandItem value="B">B</CommandItem>
              <CommandItem value="Z">Z</CommandItem>
            </CommandGroup>
            {search ? (
              <CommandGroup heading="Numbers">
                <CommandItem value="One">One</CommandItem>
                <CommandItem value="Two">Two</CommandItem>
                <CommandItem value="Three">Three</CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </>
    )
  }

  it('shows and hides each group by whether its items match', () => {
    render(<Page />)

    type('z')

    expect([group('Animals')?.hidden, group('Letters')?.hidden]).toEqual([true, false])
  })

  it('filters a group mounted under a search', () => {
    render(<Page />)

    type('t')

    expect([group('Animals')?.hidden, group('Letters')?.hidden, group('Numbers')?.hidden]).toEqual([true, true, false])
  })

  it('shows a forceMount group whatever the search', () => {
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: 'Force mount Group Letters' }))

    type('Giraffe')

    expect(group('Letters')?.hidden).toBe(false)
  })
})
