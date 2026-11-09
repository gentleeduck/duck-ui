import { describe, expect, it, mock } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { freshDom, scrollable, scrolls, untilScrollLocked, wait } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
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

function renderMenubar() {
  return render(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
  )
}

describe('Menubar', () => {
  it('renders with data-slot="menubar"', () => {
    const { container } = renderMenubar()
    expect(container.querySelector('[data-slot="menubar"]')).not.toBeNull()
  })

  it('renders triggers with data-slot="menubar-trigger"', () => {
    const { container } = renderMenubar()
    expect(container.querySelectorAll('[data-slot="menubar-trigger"]').length).toBe(2)
  })

  it('triggers have role="menuitem"', () => {
    const { container } = renderMenubar()
    const triggers = container.querySelectorAll('[data-slot="menubar-trigger"]')
    for (const t of triggers) {
      expect(t.getAttribute('role')).toBe('menuitem')
    }
  })

  it('triggers have aria-haspopup="menu"', () => {
    const { container } = renderMenubar()
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
  })

  it('triggers start closed', () => {
    const { container } = renderMenubar()
    const triggers = container.querySelectorAll('[data-slot="menubar-trigger"]')
    for (const t of triggers) {
      expect(t.getAttribute('data-state')).toBe('closed')
      expect(t.getAttribute('aria-expanded')).toBe('false')
    }
  })

  it('triggers have type="button"', () => {
    const { container } = renderMenubar()
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!
    expect(trigger.getAttribute('type')).toBe('button')
  })

  it('opens on Enter key', () => {
    const { container } = renderMenubar()
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('opens on Space key', () => {
    const { container } = renderMenubar()
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!
    fireEvent.keyDown(trigger, { key: ' ' })
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('opens on ArrowDown key', () => {
    const { container } = renderMenubar()
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Menubar ref={ref}>
        <MenubarMenu value="f">
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('marks the trigger that has focus as highlighted', () => {
    renderMenubar()
    const file = screen.getByText('File')

    act(() => file.focus())
    const focused = file.hasAttribute('data-highlighted')
    act(() => file.blur())

    expect([focused, file.hasAttribute('data-highlighted')]).toEqual([true, false])
  })
})

function renderNestedMenubar(dir?: 'ltr' | 'rtl') {
  const menubar = (
    <Menubar>
      <MenubarMenu value="archive">
        <MenubarTrigger>Archive</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Create</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Forward</MenubarSubTrigger>
              <MenubarPortal>
                <MenubarSubContent>
                  <MenubarItem>Mail</MenubarItem>
                </MenubarSubContent>
              </MenubarPortal>
            </MenubarSub>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu value="modify">
        <MenubarTrigger>Modify</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Revert</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu value="display">
        <MenubarTrigger>Display</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Magnify</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>
  )
  const utils = render(dir ? <DirectionProvider dir={dir}>{menubar}</DirectionProvider> : menubar)
  const triggerState = (label: string) =>
    utils.getByText(label, { selector: '[data-slot="menubar-trigger"]' }).getAttribute('data-state')
  fireEvent.keyDown(utils.getByText('Archive', { selector: '[data-slot="menubar-trigger"]' }), { key: 'Enter' })
  return { ...utils, triggerState }
}

describe('Menubar keyboard direction', () => {
  it('moves to the next menu with ArrowRight in LTR', () => {
    const { getByText, triggerState } = renderNestedMenubar()
    fireEvent.keyDown(getByText('Create'), { key: 'ArrowRight' })
    expect(triggerState('Modify')).toBe('open')
  })

  it('moves to the next menu with ArrowLeft in RTL', () => {
    const { getByText, triggerState } = renderNestedMenubar('rtl')
    fireEvent.keyDown(getByText('Create'), { key: 'ArrowLeft' })
    expect(triggerState('Modify')).toBe('open')
  })

  it('moves to the previous menu with ArrowRight in RTL', () => {
    const { getByText, triggerState } = renderNestedMenubar('rtl')
    fireEvent.keyDown(getByText('Create'), { key: 'ArrowRight' })
    expect(triggerState('Display')).toBe('open')
  })

  it('opens a submenu with ArrowLeft in RTL without leaving the menu', () => {
    const { getByText, queryByText, triggerState } = renderNestedMenubar('rtl')
    fireEvent.keyDown(getByText('Forward'), { key: 'ArrowLeft' })
    expect(triggerState('Archive')).toBe('open')
    expect(queryByText('Mail')).not.toBeNull()
  })

  it('places the submenu on the left in RTL', () => {
    const { getByText } = renderNestedMenubar('rtl')
    fireEvent.keyDown(getByText('Forward'), { key: 'ArrowLeft' })
    const subContent = getByText('Mail').closest('[role="menu"]')
    expect(subContent?.getAttribute('dir')).toBe('rtl')
    expect(subContent?.getAttribute('data-side')).toBe('left')
  })

  it('closes a submenu with ArrowRight in RTL without leaving the menu', () => {
    const { getByText, queryByText, triggerState } = renderNestedMenubar('rtl')
    fireEvent.keyDown(getByText('Forward'), { key: 'ArrowLeft' })
    fireEvent.keyDown(getByText('Mail'), { key: 'ArrowRight' })
    expect(triggerState('Archive')).toBe('open')
    expect(queryByText('Mail')).toBeNull()
  })

  it('closes a submenu with ArrowLeft in LTR without leaving the menu', () => {
    const { getByText, queryByText, triggerState } = renderNestedMenubar()
    fireEvent.keyDown(getByText('Forward'), { key: 'ArrowRight' })
    fireEvent.keyDown(getByText('Mail'), { key: 'ArrowLeft' })
    expect(triggerState('Archive')).toBe('open')
    expect(queryByText('Mail')).toBeNull()
  })
})

function renderMenubarBesideButton(props?: React.ComponentProps<typeof Menubar>) {
  render(
    <>
      <Menubar {...props}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent data-testid="file-content" ref={scrollable}>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Zoom</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <button type="button" ref={scrollable}>
        Outside
      </button>
    </>,
  )
}

const openMenuItem = () => ['New', 'Undo', 'Zoom'].find((name) => screen.queryByText(name) !== null) ?? null

async function openFileWithPointer(props?: React.ComponentProps<typeof Menubar>) {
  renderMenubarBesideButton(props)
  fireEvent.pointerDown(screen.getByText('File'), { button: 0, ctrlKey: false })
  await wait(0)
}

describe('Menubar trigger pointer', () => {
  it('opens its menu on a primary press and claims only the opening press, so the next one closes it', async () => {
    renderMenubarBesideButton()
    const file = screen.getByText('File')

    expect(fireEvent.pointerDown(file, { button: 0, ctrlKey: false })).toBe(false)
    expect(openMenuItem()).toBe('New')
    await wait(0)

    expect(fireEvent.pointerDown(file, { button: 0, ctrlKey: false })).toBe(true)
    expect(openMenuItem()).toBeNull()
  })

  it('opens nothing on a ctrl-click or a secondary press', async () => {
    renderMenubarBesideButton()

    fireEvent.pointerDown(screen.getByText('File'), { button: 0, ctrlKey: true })
    await wait(0)
    const afterCtrlClick = openMenuItem()
    fireEvent.pointerDown(screen.getByText('File'), { button: 2, ctrlKey: false })
    await wait(0)

    expect([afterCtrlClick, openMenuItem()]).toEqual([null, null])
  })

  it('leaves focus in the open menu when the pointer comes back over its trigger', async () => {
    await openFileWithPointer()
    const item = screen.getByText('New')

    act(() => item.focus())
    fireEvent.pointerEnter(screen.getByText('File'))

    expect(document.activeElement).toBe(item)
  })

  it('switches to the menu whose trigger the pointer enters while one is open', async () => {
    await openFileWithPointer()

    fireEvent.pointerEnter(screen.getByText('Edit'))

    expect(openMenuItem()).toBe('Undo')
  })

  it('focuses the trigger the pointer enters, even one with no menu to take focus', async () => {
    render(
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="help">
          <MenubarTrigger>Help</MenubarTrigger>
        </MenubarMenu>
      </Menubar>,
    )
    fireEvent.pointerDown(screen.getByText('File'), { button: 0, ctrlKey: false })
    await wait(0)

    fireEvent.pointerEnter(screen.getByText('Help'))
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('Help'))
  })

  it('opens nothing when the pointer enters a trigger while every menu is closed', () => {
    renderMenubarBesideButton()

    fireEvent.pointerEnter(screen.getByText('Edit'))

    expect(openMenuItem()).toBeNull()
  })
})

describe('Menubar content outside focus and interaction', () => {
  it('stays open when focus moves to another menubar trigger', async () => {
    await openFileWithPointer()

    act(() => screen.getByText('View').focus())

    expect(openMenuItem()).toBe('New')
  })

  it('returns focus to its trigger when Escape closes it', async () => {
    await openFileWithPointer()

    fireEvent.keyDown(screen.getByTestId('file-content'), { key: 'Escape' })
    await wait(0)

    expect(openMenuItem()).toBeNull()
    expect(document.activeElement).toBe(screen.getByText('File'))
  })

  it('closes when focus moves out of the menubar, and leaves focus there', async () => {
    await openFileWithPointer()
    const outside = screen.getByText('Outside')

    act(() => outside.focus())
    await wait(0)

    expect([openMenuItem(), document.activeElement]).toEqual([null, outside])
  })

  it('leaves focus where the user clicked outside', async () => {
    await openFileWithPointer()
    const outside = screen.getByText('Outside')

    fireEvent.pointerDown(outside)
    act(() => outside.focus())
    await wait(0)

    expect(openMenuItem()).toBeNull()
    expect(document.activeElement).toBe(outside)
  })

  it('returns focus to its trigger on Escape after an earlier close by a click outside', async () => {
    await openFileWithPointer()
    const outside = screen.getByText('Outside')
    fireEvent.pointerDown(outside)
    act(() => outside.focus())
    await wait(0)

    fireEvent.pointerDown(screen.getByText('File'), { button: 0, ctrlKey: false })
    await wait(0)
    fireEvent.keyDown(screen.getByTestId('file-content'), { key: 'Escape' })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('File'))
  })
})

describe('Menubar content', () => {
  it('opens below its trigger and aligned to its start, labelled by it, with the popper sizes handed on', async () => {
    await openFileWithPointer()
    const content = screen.getByTestId('file-content')

    expect([
      content.dataset.side,
      content.dataset.align,
      content.getAttribute('aria-labelledby'),
      content.style.getPropertyValue('--gentleduck-menubar-content-transform-origin'),
    ]).toEqual(['bottom', 'start', screen.getByText('File').id, 'var(--gentleduck-popper-transform-origin)'])
  })

  it('opens a submenu its defaultOpen names, with the popper sizes handed on', async () => {
    renderMenubarWithSubmenus({}, { defaultOpen: true })
    await wait(0)
    const submenu = screen.getByText('Mail').closest<HTMLElement>('[role="menu"]')

    expect(submenu?.style.getPropertyValue('--gentleduck-menubar-content-transform-origin')).toBe(
      'var(--gentleduck-popper-transform-origin)',
    )
  })
})

describe('Menubar tab stop', () => {
  const tabStops = (names: string[]) => names.filter((name) => screen.getByText(name).tabIndex === 0)

  it('moves to the menu a press or an arrow key opens', async () => {
    renderMenubarBesideButton()

    fireEvent.pointerDown(screen.getByText('Edit'), { button: 0, ctrlKey: false })
    await wait(0)
    const afterPress = tabStops(['File', 'Edit', 'View'])
    const claimed = fireEvent.keyDown(screen.getByText('Undo'), { key: 'ArrowRight' })
    await wait(0)

    expect([afterPress, claimed, tabStops(['File', 'Edit', 'View'])]).toEqual([['Edit'], false, ['View']])
  })

  it('stays on the menu the back arrow closes, when closing it focuses nothing', async () => {
    render(
      <Menubar orientation="vertical">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent onCloseAutoFocus={(event) => event.preventDefault()}>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
        </MenubarMenu>
      </Menubar>,
    )
    fireEvent.pointerDown(screen.getByText('File'), { button: 0, ctrlKey: false })
    await wait(0)

    fireEvent.keyDown(screen.getByText('New'), { key: 'ArrowLeft' })
    await wait(0)

    expect([screen.queryByText('New'), tabStops(['File', 'Edit'])]).toEqual([null, ['File']])
  })
})

describe('Menubar trigger keys', () => {
  it('closes its open menu on Enter or Space at its trigger', async () => {
    await openFileWithPointer()
    const file = screen.getByText('File')

    fireEvent.keyDown(file, { key: 'Enter' })
    const afterEnter = openMenuItem()
    fireEvent.keyDown(file, { key: ' ' })
    const afterFirstSpace = openMenuItem()
    fireEvent.keyDown(file, { key: ' ' })

    expect([afterEnter, afterFirstSpace, openMenuItem()]).toEqual([null, 'New', null])
  })

  it('opens only its own menu when no menu is given a value', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    const before = [screen.queryByText('New'), screen.queryByText('Undo')]

    fireEvent.keyDown(screen.getByText('Edit'), { key: 'Enter' })

    expect([...before, screen.queryByText('New'), screen.queryByText('Undo')?.textContent]).toEqual([
      null,
      null,
      null,
      'Undo',
    ])
  })

  it('focuses no item in a menu the arrow keys reach, though its trigger opened it from the keyboard before', async () => {
    renderMenubarBesideButton()
    fireEvent.keyDown(screen.getByText('File'), { key: 'Enter' })
    await wait(0)
    const fromKeyboard = document.activeElement?.textContent
    fireEvent.keyDown(screen.getByTestId('file-content'), { key: 'Escape' })
    await wait(0)

    fireEvent.keyDown(screen.getByText('Edit'), { key: 'Enter' })
    await wait(0)
    fireEvent.keyDown(screen.getByText('Undo'), { key: 'ArrowLeft' })
    await wait(0)

    expect(fromKeyboard).toBe('New')
    expect(document.activeElement).toBe(screen.getByTestId('file-content'))
  })

  it('keeps its menu open on the key that opens it, and claims the key', async () => {
    renderMenubarBesideButton({ defaultValue: 'file' })

    const claimed = fireEvent.keyDown(screen.getByText('File'), { key: 'ArrowDown' })
    await wait(0)

    expect([claimed, openMenuItem()]).toEqual([false, 'New'])
  })
})

describe('Menubar without loop', () => {
  it('stops at the first and the last menu', async () => {
    await openFileWithPointer({ loop: false })

    fireEvent.keyDown(screen.getByTestId('file-content'), { key: 'ArrowLeft' })
    const beforeFirst = openMenuItem()
    fireEvent.keyDown(screen.getByText('New'), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByText('Undo'), { key: 'ArrowRight' })
    const last = openMenuItem()
    fireEvent.keyDown(screen.getByText('Zoom'), { key: 'ArrowRight' })

    expect([beforeFirst, last, openMenuItem()]).toEqual(['New', 'Zoom', 'Zoom'])
  })
})

describe('Menubar first and last menu keys', () => {
  it('opens the last menu on A and the first on I', async () => {
    await openFileWithPointer()

    fireEvent.keyDown(screen.getByTestId('file-content'), { key: 'A', shiftKey: true })
    expect(openMenuItem()).toBe('Zoom')

    fireEvent.keyDown(screen.getByText('Zoom'), { key: 'I', shiftKey: true })
    expect(openMenuItem()).toBe('New')
  })

  it('leaves an A or I typed with Caps Lock, or with Shift and another modifier, to the menu', async () => {
    await openFileWithPointer()
    const content = screen.getByTestId('file-content')

    const claimed = [
      fireEvent.keyDown(content, { key: 'A' }),
      fireEvent.keyDown(content, { key: 'A', shiftKey: true, ctrlKey: true }),
      fireEvent.keyDown(content, { key: 'I', shiftKey: true, metaKey: true }),
      fireEvent.keyDown(content, { key: 'A', shiftKey: true, altKey: true }),
    ]

    expect([openMenuItem(), claimed]).toEqual(['New', [true, true, true, true]])
  })

  it('swaps the two keys right to left', async () => {
    renderMenubarBesideButton({ dir: 'rtl' })
    fireEvent.pointerDown(screen.getByText('File'), { button: 0, ctrlKey: false })
    await wait(0)

    fireEvent.keyDown(screen.getByTestId('file-content'), { key: 'I', shiftKey: true })

    expect(openMenuItem()).toBe('Zoom')
  })
})

function renderMenubarWithSubmenus(
  subTriggerProps: React.ComponentProps<typeof MenubarSubTrigger> = {},
  subProps: Omit<React.ComponentProps<typeof MenubarSub>, 'children'> = {},
) {
  render(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Hide</MenubarItem>
          <MenubarItem>Lock</MenubarItem>
          <MenubarItem textValue="Find">
            <input aria-label="Find" />
          </MenubarItem>
          <MenubarSub {...subProps}>
            <MenubarSubTrigger {...subTriggerProps}>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Mail</MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger>More</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Messages</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  )
  fireEvent.keyDown(screen.getByText('File'), { key: 'Enter' })
}

describe('Menubar menu keys', () => {
  it('types ahead to an item that starts with l', async () => {
    renderMenubarWithSubmenus()

    fireEvent.keyDown(screen.getByText('Hide'), { key: 'l' })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('Lock'))
    expect(screen.queryByText('Undo')).toBeNull()
  })

  it('types ahead to an item that starts with h', async () => {
    renderMenubarWithSubmenus()

    fireEvent.keyDown(screen.getByText('Lock'), { key: 'h' })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('Hide'))
    expect(screen.queryByText('Undo')).toBeNull()
  })

  it('leaves the arrows and the I and A keys to a field inside an item', () => {
    renderMenubarWithSubmenus()

    for (const key of ['ArrowRight', 'ArrowLeft', 'I', 'A']) fireEvent.keyDown(screen.getByLabelText('Find'), { key })

    expect(screen.queryByText('Hide')).not.toBeNull()
    expect(screen.queryByText('Undo')).toBeNull()
  })

  it('closes only a submenu on Escape and focuses its trigger when it keeps its parent open', async () => {
    renderMenubarWithSubmenus({}, { closeParentOnEsc: false })
    fireEvent.keyDown(screen.getByText('Share'), { key: 'ArrowRight' })
    await wait(0)

    fireEvent.keyDown(screen.getByText('Mail'), { key: 'Escape' })
    await wait(0)

    expect(screen.queryByText('Mail')).toBeNull()
    expect(screen.queryByText('Hide')).not.toBeNull()
    expect(document.activeElement).toBe(screen.getByText('Share'))
  })

  it('opens a submenu on ArrowRight when its sub-trigger carries its own data-slot', () => {
    renderMenubarWithSubmenus({ 'data-slot': 'share' } as React.ComponentProps<typeof MenubarSubTrigger>)

    fireEvent.keyDown(screen.getByText('Share'), { key: 'ArrowRight' })

    expect(screen.queryByText('Mail')).not.toBeNull()
    expect(screen.queryByText('Undo')).toBeNull()
  })

  it('opens a nested submenu on ArrowRight without leaving the menu', () => {
    renderMenubarWithSubmenus()
    fireEvent.keyDown(screen.getByText('Share'), { key: 'ArrowRight' })

    fireEvent.keyDown(screen.getByText('More'), { key: 'ArrowRight' })

    expect(screen.queryByText('Messages')).not.toBeNull()
    expect(screen.queryByText('Undo')).toBeNull()
  })
})

describe('MenubarMenu onOpenChange', () => {
  it('reports only the changes to its open state', () => {
    const calls: boolean[] = []
    const view = (value: string) => (
      <Menubar value={value}>
        <MenubarMenu value="file" onOpenChange={(open) => calls.push(open)}>
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    )
    const { rerender } = render(view(''))

    rerender(view(''))
    rerender(view('file'))
    rerender(view('file'))
    rerender(view(''))

    expect(calls).toEqual([true, false])
  })
})

function renderVerticalMenubar(dir?: 'ltr' | 'rtl') {
  render(
    <Menubar orientation="vertical" dir={dir}>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent data-testid="file-content">
          <MenubarItem>New</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Zoom</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  )
}

const openFileFromKeyboard = (key = 'Enter') => fireEvent.keyDown(screen.getByText('File'), { key })

describe('Menubar vertical orientation', () => {
  it('tells assistive tech the bar is vertical', () => {
    renderVerticalMenubar()

    expect(screen.getByRole('menubar').getAttribute('aria-orientation')).toBe('vertical')
  })

  it('moves between menus with ArrowDown and ArrowUp without opening one', async () => {
    renderVerticalMenubar()
    screen.getByText('File').focus()

    fireEvent.keyDown(screen.getByText('File'), { key: 'ArrowDown' })
    await wait(0)
    expect(document.activeElement).toBe(screen.getByText('Edit'))
    fireEvent.keyDown(screen.getByText('Edit'), { key: 'ArrowUp' })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('File'))
    expect(openMenuItem()).toBeNull()
  })

  it('opens a menu on ArrowRight, and on ArrowLeft right to left', () => {
    renderVerticalMenubar()
    openFileFromKeyboard('ArrowRight')
    expect(openMenuItem()).toBe('New')
    cleanup()

    renderVerticalMenubar('rtl')
    openFileFromKeyboard('ArrowLeft')

    expect(openMenuItem()).toBe('New')
  })

  it('places the menu beside the bar, on the left right to left', () => {
    renderVerticalMenubar()
    openFileFromKeyboard()
    expect(screen.getByTestId('file-content').getAttribute('data-side')).toBe('right')
    cleanup()

    renderVerticalMenubar('rtl')
    openFileFromKeyboard()

    expect(screen.getByTestId('file-content').getAttribute('data-side')).toBe('left')
  })

  it('closes the menu back to its trigger on ArrowLeft, and on ArrowRight right to left', async () => {
    renderVerticalMenubar()
    openFileFromKeyboard()
    fireEvent.keyDown(screen.getByText('New'), { key: 'ArrowLeft' })
    await wait(0)
    expect(openMenuItem()).toBeNull()
    expect(document.activeElement).toBe(screen.getByText('File'))
    cleanup()

    renderVerticalMenubar('rtl')
    openFileFromKeyboard()
    fireEvent.keyDown(screen.getByText('New'), { key: 'ArrowRight' })
    await wait(0)

    expect(openMenuItem()).toBeNull()
  })

  it('stays in the menu on the arrow pointing away from the bar', () => {
    renderVerticalMenubar()
    openFileFromKeyboard()

    fireEvent.keyDown(screen.getByText('New'), { key: 'ArrowRight' })

    expect(openMenuItem()).toBe('New')
  })

  it('opens the top menu on I and the bottom on A, right to left too', () => {
    renderVerticalMenubar('rtl')
    openFileFromKeyboard()
    fireEvent.keyDown(screen.getByText('New'), { key: 'A', shiftKey: true })
    expect(openMenuItem()).toBe('Zoom')

    fireEvent.keyDown(screen.getByText('Zoom'), { key: 'I', shiftKey: true })

    expect(openMenuItem()).toBe('New')
  })
})

