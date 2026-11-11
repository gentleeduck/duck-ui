import { afterEach, describe, expect, mock, test } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { hydrateOnMac } from '../../_internal/__tests__/hydrate-on-mac'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  CommandShortcut,
  CommandStatus,
} from '../command'
import { useCommandSearch } from '../index'
import { MotionCommandDialog, MotionCommandItem } from '../motion-command'

afterEach(cleanup)

// The test DOM has no scrollIntoView, which an arrow key calls on the item it highlights.
Element.prototype.scrollIntoView ??= () => {}

const highlighted = () =>
  screen.getAllByRole('option').find((item) => item.hasAttribute('data-highlighted'))?.textContent

describe.each([
  ['CommandDialog', CommandDialog],
  ['MotionCommandDialog', MotionCommandDialog],
] as const)('registry-ui %s', (_, Palette) => {
  test('names the dialog with its title and wraps the highlight with loop', async () => {
    render(
      <Palette open loop title="Go to" description="Jump to a page">
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="home">Home</CommandItem>
          <CommandItem value="settings">Settings</CommandItem>
        </CommandList>
      </Palette>,
    )
    await act(async () => {})

    expect(screen.getByRole('dialog', { name: 'Go to' })).not.toBeNull()
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowUp' })
    expect(highlighted()).toBe('Settings')
  })

  test('hands the command its filter and its highlight value', async () => {
    const asked: string[] = []
    function Searched() {
      return <p>{useCommandSearch()}</p>
    }
    render(
      <Palette
        open
        value="settings"
        onValueChange={(value) => asked.push(value)}
        filter={(text, search) => (text.startsWith(search) ? 1 : 0)}>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="home">Home</CommandItem>
          <CommandItem value="settings">Settings</CommandItem>
          <CommandItem value="search">Search</CommandItem>
        </CommandList>
        <Searched />
      </Palette>,
    )
    await act(async () => {})
    const named = highlighted()

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Sea' } })

    expect([named, asked, screen.getByText('Sea').tagName]).toEqual(['Settings', ['search'], 'P'])
  })

  test('hands the command its limit, its Ctrl keys and its pointer setting', async () => {
    render(
      <Palette open limit={2} vimBindings={false} disablePointerSelection>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="home">Home</CommandItem>
          <CommandItem value="settings">Settings</CommandItem>
          <CommandItem value="search">Search</CommandItem>
        </CommandList>
      </Palette>,
    )
    await act(async () => {})
    const shown = screen.getAllByRole('option').filter((item) => !item.hidden).length

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'n', ctrlKey: true })
    fireEvent.pointerMove(screen.getByText('Settings'), { pointerType: 'mouse' })

    expect([shown, highlighted()]).toEqual([2, 'Home'])
  })
})

describe('registry-ui Command', () => {
  test('carries each primitive slot once', async () => {
    const { container } = render(
      <Command>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandEmpty>Nothing</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem value="home">Home</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    await act(async () => {})

    const slots = [...container.querySelectorAll('[data-slot]')].map((el) => el.getAttribute('data-slot'))
    for (const slot of ['command', 'command-input', 'command-list', 'command-group', 'command-item']) {
      expect(slots.filter((s) => s === slot)).toHaveLength(1)
    }
  })

  test('keeps the count for a screen reader, and draws the loading row', async () => {
    render(
      <Command>
        <CommandInput aria-label="Search" />
        <CommandStatus>{(count) => `${count} results`}</CommandStatus>
        <CommandList>
          <CommandLoading progress={50}>Fetching</CommandLoading>
          <CommandItem value="home">Home</CommandItem>
        </CommandList>
      </Command>,
    )
    await act(async () => {})
    const status = screen.getByRole('status')
    const loading = screen.getByRole('progressbar', { name: 'Loading' })

    expect([status.textContent, status.className, loading.getAttribute('aria-valuenow')]).toEqual([
      '1 results',
      'sr-only',
      '50',
    ])
  })

  test('starts a motion item later by its index, and leaves its place in the list unset', async () => {
    render(
      <Command>
        <CommandList>
          <MotionCommandItem index={3} value="home">
            Home
          </MotionCommandItem>
        </CommandList>
      </Command>,
    )
    await act(async () => {})

    expect(screen.getByRole('option').getAttribute('aria-posinset')).toBeNull()
  })
})

describe('registry-ui CommandList', () => {
  test('keeps a wheel or a swipe inside it from reaching the page, whose scroll lock would cancel it', async () => {
    const onWheel = mock()
    const onTouchMove = mock()
    const { container } = render(
      <div onTouchMove={onTouchMove} onWheel={onWheel}>
        <Command>
          <CommandList>
            <CommandItem value="home">Home</CommandItem>
            <CommandSeparator />
            <CommandItem value="away">Away</CommandItem>
          </CommandList>
        </Command>
      </div>,
    )
    await act(async () => {})

    fireEvent.wheel(screen.getByRole('listbox'))
    fireEvent.touchMove(screen.getByRole('listbox'))

    expect([onWheel.mock.calls.length, onTouchMove.mock.calls.length]).toEqual([0, 0])
    expect(container.querySelector('[data-slot="command-separator"]')?.className).toContain('bg-secondary')
  })
})

describe('registry-ui CommandShortcut', () => {
  test('runs onKeysPressed on its keys with no KeyProvider above it, and stops once it is gone', async () => {
    const onKeysPressed = mock()
    const { unmount } = render(
      <CommandShortcut keys="ctrl+shift+k" onKeysPressed={onKeysPressed} variant="secondary">
        Ctrl Shift K
      </CommandShortcut>,
    )
    const badge = screen.getByText('Ctrl Shift K')
    expect([badge.tagName, badge.getAttribute('data-slot'), badge.className.includes('bg-secondary')]).toEqual([
      'KBD',
      'command-badge',
      true,
    ])

    fireEvent.keyDown(document, { ctrlKey: true, key: 'k', shiftKey: true })
    expect(onKeysPressed).toHaveBeenCalledTimes(1)

    unmount()
    fireEvent.keyDown(document, { ctrlKey: true, key: 'k', shiftKey: true })
    expect(onKeysPressed).toHaveBeenCalledTimes(1)
  })

  test('draws a label alone, bound to nothing, when it has no keys', () => {
    const warn = mock()
    const quiet = console.warn
    console.warn = warn

    try {
      render(<CommandShortcut>Ctrl P</CommandShortcut>)
    } finally {
      console.warn = quiet
    }

    expect(screen.getByText('Ctrl P').className).not.toContain('bg-secondary')
    expect(warn).not.toHaveBeenCalled()
  })

  test('spells its keys out when it has no label, shows its label over them, and draws nothing for neither', () => {
    render(
      <>
        <CommandShortcut keys="ctrl+shift+k" />
        <CommandShortcut keys="ctrl+k">Search</CommandShortcut>
        <CommandShortcut />
      </>,
    )

    expect(Array.from(document.querySelectorAll('[data-slot="command-badge"]'), (node) => node.textContent)).toEqual([
      'Ctrl+Shift+K',
      'Search',
      '',
    ])
  })

  test("hydrates the keys a server drew, then shows the browser's own", async () => {
    const { container, errors, html, unmount } = await hydrateOnMac(<CommandShortcut keys="mod+k" />)

    expect(html).toContain('>Ctrl+K</kbd>')
    expect(errors).toEqual([])
    expect(container.querySelector('[data-slot="command-badge"]')?.textContent).toBe('Cmd+K')
    unmount()
  })
})
