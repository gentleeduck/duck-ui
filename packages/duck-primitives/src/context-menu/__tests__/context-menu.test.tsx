import { afterEach, beforeEach, describe, expect, it, mock, spyOn, vi } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { freshDom, wait } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import {
  ContextMenu,
  ContextMenuArrow,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIndicator,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  createContextMenuScope,
} from '../index'

freshDom()

function renderContextMenu(props: Record<string, unknown> = {}) {
  return render(
    <ContextMenu {...props}>
      <ContextMenuTrigger>Right click me</ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent>
          <ContextMenuItem>Edit</ContextMenuItem>
          <ContextMenuItem>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenu>,
  )
}

describe('ContextMenu', () => {
  it('renders trigger with data-slot="context-menu-trigger"', () => {
    const { container } = renderContextMenu()
    expect(container.querySelector('[data-slot="context-menu-trigger"]')).not.toBeNull()
  })

  it('trigger renders as a span', () => {
    const { container } = renderContextMenu()
    expect(container.querySelector('span[data-slot="context-menu-trigger"]')).not.toBeNull()
  })

  it('trigger starts with data-state="closed"', () => {
    const { container } = renderContextMenu()
    expect(container.querySelector('[data-slot="context-menu-trigger"]')?.getAttribute('data-state')).toBe('closed')
  })

  it('opens on right-click (contextmenu event)', () => {
    const handler = mock(() => {})
    const { container } = renderContextMenu({ onOpenChange: handler })
    fireEvent.contextMenu(container.querySelector('[data-slot="context-menu-trigger"]')!)
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('disabled trigger does not open on right-click', () => {
    const handler = mock(() => {})
    const { container } = render(
      <ContextMenu onOpenChange={handler}>
        <ContextMenuTrigger disabled>Right click me</ContextMenuTrigger>
      </ContextMenu>,
    )
    fireEvent.contextMenu(container.querySelector('[data-slot="context-menu-trigger"]')!)
    expect(handler).not.toHaveBeenCalled()
  })

  it('disabled trigger has data-disabled', () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger disabled>Right click me</ContextMenuTrigger>
      </ContextMenu>,
    )
    expect(container.querySelector('[data-slot="context-menu-trigger"]')?.getAttribute('data-disabled')).toBe('')
  })

  it('forwards ref to trigger', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(
      <ContextMenu>
        <ContextMenuTrigger ref={ref}>Right click me</ContextMenuTrigger>
      </ContextMenu>,
    )
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('trigger changes data-state to open when right-clicked', () => {
    const { container } = renderContextMenu()
    const trigger = container.querySelector('[data-slot="context-menu-trigger"]')!
    fireEvent.contextMenu(trigger)
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('passes className to trigger', () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger className="ctx-trigger">Right click</ContextMenuTrigger>
      </ContextMenu>,
    )
    expect(container.querySelector('.ctx-trigger')).not.toBeNull()
  })

  it('puts a dir passed to the root on the menu and leaves the trigger to the page', () => {
    const { container, getByText } = renderContextMenu({ dir: 'rtl' })
    const trigger = container.querySelector('[data-slot="context-menu-trigger"]')!

    fireEvent.contextMenu(trigger)

    expect(trigger.hasAttribute('dir')).toBe(false)
    expect(getByText('Edit').closest('[role="menu"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('trigger renders children as text', () => {
    const { container } = renderContextMenu()
    expect(container.querySelector('[data-slot="context-menu-trigger"]')?.textContent).toBe('Right click me')
  })
})

describe('ContextMenu trigger props', () => {
  it('lets the props on a trigger win over its own attributes', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-slot="canvas">Right click me</ContextMenuTrigger>
      </ContextMenu>,
    )

    expect(screen.getByText('Right click me').dataset.slot).toBe('canvas')
  })

  it('turns off the touch callout, beside the style it was given', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger style={{ color: 'teal' }}>Right click me</ContextMenuTrigger>
      </ContextMenu>,
    )
    const { style } = screen.getByText('Right click me')

    expect([style.color, Reflect.get(style, 'WebkitTouchCallout')]).toEqual(['teal', 'none'])
  })

  it.each([{ disabled: false }, { disabled: true }])("runs the trigger's own handlers, %o", ({ disabled }) => {
    const handlers = {
      onPointerDown: mock(),
      onPointerMove: mock(),
      onPointerCancel: mock(),
      onPointerUp: mock(),
      onContextMenu: mock(),
    }
    render(
      <ContextMenu>
        <ContextMenuTrigger disabled={disabled} {...handlers}>
          Right click me
        </ContextMenuTrigger>
      </ContextMenu>,
    )
    const trigger = screen.getByText('Right click me')

    fireEvent.pointerDown(trigger, { pointerType: 'touch' })
    fireEvent.pointerMove(trigger, { pointerType: 'touch' })
    fireEvent.pointerCancel(trigger, { pointerType: 'touch' })
    fireEvent.pointerUp(trigger, { pointerType: 'touch' })
    fireEvent.contextMenu(trigger)

    expect(Object.values(handlers).map((handler) => handler.mock.calls.length)).toEqual([1, 1, 1, 1, 1])
  })
})

