import { afterAll, afterEach, beforeAll, describe, expect, it, mock, spyOn, vi } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type * as React from 'react'
import { createPortal } from 'react-dom'
import { freshDom, scrolls, untilScrollLocked, wait } from '../../__tests__/dom'
import {
  Menu,
  MenuAnchor,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuItemIndicator,
  MenuLabel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from '../index'

freshDom()

// jsdom has no scrollIntoView, which a jump with G calls.
const originalScrollIntoView = Element.prototype.scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
})
afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView
})

const mouse = { pointerType: 'mouse' }

function renderMenu(
  children: React.ReactNode,
  menu: React.ComponentProps<typeof Menu> = {},
  content: React.ComponentProps<typeof MenuContent> = {},
) {
  return render(
    <Menu open {...menu}>
      <MenuAnchor />
      <MenuContent {...content}>{children}</MenuContent>
    </Menu>,
  )
}

interface ISubMenuProps {
  menu?: React.ComponentProps<typeof Menu>
  sub?: React.ComponentProps<typeof MenuSub>
  trigger?: React.ComponentProps<typeof MenuSubTrigger>
  subContent?: React.ComponentProps<typeof MenuSubContent>
  subChildren?: React.ReactNode
  portalled?: boolean
  withSub?: boolean
}

function SubMenu({ menu, sub, trigger, subContent, subChildren, portalled = false, withSub = true }: ISubMenuProps) {
  const content = (
    <MenuSubContent data-testid="sub-content" avoidCollisions={false} {...subContent}>
      <MenuItem>Grape</MenuItem>
      {subChildren}
    </MenuSubContent>
  )
  return (
    <Menu open {...menu}>
      <MenuAnchor />
      <MenuContent data-testid="content">
        <MenuItem>Apple</MenuItem>
        {withSub && (
          <MenuSub {...sub}>
            <MenuSubTrigger {...trigger}>More</MenuSubTrigger>
            {portalled ? <MenuPortal>{content}</MenuPortal> : content}
          </MenuSub>
        )}
      </MenuContent>
    </Menu>
  )
}

