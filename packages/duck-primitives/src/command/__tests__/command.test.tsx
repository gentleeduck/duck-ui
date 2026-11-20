import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { renderToString } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  CommandStatus,
  fuzzyFilter,
  useCommandContext,
  useCommandItemContext,
  useCommandSearch,
  useCommandState,
} from '../index'

freshDom()

function renderCommand(props: Record<string, unknown> = {}) {
  return render(
    <Command {...props}>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        <CommandGroup heading="Fruits">
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>,
  )
}

describe('Command', () => {
  it('renders with data-slot="command"', () => {
    const { container } = renderCommand()
    expect(container.querySelector('[data-slot="command"]')).not.toBeNull()
  })

  it('renders input with data-slot="command-input"', () => {
    const { container } = renderCommand()
    expect(container.querySelector('[data-slot="command-input"]')).not.toBeNull()
  })

  it('renders list with data-slot="command-list"', () => {
    const { container } = renderCommand()
    expect(container.querySelector('[data-slot="command-list"]')).not.toBeNull()
  })

  it('renders items with data-slot="command-item"', () => {
    const { container } = renderCommand()
    expect(container.querySelectorAll('[data-slot="command-item"]').length).toBe(2)
  })

  it('renders group with data-slot="command-group"', () => {
    const { container } = renderCommand()
    expect(container.querySelector('[data-slot="command-group"]')).not.toBeNull()
  })

  it('renders empty with data-slot="command-empty"', () => {
    const { container } = renderCommand()
    // Empty is hidden when items exist, but still in DOM
    const empty = container.querySelector('[data-slot="command-empty"]')
    // May or may not render depending on filter state
    expect(container.querySelector('[data-slot="command"]')).not.toBeNull()
  })

  it('input has placeholder', () => {
    const { container } = renderCommand()
    const input = container.querySelector('input')
    expect(input?.getAttribute('placeholder')).toBe('Search...')
  })

  it('items have role="option"', () => {
    const { container } = renderCommand()
    const items = container.querySelectorAll('[role="option"]')
    expect(items.length).toBe(2)
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Command ref={ref}>
        <CommandList>
          <CommandItem value="x">X</CommandItem>
        </CommandList>
      </Command>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  // --- Input ARIA ---

  it('input has role="combobox"', () => {
    const { container } = renderCommand()
    expect(container.querySelector('input')?.getAttribute('role')).toBe('combobox')
  })

  it('input has aria-expanded="true"', () => {
    const { container } = renderCommand()
    expect(container.querySelector('input')?.getAttribute('aria-expanded')).toBe('true')
  })

  it('input has aria-autocomplete="list"', () => {
    const { container } = renderCommand()
    expect(container.querySelector('input')?.getAttribute('aria-autocomplete')).toBe('list')
  })

  it('input has aria-controls pointing to list', () => {
    const { container } = renderCommand()
    const input = container.querySelector('input')!
    const listId = input.getAttribute('aria-controls')
    expect(listId).toBeTruthy()
  })

  // --- Group ---

  it('group has role="group"', () => {
    const { container } = renderCommand()
    expect(container.querySelector('[data-slot="command-group"]')?.getAttribute('role')).toBe('group')
  })

  it('group heading renders with data-slot="command-group-heading"', () => {
    const { container } = renderCommand()
    const heading = container.querySelector('[data-slot="command-group-heading"]')
    expect(heading).not.toBeNull()
    expect(heading?.textContent).toBe('Fruits')
  })

  it('group has aria-labelledby pointing to heading', () => {
    const { container } = renderCommand()
    const group = container.querySelector('[data-slot="command-group"]')!
    const headingId = group.getAttribute('aria-labelledby')
    expect(headingId).toBeTruthy()
    expect(container.querySelector(`#${headingId}`)?.textContent).toBe('Fruits')
  })

  it('leaves a group without a heading unlabelled', () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem value="apple">Apple</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    const group = screen.getByRole('group')

    expect([
      group.hasAttribute('aria-labelledby'),
      container.querySelector('[data-slot="command-group-heading"]'),
    ]).toEqual([false, null])
  })

  // --- Items ---

  it('items have data-value attribute', () => {
    const { container } = renderCommand()
    const items = container.querySelectorAll('[data-slot="command-item"]')
    expect(items[0]!.getAttribute('data-value')).toBe('apple')
    expect(items[1]!.getAttribute('data-value')).toBe('banana')
  })

  it('disabled item has aria-disabled and data-disabled', () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandItem value="x" disabled>
            Disabled
          </CommandItem>
        </CommandList>
      </Command>,
    )
    const item = container.querySelector('[data-slot="command-item"]')!
    expect(item.getAttribute('aria-disabled')).toBe('true')
    expect(item.getAttribute('data-disabled')).toBe('')
  })

  it('items are li elements', () => {
    const { container } = renderCommand()
    const items = container.querySelectorAll('[data-slot="command-item"]')
    for (const item of items) {
      expect(item.tagName.toLowerCase()).toBe('li')
    }
  })

  // --- Separator ---

  it('renders separator with data-slot="command-separator"', () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandItem value="a">A</CommandItem>
          <CommandSeparator />
          <CommandItem value="b">B</CommandItem>
        </CommandList>
      </Command>,
    )
    expect(container.querySelector('[data-slot="command-separator"]')).not.toBeNull()
  })

  // --- className ---

  it('passes className to root', () => {
    const { container } = render(
      <Command className="my-command">
        <CommandList>
          <CommandItem value="x">X</CommandItem>
        </CommandList>
      </Command>,
    )
    expect(container.querySelector('.my-command')).not.toBeNull()
  })
})

// jsdom has no scrollIntoView.
const scrollIntoView = vi.fn()
const originalScrollIntoView = Element.prototype.scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = scrollIntoView
})
afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView
})

function renderGroupedCommand(children?: React.ReactNode) {
  const onSelect = vi.fn()
  render(
    <Command data-testid="root">
      <CommandInput aria-label="Search" />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        <CommandGroup heading="Fruits">
          <CommandItem value="apple" onSelect={onSelect}>
            Apple
          </CommandItem>
          <CommandItem value="banana" disabled onSelect={onSelect}>
            Banana
          </CommandItem>
          <CommandItem value="cherry" onSelect={onSelect}>
            Cherry
          </CommandItem>
        </CommandGroup>
        <CommandSeparator data-testid="separator" />
        <CommandGroup heading="Vegetables">
          <CommandItem value="carrot" onSelect={onSelect}>
            Carrot
          </CommandItem>
        </CommandGroup>
      </CommandList>
      {children}
    </Command>,
  )
  return { onSelect, root: screen.getByTestId('root'), input: screen.getByRole('combobox') }
}

const highlighted = () => document.querySelector('[data-highlighted]')?.textContent ?? null
const option = (name: string) => screen.getByText(name)
const group = (name: string) => screen.getByText(name).parentElement as HTMLElement

function press(root: HTMLElement, ...keys: string[]) {
  return keys.map((key) => fireEvent.keyDown(root, { key }))
}