describe('ContextMenu scope', () => {
  it('hands its parts the scope it is given', async () => {
    const useScope = createContextMenuScope()
    function Scoped() {
      const scope = useScope(undefined)
      return (
        <ContextMenu {...scope}>
          <ContextMenuTrigger {...scope}>Right click me</ContextMenuTrigger>
          <ContextMenuContent {...scope}>
            <ContextMenuItem {...scope}>Edit</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )
    }
    render(<Scoped />)

    fireEvent.contextMenu(screen.getByText('Right click me'))
    await wait(0)

    expect(screen.getByText('Right click me').dataset.state).toBe('open')
  })
})

describe('ContextMenu right-click while open', () => {
  async function openMenu() {
    const utils = renderContextMenu({ modal: false })
    const trigger = utils.container.querySelector('[data-slot="context-menu-trigger"]')!
    fireEvent.contextMenu(trigger)
    await wait(0)
    return { ...utils, trigger }
  }

  it('closes the menu rather than reopening it', async () => {
    const { trigger, queryByRole } = await openMenu()

    fireEvent.pointerDown(trigger, { button: 2, pointerType: 'mouse' })
    fireEvent.contextMenu(trigger)
    await wait(0)

    expect(queryByRole('menu')).toBeNull()
  })

  it('closes the menu on a control-click, which also fires contextmenu', async () => {
    const { trigger, queryByRole } = await openMenu()

    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: true, pointerType: 'mouse' })
    fireEvent.contextMenu(trigger)
    await wait(0)

    expect(queryByRole('menu')).toBeNull()
  })

  it('closes a modal menu too, whose press lands on the page because the page takes no pointer events', async () => {
    const { container, queryByRole } = renderContextMenu()
    const trigger = container.querySelector('[data-slot="context-menu-trigger"]')!
    fireEvent.contextMenu(trigger)
    await wait(0)

    fireEvent.pointerDown(document.documentElement, { button: 2, pointerType: 'mouse' })
    fireEvent.contextMenu(trigger)
    await wait(0)

    expect(queryByRole('menu')).toBeNull()
  })

  it('opens from the keyboard after a right click elsewhere closed it', async () => {
    const { trigger, queryByRole } = await openMenu()

    fireEvent.pointerDown(document.body, { button: 2, pointerType: 'mouse' })
    fireEvent.contextMenu(document.body)
    await wait(0)
    expect(queryByRole('menu')).toBeNull()
    fireEvent.contextMenu(trigger)

    expect(queryByRole('menu')).not.toBeNull()
  })

  it('reopens the menu on a right-click after a left click closed it', async () => {
    const { trigger, queryByRole } = await openMenu()

    fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' })
    await wait(0)
    expect(queryByRole('menu')).toBeNull()
    fireEvent.contextMenu(trigger)

    expect(queryByRole('menu')).not.toBeNull()
  })
})