const pass = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('Menu', () => {
  it('starts closed without open', () => {
    render(
      <Menu>
        <MenuAnchor />
        <MenuContent>
          <MenuItem>Apple</MenuItem>
        </MenuContent>
      </Menu>,
    )

    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('is modal without modal, hiding the rest of the page from assistive technology', () => {
    render(
      <>
        <button type="button">Outside</button>
        <Menu open>
          <MenuAnchor />
          <MenuContent>
            <MenuItem>Apple</MenuItem>
          </MenuContent>
        </Menu>
      </>,
    )

    expect(screen.getByText('Outside', { ignore: false }).closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('gives the rest of the page back to assistive technology once it closes', () => {
    const page = (open: boolean) => (
      <>
        <button type="button">Outside</button>
        <Menu open={open}>
          <MenuAnchor />
          <MenuContent>
            <MenuItem>Apple</MenuItem>
          </MenuContent>
        </Menu>
      </>
    )
    const { rerender } = render(page(true))

    rerender(page(false))

    expect(screen.getByText('Outside').closest('[aria-hidden]')).toBeNull()
  })
})

describe('Menu.Sub', () => {
  it('starts closed without open', () => {
    render(
      <Menu open>
        <MenuAnchor />
        <MenuContent>
          <MenuSub>
            <MenuSubTrigger>More</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Grape</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>,
    )

    expect(screen.queryByText('Grape')).toBeNull()
  })

  it('does not ask an open sub menu to open again when its trigger is clicked', () => {
    const onOpenChange = mock()
    render(
      <Menu open>
        <MenuAnchor />
        <MenuContent>
          <MenuSub open onOpenChange={onOpenChange}>
            <MenuSubTrigger>More</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Grape</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>,
    )

    onOpenChange.mockClear()

    fireEvent.click(screen.getByText('More'))

    expect(onOpenChange.mock.calls).toEqual([])
  })
})

describe('Menu keyboard tracking', () => {
  it('adds one keydown listener for every menu mounted, and removes it with the last', () => {
    const add = spyOn(document, 'addEventListener')
    const remove = spyOn(document, 'removeEventListener')
    try {
      const { unmount } = render(
        <>
          <Menu>
            <MenuAnchor />
          </Menu>
          <Menu>
            <MenuAnchor />
          </Menu>
        </>,
      )
      unmount()

      const keydown = (spy: typeof add) => spy.mock.calls.filter(([type]) => type === 'keydown').length
      expect([keydown(add), keydown(remove)]).toEqual([1, 1])
    } finally {
      add.mockRestore()
      remove.mockRestore()
    }
  })

  it('stops listening for the window losing focus once it closes', () => {
    const onOpenChange = mock()
    const { rerender } = render(
      <Menu open onOpenChange={onOpenChange}>
        <MenuAnchor />
      </Menu>,
    )
    rerender(
      <Menu open={false} onOpenChange={onOpenChange}>
        <MenuAnchor />
      </Menu>,
    )

    fireEvent.blur(window)

    expect(onOpenChange.mock.calls).toEqual([])
  })
})

describe('Menu.Content', () => {
  it('is a vertical menu drawn without an outline, in the direction of its root', () => {
    renderMenu(<MenuItem>Apple</MenuItem>, { dir: 'rtl' })
    const content = screen.getByRole('menu')

    expect([content.getAttribute('aria-orientation'), content.getAttribute('dir'), content.style.outline]).toEqual([
      'vertical',
      'rtl',
      'none',
    ])
  })

  it('stays mounted while closed under a forceMount portal, inside the portal container', () => {
    const container = document.body.appendChild(document.createElement('div'))
    render(
      <Menu>
        <MenuAnchor />
        <MenuPortal forceMount container={container}>
          <MenuContent>
            <MenuItem>Apple</MenuItem>
          </MenuContent>
        </MenuPortal>
      </Menu>,
    )

    expect(container.querySelector('[role="menu"]')).not.toBeNull()

    cleanup()
    container.remove()
  })

  it('puts a focus guard at each edge of the page while open', () => {
    renderMenu(<MenuItem>Apple</MenuItem>)

    expect(document.querySelectorAll('[data-slot="focus-guard"]').length).toBe(2)
  })

  it('focuses itself on open, not a field inside it', () => {
    renderMenu(
      <>
        <input aria-label="Filter" />
        <MenuItem>Apple</MenuItem>
      </>,
    )

    expect(document.activeElement?.getAttribute('role')).toBe('menu')
  })

  it('moves focus without scrolling: to itself on open, to the first item on a keyboard open, to an item under the mouse', () => {
    const calls: [HTMLElement, FocusOptions | undefined][] = []
    const focus = HTMLElement.prototype.focus
    const spy = spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement, options) {
      calls.push([this, options])
      focus.call(this, options)
    })
    try {
      const fruit = (open: boolean) => (
        <Menu open={open}>
          <MenuAnchor />
          <MenuContent>
            <MenuItem>Apple</MenuItem>
            <MenuItem>Banana</MenuItem>
          </MenuContent>
        </Menu>
      )
      const { rerender } = render(fruit(false))
      fireEvent.keyDown(document.body, { key: 'Enter' })
      rerender(fruit(true))
      fireEvent.pointerMove(screen.getByText('Banana'), mouse)

      expect(calls.map(([node, options]) => [node.textContent, options?.preventScroll])).toEqual([
        ['AppleBanana', true],
        ['Apple', true],
        ['Banana', true],
      ])
    } finally {
      spy.mockRestore()
    }
  })

  it('makes the item under the mouse its tab stop and highlights it, and takes both back when the mouse leaves', () => {
    renderMenu(
      <>
        <MenuItem>Apple</MenuItem>
        <MenuItem>Banana</MenuItem>
      </>,
    )
    const banana = screen.getByText('Banana')
    const read = (focused: Element) => [
      banana.tabIndex,
      banana.hasAttribute('data-highlighted'),
      document.activeElement === focused,
    ]

    fireEvent.pointerMove(banana, mouse)
    const over = read(banana)
    fireEvent.pointerLeave(banana, mouse)

    expect([over, read(screen.getByRole('menu'))]).toEqual([
      [0, true, true],
      [-1, false, true],
    ])
  })
})

describe('Menu keys', () => {
  it('moves from the content to the first or the last enabled item, taking the key', () => {
    const landsOn = (key: string) => {
      renderMenu(
        <>
          <MenuItem disabled>Apple</MenuItem>
          <MenuItem>Banana</MenuItem>
          <MenuItem>Cherry</MenuItem>
          <MenuItem disabled>Date</MenuItem>
        </>,
      )
      const taken = !fireEvent.keyDown(screen.getByRole('menu'), { key })
      const text = document.activeElement?.textContent
      cleanup()
      return [key, text, taken]
    }

    expect(['ArrowDown', 'PageUp', 'Home', 'ArrowUp', 'PageDown', 'End'].map(landsOn)).toEqual([
      ['ArrowDown', 'Banana', true],
      ['PageUp', 'Banana', true],
      ['Home', 'Banana', true],
      ['ArrowUp', 'Cherry', true],
      ['PageDown', 'Cherry', true],
      ['End', 'Cherry', true],
    ])
  })

  it('leaves an arrow typed in a field inside it to the field', () => {
    renderMenu(
      <>
        <input aria-label="Filter" />
        <MenuItem>Apple</MenuItem>
      </>,
    )
    const field = screen.getByLabelText('Filter')
    act(() => field.focus())

    fireEvent.keyDown(field, { key: 'ArrowDown' })

    expect(document.activeElement?.getAttribute('aria-label')).toBe('Filter')
  })

  it('stops at the last item rather than wrapping', async () => {
    renderMenu(
      <>
        <MenuItem>Apple</MenuItem>
        <MenuItem>Banana</MenuItem>
      </>,
    )
    const banana = screen.getByText('Banana')
    act(() => banana.focus())

    fireEvent.keyDown(banana, { key: 'ArrowDown' })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Banana')
  })

  it('selects once for each Enter and Space, taking the key', () => {
    const onSelect = mock()
    renderMenu(
      <MenuItem onSelect={onSelect} closeOnSelect={false}>
        Apple
      </MenuItem>,
    )
    const apple = screen.getByText('Apple')

    const taken = ['Enter', ' '].map((key) => !fireEvent.keyDown(apple, { key }))

    expect([taken, onSelect.mock.calls.length]).toEqual([[true, true], 2])
  })

  it('leaves Enter and Space on a disabled item to the page', () => {
    renderMenu(<MenuItem disabled>Apple</MenuItem>)
    const apple = screen.getByText('Apple')

    expect(['Enter', ' '].map((key) => fireEvent.keyDown(apple, { key }))).toEqual([true, true])
  })

  it('jumps with G to the last enabled item', async () => {
    renderMenu(
      <>
        <MenuItem>Apple</MenuItem>
        <MenuItem>Banana</MenuItem>
        <MenuItem disabled>Cherry</MenuItem>
      </>,
    )

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'G', shiftKey: true })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Banana')
  })
})

describe('Menu typeahead', () => {
  it('passes over a disabled item', async () => {
    renderMenu(
      <>
        <MenuItem>Apple</MenuItem>
        <MenuItem disabled>Banana</MenuItem>
        <MenuItem>Blueberry</MenuItem>
      </>,
    )

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'b' })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Blueberry')
  })

  it('reads only a character typed without Ctrl, Alt or Meta', async () => {
    renderMenu(
      <>
        <MenuItem>Apple</MenuItem>
        <MenuItem>Delete</MenuItem>
        <MenuItem>Banana</MenuItem>
      </>,
    )
    const content = screen.getByRole('menu')

    for (const key of [
      { key: 'b', ctrlKey: true },
      { key: 'b', altKey: true },
      { key: 'b', metaKey: true },
      { key: 'Delete' },
    ]) {
      fireEvent.keyDown(content, key)
    }
    await wait(0)

    expect(document.activeElement?.getAttribute('role')).toBe('menu')
  })

  it('starts the search over after a jump with G', async () => {
    renderMenu(
      <>
        <MenuItem>Apple</MenuItem>
        <MenuItem>Apricot</MenuItem>
        <MenuItem>Cherry</MenuItem>
      </>,
    )
    const content = screen.getByRole('menu')

    fireEvent.keyDown(content, { key: 'a' })
    fireEvent.keyDown(content, { key: 'G', shiftKey: true })
    await wait(0)
    fireEvent.keyDown(screen.getByText('Cherry'), { key: 'p' })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Cherry')
  })

  it('starts the search over once focus leaves the menu', async () => {
    renderMenu(
      <>
        <MenuItem>Apple</MenuItem>
        <MenuItem>Pear</MenuItem>
      </>,
    )
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'a' })
    await wait(0)
    const apple = screen.getByText('Apple')

    fireEvent.focusOut(apple, { relatedTarget: document.body })
    fireEvent.keyDown(apple, { key: 'p' })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Pear')
  })

  it('leaves a key typed in an open sub menu to the sub menu', async () => {
    render(<SubMenu sub={{ open: true }} />)
    const grape = screen.getByText('Grape')
    act(() => grape.focus())

    fireEvent.keyDown(grape, { key: 'a' })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Grape')
  })
})