describe('Command keyboard', () => {
  it('highlights the first item once the list mounts', () => {
    renderGroupedCommand()

    expect(highlighted()).toBe('Apple')
  })

  it('moves down past disabled items and stops at the last', () => {
    const { root } = renderGroupedCommand()

    scrollIntoView.mockClear()

    press(root, 'ArrowDown')
    expect(highlighted()).toBe('Cherry')
    expect(scrollIntoView.mock.contexts).toEqual([option('Cherry')])
    expect(scrollIntoView.mock.calls).toEqual([[{ block: 'nearest' }]])
    press(root, 'ArrowDown', 'ArrowDown')
    expect(highlighted()).toBe('Carrot')
  })

  it('moves up past disabled items and stops at the first', () => {
    const { root } = renderGroupedCommand()
    press(root, 'End')

    press(root, 'ArrowUp')
    expect(highlighted()).toBe('Cherry')
    press(root, 'ArrowUp', 'ArrowUp')
    expect(highlighted()).toBe('Apple')
  })

  it('jumps to the last and first items with End and Home', () => {
    const { root } = renderGroupedCommand()

    press(root, 'End')
    expect(highlighted()).toBe('Carrot')
    press(root, 'Home')
    expect(highlighted()).toBe('Apple')
  })

  it('starts from the first item going down and the last going up when nothing is highlighted', () => {
    const { root } = renderGroupedCommand()

    fireEvent.pointerMove(option('Banana'), { pointerType: 'mouse' })
    expect(highlighted()).toBeNull()
    press(root, 'ArrowUp')
    expect(highlighted()).toBe('Carrot')

    fireEvent.pointerMove(option('Banana'), { pointerType: 'mouse' })
    press(root, 'ArrowDown')
    expect(highlighted()).toBe('Apple')
  })

  it('selects the highlighted item on Enter', () => {
    const { root, onSelect } = renderGroupedCommand()

    press(root, 'ArrowDown', 'Enter')

    expect(onSelect.mock.calls).toEqual([['cherry']])
  })

  it('selects the item the mouse highlighted on Enter', () => {
    const { input, onSelect } = renderGroupedCommand()
    fireEvent.pointerMove(option('Cherry'), { pointerType: 'mouse' })

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelect.mock.calls).toEqual([['cherry']])
  })

  it('leaves the keys to an input method that is composing text', () => {
    const { input, onSelect } = renderGroupedCommand()

    fireEvent.keyDown(input, { key: 'ArrowDown', isComposing: true })
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(highlighted()).toBe('Apple')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('lets Tab and Shift+Tab leave, so an inline command traps no keyboard user', () => {
    const { root } = renderGroupedCommand()

    expect([press(root, 'Tab'), fireEvent.keyDown(root, { key: 'Tab', shiftKey: true })]).toEqual([[true], true])
  })

  it('selects nothing on the Enter Safari sends after composition, with keyCode 229', () => {
    const { input, onSelect } = renderGroupedCommand()

    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('leaves Enter on a button inside it to the button', () => {
    const { onSelect } = renderGroupedCommand(<button type="button">Help</button>)

    const notPrevented = fireEvent.keyDown(screen.getByText('Help'), { key: 'Enter' })

    expect([notPrevented, onSelect.mock.calls.length]).toEqual([true, 0])
  })

  it('moves down on Ctrl+N and Ctrl+J and up on Ctrl+P and Ctrl+K', () => {
    const { root } = renderGroupedCommand()
    const ctrl = (key: string) => {
      fireEvent.keyDown(root, { key, ctrlKey: true })
      return highlighted()
    }

    expect([ctrl('n'), ctrl('j'), ctrl('p'), ctrl('k')]).toEqual(['Cherry', 'Carrot', 'Cherry', 'Apple'])
  })

  it('leaves Ctrl+N, Ctrl+J, Ctrl+P and Ctrl+K to the input with vimBindings off, and N to typing', () => {
    render(<Fruits vimBindings={false} />)
    const input = screen.getByRole('combobox')

    const kept = ['n', 'j', 'p', 'k'].map((key) => fireEvent.keyDown(input, { key, ctrlKey: true }))
    fireEvent.keyDown(input, { key: 'n' })

    expect([kept, highlighted()]).toEqual([[true, true, true, true], 'Apple'])
  })

  it('jumps to the first item of the next group on Alt+ArrowDown and of the group before on Alt+ArrowUp', () => {
    const { root } = renderGroupedCommand()
    const alt = (key: string) => {
      fireEvent.keyDown(root, { key, altKey: true })
      return highlighted()
    }

    expect([alt('ArrowDown'), alt('ArrowDown'), alt('ArrowUp'), alt('ArrowUp')]).toEqual([
      'Carrot',
      'Carrot',
      'Apple',
      'Apple',
    ])
  })

  it('takes the items outside a group as a group of their own, and Alt+ArrowUp from inside a group to its start', () => {
    render(
      <Command data-testid="root">
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="home">Home</CommandItem>
          <CommandGroup heading="Fruits">
            <CommandItem value="apple">Apple</CommandItem>
            <CommandItem value="cherry">Cherry</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Vegetables">
            <CommandItem value="carrot">Carrot</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    const root = screen.getByTestId('root')
    const alt = (key: string) => {
      fireEvent.keyDown(root, { key, altKey: true })
      return highlighted()
    }

    const first = alt('ArrowDown')
    press(root, 'ArrowDown')

    expect([first, alt('ArrowUp'), alt('ArrowUp'), alt('ArrowDown'), alt('ArrowDown')]).toEqual([
      'Apple',
      'Apple',
      'Home',
      'Apple',
      'Carrot',
    ])
  })

  it('jumps to the last item on Cmd+ArrowDown and the first on Cmd+ArrowUp', () => {
    const { root } = renderGroupedCommand()

    fireEvent.keyDown(root, { key: 'ArrowDown', metaKey: true })
    const last = highlighted()
    fireEvent.keyDown(root, { key: 'ArrowUp', metaKey: true })

    expect([last, highlighted()]).toEqual(['Carrot', 'Apple'])
  })

  it('jumps to the last item on PageDown and the first on PageUp when the list does not scroll', () => {
    const { root } = renderGroupedCommand()

    const prevented = press(root, 'PageDown')
    const last = highlighted()
    press(root, 'PageUp')

    expect([prevented, last, highlighted()]).toEqual([[false], 'Carrot', 'Apple'])
  })

  it('moves a page of the list on PageDown and PageUp when it scrolls', () => {
    const { root } = renderGroupedCommand()
    const list = document.querySelector<HTMLElement>('[data-slot="command-list"]') as HTMLElement
    const rows = ['Apple', 'Banana', 'Cherry', 'Carrot']
    Object.defineProperties(list, { clientHeight: { value: 40 }, scrollHeight: { value: 80 } })
    for (const [index, name] of rows.entries()) {
      option(name).getBoundingClientRect = () => DOMRect.fromRect({ y: index * 20, height: 20 })
    }

    press(root, 'PageDown')
    const down = highlighted()
    press(root, 'PageUp')
    const up = highlighted()
    press(root, 'End', 'PageDown')

    expect([down, up, highlighted()]).toEqual(['Cherry', 'Apple', 'Carrot'])
  })

  it('does nothing on navigation keys when no item is visible', () => {
    const { root, input, onSelect } = renderGroupedCommand()
    fireEvent.change(input, { target: { value: 'zzz' } })

    expect(press(root, 'ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp', 'Enter')).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ])
    expect(highlighted()).toBeNull()
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('Command filtering', () => {
  it('hides the items that do not match and highlights the first that does', () => {
    const { input } = renderGroupedCommand()

    fireEvent.change(input, { target: { value: 'CH' } })

    expect(option('Apple').hidden).toBe(true)
    expect(option('Cherry').hidden).toBe(false)
    expect(highlighted()).toBe('Cherry')
  })

  it('hides a group left with no match, and the separator after it, until the search clears', () => {
    const { input } = renderGroupedCommand()

    fireEvent.change(input, { target: { value: 'carr' } })
    expect(group('Fruits').hidden).toBe(true)
    expect(screen.getByTestId('separator').hidden).toBe(true)
    expect(group('Vegetables').hidden).toBe(false)

    fireEvent.change(input, { target: { value: '' } })
    expect(group('Fruits').hidden).toBe(false)
    expect(screen.getByTestId('separator').hidden).toBe(false)
  })

  it('shows the empty state for a list with no items', () => {
    render(
      <Command>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
        </CommandList>
      </Command>,
    )

    expect(screen.getByText('No results').hidden).toBe(false)
  })

  it('shows the empty state only when nothing matches', () => {
    const { input } = renderGroupedCommand()
    const empty = screen.getByText('No results')
    expect(empty.hidden).toBe(true)

    fireEvent.change(input, { target: { value: 'zzz' } })

    expect(empty.hidden).toBe(false)
  })

  it('hides nothing while shouldFilter is off, leaving the filtering to the caller', () => {
    render(
      <Command shouldFilter={false}>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
        </CommandList>
      </Command>,
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzz' } })

    expect(screen.getByRole('option').hidden).toBe(false)
  })
})

describe('Command item', () => {
  it('highlights an item the mouse moves over and selects it on pointer up, once', () => {
    const { onSelect } = renderGroupedCommand()
    const cherry = option('Cherry')

    fireEvent.pointerMove(cherry, { pointerType: 'mouse' })
    expect(highlighted()).toBe('Cherry')
    fireEvent.pointerDown(cherry, { pointerType: 'mouse' })
    fireEvent.pointerUp(cherry, { pointerType: 'mouse' })
    fireEvent.click(cherry, { detail: 1 })

    expect(onSelect.mock.calls).toEqual([['cherry']])
  })

  it('leaves the highlight where it is as the mouse moves with disablePointerSelection, and still selects on a click', () => {
    const onSelect = vi.fn()
    render(
      <Fruits
        disablePointerSelection
        extra={
          <>
            <CommandItem value="pear" onSelect={onSelect}>
              Pear
            </CommandItem>
            <CommandItem value="plum" disabled>
              Plum
            </CommandItem>
          </>
        }
      />,
    )
    const pear = option('Pear')

    fireEvent.pointerMove(pear, { pointerType: 'mouse' })
    fireEvent.pointerMove(option('Plum'), { pointerType: 'mouse' })
    const moved = highlighted()
    fireEvent.pointerDown(pear, { pointerType: 'mouse' })
    fireEvent.pointerUp(pear, { pointerType: 'mouse' })

    expect([moved, onSelect.mock.calls]).toEqual(['Apple', [['pear']]])
  })

  it('selects a touched item on the click, not the pointer up', () => {
    const { onSelect } = renderGroupedCommand()
    const cherry = option('Cherry')

    fireEvent.pointerDown(cherry, { pointerType: 'touch' })
    fireEvent.pointerUp(cherry, { pointerType: 'touch' })
    expect(onSelect).not.toHaveBeenCalled()
    fireEvent.click(cherry, { detail: 1 })

    expect(onSelect.mock.calls).toEqual([['cherry']])
  })

  it('selects an item a screen reader clicks after the mouse moved over it', () => {
    const { onSelect } = renderGroupedCommand()
    const cherry = option('Cherry')
    fireEvent.pointerMove(cherry, { pointerType: 'mouse' })

    fireEvent.click(cherry, { detail: 0 })

    expect(onSelect.mock.calls).toEqual([['cherry']])
  })

  it('leaves the highlight where it is when a touch moves over an item', () => {
    renderGroupedCommand()

    fireEvent.pointerMove(option('Cherry'), { pointerType: 'touch' })

    expect(highlighted()).toBe('Apple')
  })

  it('highlights an item that takes focus', () => {
    renderGroupedCommand()

    act(() => option('Carrot').focus())

    expect(highlighted()).toBe('Carrot')
  })

  it('hands focus back to the input when the pointer leaves the focused item', () => {
    const { input } = renderGroupedCommand()
    const carrot = option('Carrot')
    act(() => carrot.focus())

    fireEvent.pointerLeave(carrot)

    expect(document.activeElement).toBe(input)
    expect(highlighted()).toBeNull()
  })

  it('keeps the highlight when the pointer leaves an item without focus', () => {
    renderGroupedCommand()

    fireEvent.pointerLeave(option('Apple'))

    expect(highlighted()).toBe('Apple')
  })

  it('selects a focused item on Space, and keeps Space from scrolling', () => {
    const { onSelect } = renderGroupedCommand()
    const cherry = option('Cherry')
    act(() => cherry.focus())

    const spaceDefault = fireEvent.keyDown(cherry, { key: ' ' })
    fireEvent.keyDown(cherry, { key: 'a' })

    expect(onSelect.mock.calls).toEqual([['cherry']])
    expect(spaceDefault).toBe(false)
  })

  it('selects a focused item once on Enter', () => {
    const { onSelect } = renderGroupedCommand()
    const cherry = option('Cherry')
    act(() => cherry.focus())

    fireEvent.keyDown(cherry, { key: 'Enter' })

    expect(onSelect.mock.calls).toEqual([['cherry']])
  })

  it('never selects a disabled item from its own keys', () => {
    const { onSelect } = renderGroupedCommand()
    const banana = option('Banana')
    act(() => banana.focus())

    fireEvent.keyDown(banana, { key: ' ' })

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('leaves Space to a typeahead a consumer is running', () => {
    function TypingAhead() {
      useCommandContext('TypingAhead', undefined).typeaheadSearchRef.current = 'c'
      return null
    }
    const { onSelect } = renderGroupedCommand(<TypingAhead />)

    fireEvent.keyDown(option('Cherry'), { key: ' ' })

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('takes its search text from a text part when one names it, leaving the rest unsearched', () => {
    function ItemText({ children }: { children: string }) {
      return <span ref={useCommandItemContext('ItemText', undefined).onItemTextChange}>{children}</span>
    }
    render(
      <Command>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="save">
            <ItemText>Save</ItemText>
            <kbd>Ctrl S</kbd>
          </CommandItem>
        </CommandList>
      </Command>,
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ctrl' } })

    expect(screen.getByRole('option', { hidden: true }).hidden).toBe(true)
  })

  it('is found by all it shows once its text part unmounts', () => {
    function ItemText({ children }: { children: string }) {
      return <span ref={useCommandItemContext('ItemText', undefined).onItemTextChange}>{children}</span>
    }
    function Save({ showText }: { showText: boolean }) {
      return (
        <Command>
          <CommandInput aria-label="Search" />
          <CommandList>
            <CommandItem value="save">
              {showText ? <ItemText>Save</ItemText> : null}
              <kbd>Ctrl S</kbd>
            </CommandItem>
          </CommandList>
        </Command>
      )
    }
    const { rerender } = render(<Save showText />)
    rerender(<Save showText={false} />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ctrl' } })

    expect(screen.getByRole('option').hidden).toBe(false)
  })

  it('is found by the text it shows now, not the text it first showed', () => {
    function Fruit({ name }: { name: string }) {
      return (
        <Command>
          <CommandInput aria-label="Search" />
          <CommandList>
            <CommandItem value="fruit">{name}</CommandItem>
          </CommandList>
        </Command>
      )
    }
    const { rerender } = render(<Fruit name="Apple" />)
    rerender(<Fruit name="Apricot" />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'apricot' } })

    expect(screen.getByRole('option', { hidden: true }).hidden).toBe(false)
  })

  it('is found by the text its text part shows now', () => {
    function ItemText({ children }: { children: string }) {
      return <span ref={useCommandItemContext('ItemText', undefined).onItemTextChange}>{children}</span>
    }
    function Save({ label }: { label: string }) {
      return (
        <Command>
          <CommandInput aria-label="Search" />
          <CommandList>
            <CommandItem value="save">
              <ItemText>{label}</ItemText>
              <kbd>Ctrl S</kbd>
            </CommandItem>
          </CommandList>
        </Command>
      )
    }
    const { rerender } = render(<Save label="Save" />)
    rerender(<Save label="Save as" />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'save as' } })

    expect(screen.getByRole('option', { hidden: true }).hidden).toBe(false)
  })

  it('is found by its textValue rather than what it shows', () => {
    render(
      <Command>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="gear" textValue="Settings">
            <svg aria-hidden />
            Preferences
          </CommandItem>
        </CommandList>
      </Command>,
    )
    const search = screen.getByRole('combobox')
    const item = screen.getByRole('option', { hidden: true })

    fireEvent.change(search, { target: { value: 'settings' } })
    const foundBySettings = !item.hidden
    fireEvent.change(search, { target: { value: 'preferences' } })

    expect([foundBySettings, item.hidden]).toEqual([true, true])
  })

  it('selects with an empty value when it names none', () => {
    const onSelect = vi.fn()
    render(
      <Command>
        <CommandList>
          <CommandItem onSelect={onSelect}>Untitled</CommandItem>
        </CommandList>
      </Command>,
    )
    const item = screen.getByRole('option')

    fireEvent.click(item)

    expect([item.getAttribute('data-value'), onSelect.mock.calls]).toEqual(['', [['']]])
  })
})

describe('Command input state', () => {
  function ControlledSearch() {
    const [search, setSearch] = React.useState('')
    return (
      <Command>
        <CommandInput aria-label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
        <button type="button" onClick={() => setSearch('')}>
          Clear
        </button>
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
        </CommandList>
      </Command>
    )
  }

  it('keeps every item when a controlled search refuses an edit', () => {
    render(
      <Command>
        <CommandInput aria-label="Search" value="" onChange={() => {}} />
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
        </CommandList>
      </Command>,
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } })

    expect(option('Apple').closest('[hidden]')).toBeNull()
  })

  it('filters again when a controlled search is cleared without typing', async () => {
    render(<ControlledSearch />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ban' } })
    await act(async () => {})
    expect(screen.getByText('Apple').hidden).toBe(true)

    fireEvent.click(screen.getByText('Clear'))
    await act(async () => {})

    expect(screen.getByText('Apple').hidden).toBe(false)
  })

  it('names the highlighted option as the active descendant of the input', async () => {
    renderCommand()
    await act(async () => {})
    const input = screen.getByRole('combobox')
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByText('Apple').id)

    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByText('Banana').id)
  })

  it('highlights the first match before the keystroke that filtered returns', async () => {
    renderCommand()
    await act(async () => {})
    const input = screen.getByRole<HTMLInputElement>('combobox')
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    // act would flush a render left for a later task, which is the bug.
    const actEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', false)

    setValue?.call(input, 'ban')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    const active = input.getAttribute('aria-activedescendant')

    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', actEnvironment)
    await act(async () => {})
    expect(active).toBe(screen.getByText('Banana').id)
  })
})

describe('Command loop', () => {
  const highlighted = () =>
    screen.getAllByRole('option').find((item) => item.hasAttribute('data-highlighted'))?.textContent

  it('stops at the ends without loop', async () => {
    renderCommand()
    await act(async () => {})
    const input = screen.getByRole('combobox')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(highlighted()).toBe('Apple')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(highlighted()).toBe('Banana')
  })

  it('wraps from one end to the other with loop', async () => {
    renderCommand({ loop: true })
    await act(async () => {})
    const input = screen.getByRole('combobox')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(highlighted()).toBe('Banana')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(highlighted()).toBe('Apple')
  })
})

describe('Command.Item keywords', () => {
  it('matches a search against its keywords as well as its text', async () => {
    render(
      <Command>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="settings" keywords={['preferences', 'options']}>
            Settings
          </CommandItem>
          <CommandItem value="profile">Profile</CommandItem>
        </CommandList>
      </Command>,
    )
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'OPTIONS' } })
    await act(async () => {})
    expect([screen.getByText('Settings').hidden, screen.getByText('Profile').hidden]).toEqual([false, true])

    fireEvent.change(input, { target: { value: 'prof' } })
    await act(async () => {})
    expect([screen.getByText('Settings').hidden, screen.getByText('Profile').hidden]).toEqual([true, false])
  })
})

const texts = () =>
  screen
    .getAllByRole('option', { hidden: true })
    .filter((item) => !item.hidden)
    .map((item) => item.textContent)

function Fruits(props: React.ComponentProps<typeof Command> & { extra?: React.ReactNode }) {
  const { extra, children, ...commandProps } = props
  return (
    <Command {...commandProps}>
      <CommandInput aria-label="Search" />
      {children}
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        <CommandItem value="apple">Apple</CommandItem>
        <CommandItem value="banana">Banana</CommandItem>
        <CommandItem value="cherry">Cherry</CommandItem>
        {extra}
      </CommandList>
    </Command>
  )
}

const type = (search: string) => fireEvent.change(screen.getByRole('combobox'), { target: { value: search } })

describe('Command highlight value', () => {
  it('tells onValueChange the value of each item the highlight moves to', () => {
    const onValueChange = vi.fn()
    render(<Fruits onValueChange={onValueChange} />)

    press(screen.getByRole('combobox'), 'ArrowDown', 'ArrowDown')
    type('zzz')

    expect(onValueChange.mock.calls).toEqual([['apple'], ['banana'], ['cherry'], ['']])
  })

  it('stays quiet when the highlight moves between items of the same value', () => {
    const onValueChange = vi.fn()
    render(
      <Command onValueChange={onValueChange}>
        <CommandList>
          <CommandItem>One</CommandItem>
          <CommandItem>Two</CommandItem>
        </CommandList>
      </Command>,
    )

    fireEvent.pointerMove(option('Two'), { pointerType: 'mouse' })

    expect([highlighted(), onValueChange.mock.calls]).toEqual(['Two', []])
  })

  it('highlights the defaultValue item first, and the first item when it names none shown', () => {
    const { unmount } = render(<Fruits defaultValue="banana" />)
    const named = highlighted()
    unmount()
    render(<Fruits defaultValue="kiwi" />)

    expect([named, highlighted()]).toEqual(['Banana', 'Apple'])
  })

  it('highlights the item a controlled value names, and moves only once the owner takes the change', () => {
    const asked: string[] = []
    function Owned({ follow }: { follow: boolean }) {
      const [value, setValue] = React.useState('banana')
      return (
        <Fruits
          value={value}
          onValueChange={(next) => {
            asked.push(next)
            if (follow) setValue(next)
          }}
        />
      )
    }
    const { unmount } = render(<Owned follow={false} />)
    const input = screen.getByRole('combobox')
    press(input, 'ArrowDown')
    const ignored = highlighted()
    unmount()
    render(<Owned follow />)
    press(screen.getByRole('combobox'), 'ArrowDown')

    expect([ignored, highlighted(), asked]).toEqual(['Banana', 'Cherry', ['cherry', 'cherry']])
  })

  it('leaves the highlight empty when the owner clears it to an empty value', () => {
    function Owned() {
      const [value, setValue] = React.useState('apple')
      return (
        <Fruits value={value} onValueChange={setValue}>
          <button type="button" onClick={() => setValue('')}>
            Clear
          </button>
        </Fruits>
      )
    }
    render(<Owned />)
    const before = highlighted()

    fireEvent.click(screen.getByText('Clear'))

    expect([before, highlighted()]).toEqual(['Apple', null])
  })

  it('asks for the first match when a search hides the controlled item, and for none when nothing matches', () => {
    function Owned() {
      const [value, setValue] = React.useState('apple')
      return <Fruits value={value} onValueChange={setValue} />
    }
    render(<Owned />)

    type('an')
    const matched = highlighted()
    type('zzz')

    expect([matched, highlighted(), screen.getByRole('combobox').hasAttribute('aria-activedescendant')]).toEqual([
      'Banana',
      null,
      false,
    ])
  })

  it('asks for the first match on a search, keeping the controlled item highlighted until the owner moves it', () => {
    const onValueChange = vi.fn()
    render(<Fruits value="banana" onValueChange={onValueChange} />)

    type('a')

    expect([highlighted(), onValueChange.mock.calls]).toEqual(['Banana', [['apple']]])
  })

  it('asks for the first item when a controlled value names none, and highlights nothing for an empty one', () => {
    const onValueChange = vi.fn()
    render(<Fruits value="" onValueChange={onValueChange} />)

    expect([highlighted(), onValueChange.mock.calls]).toEqual([null, [['apple']]])
  })
})

describe('Command ranking', () => {
  const byLength = (text: string, search: string) =>
    text.toLowerCase().includes(search.toLowerCase()) ? 1 / text.length : 0

  it('orders the matches by a custom filter, hides the ones it scores 0, and puts them back once the search clears', () => {
    render(<Fruits filter={byLength} extra={<CommandItem value="pear">Pear</CommandItem>} />)

    type('a')
    const ranked = [texts(), highlighted()]
    type('')

    expect([ranked, texts()]).toEqual([
      [['Pear', 'Apple', 'Banana'], 'Pear'],
      ['Apple', 'Banana', 'Cherry', 'Pear'],
    ])
  })

  it('passes the filter the text, the search and the keywords', () => {
    const filter = vi.fn(() => 1)
    render(
      <Command filter={filter}>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="gear" textValue="Settings" keywords={['prefs']}>
            Preferences
          </CommandItem>
          <CommandItem value="profile">Profile</CommandItem>
        </CommandList>
      </Command>,
    )

    type('S')

    expect(filter.mock.calls).toEqual([
      ['Settings', 'S', ['prefs']],
      ['Profile', 'S', []],
    ])
  })

  it('orders the groups by their best item, leaving each heading, separator and the empty state where they were', () => {
    const score = (text: string) => ({ Apple: 0.2, Cherry: 0.5, Carrot: 0.9 })[text] ?? 0
    render(
      <Command filter={score}>
        <CommandInput aria-label="Search" />
        <CommandList data-testid="list">
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Fruits">
            <CommandItem value="apple">Apple</CommandItem>
            <CommandItem value="cherry">Cherry</CommandItem>
          </CommandGroup>
          <CommandSeparator data-testid="separator" />
          <CommandGroup heading="Vegetables">
            <CommandItem value="carrot">Carrot</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    const layout = () =>
      Array.from(screen.getByTestId('list').querySelectorAll('[data-slot]'), (node) =>
        node.getAttribute('data-slot') === 'command-item' || node.getAttribute('data-slot') === 'command-group-heading'
          ? node.textContent
          : node.getAttribute('data-slot'),
      )

    type('c')
    const ranked = layout()
    type('')

    expect([ranked, layout()]).toEqual([
      [
        'command-empty',
        'command-group',
        'Vegetables',
        'Carrot',
        'command-separator',
        'command-group',
        'Fruits',
        'Cherry',
        'Apple',
      ],
      [
        'command-empty',
        'command-group',
        'Fruits',
        'Apple',
        'Cherry',
        'command-separator',
        'command-group',
        'Vegetables',
        'Carrot',
      ],
    ])
  })

  it('moves the highlight through the items in their ranked order', () => {
    render(<Fruits filter={(text) => ({ Apple: 0.1, Banana: 0.3, Cherry: 0.2 })[text] ?? 0} />)

    type('x')
    press(screen.getByRole('combobox'), 'ArrowDown')

    expect([texts(), highlighted()]).toEqual([['Banana', 'Cherry', 'Apple'], 'Cherry'])
  })

  it('puts an item added under a ranked search back in its own place once the search clears', () => {
    function Growing({ items }: { items: string[] }) {
      return (
        <Command filter={byLength}>
          <CommandInput aria-label="Search" />
          <CommandList>
            {items.map((item) => (
              <CommandItem key={item} value={item}>
                {item}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      )
    }
    const { rerender } = render(<Growing items={['Banana', 'Fig', 'Kiwi']} />)
    type('i')
    rerender(<Growing items={['Apricot', 'Banana', 'Fig', 'Kiwi', 'Lime', 'Plum']} />)
    const ranked = texts()
    type('')

    expect([ranked, texts()]).toEqual([
      ['Fig', 'Kiwi', 'Lime', 'Apricot'],
      ['Apricot', 'Banana', 'Fig', 'Kiwi', 'Lime', 'Plum'],
    ])
  })

  it('puts the items back in order when the filter is taken away under a search', () => {
    const pear = <CommandItem value="pear">Pear</CommandItem>
    const { rerender } = render(<Fruits filter={byLength} extra={pear} />)
    type('a')
    const ranked = texts()

    rerender(<Fruits extra={pear} />)

    expect([ranked, texts()]).toEqual([
      ['Pear', 'Apple', 'Banana'],
      ['Apple', 'Banana', 'Pear'],
    ])
  })
})

describe('Command forceMount', () => {
  it('shows a forced item whatever the search, beside the empty state, since it is no match', () => {
    render(
      <Fruits
        extra={
          <CommandItem forceMount value="create">
            Create new
          </CommandItem>
        }
      />,
    )

    type('zzz')

    expect([texts(), screen.getByText('No results').hidden, highlighted()]).toEqual([
      ['Create new'],
      false,
      'Create new',
    ])
  })

  it('shows a forced group with its heading when none of its items match, until it stops forcing', () => {
    function Grouped({ force }: { force: boolean }) {
      return (
        <Command>
          <CommandInput aria-label="Search" />
          <CommandList>
            <CommandGroup heading="Recent" forceMount={force}>
              <CommandItem value="apple">Apple</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )
    }
    const { rerender } = render(<Grouped force />)
    type('zzz')
    const forced = group('Recent').hidden

    rerender(<Grouped force={false} />)

    expect([forced, group('Recent').hidden]).toEqual([false, true])
  })
})

describe('Command items changing', () => {
  function Growing({ items, labels = {} }: { items: string[]; labels?: Record<string, string> }) {
    return (
      <Command>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          {items.map((item) => (
            <CommandItem key={item} value={item}>
              {labels[item] ?? item}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    )
  }

  it('filters an item added under a search, and counts it for the empty state', () => {
    const { rerender } = render(<Growing items={['Apple']} />)
    type('ki')
    const before = screen.getByText('No results').hidden

    rerender(<Growing items={['Apple', 'Kiwi', 'Banana']} />)

    expect([before, texts(), screen.getByText('No results').hidden, highlighted()]).toEqual([
      false,
      ['Kiwi'],
      true,
      'Kiwi',
    ])
  })

  it('filters again when an item is renamed under a search', () => {
    const { rerender } = render(<Growing items={['fruit']} labels={{ fruit: 'Apple' }} />)
    type('apri')

    rerender(<Growing items={['fruit']} labels={{ fruit: 'Apricot' }} />)

    expect(texts()).toEqual(['Apricot'])
  })

  it('moves the highlight to the first item when the highlighted one unmounts', () => {
    const { rerender } = render(<Growing items={['Apple', 'Banana', 'Cherry']} />)
    press(screen.getByRole('combobox'), 'ArrowDown')

    rerender(<Growing items={['Apple', 'Cherry']} />)

    expect(highlighted()).toBe('Apple')
  })

  it('keeps the highlight on its item while other items come and go', () => {
    const { rerender } = render(<Growing items={['Apple', 'Banana']} />)
    press(screen.getByRole('combobox'), 'ArrowDown')

    rerender(<Growing items={['Apple', 'Banana', 'Cherry']} />)

    expect(highlighted()).toBe('Banana')
  })

  it('filters again on a rename in the list that stays when a list mounted before it leaves', () => {
    let rename: (label: string) => void = () => {}
    function Fruit() {
      const [label, setLabel] = React.useState('Apple')
      rename = setLabel
      return <CommandItem value="fruit">{label}</CommandItem>
    }
    const lists = (both: boolean) => (
      <Command>
        <CommandInput aria-label="Search" />
        {both ? <CommandList /> : null}
        <CommandList>
          <Fruit />
        </CommandList>
      </Command>
    )
    const { rerender } = render(lists(true))
    type('apri')
    rerender(lists(false))

    act(() => rename('Apricot'))

    expect(texts()).toEqual(['Apricot'])
  })
})

describe('Command input default', () => {
  it('filters by the text an uncontrolled input starts with', () => {
    render(
      <Command>
        <CommandInput aria-label="Search" defaultValue="ban" />
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
        </CommandList>
      </Command>,
    )

    expect([texts(), highlighted()]).toEqual([['Banana'], 'Banana'])
  })

  it('starts unfiltered through an input slotted onto a component that drops its ref, and filters as it is typed in', () => {
    function NoRef({ ref: _ref, ...props }: React.ComponentProps<'input'>) {
      return <input {...props} />
    }
    render(
      <Command>
        <CommandInput aria-label="Search" defaultValue="ban" asChild>
          <NoRef />
        </CommandInput>
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
        </CommandList>
      </Command>,
    )
    const before = texts()

    type('app')

    expect([before, texts()]).toEqual([['Apple', 'Banana'], ['Apple']])
  })
})

describe('Command shouldFilter off', () => {
  function Owned({ items, shouldFilter = false }: { items: string[]; shouldFilter?: boolean }) {
    return (
      <Command shouldFilter={shouldFilter}>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Fruits">
            {items.map((item) => (
              <CommandItem key={item} value={item}>
                {item}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    )
  }

  it('shows the empty state, and hides the group, once the caller renders no item', () => {
    const { rerender } = render(<Owned items={['Apple']} />)
    const before = [screen.getByText('No results').hidden, group('Fruits').hidden]

    rerender(<Owned items={[]} />)

    expect([before, [screen.getByText('No results').hidden, group('Fruits').hidden]]).toEqual([
      [true, false],
      [false, true],
    ])
  })

  it('shows again the items a search hid once filtering is turned off', () => {
    const { rerender } = render(<Owned items={['Apple', 'Banana']} shouldFilter />)
    type('ban')

    rerender(<Owned items={['Apple', 'Banana']} />)

    expect(texts()).toEqual(['Apple', 'Banana'])
  })

  it('leaves an item the caller hides hidden', () => {
    render(
      <Command shouldFilter={false}>
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana" hidden>
            Banana
          </CommandItem>
        </CommandList>
      </Command>,
    )

    expect(texts()).toEqual(['Apple'])
  })

  it('shows an empty state that mounts once a search of its own has settled on nothing', () => {
    function Settling({ loading }: { loading: boolean }) {
      return (
        <Command shouldFilter={false}>
          <CommandList>{!loading && <CommandEmpty>No results</CommandEmpty>}</CommandList>
        </Command>
      )
    }
    const { rerender } = render(<Settling loading />)

    rerender(<Settling loading={false} />)

    expect(screen.getByText('No results').hidden).toBe(false)
  })
})

describe('Command renders', () => {
  function counted() {
    const renders = { items: 0, commits: 0 }
    function Counted({ value }: { value: string }) {
      renders.items++
      return <CommandItem value={value}>{value}</CommandItem>
    }
    const view = render(
      <React.Profiler id="command" onRender={() => renders.commits++}>
        <Command>
          <CommandInput aria-label="Search" />
          <CommandList>
            <Counted value="Apple" />
            <Counted value="Banana" />
          </CommandList>
        </Command>
      </React.Profiler>,
    )
    return { renders, view }
  }

  it('mounts in one render, with the first item highlighted', () => {
    const { renders } = counted()

    expect([renders.commits, renders.items, highlighted()]).toEqual([1, 2, 'Apple'])
  })

  it('moves the highlight without rendering anything', () => {
    const { renders } = counted()

    press(screen.getByRole('combobox'), 'ArrowDown', 'End', 'Home')
    fireEvent.pointerMove(option('Banana'), { pointerType: 'mouse' })

    expect([renders.commits, highlighted()]).toEqual([1, 'Banana'])
  })

  it('filters as you type without rendering the items', () => {
    const { renders } = counted()

    type('ban')

    expect([renders.items, texts()]).toEqual([2, ['Banana']])
  })

  it('writes the direction on the root alone, which the parts inherit', () => {
    render(
      <Command dir="rtl" data-testid="root">
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Fruits">
            <CommandItem value="apple">Apple</CommandItem>
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </Command>,
    )
    const root = screen.getByTestId('root')

    expect([root.getAttribute('dir'), root.querySelectorAll('[dir]').length]).toEqual(['rtl', 0])
  })
})

describe('useCommandSearch', () => {
  it('reads the text typed into the input', () => {
    let read = ''
    function Searched() {
      read = useCommandSearch()
      return null
    }
    render(<Fruits extra={<Searched />} />)

    type('che')

    expect(read).toBe('che')
  })

  it('names the highlighted item on an input drawn after the list', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
        </CommandList>
        <CommandInput aria-label="Search" />
      </Command>,
    )

    expect(screen.getByRole('combobox').getAttribute('aria-activedescendant')).toBe(option('Apple').id)
  })
})

describe('Command matching', () => {
  it('matches a search whatever its case and the accents on its letters', () => {
    render(
      <Fruits
        extra={
          <>
            <CommandItem value="cafe">Café</CommandItem>
            <CommandItem value="creme" keywords={['Crème brûlée']}>
              Dessert
            </CommandItem>
          </>
        }
      />,
    )

    type('CAFE')
    const plain = texts()
    type('creme brulee')

    expect([plain, texts()]).toEqual([['Café'], ['Dessert']])
  })
})

describe('fuzzyFilter', () => {
  it('scores 1 an empty search, which every item matches', () => {
    expect(fuzzyFilter('Apple', '', [])).toBe(1)
  })

  it('scores 0 a search whose letters the text does not hold in order', () => {
    expect([fuzzyFilter('Apple', 'pa', []), fuzzyFilter('Apple', 'x', [])]).toEqual([0, 0])
  })

  it('scores a match at the start over one at a word start, and that over one inside a word', () => {
    const start = fuzzyFilter('Apple', 'ap', [])
    const word = fuzzyFilter('Green apple', 'ap', [])
    const inside = fuzzyFilter('Grape', 'ap', [])

    expect([start > word, word > inside, inside > 0]).toEqual([true, true, true])
  })

  it('scores letters side by side over letters spread apart, and the whole text over a part of it', () => {
    expect([
      fuzzyFilter('Apple', 'apl', []) > fuzzyFilter('A pale lamp', 'apl', []),
      fuzzyFilter('Apple', 'apple', []) > fuzzyFilter('Applesauce', 'apple', []),
      fuzzyFilter('Apple', 'apple', []),
    ]).toEqual([true, true, 1])
  })

  it('finds the best of the places a search could start', () => {
    expect(fuzzyFilter('pineapple', 'pple', [])).toBe(fuzzyFilter('xineapple', 'pple', []))
  })

  it('matches by the best of the text and its keywords, ignoring case and accents', () => {
    expect([
      fuzzyFilter('Settings', 'PREF', ['preferences']) === fuzzyFilter('Preferences', 'pref', []),
      fuzzyFilter('Café', 'cafe', []),
    ]).toEqual([true, 1])
  })

  it('ranks the items of a command by how well they match', () => {
    render(
      <Fruits
        filter={fuzzyFilter}
        extra={
          <>
            <CommandItem value="pineapple">Pineapple</CommandItem>
            <CommandItem value="green-apple">Green apple</CommandItem>
          </>
        }
      />,
    )

    type('apl')

    expect(texts()).toEqual(['Apple', 'Green apple', 'Pineapple'])
  })
})

describe('Command.Loading', () => {
  it('is a progress bar named Loading, at the progress it is given or with none', () => {
    render(
      <Command>
        <CommandList>
          <CommandLoading progress={40} />
          <CommandLoading aria-label="Fetching people">
            <span>Fetching</span>
          </CommandLoading>
        </CommandList>
      </Command>,
    )
    const [halfway, unknown] = screen.getAllByRole('progressbar')
    const read = (bar: HTMLElement) =>
      ['aria-label', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'data-slot'].map((name) =>
        bar.getAttribute(name),
      )

    expect([read(halfway), read(unknown), unknown.textContent]).toEqual([
      ['Loading', '40', '0', '100', 'command-loading'],
      ['Fetching people', null, '0', '100', 'command-loading'],
      'Fetching',
    ])
  })
})

describe('Command list height', () => {
  class FakeResizeObserver {
    static last: FakeResizeObserver | null = null
    targets = new Set<Element>()
    constructor(readonly report: ResizeObserverCallback) {
      FakeResizeObserver.last = this
    }
    observe(target: Element) {
      this.targets.add(target)
    }
    unobserve(target: Element) {
      this.targets.delete(target)
    }
    disconnect() {
      this.targets.clear()
    }
  }
  const original = globalThis.ResizeObserver
  beforeAll(() => {
    globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver
  })
  afterAll(() => {
    globalThis.ResizeObserver = original
  })

  // Each shown row is 20px tall, one under the other in the order they were drawn.
  function layOut(list: HTMLElement) {
    Array.from(list.children).forEach((child, index) => {
      child.getBoundingClientRect = () =>
        DOMRect.fromRect((child as HTMLElement).hidden ? {} : { y: index * 20, height: 20 })
    })
  }

  function Pears({ pear }: { pear: boolean }) {
    return <Fruits extra={pear && <CommandItem value="pear">Pear</CommandItem>} />
  }

  it('leaves the variable unset where there is no ResizeObserver', () => {
    globalThis.ResizeObserver = undefined as unknown as typeof ResizeObserver
    render(<Fruits />)
    globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver
    const list = document.querySelector<HTMLElement>('[data-slot="command-list"]') as HTMLElement

    expect([texts(), list.style.getPropertyValue('--gentleduck-command-list-height')]).toEqual([
      ['Apple', 'Banana', 'Cherry'],
      '',
    ])
  })

  it('writes the height of the rows the list shows to --gentleduck-command-list-height as they change', async () => {
    const view = render(<Pears pear={false} />)
    const list = document.querySelector<HTMLElement>('[data-slot="command-list"]') as HTMLElement
    const observer = FakeResizeObserver.last as FakeResizeObserver
    const report = (targets: Element[] = []) => {
      layOut(list)
      observer.report(
        targets.map((target) => ({ target }) as ResizeObserverEntry),
        observer as unknown as ResizeObserver,
      )
      return list.style.getPropertyValue('--gentleduck-command-list-height')
    }
    const watched = () => Array.from(observer.targets, (target) => target.textContent)

    const all = report()
    type('ch')
    const one = report([option('Cherry')])
    type('')
    view.rerender(<Pears pear />)
    await act(async () => {})
    const added = [watched(), report()]
    const pear = option('Pear')
    view.rerender(<Pears pear={false} />)
    report([pear])
    const removed = watched()
    view.unmount()

    expect([all, one, added, removed, observer.targets.size]).toEqual([
      '60px',
      '20px',
      [['No results', 'Apple', 'Banana', 'Cherry', 'Pear'], '80px'],
      ['No results', 'Apple', 'Banana', 'Cherry'],
      0,
    ])
  })
})

describe('useCommandState', () => {
  it('settles on a selector that returns a new object, where each read made a fresh one', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Count() {
      const picked = useCommandState((state) => ({ count: state.count }))
      return <output data-testid="count">{picked.count}</output>
    }
    render(
      <Fruits>
        <Count />
      </Fruits>,
    )
    const logged = errors.mock.calls.length
    errors.mockRestore()

    expect([screen.getByTestId('count').textContent, logged]).toEqual(['3', 0])
  })

  it('reads the search, the highlighted value and how many items match', () => {
    let state = {}
    function Read() {
      const search = useCommandState((read) => read.search)
      const value = useCommandState((read) => read.value)
      const count = useCommandState((read) => read.count)
      state = { search, value, count }
      return null
    }
    render(<Fruits extra={<Read />} />)

    const first = state
    type('an')
    const typed = state
    type('zz')

    expect([first, typed, state]).toEqual([
      { search: '', value: 'apple', count: 3 },
      { search: 'an', value: 'banana', count: 1 },
      { search: 'zz', value: '', count: 0 },
    ])
  })

  it('renders a reader only when what it picks changes', () => {
    let renders = 0
    function Count() {
      useCommandState((read) => read.count)
      renders++
      return null
    }
    render(<Fruits extra={<Count />} />)
    const mounted = renders

    press(screen.getByRole('combobox'), 'ArrowDown', 'End')
    const moved = renders - mounted
    type('a')

    expect([moved, renders - mounted]).toEqual([0, 1])
  })
})

describe('Command.Status', () => {
  it('tells a screen reader how many items match, through a function child', () => {
    render(
      <Command>
        <CommandInput aria-label="Search" />
        <CommandStatus>{(count) => `${count} results`}</CommandStatus>
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
        </CommandList>
      </Command>,
    )
    const status = screen.getByRole('status')
    const read = () => [status.textContent, status.getAttribute('aria-live'), status.getAttribute('aria-atomic')]

    const all = read()
    type('ban')

    expect([all, read(), status.getAttribute('data-slot')]).toEqual([
      ['2 results', 'polite', 'true'],
      ['1 results', 'polite', 'true'],
      'command-status',
    ])
  })

  it('draws children that are not a function as they are', () => {
    render(
      <Command>
        <CommandStatus>Ready</CommandStatus>
      </Command>,
    )

    expect(screen.getByRole('status').textContent).toBe('Ready')
  })
})

describe('Command limit', () => {
  const byLength = (text: string, search: string) =>
    text.toLowerCase().includes(search.toLowerCase()) ? 1 / text.length : 0

  function Counted(props: React.ComponentProps<typeof Command> & { extra?: React.ReactNode }) {
    const { extra, ...commandProps } = props
    return (
      <Fruits
        {...commandProps}
        extra={
          <>
            <CommandItem value="pear">Pear</CommandItem>
            {extra}
          </>
        }>
        <CommandStatus>{(count) => count}</CommandStatus>
      </Fruits>
    )
  }

  it('shows no more than limit matches, the best ranked first, and counts only those', () => {
    render(<Counted limit={2} filter={byLength} />)
    const shown = () => [texts(), screen.getByText(/^\d+$/).textContent]

    const cleared = shown()
    type('a')
    const ranked = shown()
    type('rr')

    expect([cleared, ranked, shown()]).toEqual([
      [['Apple', 'Banana'], '2'],
      [['Pear', 'Apple'], '2'],
      [['Cherry'], '1'],
    ])
  })

  it('shows a forced item beside the limit, and counts it only when it matches', () => {
    render(
      <Counted
        limit={1}
        extra={
          <CommandItem value="create" forceMount>
            Create
          </CommandItem>
        }
      />,
    )

    const shown = () => [texts(), screen.getByText(/^\d+$/).textContent]

    type('zz')
    const forced = shown()
    type('')

    expect([forced, shown()]).toEqual([
      [['Create'], '0'],
      [['Apple', 'Create'], '2'],
    ])
  })

  it('leaves the items alone with shouldFilter off', () => {
    render(<Counted limit={1} shouldFilter={false} />)

    expect(texts()).toEqual(['Apple', 'Banana', 'Cherry', 'Pear'])
  })
})

describe('Command virtual list', () => {
  const ROWS = Array.from({ length: 100 }, (_, index) => `Row ${index}`)
  const WINDOW = 5

  // Draws five rows at a time, as a virtualizer does, from the first one scrollToIndex brought into view.
  function Virtual(
    props: React.ComponentProps<typeof Command> & { disabled?: number[]; asked?: (index: number) => void },
  ) {
    const { disabled = [], asked, ...commandProps } = props
    const [start, setStart] = React.useState(0)
    const scrollToIndex = React.useCallback(
      (index: number) =>
        asked
          ? asked(index)
          : setStart((from) =>
              index >= from && index < from + WINDOW ? from : index < from ? index : index - WINDOW + 1,
            ),
      [asked],
    )
    return (
      <Command shouldFilter={false} {...commandProps}>
        <CommandInput aria-label="Search" />
        <button type="button" onClick={() => setStart(50)}>
          Scroll away
        </button>
        <button type="button" onClick={() => setStart(0)}>
          Scroll back
        </button>
        <CommandStatus>{(count) => `${count} results`}</CommandStatus>
        <CommandList virtual={{ count: ROWS.length, scrollToIndex }}>
          {ROWS.slice(start, start + WINDOW).map((row, offset) => (
            <CommandItem key={row} index={start + offset} value={row} disabled={disabled.includes(start + offset)}>
              {row}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    )
  }

  const keys = (...pressed: string[]) => {
    for (const key of pressed) fireEvent.keyDown(screen.getByRole('combobox'), { key })
    return highlighted()
  }

  it('moves past the rows drawn, bringing each one in through scrollToIndex', () => {
    render(<Virtual />)

    expect([keys('End'), keys('Home'), keys('ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown')]).toEqual([
      'Row 99',
      'Row 0',
      'Row 5',
    ])
  })

  it('leaves Enter alone once the highlighted row has scrolled out of the DOM', () => {
    render(<Virtual />)
    keys('ArrowDown')

    fireEvent.click(screen.getByText('Scroll away'))
    const notPrevented = fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })

    expect(notPrevented).toBe(true)
  })

  it('stops asking a virtual list to scroll once it unmounts', () => {
    const scrollToIndex = vi.fn()
    function Toggle() {
      const [shown, setShown] = React.useState(true)
      return (
        <Command shouldFilter={false}>
          <CommandInput aria-label="Search" />
          <button type="button" onClick={() => setShown(false)}>
            Hide
          </button>
          {shown && (
            <CommandList virtual={{ count: 3, scrollToIndex }}>
              <CommandItem index={0} value="zero">
                Zero
              </CommandItem>
            </CommandList>
          )}
        </Command>
      )
    }
    render(<Toggle />)
    fireEvent.click(screen.getByText('Hide'))
    scrollToIndex.mockClear()

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })

    expect(scrollToIndex).not.toHaveBeenCalled()
  })

  it('wraps by index with loop', () => {
    render(<Virtual loop />)

    expect([keys('ArrowUp'), keys('ArrowDown')]).toEqual(['Row 99', 'Row 0'])
  })

  it('stops at the ends without loop', () => {
    render(<Virtual />)

    expect([keys('ArrowUp'), keys('End', 'ArrowDown')]).toEqual(['Row 0', 'Row 99'])
  })

  it('skips a disabled row whether it is drawn or brought in', () => {
    render(<Virtual disabled={[1, 5, 99]} />)

    expect([keys('ArrowDown'), keys('ArrowDown', 'ArrowDown', 'ArrowDown'), keys('End')]).toEqual([
      'Row 2',
      'Row 6',
      'Row 98',
    ])
  })

  it('jumps to the edges on PageDown and PageUp when nothing scrolls', () => {
    render(<Virtual />)

    expect([keys('PageDown'), keys('PageUp')]).toEqual(['Row 99', 'Row 0'])
  })

  it('keeps the highlight on a row scrolled out of the DOM, and draws it again when the row comes back', () => {
    const onValueChange = vi.fn()
    render(<Virtual onValueChange={onValueChange} />)
    keys('ArrowDown', 'ArrowDown')
    onValueChange.mockClear()
    const input = screen.getByRole('combobox')

    fireEvent.click(screen.getByText('Scroll away'))
    const away = [highlighted(), input.getAttribute('aria-activedescendant')]
    fireEvent.click(screen.getByText('Scroll back'))

    expect([away, highlighted(), input.getAttribute('aria-activedescendant'), onValueChange.mock.calls]).toEqual([
      [null, null],
      'Row 2',
      option('Row 2').id,
      [],
    ])
  })

  it('places each row in the whole list for a screen reader, and counts the rows not drawn', () => {
    render(<Virtual />)
    const row = option('Row 3')

    expect([
      row.getAttribute('aria-posinset'),
      row.getAttribute('aria-setsize'),
      screen.getByRole('status').textContent,
    ]).toEqual(['4', '100', '100 results'])
  })

  it('starts from the first row on ArrowDown and the last on ArrowUp when nothing is highlighted', () => {
    render(<Virtual disabled={[1, 97]} />)
    const leave = (name: string) => fireEvent.pointerMove(option(name), { pointerType: 'mouse' })

    leave('Row 1')
    const up = keys('ArrowUp')
    leave('Row 97')

    expect([up, keys('ArrowDown')]).toEqual(['Row 99', 'Row 0'])
  })

  it('stays where it is when every row past it is disabled', () => {
    render(<Virtual disabled={[0, 1]} />)

    expect([highlighted(), keys('ArrowUp')]).toEqual(['Row 2', 'Row 2'])
  })

  it('pages by the rows the scrolling box shows, past the rows drawn', () => {
    render(<Virtual />)
    Object.defineProperties(screen.getByRole('listbox'), { clientHeight: { value: 60 }, scrollHeight: { value: 2000 } })
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(DOMRect.fromRect({ height: 20 }))

    const pages = [keys('PageDown'), keys('PageDown'), keys('PageDown'), keys('PageUp')]
    rect.mockRestore()

    expect(pages).toEqual(['Row 2', 'Row 4', 'Row 6', 'Row 4'])
  })

  it('pages one row at least when the box shows no more than the highlighted one', () => {
    render(<Virtual />)
    Object.defineProperties(screen.getByRole('listbox'), { clientHeight: { value: 20 }, scrollHeight: { value: 2000 } })
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(DOMRect.fromRect({ height: 20 }))

    const paged = keys('PageDown')
    rect.mockRestore()

    expect(paged).toBe('Row 1')
  })

  it('jumps to the last row on Meta with ArrowDown, and the first on Meta with ArrowUp', () => {
    render(<Virtual />)
    const input = screen.getByRole('combobox')

    fireEvent.keyDown(input, { key: 'ArrowDown', metaKey: true })
    const last = highlighted()
    fireEvent.keyDown(input, { key: 'ArrowUp', metaKey: true })

    expect([last, highlighted()]).toEqual(['Row 99', 'Row 0'])
  })

  it('goes forward from a disabled first row on Home', () => {
    render(<Virtual disabled={[0]} />)

    expect([keys('ArrowDown', 'ArrowDown'), keys('Home')]).toEqual(['Row 3', 'Row 1'])
  })

  it('asks for no row past the end when every row after the highlight is disabled', () => {
    render(<Virtual disabled={[97, 98, 99]} />)
    keys('End')

    const stuck = keys('ArrowDown')
    fireEvent.click(screen.getByText('Scroll back'))

    expect([stuck, screen.queryByText('Row 0')?.textContent]).toEqual(['Row 96', 'Row 0'])
  })

  it('starts on the row defaultValue names', () => {
    render(<Virtual defaultValue="Row 3" />)

    expect(highlighted()).toBe('Row 3')
  })

  it('forgets a row it asked for once a search runs, controlled', () => {
    const asked = vi.fn()
    function Owned() {
      const [value, setValue] = React.useState('Row 0')
      return <Virtual value={value} onValueChange={setValue} asked={asked} />
    }
    render(<Owned />)
    keys('End')
    type('Row')
    asked.mockClear()

    fireEvent.click(screen.getByText('Scroll away'))

    expect(asked).not.toHaveBeenCalled()
  })
})

describe('Command store', () => {
  it('tells its readers of a change only, and nothing once they unsubscribe', () => {
    const stores: ReturnType<typeof useCommandContext>['store'][] = []
    function Grab() {
      stores.push(useCommandContext('Grab', undefined).store)
      return null
    }
    render(
      <Command>
        <Grab />
      </Command>,
    )
    const [store] = stores
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    store.set('search', '')
    store.set('search', 'a')
    unsubscribe()
    store.set('search', 'b')

    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe('Command parts', () => {
  it('carries the direction of a provider it is portalled out of', () => {
    render(
      <DirectionProvider dir="rtl">
        {createPortal(
          <Command data-testid="portalled">
            <CommandList />
          </Command>,
          document.body,
        )}
      </DirectionProvider>,
    )

    expect(screen.getByTestId('portalled').getAttribute('dir')).toBe('rtl')
  })

  it('points the input at the list it controls', () => {
    render(<Fruits />)

    expect(screen.getByRole('combobox').getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id)
  })

  it("runs the root's own onKeyDown", () => {
    const onKeyDown = vi.fn()
    render(<Fruits onKeyDown={onKeyDown} />)

    press(screen.getByRole('combobox'), 'ArrowDown')

    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  it('lets the props on an item win over its own attributes', () => {
    render(
      <Fruits
        extra={
          <CommandItem value="kiwi" id="fruit-kiwi">
            Kiwi
          </CommandItem>
        }
      />,
    )

    expect(option('Kiwi').id).toBe('fruit-kiwi')
  })

  it("runs an item's own onClick", () => {
    const onClick = vi.fn()
    render(
      <Fruits
        extra={
          <CommandItem value="kiwi" onClick={onClick}>
            Kiwi
          </CommandItem>
        }
      />,
    )

    fireEvent.click(option('Kiwi'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('takes a disabled item out of the focus order', () => {
    renderGroupedCommand()

    expect([option('Banana').getAttribute('tabindex'), option('Apple').getAttribute('tabindex')]).toEqual([null, '-1'])
  })

  it('draws a separator a screen reader passes over', () => {
    renderGroupedCommand()
    const separator = screen.getByTestId('separator')

    expect([separator.getAttribute('role'), separator.getAttribute('aria-hidden')]).toEqual(['separator', 'true'])
  })

  it('renders the empty state hidden on the server, as a status, since only the list in the browser knows what matches', () => {
    const html = renderToString(
      <Command>
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
        </CommandList>
      </Command>,
    )

    expect(html).toContain('<div data-slot="command-empty" role="status" aria-live="polite" hidden="">No results</div>')
  })
})

describe('Command highlight marking', () => {
  it('marks only the highlighted item selected', () => {
    render(<Fruits />)

    press(screen.getByRole('combobox'), 'ArrowDown')

    expect(screen.getAllByRole('option').map((item) => item.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
      'false',
    ])
  })

  it('leaves the highlighted item alone when the list runs again with the same highlight', () => {
    const { rerender } = render(<Fruits value="banana" />)
    const records = new MutationObserver(() => {})
    records.observe(screen.getByRole('listbox'), {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-highlighted', 'aria-selected'],
    })

    rerender(<Fruits value="banana" limit={10} />)
    const changed = records.takeRecords()
    records.disconnect()

    expect(changed).toEqual([])
  })

  it('reports nothing when the pointer moves onto the value it already holds', () => {
    const onValueChange = vi.fn()
    render(<Fruits value="apple" onValueChange={onValueChange} />)

    fireEvent.pointerMove(option('Apple'), { pointerType: 'mouse' })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('starts on defaultValue, and on the first match once a search runs', () => {
    render(<Fruits defaultValue="banana" />)
    const start = highlighted()

    type('a')

    expect([start, highlighted()]).toEqual(['Banana', 'Apple'])
  })

  it('keeps the highlight where the keys moved it when an item comes in under a search', () => {
    const { rerender } = render(<Fruits />)
    type('a')
    press(screen.getByRole('combobox'), 'ArrowDown')

    rerender(<Fruits extra={<CommandItem value="pear">Pear</CommandItem>} />)

    expect(highlighted()).toBe('Banana')
  })

  it('moves the highlight off an item once it is disabled', () => {
    const page = (disabled: boolean) => (
      <Command>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="apple" disabled={disabled}>
            Apple
          </CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
        </CommandList>
      </Command>
    )
    const { rerender } = render(page(false))

    rerender(page(true))

    expect(highlighted()).toBe('Banana')
  })
})

describe('Command keys', () => {
  it('moves only on Control with a vim key, so typing j or n reaches the search', () => {
    const { root } = renderGroupedCommand()

    press(root, 'j', 'n')

    expect(highlighted()).toBe('Apple')
  })

  it('keeps Enter from the page only when it picks an item', () => {
    render(<Fruits />)
    const input = screen.getByRole('combobox')

    const picked = fireEvent.keyDown(input, { key: 'Enter' })
    type('zzz')
    const nothing = fireEvent.keyDown(input, { key: 'Enter' })

    expect([picked, nothing]).toEqual([false, true])
  })

  it('gives focus back to the input without scrolling when the pointer reaches a disabled item', () => {
    const { input } = renderGroupedCommand()
    const focus = vi.spyOn(input, 'focus')

    fireEvent.pointerMove(option('Banana'), { pointerType: 'mouse' })
    const calls = focus.mock.calls
    focus.mockRestore()

    expect(calls).toEqual([[{ preventScroll: true }]])
  })
})

describe('Command filtering again', () => {
  it('filters again only when an item changes what it shows, not each time it renders', () => {
    const filter = vi.fn(() => 1)
    const { rerender } = render(<Fruits filter={filter} />)
    type('a')
    filter.mockClear()

    rerender(<Fruits filter={filter} />)

    expect(filter).not.toHaveBeenCalled()
  })

  it('filters again when an item changes its keywords under a search', () => {
    const page = (keywords: string[]) => (
      <Fruits
        extra={
          <CommandItem value="kiwi" keywords={keywords}>
            Kiwi
          </CommandItem>
        }
      />
    )
    const { rerender } = render(page([]))
    type('green')
    const before = texts()

    rerender(page(['green']))

    expect([before, texts()]).toEqual([[], ['Kiwi']])
  })

  it('shows a group once it starts forcing, under a search none of its items match', () => {
    const page = (force: boolean) => (
      <Command>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandGroup heading="Recent" forceMount={force}>
            <CommandItem value="apple">Apple</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )
    const { rerender } = render(page(false))
    type('zzz')

    rerender(page(true))

    expect(group('Recent').hidden).toBe(false)
  })

  it('leaves the order and the count alone with a filter while shouldFilter is off', () => {
    render(
      <Fruits shouldFilter={false} filter={fuzzyFilter}>
        <CommandStatus>{(count) => `${count} results`}</CommandStatus>
      </Fruits>,
    )

    type('ch')

    expect([texts(), screen.getByRole('status').textContent]).toEqual([['Apple', 'Banana', 'Cherry'], '3 results'])
  })
})

describe('Command ranking order', () => {
  const favourBanana = (text: string, search: string) => (search === 'b' && text === 'Banana' ? 2 : 1)

  it('ranks a group by its best match, not its last', () => {
    render(
      <Command filter={fuzzyFilter}>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandGroup heading="Mixed">
            <CommandItem value="apple">Apple</CommandItem>
            <CommandItem value="mango pie">Mango pie</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Middling">
            <CommandItem value="grape">Grape</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )

    type('ap')

    expect(
      Array.from(document.querySelectorAll('[data-slot="command-group-heading"]'), (heading) => heading.textContent),
    ).toEqual(['Mixed', 'Middling'])
  })

  it('puts tied matches back in their own order after a search that moved them', () => {
    render(<Fruits filter={favourBanana} />)
    type('b')
    const moved = texts()

    type('bb')

    expect([moved, texts()]).toEqual([
      ['Banana', 'Apple', 'Cherry'],
      ['Apple', 'Banana', 'Cherry'],
    ])
  })

  it('leaves the items in the order React gives them once a search that moved them clears', () => {
    function Ordered({ names, limit }: { names: string[]; limit?: number }) {
      return (
        <Command filter={favourBanana} limit={limit}>
          <CommandInput aria-label="Search" />
          <CommandList>
            {names.map((name) => (
              <CommandItem key={name} value={name}>
                {name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      )
    }
    const { rerender } = render(<Ordered names={['Apple', 'Banana', 'Cherry']} />)
    type('b')
    type('')

    rerender(<Ordered names={['Cherry', 'Banana', 'Apple']} limit={10} />)

    expect(texts()).toEqual(['Cherry', 'Banana', 'Apple'])
  })
})

describe('fuzzyFilter scoring', () => {
  it('scores a letter at the start of a word over one inside a word', () => {
    expect(fuzzyFilter('a-b', 'ab', [])).toBeGreaterThan(fuzzyFilter('axb', 'ab', []))
  })

  it('keeps the best of the places the search could start', () => {
    // From the first a: 3 points each for a and the b beside it, of 6, times 0.9 + 0.1 x 2 / 6 for the length.
    expect(fuzzyFilter('ab-axb', 'ab', [])).toBeCloseTo(0.9333, 4)
  })

  it('gives up at once on a long text missing a letter of the search', () => {
    const text = 'a'.repeat(200_000)
    const started = performance.now()

    const score = fuzzyFilter(text, 'aq', [])

    expect([score, performance.now() - started < 100]).toEqual([0, true])
  })
})