describe('ContextMenu right-click mark', () => {
  function renderStopping(contentProps: React.ComponentProps<typeof ContextMenuContent> = {}) {
    render(
      <ContextMenu modal={false}>
        <ContextMenuTrigger onContextMenu={(event) => event.stopPropagation()}>Right click me</ContextMenuTrigger>
        <ContextMenuContent {...contentProps}>
          <ContextMenuItem>Edit</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    return screen.getByText('Right click me')
  }

  it('opens on the next right click after one closed it, when the trigger stops the contextmenu going further', async () => {
    const trigger = renderStopping()
    fireEvent.contextMenu(trigger)
    await wait(0)
    fireEvent.pointerDown(trigger, { button: 2, pointerType: 'mouse' })
    fireEvent.contextMenu(trigger)
    await wait(0)
    const afterClosing = screen.queryByRole('menu')

    fireEvent.contextMenu(trigger)

    expect([afterClosing, screen.queryByRole('menu')?.getAttribute('role')]).toEqual([null, 'menu'])
  })

  it('moves to a right click on its trigger that onPointerDownOutside kept from closing it', async () => {
    const trigger = renderStopping({
      avoidCollisions: false,
      updatePositionStrategy: 'always',
      onPointerDownOutside: (event) => event.preventDefault(),
    })
    fireEvent.contextMenu(trigger, { clientX: 10, clientY: 10 })
    await wait(20)

    fireEvent.pointerDown(trigger, { button: 2, pointerType: 'mouse' })
    fireEvent.contextMenu(trigger, { clientX: 200, clientY: 120 })
    await wait(50)

    expect(document.querySelector<HTMLElement>('[data-slot="popper-content-wrapper"]')?.style.transform).toBe(
      'translate(202px, 120px)',
    )
  })

  it('clears the mark when a right click elsewhere lands on the root element, as it does under a modal menu', async () => {
    const trigger = renderStopping()
    fireEvent.contextMenu(trigger)
    await wait(0)

    fireEvent.pointerDown(document.documentElement, { button: 2, pointerType: 'mouse' })
    fireEvent.contextMenu(document.documentElement)
    await wait(0)
    fireEvent.contextMenu(trigger)

    expect(screen.queryByRole('menu')).not.toBeNull()
  })

  it('leaves no listener behind once the contextmenu after a right click lands', async () => {
    const heard = mock()
    const add = window.addEventListener.bind(window)
    const spy = spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
      if (type !== 'contextmenu' || typeof listener !== 'function') return add(type, listener, options)
      add(type, (event) => (heard(), listener(event)), options)
    })
    const trigger = renderStopping()
    fireEvent.contextMenu(trigger)
    await wait(0)
    fireEvent.pointerDown(document.body, { button: 2, pointerType: 'mouse' })
    fireEvent.contextMenu(document.body)

    fireEvent.contextMenu(document.body)
    spy.mockRestore()

    expect(heard).toHaveBeenCalledTimes(1)
  })

  it("hands a press outside to the content's own onPointerDownOutside", async () => {
    const onPointerDownOutside = mock()
    const trigger = renderStopping({ onPointerDownOutside })
    fireEvent.contextMenu(trigger)
    await wait(0)

    fireEvent.pointerDown(document.body, { button: 2, pointerType: 'mouse' })

    expect(onPointerDownOutside).toHaveBeenCalledTimes(1)
  })
})

