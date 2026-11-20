import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import ReactDOM from 'react-dom'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { freshDom, pageChangesOnClose, wait } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../index'

freshDom()

function renderDropdown(props: Record<string, unknown> = {}) {
  return render(
    <DropdownMenu {...props}>
      <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>,
  )
}

describe('DropdownMenu', () => {
  it('renders trigger with data-slot="dropdown-menu-trigger"', () => {
    const { container } = renderDropdown()
    expect(container.querySelector('[data-slot="dropdown-menu-trigger"]')).not.toBeNull()
  })

  it('trigger has type="button"', () => {
    const { container } = renderDropdown()
    expect(container.querySelector('[data-slot="dropdown-menu-trigger"]')?.getAttribute('type')).toBe('button')
  })

  it('trigger has aria-haspopup="menu"', () => {
    const { container } = renderDropdown()
    expect(container.querySelector('[data-slot="dropdown-menu-trigger"]')?.getAttribute('aria-haspopup')).toBe('menu')
  })

  it('trigger starts closed', () => {
    const { container } = renderDropdown()
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })

  it('trigger opens on Enter key', () => {
    const handler = vi.fn(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="dropdown-menu-trigger"]')!, { key: 'Enter' })
    expect(handler).toHaveBeenCalled()
  })

  it('trigger opens on Space key', () => {
    const handler = vi.fn(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="dropdown-menu-trigger"]')!, { key: ' ' })
    expect(handler).toHaveBeenCalled()
  })

  it('trigger opens on ArrowDown key', () => {
    const handler = vi.fn(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="dropdown-menu-trigger"]')!, { key: 'ArrowDown' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('leaves a key it does not use to the page', () => {
    const handler = vi.fn(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    const handled = ['Tab', 'a', 'ArrowUp'].map((key) => fireEvent.keyDown(trigger, { key }))

    expect([handled, handler.mock.calls]).toEqual([[true, true, true], []])
  })

  it('keeps the browser from acting on Enter, Space and ArrowDown, which it uses', () => {
    const { container } = renderDropdown()
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    const handled = ['Enter', ' ', 'ArrowDown'].map((key) => fireEvent.keyDown(trigger, { key }))

    expect(handled).toEqual([false, false, false])
  })

  it('closes on Enter or Space at its trigger while the menu leaves focus there', () => {
    render(
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent onOpenAutoFocus={(event) => event.preventDefault()}>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const trigger = screen.getByText('Menu')

    const states = ['Enter', 'Enter', ' ', ' '].map((key) => {
      fireEvent.keyDown(trigger, { key })
      return isOpen()
    })

    expect(states).toEqual([true, false, true, false])
  })

  it('opens on no key while disabled, even rendered as an element that still takes focus', () => {
    const handler = vi.fn(() => {})
    render(
      <DropdownMenu onOpenChange={handler}>
        <DropdownMenuTrigger asChild disabled>
          <a href="#menu">Menu</a>
        </DropdownMenuTrigger>
      </DropdownMenu>,
    )
    const trigger = screen.getByText('Menu')

    const handled = ['Enter', ' ', 'ArrowDown'].map((key) => fireEvent.keyDown(trigger, { key }))

    expect([handled, handler.mock.calls]).toEqual([[true, true, true], []])
  })

  it('disabled trigger has data-disabled and disabled attr', () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger disabled>Menu</DropdownMenuTrigger>
      </DropdownMenu>,
    )
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!
    expect(trigger.getAttribute('data-disabled')).toBe('')
    expect((trigger as HTMLButtonElement).disabled).toBe(true)
  })

  it('calls onOpenChange', () => {
    const handler = vi.fn(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="dropdown-menu-trigger"]')!, { key: 'Enter' })
    expect(handler).toHaveBeenCalled()
  })

  it('forwards ref to trigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger ref={ref}>Menu</DropdownMenuTrigger>
      </DropdownMenu>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('trigger has aria-controls when open', () => {
    const { container } = renderDropdown({ defaultOpen: true })
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!
    expect(trigger.getAttribute('aria-controls')).toBeTruthy()
  })

  it('trigger has no aria-controls when closed', () => {
    const { container } = renderDropdown()
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!
    expect(trigger.getAttribute('aria-controls')).toBeNull()
  })

  it('passes className through to trigger', () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger className="my-trigger">Menu</DropdownMenuTrigger>
      </DropdownMenu>,
    )
    expect(container.querySelector('.my-trigger')).not.toBeNull()
  })
})

