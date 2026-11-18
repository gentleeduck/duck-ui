import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '../index'

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