describe('ContextMenu long press', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  function holdTrigger(finish: (trigger: HTMLElement) => void) {
    renderContextMenu()
    const trigger = screen.getByText('Right click me')
    fireEvent.pointerDown(trigger, { clientX: 100, clientY: 100, pointerType: 'touch' })
    finish(trigger)
    act(() => {
      vi.advanceTimersByTime(700)
    })
    return screen.queryByRole('menu')
  }

  const driftTo = (clientX: number, clientY: number) => (trigger: HTMLElement) =>
    fireEvent.pointerMove(trigger, { clientX, clientY, pointerType: 'touch' })

  it('opens when the finger drifts 10px while it holds', () => {
    expect(holdTrigger(driftTo(106, 108))).not.toBeNull()
  })

  it('cancels once the finger moves further than 10px', () => {
    expect(holdTrigger(driftTo(100, 111))).toBeNull()
    cleanup()
    expect(holdTrigger(driftTo(89, 100))).toBeNull()
  })

  it('keeps a held finger when a mouse moves away or lifts over the trigger', () => {
    expect(
      holdTrigger((trigger) => {
        fireEvent.pointerMove(trigger, { clientX: 300, clientY: 300, pointerType: 'mouse' })
        fireEvent.pointerUp(trigger, { pointerType: 'mouse' })
        fireEvent.pointerCancel(trigger, { pointerType: 'mouse' })
      }),
    ).not.toBeNull()
  })

  it('closes the open menu when a finger presses the trigger again, and opens it once that finger holds', () => {
    holdTrigger(() => {})
    const trigger = screen.getByText('Right click me')

    fireEvent.pointerDown(trigger, { clientX: 50, clientY: 50, pointerType: 'touch' })
    const afterPress = screen.queryByRole('menu')
    act(() => {
      vi.advanceTimersByTime(700)
    })

    expect([afterPress, trigger.getAttribute('data-state')]).toEqual([null, 'open'])
  })

  it('cancels when the finger lifts or the browser takes the gesture', () => {
    expect(holdTrigger((trigger) => fireEvent.pointerUp(trigger, { pointerType: 'touch' }))).toBeNull()
    cleanup()
    expect(holdTrigger((trigger) => fireEvent.pointerCancel(trigger, { pointerType: 'touch' }))).toBeNull()
  })

  const pass = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

  it('waits the whole 700ms before it opens', () => {
    renderContextMenu()
    fireEvent.pointerDown(screen.getByText('Right click me'), { pointerType: 'touch' })

    pass(699)
    const early = screen.queryByRole('menu')
    pass(1)

    expect([early, screen.queryByRole('menu')?.getAttribute('role')]).toEqual([null, 'menu'])
  })

  it('counts from the last press when a finger presses again', () => {
    renderContextMenu()
    const trigger = screen.getByText('Right click me')
    fireEvent.pointerDown(trigger, { pointerType: 'touch' })
    pass(400)

    fireEvent.pointerDown(trigger, { pointerType: 'touch' })
    pass(300)
    const atFirstDeadline = screen.queryByRole('menu')
    pass(400)

    expect([atFirstDeadline, trigger.dataset.state]).toEqual([null, 'open'])
  })

  it('drops a held press once the browser opens the menu, so closing it then sticks', () => {
    renderContextMenu()
    const trigger = screen.getByText('Right click me')
    fireEvent.pointerDown(trigger, { pointerType: 'touch' })
    fireEvent.contextMenu(trigger)
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

    pass(700)

    expect(screen.queryByRole('menu')).toBeNull()
  })

  function renderHeld(trigger: (shown: boolean) => React.ReactNode) {
    const onOpenChange = mock()
    const page = (changed: boolean) => (
      <ContextMenu onOpenChange={onOpenChange}>
        {trigger(changed)}
        <ContextMenuContent>
          <ContextMenuItem>Edit</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
    const view = render(page(false))
    fireEvent.pointerDown(screen.getByText('Right click me'), { pointerType: 'touch' })
    view.rerender(page(true))
    pass(700)
    return onOpenChange
  }

  it('drops a held press when its trigger leaves the page', () => {
    const onOpenChange = renderHeld((gone) => !gone && <ContextMenuTrigger>Right click me</ContextMenuTrigger>)

    expect(onOpenChange).not.toHaveBeenCalledWith(true)
  })

  it('drops a held press when its trigger is disabled', () => {
    const onOpenChange = renderHeld((disabled) => (
      <ContextMenuTrigger disabled={disabled}>Right click me</ContextMenuTrigger>
    ))

    expect(onOpenChange).not.toHaveBeenCalledWith(true)
  })
})

describe('ContextMenu open before interaction', () => {
  it('warns once, even when strict mode runs its effects twice', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <React.StrictMode>
        <ContextMenu open>
          <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        </ContextMenu>
      </React.StrictMode>,
    )

    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })
})

describe('ContextMenu direction', () => {
  function openWith(dir: 'ltr' | 'rtl') {
    const utils = render(
      <DirectionProvider dir={dir}>
        <ContextMenu>
          <ContextMenuTrigger>Canvas area</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuItem>Inspect</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      </DirectionProvider>,
    )
    fireEvent.contextMenu(utils.getByText('Canvas area'))
    return utils.getByText('Inspect').closest('[role="menu"]')
  }

  it('opens to the right of the pointer in LTR', () => {
    expect(openWith('ltr')?.getAttribute('data-side')).toBe('right')
  })

  it('opens to the left of the pointer and sets dir in RTL', () => {
    const menu = openWith('rtl')
    expect(menu?.getAttribute('data-side')).toBe('left')
    expect(menu?.getAttribute('dir')).toBe('rtl')
  })
})