describe('DropdownMenu direction', () => {
  const mounted: Array<() => void> = []

  afterEach(() => {
    for (const unmount of mounted.splice(0)) unmount()
  })

  function renderWithSub(dir: 'ltr' | 'rtl') {
    const utils = render(
      <DirectionProvider dir={dir}>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>More tools</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Nested tool</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </DirectionProvider>,
    )
    mounted.push(utils.unmount)
    return utils
  }

  it('sets dir on portaled content from DirectionProvider', () => {
    const { getByText } = renderWithSub('rtl')
    expect(getByText('More tools').closest('[role="menu"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('opens the submenu to the left with ArrowLeft in RTL and closes it with ArrowRight', () => {
    const { getByText, queryByText } = renderWithSub('rtl')
    fireEvent.keyDown(getByText('More tools'), { key: 'ArrowRight' })
    expect(queryByText('Nested tool')).toBeNull()
    fireEvent.keyDown(getByText('More tools'), { key: 'ArrowLeft' })
    const subContent = getByText('Nested tool').closest('[role="menu"]')
    expect(subContent?.getAttribute('data-side')).toBe('left')
    expect(subContent?.getAttribute('dir')).toBe('rtl')
    fireEvent.keyDown(getByText('Nested tool'), { key: 'ArrowRight' })
    expect(queryByText('Nested tool')).toBeNull()
  })

  it('opens the submenu to the right with ArrowRight in LTR', () => {
    const { getByText } = renderWithSub('ltr')
    fireEvent.keyDown(getByText('More tools'), { key: 'ArrowRight' })
    expect(getByText('Nested tool').closest('[role="menu"]')?.getAttribute('data-side')).toBe('right')
  })

  it('puts a dir given to the root on the menu and leaves the trigger to the page', () => {
    const { container } = renderDropdown({ dir: 'rtl', defaultOpen: true })

    expect(container.querySelector('[data-slot="dropdown-menu-trigger"]')?.hasAttribute('dir')).toBe(false)
    expect(screen.getByText('Item 1').closest('[role="menu"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('gives the menu the direction of <html dir> when nothing else sets one', () => {
    document.documentElement.dir = 'rtl'
    try {
      renderDropdown({ defaultOpen: true })

      expect(screen.getByText('Item 1').closest('[role="menu"]')?.getAttribute('dir')).toBe('rtl')
    } finally {
      document.documentElement.dir = ''
    }
  })
})

function renderDropdownBesideButton({ modal, disabled }: { modal?: boolean; disabled?: boolean } = {}) {
  render(
    <>
      <DropdownMenu modal={modal}>
        <DropdownMenuTrigger disabled={disabled}>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <button type="button">Outside</button>
    </>,
  )
  return { trigger: screen.getByText('Menu'), outside: screen.getByText('Outside') }
}

const isOpen = () => screen.queryByText('Item') !== null

async function openWithPointer() {
  const view = renderDropdownBesideButton()
  fireEvent.pointerDown(view.trigger, { button: 0, ctrlKey: false })
  await wait(0)
  return view
}

describe('DropdownMenu trigger pointer', () => {
  it('toggles the menu on a primary pointer down', () => {
    const { trigger } = renderDropdownBesideButton()

    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    expect(isOpen()).toBe(true)
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })

    expect(isOpen()).toBe(false)
  })

  it('stops the opening pointer down from moving focus, and lets the closing one through', () => {
    const { trigger } = renderDropdownBesideButton()

    expect(fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })).toBe(false)
    expect(fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })).toBe(true)
  })

  it('ignores a secondary button, a control click and a disabled trigger', () => {
    const { trigger } = renderDropdownBesideButton()

    fireEvent.pointerDown(trigger, { button: 2, ctrlKey: false })
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: true })
    expect(isOpen()).toBe(false)

    cleanup()
    const disabled = renderDropdownBesideButton({ disabled: true })
    fireEvent.pointerDown(disabled.trigger, { button: 0, ctrlKey: false })
    expect(isOpen()).toBe(false)
  })
})