describe('Menubar disabled', () => {
  it('opens no menu from the pointer or the keyboard', async () => {
    render(
      <Menubar disabled>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    const file = screen.getByText('File')

    fireEvent.pointerDown(file, { button: 0, ctrlKey: false })
    fireEvent.keyDown(file, { key: 'Enter' })
    await wait(0)

    expect(file.hasAttribute('disabled')).toBe(true)
    expect(screen.queryByText('New')).toBeNull()
  })

  it('keeps the open menu when the pointer moves onto a disabled trigger', async () => {
    const onValueChange = mock((_value: string) => {})
    render(
      <Menubar defaultValue="file" onValueChange={onValueChange}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="help">
          <MenubarTrigger disabled>Help</MenubarTrigger>
        </MenubarMenu>
      </Menubar>,
    )

    fireEvent.pointerEnter(screen.getByText('Help'))
    await wait(0)

    expect(onValueChange.mock.calls).toEqual([])
    expect(screen.getByText('New')).toBeTruthy()
  })

  it('takes a trigger given through asChild out of the tab order once the bar is disabled', () => {
    function Bar({ disabled }: { disabled: boolean }) {
      return (
        <Menubar disabled={disabled}>
          <MenubarMenu value="file">
            <MenubarTrigger asChild>
              <a href="#file">File</a>
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      )
    }
    const { rerender } = render(<Bar disabled={false} />)
    act(() => screen.getByText('File').focus())
    const enabled = screen.getByText('File').tabIndex

    rerender(<Bar disabled />)

    expect([enabled, screen.getByText('File').tabIndex]).toEqual([0, -1])
  })

  it('takes a disabled bar out of the tab order, and marks its triggers', () => {
    render(
      <Menubar disabled>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>,
    )

    expect([screen.getByRole('menubar').tabIndex, screen.getByText('File').hasAttribute('data-disabled')]).toEqual([
      -1,
      true,
    ])
  })
})

describe('Menubar modal', () => {
  const page = () => ({
    scrolls: scrolls(screen.getByText('Outside')),
    pointerEvents: document.body.style.pointerEvents,
    bar: screen.getByRole('menubar').style.pointerEvents,
  })

  it('locks the page while a menu is open, leaving the menu and the bar usable', async () => {
    await openFileWithPointer({ modal: true })
    await untilScrollLocked()

    expect(page()).toEqual({ scrolls: false, pointerEvents: 'none', bar: 'auto' })
    expect(scrolls(screen.getByTestId('file-content'))).toBe(true)
  })

  it('keeps the page locked while the pointer moves to another menu', async () => {
    await openFileWithPointer({ modal: true })
    await untilScrollLocked()

    fireEvent.pointerEnter(screen.getByText('Edit'))
    await wait(0)

    expect(openMenuItem()).toBe('Undo')
    expect(page()).toEqual({ scrolls: false, pointerEvents: 'none', bar: 'auto' })
  })

  it('gives the page back when the menu closes', async () => {
    await openFileWithPointer({ modal: true })
    await untilScrollLocked()

    fireEvent.keyDown(screen.getByTestId('file-content'), { key: 'Escape' })
    await wait(0)

    expect(page()).toEqual({ scrolls: true, pointerEvents: '', bar: '' })
    expect(document.activeElement).toBe(screen.getByText('File'))
  })

  it('moves between menus from the keyboard', async () => {
    renderMenubarBesideButton({ modal: true })
    fireEvent.keyDown(screen.getByText('File'), { key: 'Enter' })
    await wait(0)

    fireEvent.keyDown(screen.getByText('New'), { key: 'ArrowRight' })
    await wait(0)

    expect(openMenuItem()).toBe('Undo')
    expect(document.activeElement).toBe(screen.getByText('Undo').closest('[role="menu"]'))
  })

  it('leaves the page alone by default', async () => {
    await openFileWithPointer()
    await wait(50)

    expect(page()).toEqual({ scrolls: true, pointerEvents: '', bar: '' })
  })
})