async function openContextMenu({
  modal,
  onInteractOutside,
}: Pick<React.ComponentProps<typeof ContextMenu>, 'modal'> &
  Pick<React.ComponentProps<typeof ContextMenuContent>, 'onInteractOutside'> = {}) {
  render(
    <>
      <button type="button">Before</button>
      <ContextMenu modal={modal}>
        <ContextMenuTrigger>Canvas</ContextMenuTrigger>
        <ContextMenuContent onInteractOutside={onInteractOutside}>
          <ContextMenuCheckboxItem checked>
            <ContextMenuItemIndicator data-testid="indicator">on</ContextMenuItemIndicator>
            Grid
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator data-testid="separator" />
          <ContextMenuArrow data-testid="arrow" />
        </ContextMenuContent>
      </ContextMenu>
      <button type="button">Outside</button>
    </>,
  )
  const before = screen.getByText('Before')
  act(() => before.focus())
  fireEvent.contextMenu(screen.getByText('Canvas'))
  await wait(0)
  return { before, outside: screen.getByText('Outside') }
}

const isOpen = () => screen.queryByText('Grid') !== null

describe('ContextMenu parts', () => {
  it('renders its arrow, separator and the indicator of a checked item', async () => {
    await openContextMenu()

    expect(screen.getByTestId('arrow')).toBeTruthy()
    expect(screen.getByTestId('separator').getAttribute('role')).toBe('separator')
    expect(screen.getByTestId('indicator').textContent).toBe('on')
  })
})

describe('ContextMenu focus on close', () => {
  it('returns focus to where it was when a modal menu closes on Escape', async () => {
    const { before } = await openContextMenu()

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
    await wait(0)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(before)
  })

  it('returns focus to where it was when a modal menu closes on a click outside', async () => {
    const { before, outside } = await openContextMenu()

    fireEvent.pointerDown(outside)
    await wait(0)

    expect([isOpen(), document.activeElement]).toEqual([false, before])
  })

  it('returns focus to where it was on Escape after a click outside that was kept from closing it', async () => {
    const { before, outside } = await openContextMenu({
      modal: false,
      onInteractOutside: (event) => event.preventDefault(),
    })

    fireEvent.pointerDown(outside)
    await wait(0)
    const afterClick = isOpen()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    await wait(0)

    expect([afterClick, isOpen(), document.activeElement]).toEqual([true, false, before])
  })

  it('leaves focus where the user clicked when a non-modal menu closes on a click outside', async () => {
    const { before, outside } = await openContextMenu({ modal: false })

    fireEvent.pointerDown(outside)
    await wait(0)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).not.toBe(before)
  })
})

describe('ContextMenu content placement', () => {
  async function openAt(contentProps: Record<string, unknown> = {}) {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent avoidCollisions={false} {...contentProps}>
          <ContextMenuItem>Edit</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Right click me'), { clientX: 100, clientY: 50 })
    await wait(20)
    const menu = screen.getByRole('menu')
    const wrapper = document.querySelector<HTMLElement>('[data-slot="popper-content-wrapper"]')
    return [menu.dataset.side, menu.dataset.align, wrapper?.style.transform]
  }

  it('opens 2px to the right of the pointer, its top at the pointer', async () => {
    expect(await openAt()).toEqual(['right', 'start', 'translate(102px, 50px)'])
  })

  it('keeps that placement when a caller without the types passes its own', async () => {
    expect(await openAt(JSON.parse('{"side":"left","align":"end","sideOffset":40}'))).toEqual([
      'right',
      'start',
      'translate(102px, 50px)',
    ])
  })

  it('opens a menu kept mounted while closed where the right click lands', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent avoidCollisions={false} forceMount>
          <ContextMenuItem>Edit</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    const trigger = screen.getByText('Right click me')
    fireEvent.contextMenu(trigger, { clientX: 100, clientY: 50 })
    await wait(20)
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    await wait(20)

    fireEvent.contextMenu(trigger, { clientX: 200, clientY: 150 })
    await wait(20)

    expect(document.querySelector<HTMLElement>('[data-slot="popper-content-wrapper"]')?.style.transform).toBe(
      'translate(202px, 150px)',
    )
  })
})