describe('Menu modal', () => {
  it('keeps focus inside while open', () => {
    render(
      <>
        <button type="button">Outside</button>
        <Menu open>
          <MenuAnchor />
          <MenuContent>
            <MenuItem>Apple</MenuItem>
          </MenuContent>
        </Menu>
      </>,
    )

    act(() => screen.getByText('Outside').focus())

    expect(screen.getByRole('menu').contains(document.activeElement)).toBe(true)
  })

  it('lets focus leave with trapFocus false, telling onFocusOutside and staying open', () => {
    const onOpenChange = mock()
    const onFocusOutside = mock()
    render(
      <>
        <button type="button">Outside</button>
        <Menu open onOpenChange={onOpenChange}>
          <MenuAnchor />
          <MenuContent trapFocus={false} onFocusOutside={onFocusOutside}>
            <MenuItem>Apple</MenuItem>
          </MenuContent>
        </Menu>
      </>,
    )
    const outside = screen.getByText('Outside')

    act(() => outside.focus())

    expect([document.activeElement === outside, onFocusOutside.mock.calls.length, onOpenChange.mock.calls]).toEqual([
      true,
      1,
      [],
    ])
  })

  it('leaves pointer events outside alone with disableOutsidePointerEvents false', () => {
    renderMenu(<MenuItem>Apple</MenuItem>, {}, { disableOutsidePointerEvents: false })

    expect(document.body.style.pointerEvents).toBe('')
  })

  it('locks scrolling outside, letting a pinch zoom over it through and leaving the scrollbar alone', async () => {
    renderMenu(<MenuItem>Apple</MenuItem>)
    await untilScrollLocked()
    // A wheel over a drag selection is let through, and jsdom leaves the selection on the page.
    window.getSelection()?.removeAllRanges()
    await wait(5)

    const pinch = fireEvent.wheel(screen.getByRole('menu'), { deltaY: 10, ctrlKey: true })

    expect([pinch, document.body.hasAttribute('data-scroll-locked')]).toEqual([true, false])
  })

  it('leaves the page scrolling while closed, and with disableOutsideScroll false', async () => {
    renderMenu(<MenuItem>Apple</MenuItem>)
    await untilScrollLocked()
    cleanup()

    render(
      <Menu>
        <MenuAnchor />
        <MenuContent forceMount>
          <MenuItem>Apple</MenuItem>
        </MenuContent>
      </Menu>,
    )
    await wait(10)
    const whileClosed = scrolls(document.body)
    cleanup()
    renderMenu(<MenuItem>Apple</MenuItem>, {}, { disableOutsideScroll: false })
    await wait(10)

    expect([whileClosed, scrolls(document.body)]).toEqual([true, true])
  })
})