describe('DropdownMenu focus on close', () => {
  it('returns focus to the trigger after a primary click outside a modal menu', async () => {
    const { trigger, outside } = await openWithPointer()

    fireEvent.pointerDown(outside, { button: 0 })
    await wait(0)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('leaves focus alone after a right click outside, which may be opening another menu', async () => {
    const { trigger, outside } = await openWithPointer()

    fireEvent.pointerDown(outside, { button: 2 })
    await wait(0)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).not.toBe(trigger)
  })

  it('leaves focus alone after a control click outside', async () => {
    const { trigger, outside } = await openWithPointer()

    fireEvent.pointerDown(outside, { button: 0, ctrlKey: true })
    await wait(0)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).not.toBe(trigger)
  })

  it('leaves focus where the user put it after any click outside a non-modal menu', async () => {
    const { trigger, outside } = renderDropdownBesideButton({ modal: false })
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    await wait(0)

    fireEvent.pointerDown(outside, { button: 0 })
    await wait(0)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).not.toBe(trigger)
  })

  it('gives focus back to the trigger on Escape after an earlier click outside closed the menu', async () => {
    const { trigger, outside } = renderDropdownBesideButton({ modal: false })
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    await wait(0)
    fireEvent.pointerDown(outside, { button: 0 })
    await wait(0)

    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    await wait(0)
    await press('Escape')

    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })
})

// jsdom has no scrollIntoView.
const originalScrollIntoView = Element.prototype.scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
})
afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView
})

function renderOpenFruitMenu({
  onSelect,
  closeParentOnEsc,
}: {
  onSelect?: (fruit: string) => void
  closeParentOnEsc?: boolean
} = {}) {
  render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Fruit</DropdownMenuTrigger>
      <DropdownMenuContent data-testid="content">
        <DropdownMenuItem onSelect={() => onSelect?.('Apple')}>Apple</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect?.('Banana')}>Banana</DropdownMenuItem>
        <DropdownMenuItem disabled>Blackberry</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect?.('Cherry')}>Cherry</DropdownMenuItem>
        <DropdownMenuSub closeParentOnEsc={closeParentOnEsc}>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent data-testid="sub-content">
            <DropdownMenuItem>Grape</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>,
  )
}

async function press(key: string, init: Record<string, unknown> = {}) {
  fireEvent.keyDown(document.activeElement ?? document.body, { key, ...init })
  await wait(0)
}

describe('DropdownMenu content keyboard', () => {
  it('moves focus to the item a typed letter starts', async () => {
    renderOpenFruitMenu()
    act(() => screen.getByText('Apple').focus())

    await press('c')

    expect(document.activeElement).toBe(screen.getByText('Cherry'))
  })

  it('starts the search again from the last letter when the letters typed so far match nothing', async () => {
    renderOpenFruitMenu()
    act(() => screen.getByText('Apple').focus())

    await press('c')
    await press('b')

    expect(document.activeElement).toBe(screen.getByText('Banana'))
  })

  it('cancels a pending gg when a modified key comes between the two presses', async () => {
    renderOpenFruitMenu()
    act(() => screen.getByText('Cherry').focus())

    await press('g')
    await press('g', { ctrlKey: true })
    await press('g')

    expect(document.activeElement).toBe(screen.getByText('Cherry'))
  })

  it('moves focus to the last item on G and back to the first on gg', async () => {
    renderOpenFruitMenu()
    act(() => screen.getByText('Banana').focus())

    await press('G', { shiftKey: true })
    expect(document.activeElement).toBe(screen.getByText('More'))

    await press('g')
    await press('g')
    expect(document.activeElement).toBe(screen.getByText('Apple'))
  })

  it('moves focus from the content to the last item on End and the first on Home', async () => {
    renderOpenFruitMenu()
    act(() => screen.getByTestId('content').focus())

    await press('End')
    expect(document.activeElement).toBe(screen.getByText('More'))

    act(() => screen.getByTestId('content').focus())
    await press('Home')
    expect(document.activeElement).toBe(screen.getByText('Apple'))
  })
})

describe('DropdownMenu item pointer', () => {
  it('selects an item released on after a press that started elsewhere', () => {
    const onSelect = vi.fn((_fruit: string) => {})
    renderOpenFruitMenu({ onSelect })

    fireEvent.pointerUp(screen.getByText('Apple'))

    expect(onSelect.mock.calls).toEqual([['Apple']])
  })

  it('leaves selection to the click when the press started on the item', () => {
    const onSelect = vi.fn((_fruit: string) => {})
    renderOpenFruitMenu({ onSelect })

    fireEvent.pointerDown(screen.getByText('Apple'))
    fireEvent.pointerUp(screen.getByText('Apple'))

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('hands focus back to the content when the mouse moves onto a disabled item', () => {
    renderOpenFruitMenu()
    act(() => screen.getByText('Banana').focus())

    fireEvent.pointerMove(screen.getByText('Blackberry'), { pointerType: 'mouse' })

    expect(document.activeElement).toBe(screen.getByTestId('content'))
  })

  it('follows no link a disabled item renders, and still follows an enabled one', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Account</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem asChild disabled>
              <a href="#team">Team</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="#profile">Profile</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    )

    const followed = [fireEvent.click(screen.getByText('Team')), fireEvent.click(screen.getByText('Profile'))]

    expect(followed).toEqual([false, true])
  })
})