describe('ContextMenu close focus', () => {
  it("runs the content's own onCloseAutoFocus", async () => {
    const onCloseAutoFocus = mock()
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent onCloseAutoFocus={onCloseAutoFocus}>
          <ContextMenuItem>Edit</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Right click me'))
    await wait(0)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    await wait(0)

    expect(onCloseAutoFocus).toHaveBeenCalledTimes(1)
  })

  it('kept mounted, gives focus back on unmount when its last opening closed on Escape', async () => {
    const page = (mounted: boolean) => (
      <>
        <button type="button">Before</button>
        <ContextMenu modal={false}>
          <ContextMenuTrigger>Canvas</ContextMenuTrigger>
          {mounted && (
            <ContextMenuContent forceMount>
              <ContextMenuItem>Grid</ContextMenuItem>
            </ContextMenuContent>
          )}
        </ContextMenu>
        <button type="button">Outside</button>
      </>
    )
    const view = render(page(false))
    const before = screen.getByText('Before')
    act(() => before.focus())
    view.rerender(page(true))
    const canvas = screen.getByText('Canvas')
    fireEvent.contextMenu(canvas)
    await wait(0)
    fireEvent.pointerDown(screen.getByText('Outside'))
    await wait(0)
    fireEvent.contextMenu(canvas)
    await wait(0)
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    await wait(0)

    view.rerender(page(false))
    await wait(0)

    expect(document.activeElement).toBe(before)
  })
})

describe('ContextMenu sub menu', () => {
  it('closes only itself on Escape and focuses its trigger when it keeps its parent open', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Edit</ContextMenuItem>
          <ContextMenuSub closeParentOnEsc={false}>
            <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Mail</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Right click me'))
    fireEvent.keyDown(screen.getByText('Share'), { key: 'ArrowRight' })
    await wait(0)

    fireEvent.keyDown(screen.getByText('Mail'), { key: 'Escape' })
    await wait(0)

    expect(screen.queryByText('Mail')).toBeNull()
    expect(screen.queryByText('Edit')).not.toBeNull()
    expect(document.activeElement).toBe(screen.getByText('Share'))
  })
})

describe('ContextMenu sub menu state', () => {
  function renderSub(subProps: React.ComponentProps<typeof ContextMenuSub>) {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub {...subProps}>
            <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Mail</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Right click me'))
  }

  it('marks its sub trigger with data-slot="context-menu-subtrigger"', () => {
    renderSub({})

    expect(screen.getByText('Share').dataset.slot).toBe('context-menu-subtrigger')
  })

  it('opens a sub menu by open', async () => {
    renderSub({ open: true })
    await wait(0)

    expect(screen.queryByText('Mail')).not.toBeNull()
  })

  it('opens a sub menu by defaultOpen when it mounts into a menu already open', async () => {
    const page = (withSub: boolean) => (
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Edit</ContextMenuItem>
          {withSub && (
            <ContextMenuSub defaultOpen>
              <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Mail</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
        </ContextMenuContent>
      </ContextMenu>
    )
    const view = render(page(false))
    fireEvent.contextMenu(screen.getByText('Right click me'))
    await wait(0)

    view.rerender(page(true))
    await wait(0)

    expect(screen.queryByText('Mail')).not.toBeNull()
  })

  it('reports a sub menu opening to onOpenChange', async () => {
    const onOpenChange = mock()
    renderSub({ onOpenChange })

    fireEvent.keyDown(screen.getByText('Share'), { key: 'ArrowRight' })
    await wait(0)

    expect(onOpenChange.mock.calls).toEqual([[true]])
  })
})

describe('ContextMenu content style', () => {
  it("names the popper's measurements under the context menu's own variables, beside the style it was given", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent data-testid="content" style={{ color: 'teal' }}>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent data-testid="sub-content" style={{ color: 'plum' }}>
              <ContextMenuItem>Mail</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Right click me'))
    fireEvent.keyDown(screen.getByText('Share'), { key: 'ArrowRight' })
    await wait(0)

    const read = (testId: string) => {
      const { style } = screen.getByTestId(testId)
      return [
        style.color,
        ...[
          '--gentleduck-context-menu-content-transform-origin',
          '--gentleduck-context-menu-content-available-width',
          '--gentleduck-context-menu-content-available-height',
          '--gentleduck-context-menu-trigger-width',
          '--gentleduck-context-menu-trigger-height',
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

  it('keeps its own measurement variables over ones the style names', () => {
    const style: React.CSSProperties & Record<`--${string}`, string> = {
      '--gentleduck-context-menu-trigger-width': '10px',
    }
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent style={style}>
          <ContextMenuItem>Edit</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Right click me'))

    expect(screen.getByRole('menu').style.getPropertyValue('--gentleduck-context-menu-trigger-width')).toBe(
      'var(--gentleduck-popper-anchor-width)',
    )
  })
})