describe('Menu items', () => {
  it('selects again on a release alone after a select that keeps it open', () => {
    const onSelect = mock()
    renderMenu(
      <MenuItem onSelect={onSelect} closeOnSelect={false}>
        Apple
      </MenuItem>,
    )
    const apple = screen.getByText('Apple')

    fireEvent.pointerDown(apple, mouse)
    fireEvent.pointerUp(apple, mouse)
    fireEvent.click(apple)
    fireEvent.pointerUp(apple, mouse)

    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('calls its own onPointerDown', () => {
    const onPointerDown = mock()
    renderMenu(<MenuItem onPointerDown={onPointerDown}>Apple</MenuItem>)

    fireEvent.pointerDown(screen.getByText('Apple'), mouse)

    expect(onPointerDown).toHaveBeenCalledTimes(1)
  })

  it('starts a checkbox item unchecked, and toggles it on a select whose own handler keeps the menu open', () => {
    const onSelect = mock((event: Event) => event.preventDefault())
    const onCheckedChange = mock()
    renderMenu(
      <MenuCheckboxItem onSelect={onSelect} onCheckedChange={onCheckedChange}>
        Bold
      </MenuCheckboxItem>,
    )
    const bold = screen.getByRole('menuitemcheckbox')
    const state = [bold.getAttribute('aria-checked'), bold.getAttribute('data-state')]

    fireEvent.click(bold)

    expect([state, onSelect.mock.calls.length, onCheckedChange.mock.calls]).toEqual([
      ['false', 'unchecked'],
      1,
      [[true]],
    ])
  })

  it('marks the chosen radio item and shows its indicator, and chooses on a select whose own handler keeps the menu open', () => {
    const onValueChange = mock()
    renderMenu(
      <MenuRadioGroup value="small" onValueChange={onValueChange}>
        <MenuRadioItem value="small">
          <MenuItemIndicator>*</MenuItemIndicator>Small
        </MenuRadioItem>
        <MenuRadioItem value="large" onSelect={(event) => event.preventDefault()}>
          <MenuItemIndicator>*</MenuItemIndicator>Large
        </MenuRadioItem>
      </MenuRadioGroup>,
    )
    const items = screen.getAllByRole('menuitemradio')
    const state = items.map((item) => [item.getAttribute('data-state'), item.textContent])

    fireEvent.click(screen.getByText('Large'))

    expect([state, onValueChange.mock.calls]).toEqual([
      [
        ['checked', '*Small'],
        ['unchecked', 'Large'],
      ],
      [['large']],
    ])
  })

  it('shows an indicator while its item is mixed, or always with forceMount', () => {
    renderMenu(
      <>
        <MenuCheckboxItem checked="indeterminate">
          <MenuItemIndicator>-</MenuItemIndicator>Mixed
        </MenuCheckboxItem>
        <MenuCheckboxItem>
          <MenuItemIndicator forceMount>x</MenuItemIndicator>Off
        </MenuCheckboxItem>
      </>,
    )

    expect(
      Array.from(document.querySelectorAll('[data-slot="menu-item-indicator"]'), (node) => [
        node.textContent,
        node.getAttribute('data-state'),
      ]),
    ).toEqual([
      ['-', 'indeterminate'],
      ['x', 'unchecked'],
    ])
  })

  it('marks its label', () => {
    renderMenu(<MenuLabel>Fruit</MenuLabel>)

    expect(screen.getByText('Fruit').getAttribute('data-slot')).toBe('menu-label')
  })
})

describe('Menu.SubTrigger', () => {
  it('opens its sub menu on Enter, Space and the arrow toward it', () => {
    const opensOn = (key: string) => {
      const onOpenChange = mock()
      render(<SubMenu sub={{ onOpenChange }} />)
      fireEvent.keyDown(screen.getByText('More'), { key })
      const calls = [...onOpenChange.mock.calls]
      cleanup()
      return calls
    }

    expect(['Enter', ' ', 'ArrowRight'].map(opensOn)).toEqual([[[true]], [[true]], [[true]]])
  })

  it('moves focus into its open sub menu on the arrow toward it, taking the key', () => {
    render(<SubMenu sub={{ open: true }} />)
    const more = screen.getByText('More')
    act(() => more.focus())

    const taken = !fireEvent.keyDown(more, { key: 'ArrowRight' })

    expect([taken, screen.getByTestId('sub-content').contains(document.activeElement)]).toEqual([true, true])
  })

  it('opens its sub menu on a click, focusing itself, unless the click is prevented', () => {
    const onOpenChange = mock()
    render(<SubMenu sub={{ onOpenChange }} />)
    const more = screen.getByText('More')
    fireEvent.click(more)
    const clicked = [[...onOpenChange.mock.calls], document.activeElement === more]
    cleanup()
    const onPreventedOpenChange = mock()
    render(
      <SubMenu
        sub={{ onOpenChange: onPreventedOpenChange }}
        trigger={{ onClick: (event) => event.preventDefault() }}
      />,
    )

    fireEvent.click(screen.getByText('More'))

    expect([clicked, onPreventedOpenChange.mock.calls]).toEqual([[[[true]], true], []])
  })

  it('names the sub menu and says whether it is open', () => {
    render(<SubMenu sub={{ open: true }} />)

    expect([screen.getByRole('menu', { name: 'More' }), screen.getByText('More').getAttribute('data-state')]).toEqual([
      screen.getByTestId('sub-content'),
      'open',
    ])
  })
})

describe('Menu.Sub', () => {
  it('asks to close when it mounts in a closed menu, and when it unmounts', () => {
    const onOpenChange = mock()
    const fruit = (withSub: boolean) => (
      <Menu>
        <MenuAnchor />
        <MenuContent forceMount>
          {withSub && (
            <MenuSub open onOpenChange={onOpenChange}>
              <MenuSubTrigger>More</MenuSubTrigger>
            </MenuSub>
          )}
        </MenuContent>
      </Menu>
    )
    const { rerender } = render(fruit(true))
    const onMount = [...onOpenChange.mock.calls]

    rerender(fruit(false))

    expect([onMount, onOpenChange.mock.calls.slice(onMount.length)]).toEqual([[[false]], [[false]]])
  })
})

describe('Menu.SubContent', () => {
  it('opens to the right of its trigger, aligned to its start, whatever side and align it is given', () => {
    render(<SubMenu sub={{ open: true }} subContent={JSON.parse('{"side":"left","align":"end"}')} />)
    const sub = screen.getByTestId('sub-content')

    expect([sub.getAttribute('data-side'), sub.getAttribute('data-align')]).toEqual(['right', 'start'])
  })

  it('leaves pointer events and scrolling outside alone in a menu that is not modal', async () => {
    render(<SubMenu menu={{ modal: false }} sub={{ open: true }} />)
    await wait(10)

    expect([document.body.style.pointerEvents, scrolls(document.body)]).toEqual(['', true])
  })

  it('closes when focus leaves it for anything but its trigger, telling onFocusOutside', () => {
    const onOpenChange = mock()
    const onFocusOutside = mock()
    render(<SubMenu sub={{ open: true, onOpenChange }} subContent={{ onFocusOutside }} />)
    onOpenChange.mockClear()
    onFocusOutside.mockClear()

    act(() => screen.getByText('Apple').focus())

    expect([onFocusOutside.mock.calls.length, onOpenChange.mock.calls]).toEqual([1, [[false]]])
  })

  it('takes an Escape typed in it, telling onEscapeKeyDown', () => {
    const onEscapeKeyDown = mock()
    const { rerender } = render(<SubMenu subContent={{ onEscapeKeyDown }} />)
    rerender(<SubMenu sub={{ open: true }} subContent={{ onEscapeKeyDown }} />)

    const taken = !fireEvent.keyDown(screen.getByText('Grape'), { key: 'Escape' })

    expect([taken, onEscapeKeyDown.mock.calls.length]).toEqual([true, 1])
  })

  it('stays open on the arrow away from it typed in a field portalled out of it, telling onKeyDown', () => {
    const onOpenChange = mock()
    const onKeyDown = mock()
    const Field = () => createPortal(<input aria-label="Note" />, document.body)
    render(<SubMenu sub={{ open: true, onOpenChange }} subContent={{ onKeyDown }} subChildren={<Field />} />)
    onOpenChange.mockClear()

    fireEvent.keyDown(screen.getByLabelText('Note'), { key: 'ArrowLeft' })

    expect([onKeyDown.mock.calls.length, onOpenChange.mock.calls]).toEqual([1, []])
  })
})

describe('Menu sub menu on hover', () => {
  afterEach(() => vi.useRealTimers())

  it('opens 100ms after the mouse comes over its trigger, once however often it moves', () => {
    const onOpenChange = mock()
    render(<SubMenu sub={{ onOpenChange }} />)
    vi.useFakeTimers()
    const more = screen.getByText('More')

    for (let move = 0; move < 3; move++) fireEvent.pointerMove(more, mouse)
    pass(50)
    const early = onOpenChange.mock.calls.length
    pass(60)

    expect([early, onOpenChange.mock.calls]).toEqual([0, [[true]]])
  })

  it('opens again on hover after it closed', () => {
    const onOpenChange = mock()
    const { rerender } = render(<SubMenu sub={{ onOpenChange }} />)
    vi.useFakeTimers()
    const hover = () => {
      fireEvent.pointerMove(screen.getByText('More'), mouse)
      pass(110)
    }

    hover()
    rerender(<SubMenu sub={{ open: true, onOpenChange }} />)
    rerender(<SubMenu sub={{ open: false, onOpenChange }} />)
    hover()

    expect(onOpenChange.mock.calls).toEqual([[true], [true]])
  })

  it('does not open once its trigger has unmounted', () => {
    const onOpenChange = mock()
    const { rerender } = render(<SubMenu sub={{ onOpenChange }} />)
    vi.useFakeTimers()

    fireEvent.pointerMove(screen.getByText('More'), mouse)
    rerender(<SubMenu sub={{ onOpenChange }} withSub={false} />)
    pass(110)

    expect(onOpenChange.mock.calls).toEqual([[false]])
  })
})

describe('Menu pointer grace toward a sub menu', () => {
  afterEach(() => vi.useRealTimers())

  // The sub menu spans x 100 to 200 and y 0 to 100, and the mouse leaves its trigger at (50, 10) heading right.
  function openSubToTheRight(props: ISubMenuProps = {}) {
    const result = render(<SubMenu sub={{ open: true }} {...props} />)
    screen.getByTestId('sub-content').getBoundingClientRect = () => new DOMRect(100, 0, 100, 100)
    fireEvent.pointerMove(screen.getByTestId('content'), { ...mouse, clientX: 70, clientY: 10 })
    vi.useFakeTimers()
    return result
  }
  const moveOverContent = (clientX: number, clientY = 10) =>
    fireEvent.pointerMove(screen.getByTestId('content'), { ...mouse, clientX, clientY })
  const leaveTrigger = (clientY = 10) =>
    fireEvent.pointerLeave(screen.getByText('More'), { ...mouse, clientX: 50, clientY })
  const crossApple = () => {
    const apple = screen.getByText('Apple')
    fireEvent.pointerMove(apple, { ...mouse, clientX: 90, clientY: 50 })
    return document.activeElement === apple
  }

  it('keeps an item inside the path to the sub menu from taking focus', () => {
    openSubToTheRight()
    leaveTrigger()

    expect(crossApple()).toBe(false)
  })

  it('lets that item take focus once the mouse heads away from the sub menu', () => {
    openSubToTheRight()
    moveOverContent(65)
    leaveTrigger()

    expect(crossApple()).toBe(true)
  })

  it('keeps heading toward the sub menu through a move straight up or down', () => {
    openSubToTheRight()
    moveOverContent(70, 40)
    leaveTrigger()

    expect(crossApple()).toBe(false)
  })

  it('ignores the mouse moving inside a sub menu portalled out of it', () => {
    openSubToTheRight({ portalled: true })
    fireEvent.pointerMove(screen.getByText('Grape'), { ...mouse, clientX: 65, clientY: 10 })
    leaveTrigger()

    expect(crossApple()).toBe(false)
  })

  it('lets the path lapse 300ms after the mouse leaves the trigger, counting from the last time it left', () => {
    openSubToTheRight()
    leaveTrigger()
    pass(200)
    leaveTrigger()
    pass(200)
    const during = crossApple()
    pass(150)

    expect([during, crossApple()]).toEqual([false, true])
  })

  it('drops the path once the sub menu has closed and the mouse leaves the trigger elsewhere', () => {
    const { rerender } = openSubToTheRight()
    leaveTrigger()
    rerender(<SubMenu sub={{ open: false }} />)

    leaveTrigger(150)

    expect(crossApple()).toBe(true)
  })

  it('drops the path once the sub menu has closed and the mouse comes back over the trigger', () => {
    const { rerender } = openSubToTheRight()
    leaveTrigger()
    rerender(<SubMenu sub={{ open: false }} />)

    fireEvent.pointerMove(screen.getByText('More'), { ...mouse, clientX: 70, clientY: 150 })

    expect(crossApple()).toBe(true)
  })

  it('drops the path when the sub menu unmounts', () => {
    const { rerender } = openSubToTheRight()
    leaveTrigger()

    rerender(<SubMenu withSub={false} />)

    expect(crossApple()).toBe(true)
  })
})