describe('DropdownMenu sub menu', () => {
  it('names its trigger with its own data-slot', () => {
    renderOpenFruitMenu()

    expect(screen.getByText('More').getAttribute('data-slot')).toBe('dropdown-menu-subtrigger')
  })

  // A menu focusing its own content on open reads as focus leaving the submenu, which closes it.
  it('starts open in a menu that leaves focus alone, and reports each change to its open state', async () => {
    const changes: boolean[] = []
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Fruit</DropdownMenuTrigger>
        <DropdownMenuContent onOpenAutoFocus={(event) => event.preventDefault()}>
          <DropdownMenuItem>Apple</DropdownMenuItem>
          <DropdownMenuSub defaultOpen onOpenChange={(open) => changes.push(open)}>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Grape</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.queryByText('Grape')).not.toBeNull()

    act(() => screen.getByText('Grape').focus())
    await press('ArrowLeft')
    await press('ArrowRight')

    expect(changes).toEqual([false, true])
  })

  it('opens after the mouse rests on its trigger', async () => {
    renderOpenFruitMenu()

    fireEvent.pointerMove(screen.getByText('More'), { pointerType: 'mouse' })
    expect(screen.queryByText('Grape')).toBeNull()

    await wait(150)
    expect(screen.queryByText('Grape')).not.toBeNull()
  })

  it('opens nothing when the mouse leaves its trigger first', async () => {
    renderOpenFruitMenu()
    const more = screen.getByText('More')

    fireEvent.pointerMove(more, { pointerType: 'mouse' })
    fireEvent.pointerLeave(more, { pointerType: 'mouse' })
    await wait(150)

    expect(screen.queryByText('Grape')).toBeNull()
  })

  it('closes the whole menu on Escape inside it', async () => {
    renderOpenFruitMenu()
    act(() => screen.getByText('More').focus())
    await press('ArrowRight')

    fireEvent.keyDown(screen.getByTestId('sub-content'), { key: 'Escape' })
    await wait(0)

    expect(screen.queryByText('Apple')).toBeNull()
  })

  it('closes only itself on Escape and focuses its trigger when it keeps its parent open', async () => {
    renderOpenFruitMenu({ closeParentOnEsc: false })
    act(() => screen.getByText('More').focus())
    await press('ArrowRight')
    act(() => screen.getByText('Grape').focus())

    fireEvent.keyDown(screen.getByText('Grape'), { key: 'Escape' })
    await wait(0)

    expect(screen.queryByText('Grape')).toBeNull()
    expect(screen.queryByText('Apple')).not.toBeNull()
    expect(document.activeElement).toBe(screen.getByText('More'))
  })

  it('stays shut when ArrowRight is typed into an input portalled out of its trigger', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                More
                {ReactDOM.createPortal(<input data-testid="input" />, document.body)}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Grape</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    )

    expect(fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowRight' })).toBe(true)
    expect(screen.queryByText('Grape')).toBeNull()
  })
})

describe('DropdownMenu keyboard tracking', () => {
  it('still moves focus into a submenu opened from the keyboard after another menu unmounts', async () => {
    const other = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Other</DropdownMenuTrigger>
      </DropdownMenu>,
    )
    renderOpenFruitMenu()
    other.unmount()
    act(() => screen.getByText('More').focus())

    await press('ArrowRight')

    expect(document.activeElement).toBe(screen.getByText('Grape'))
  })

  it('leaves focus on the trigger of a submenu the mouse opens after the keyboard was used', async () => {
    renderOpenFruitMenu()
    act(() => screen.getByText('Apple').focus())
    await press('ArrowDown')

    fireEvent.pointerMove(screen.getByText('More'), { pointerType: 'mouse' })
    await wait(150)

    expect(document.activeElement).toBe(screen.getByText('More'))
    expect(screen.queryByText('Grape')).not.toBeNull()
  })

  it('starts a menu mounted after every other one unmounted from the pointer, whatever was typed before', async () => {
    const first = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Other</DropdownMenuTrigger>
      </DropdownMenu>,
    )
    fireEvent.keyDown(document.body, { key: 'a' })
    first.unmount()
    renderOpenFruitMenu()

    fireEvent.pointerMove(screen.getByText('More'), { pointerType: 'mouse' })
    await wait(150)

    expect(document.activeElement).toBe(screen.getByText('More'))
    expect(screen.queryByText('Grape')).not.toBeNull()
  })
})

describe('DropdownMenu content style', () => {
  it("names the popper's measurements under the dropdown menu's own variables, beside the style it was given", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="content" style={{ color: 'teal' }}>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent data-testid="sub-content" style={{ color: 'plum' }}>
              <DropdownMenuItem>Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    fireEvent.keyDown(screen.getByText('More'), { key: 'ArrowRight' })
    await wait(0)

    const read = (testId: string) => {
      const { style } = screen.getByTestId(testId)
      return [
        style.color,
        ...[
          '--gentleduck-dropdown-menu-content-transform-origin',
          '--gentleduck-dropdown-menu-content-available-width',
          '--gentleduck-dropdown-menu-content-available-height',
          '--gentleduck-dropdown-menu-trigger-width',
          '--gentleduck-dropdown-menu-trigger-height',
        ].map((name) => style.getPropertyValue(name)),
      ]
    }
    const variables = [
      'var(--gentleduck-popper-transform-origin)',
      'var(--gentleduck-popper-available-width)',
      'var(--gentleduck-popper-available-height)',
      'var(--gentleduck-popper-anchor-width)',
      'var(--gentleduck-popper-anchor-height)',
    ]
    expect(read('content')).toEqual(['teal', ...variables])
    expect(read('sub-content')).toEqual(['plum', ...variables])
  })
})

describe('DropdownMenu pointer grace area', () => {
  async function leaveTriggerTowardOpenSubMenu() {
    renderOpenFruitMenu()
    const more = screen.getByText('More')
    fireEvent.pointerMove(more, { pointerType: 'mouse' })
    await wait(150)
    screen.getByTestId('sub-content').getBoundingClientRect = () => new DOMRect(200, 0, 100, 100)

    fireEvent.pointerLeave(more, { pointerType: 'mouse', clientX: 100, clientY: 50 })
    fireEvent.pointerMove(screen.getByTestId('content'), { pointerType: 'mouse', clientX: 120, clientY: 50 })
  }

  it('keeps an item the mouse crosses on the way to the sub menu from taking focus', async () => {
    await leaveTriggerTowardOpenSubMenu()

    fireEvent.pointerMove(screen.getByText('Cherry'), { pointerType: 'mouse', clientX: 150, clientY: 50 })

    expect(document.activeElement).not.toBe(screen.getByText('Cherry'))
  })

  it('lets an item outside the path to the sub menu take focus', async () => {
    await leaveTriggerTowardOpenSubMenu()

    fireEvent.pointerMove(screen.getByText('Cherry'), { pointerType: 'mouse', clientX: 150, clientY: 150 })

    expect(document.activeElement).toBe(screen.getByText('Cherry'))
  })

  it('drops the grace area after 300ms', async () => {
    await leaveTriggerTowardOpenSubMenu()
    await wait(350)

    fireEvent.pointerMove(screen.getByText('Cherry'), { pointerType: 'mouse', clientX: 150, clientY: 50 })

    expect(document.activeElement).toBe(screen.getByText('Cherry'))
  })
})

describe('DropdownMenu opened by the pointer after typing', () => {
  it('focuses the menu rather than its first item', async () => {
    const { trigger } = renderDropdownBesideButton()
    fireEvent.keyDown(document.body, { key: 'Shift' })

    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByRole('menu'))
  })
})

describe('DropdownMenu closeOnSelect', () => {
  it('keeps the menu open after an item with closeOnSelect={false} is selected', () => {
    const onSelect = vi.fn()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem closeOnSelect={false} onSelect={onSelect}>
              Stay
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    )

    fireEvent.click(screen.getByText('Stay'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Stay')).not.toBeNull()
  })

  it('keeps the menu open while a checkbox item with closeOnSelect={false} toggles', () => {
    const onCheckedChange = vi.fn()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem closeOnSelect={false} checked={false} onCheckedChange={onCheckedChange}>
              Bold
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    )

    fireEvent.click(screen.getByText('Bold'))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(screen.queryByText('Bold')).not.toBeNull()
  })
})

describe('DropdownMenu radio item outside a radio group', () => {
  it('selects and closes with no group to report to', () => {
    const onSelect = vi.fn()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioItem value="loose" onSelect={onSelect}>
            Loose
          </DropdownMenuRadioItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    fireEvent.click(screen.getByText('Loose'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Loose')).toBeNull()
  })
})

describe('DropdownMenu giving the page back on close', () => {
  it('removes the content before it gives the page back its pointer events', () => {
    renderDropdown({ defaultOpen: true })

    const changes = pageChangesOnClose(screen.getByRole('menu'), () =>
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' }),
    )

    expect(changes[0]).toBe('content removed')
    expect(changes).toContain('body style')
  })
})

function Plain({ children }: { children?: React.ReactNode }) {
  return <div>{children}</div>
}

describe('DropdownMenu checkbox item, indeterminate', () => {
  it('reads as mixed and checks on select', () => {
    const onCheckedChange = vi.fn()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked="indeterminate" onCheckedChange={onCheckedChange}>
            All
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const item = screen.getByRole('menuitemcheckbox')
    const state = [item.getAttribute('aria-checked'), item.getAttribute('data-state')]

    fireEvent.click(item)

    expect([state, onCheckedChange.mock.calls]).toEqual([['mixed', 'indeterminate'], [[true]]])
  })
})

describe('DropdownMenu content keyboard, from the menu itself', () => {
  it('moves focus to the first item on ArrowDown when the menu opened without the keyboard', async () => {
    renderOpenFruitMenu()

    await press('ArrowDown')

    expect(document.activeElement?.textContent).toBe('Apple')
  })

  it('leaves a key that moves to no item to the browser', () => {
    renderOpenFruitMenu()

    expect(fireEvent.keyDown(screen.getByTestId('content'), { key: 'ArrowRight' })).toBe(true)
  })

  it('keeps Tab from leaving a menu that does not trap focus', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger>Fruit</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Apple</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    expect(fireEvent.keyDown(screen.getByText('Apple'), { key: 'Tab' })).toBe(false)
  })
})

describe('DropdownMenu items whose child never takes the ref', () => {
  function renderPlainItems() {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Fruit</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="content">
          <DropdownMenuItem>Apple</DropdownMenuItem>
          <DropdownMenuItem asChild textValue="Banana">
            <Plain>Banana</Plain>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Plain>Cherry</Plain>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
  }

  it('are passed over by Home and End from the menu', async () => {
    renderPlainItems()
    const content = screen.getByTestId('content')

    await press('Home')
    const afterHome = document.activeElement?.textContent
    act(() => content.focus())
    await press('End')

    expect([afterHome, document.activeElement?.textContent]).toEqual(['Apple', 'Apple'])
  })

  it('are passed over by Shift+G from the menu', async () => {
    renderPlainItems()

    await press('G', { shiftKey: true })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Apple')
  })

  it('leave focus where it is when a typed letter matches one', async () => {
    renderPlainItems()
    act(() => screen.getByText('Apple').focus())

    await press('b')
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Apple')
  })
})

describe('DropdownMenu space typed as part of a search', () => {
  it('does not select the item it lands on', async () => {
    const onSelect = vi.fn((_fruit: string) => {})
    renderOpenFruitMenu({ onSelect })
    act(() => screen.getByText('Apple').focus())

    await press('c')
    await press(' ')

    expect([document.activeElement?.textContent, onSelect.mock.calls]).toEqual(['Cherry', []])
  })

  it('does not open the sub menu whose trigger it lands on', async () => {
    renderOpenFruitMenu()
    act(() => screen.getByText('Apple').focus())

    await press('m')
    await press(' ')

    expect([document.activeElement?.textContent, screen.queryByText('Grape')]).toEqual(['More', null])
  })
})

describe('DropdownMenu touch', () => {
  it('leaves focus alone when a touch moves over an item', () => {
    renderOpenFruitMenu()
    act(() => screen.getByText('Apple').focus())

    fireEvent.pointerMove(screen.getByText('Cherry'), { pointerType: 'touch' })

    expect(document.activeElement?.textContent).toBe('Apple')
  })
})

describe('DropdownMenu disabled sub menu trigger', () => {
  function renderDisabledSub() {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Fruit</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Grape</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    return screen.getByText('More')
  }

  it('stays shut when clicked', async () => {
    fireEvent.click(renderDisabledSub())
    await wait(0)

    expect(screen.queryByText('Grape')).toBeNull()
  })

  it('stays shut when the mouse rests on it', async () => {
    fireEvent.pointerMove(renderDisabledSub(), { pointerType: 'mouse' })
    await wait(150)

    expect(screen.queryByText('Grape')).toBeNull()
  })
})

describe('DropdownMenu open sub menu', () => {
  it('stays open on a key inside it that is not its close key', async () => {
    renderOpenFruitMenu()
    act(() => screen.getByText('More').focus())
    await press('ArrowRight')

    fireEvent.keyDown(screen.getByTestId('sub-content'), { key: 'ArrowDown' })
    await wait(0)

    expect(screen.queryByText('Grape')).not.toBeNull()
  })
})

describe('DropdownMenu pointer grace area, crossing other items', () => {
  it('keeps the path when the mouse crosses another sub menu trigger on the way', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Fruit</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="content">
          <DropdownMenuItem>Cherry</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent data-testid="sub-content">
              <DropdownMenuItem>Grape</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Other</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Kiwi</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const more = screen.getByText('More')
    const other = screen.getByText('Other')
    fireEvent.pointerMove(more, { pointerType: 'mouse' })
    await wait(150)
    screen.getByTestId('sub-content').getBoundingClientRect = () => new DOMRect(200, 0, 100, 100)
    fireEvent.pointerLeave(more, { pointerType: 'mouse', clientX: 100, clientY: 50 })
    fireEvent.pointerMove(screen.getByTestId('content'), { pointerType: 'mouse', clientX: 120, clientY: 50 })

    fireEvent.pointerMove(other, { pointerType: 'mouse', clientX: 130, clientY: 50 })
    fireEvent.pointerLeave(other, { pointerType: 'mouse', clientX: 140, clientY: 50 })
    fireEvent.pointerMove(screen.getByText('Cherry'), { pointerType: 'mouse', clientX: 150, clientY: 50 })
    await wait(150)

    expect([document.activeElement?.textContent, screen.queryByText('Kiwi')]).toEqual(['More', null])
  })

  it('keeps the path to a sub menu opened to the left, in a right-to-left menu', async () => {
    render(
      <DropdownMenu defaultOpen dir="rtl">
        <DropdownMenuTrigger>Fruit</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="content">
          <DropdownMenuItem>Cherry</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent data-testid="sub-content">
              <DropdownMenuItem>Grape</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const more = screen.getByText('More')
    const cherry = screen.getByText('Cherry')
    fireEvent.pointerMove(more, { pointerType: 'mouse', clientX: 220, clientY: 50 })
    await wait(150)
    screen.getByTestId('sub-content').getBoundingClientRect = () => new DOMRect(0, 0, 100, 100)

    fireEvent.pointerLeave(more, { pointerType: 'mouse', clientX: 200, clientY: 50 })
    fireEvent.pointerMove(screen.getByTestId('content'), { pointerType: 'mouse', clientX: 210, clientY: 50 })
    fireEvent.pointerMove(cherry, { pointerType: 'mouse', clientX: 202, clientY: 50 })
    fireEvent.pointerLeave(cherry, { pointerType: 'mouse', clientX: 201, clientY: 50 })

    expect([screen.getByTestId('sub-content').getAttribute('data-side'), document.activeElement?.textContent]).toEqual([
      'left',
      'More',
    ])
  })
})

describe('DropdownMenu typeahead text', () => {
  it('searches an item by its textValue rather than what it shows', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Fruit</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Apple</DropdownMenuItem>
          <DropdownMenuItem textValue="Zest">Lemon</DropdownMenuItem>
          <DropdownMenuItem>Zucchini</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    act(() => screen.getByText('Apple').focus())

    await press('z')
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Lemon')
  })

  it('finds an item by the label it shows now, not the one it mounted with', async () => {
    function LateLabel() {
      const [label, setLabel] = React.useState('Banana')
      React.useEffect(() => setLabel('Cherry'), [])
      return <DropdownMenuItem>{label}</DropdownMenuItem>
    }
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Fruit</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Apple</DropdownMenuItem>
          <LateLabel />
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    act(() => screen.getByText('Apple').focus())

    await press('c')
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Cherry')
  })
})
