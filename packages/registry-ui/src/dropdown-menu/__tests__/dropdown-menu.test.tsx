import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { hydrateOnMac } from '../../_internal/__tests__/hydrate-on-mac'
import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../dropdown-menu'
import {
  MotionDropdownMenu,
  MotionDropdownMenuContent,
  MotionDropdownMenuSub,
  MotionDropdownMenuSubContent,
} from '../motion-dropdown-menu'

afterEach(cleanup)

const CONTENTS = [
  ['DropdownMenu', DropdownMenu, DropdownMenuContent],
  ['MotionDropdownMenu', MotionDropdownMenu, MotionDropdownMenuContent],
] as const

describe('registry-ui DropdownMenu content', () => {
  test.each(CONTENTS)(
    '%s defines the colour its arrow outlines in, which a className can change',
    (_, Root, Content) => {
      render(
        <Root defaultOpen>
          <Content className="[--dropdown-menu-border-color:teal]">Ducks only</Content>
        </Root>,
      )

      const content = screen.getByRole('menu')
      const classes = content.className.split(' ')
      expect(classes).toContain('border-(--dropdown-menu-border-color)')
      expect(classes).toContain('[--dropdown-menu-border-color:teal]')
      expect(classes).not.toContain('[--dropdown-menu-border-color:var(--border)]')
      expect(content.style.getPropertyValue('--dropdown-menu-border-color')).toBe('')
    },
  )

  test.each(CONTENTS)(
    '%s falls back to the border colour for its arrow, and scrolls inside itself so the arrow is never clipped',
    (_, Root, Content) => {
      render(
        <Root defaultOpen>
          <Content>Ducks only</Content>
        </Root>,
      )

      const content = screen.getByRole('menu')
      const classes = content.className.split(' ')
      expect(classes).toContain('[--dropdown-menu-border-color:var(--border)]')
      expect(classes).toContain('bg-popover')
      expect(classes.filter((name) => name.startsWith('overflow-'))).toEqual([])
      const scroller = screen.getByText('Ducks only')
      expect(scroller.parentElement).toBe(content)
      expect(scroller.className.split(' ')).toContain('overflow-y-auto')
    },
  )

  test.each(CONTENTS)('%s scrolls its items inside whatever height the content is held to', (_, Root, Content) => {
    render(
      <Root defaultOpen>
        <Content className="max-h-40">Ducks only</Content>
      </Root>,
    )

    const content = screen.getByRole('menu').className.split(' ')
    const scroller = screen.getByText('Ducks only').className.split(' ')
    expect([content.includes('flex-col'), content.includes('max-h-40'), scroller.includes('min-h-0')]).toEqual([
      true,
      true,
      true,
    ])
    expect(scroller.filter((name) => name.startsWith('max-h-'))).toEqual([])
  })

  test('keeps an element given through asChild as the menu itself', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuContent asChild>
          <section>
            <DropdownMenuItem>Apple</DropdownMenuItem>
          </section>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    expect(screen.getByRole('menu').tagName).toBe('SECTION')
  })
})

const SUBMENUS = [
  ['DropdownMenu', DropdownMenu, DropdownMenuContent, DropdownMenuSub, DropdownMenuSubContent],
  [
    'MotionDropdownMenu',
    MotionDropdownMenu,
    MotionDropdownMenuContent,
    MotionDropdownMenuSub,
    MotionDropdownMenuSubContent,
  ],
] as const

describe('registry-ui DropdownMenu sub content', () => {
  test.each(SUBMENUS)('%s scrolls a submenu taller than the viewport', async (_, Root, Content, Sub, SubContent) => {
    render(
      <Root defaultOpen>
        <Content>
          <Sub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <SubContent data-testid="sub-content">
              <DropdownMenuItem>Grape</DropdownMenuItem>
            </SubContent>
          </Sub>
        </Content>
      </Root>,
    )
    fireEvent.keyDown(screen.getByText('More'), { key: 'ArrowRight' })
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))

    const classes = screen.getByTestId('sub-content').className.split(' ')
    expect(classes).toContain('max-h-(--gentleduck-dropdown-menu-content-available-height)')
    expect(classes.filter((name) => name.startsWith('overflow-'))).toEqual(['overflow-y-auto', 'overflow-x-hidden'])
  })
})

const frame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)))

function View({ onShow, onSort }: { onShow: (show: boolean) => void; onSort: (sort: string) => void }) {
  const [show, setShow] = React.useState(true)
  const [sort, setSort] = React.useState('name')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>View</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel inset>Columns</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={show}
          onCheckedChange={(next) => {
            setShow(next === true)
            onShow(next === true)
          }}>
          Status
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator data-testid="separator" />
        <DropdownMenuRadioGroup
          onValueChange={(next) => {
            setSort(next)
            onSort(next)
          }}
          value={sort}>
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuItem inset variant="destructive">
          Delete view
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger inset>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Link</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuArrow className="drop-shadow" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const open = async () => {
  fireEvent.pointerDown(screen.getByRole('button', { name: 'View' }), { button: 0, ctrlKey: false })
  await frame()
}

describe('registry-ui DropdownMenu items', () => {
  // jsdom has no ResizeObserver, which the arrow measures itself with.
  beforeAll(() => {
    Object.assign(globalThis, {
      ResizeObserver: class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    })
  })
  afterAll(() => {
    Reflect.deleteProperty(globalThis, 'ResizeObserver')
  })

  test('marks the checked item and radio, insets a label and an item, and reports each choice', async () => {
    const onShow = vi.fn()
    const onSort = vi.fn()
    render(<View onShow={onShow} onSort={onSort} />)
    await open()

    const status = screen.getByRole('menuitemcheckbox', { name: 'Status' })
    expect(status.getAttribute('aria-checked')).toBe('true')
    expect(status.querySelectorAll('svg').length).toBe(1)
    expect(screen.getByRole('menuitemradio', { name: 'Name' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('menuitemradio', { name: 'Date' }).querySelectorAll('svg').length).toBe(0)
    expect(screen.getByText('Columns').className.split(' ')).toContain('ps-8')
    expect(screen.getByTestId('separator').className.split(' ')).toContain('bg-muted')
    const remove = screen.getByRole('menuitem', { name: 'Delete view' }).className.split(' ')
    expect(remove).toContain('ps-8')
    expect(remove).toContain('text-destructive')
    expect(screen.getByRole('menuitem', { name: 'Share' }).className.split(' ')).toContain('ps-8')

    fireEvent.click(status)
    expect(onShow.mock.calls).toEqual([[false]])

    await open()
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Date' }))
    expect(onSort.mock.calls).toEqual([['date']])
  })

  test('draws its arrow as an outlined curve over the fill, with the class it is handed', async () => {
    render(<View onShow={() => {}} onSort={() => {}} />)
    await open()

    const arrow = screen.getByRole('menu').querySelector('svg[overflow="visible"]')
    expect(arrow?.getAttribute('class')).toContain('drop-shadow')
    expect(Array.from(arrow?.querySelectorAll('path') ?? [], (path) => path.getAttribute('fill'))).toEqual([
      'var(--popover)',
      'none',
    ])
  })
})

describe('registry-ui DropdownMenuShortcut', () => {
  test('spells its keys out when it has no label, and runs onKeysPressed on them while mounted', () => {
    const onKeysPressed = vi.fn()
    const { unmount } = render(<DropdownMenuShortcut keys="ctrl+shift+e" onKeysPressed={onKeysPressed} />)

    const shortcut = document.querySelector('[data-slot="dropdown-menu-shortcut"]')
    expect(shortcut?.textContent).not.toBe('')
    fireEvent.keyDown(document, { ctrlKey: true, key: 'E', shiftKey: true })
    expect(onKeysPressed).toHaveBeenCalledTimes(1)

    unmount()
    fireEvent.keyDown(document, { ctrlKey: true, key: 'E', shiftKey: true })
    expect(onKeysPressed).toHaveBeenCalledTimes(1)
  })

  test('shows its label over the keys, and draws nothing for no keys and no label', () => {
    render(
      <>
        <DropdownMenuShortcut keys="ctrl+e">Export</DropdownMenuShortcut>
        <DropdownMenuShortcut />
      </>,
    )

    expect(
      Array.from(document.querySelectorAll('[data-slot="dropdown-menu-shortcut"]'), (node) => node.textContent),
    ).toEqual(['Export', ''])
  })

  test("hydrates the keys a server drew, then shows the browser's own", async () => {
    const { container, errors, html, unmount } = await hydrateOnMac(<DropdownMenuShortcut keys="mod+shift+e" />)

    expect(html).toContain('>Ctrl+Shift+E</span>')
    expect(errors).toEqual([])
    expect(container.querySelector('[data-slot="dropdown-menu-shortcut"]')?.textContent).toBe('Cmd+Shift+E')
    unmount()
  })
})

describe('registry-ui MotionDropdownMenu closing', () => {
  beforeAll(() => {
    Object.assign(globalThis, {
      ResizeObserver: class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    })
  })
  afterAll(() => {
    Reflect.deleteProperty(globalThis, 'ResizeObserver')
  })

  test('draws nothing closed, and holds a menu and a submenu in the page, taking no presses, until each exit ends', async () => {
    const view = (open: boolean) => (
      <MotionDropdownMenu open={open}>
        <MotionDropdownMenuContent>
          <MotionDropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <MotionDropdownMenuSubContent data-testid="sub">
              <DropdownMenuItem>Grape</DropdownMenuItem>
            </MotionDropdownMenuSubContent>
          </MotionDropdownMenuSub>
        </MotionDropdownMenuContent>
      </MotionDropdownMenu>
    )
    const { rerender } = render(view(false))
    expect(screen.queryByRole('menu')).toBeNull()

    rerender(view(true))
    fireEvent.keyDown(screen.getByText('More'), { key: 'ArrowRight' })
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    const sub = screen.getByTestId('sub')
    fireEvent.keyDown(screen.getByText('Grape'), { key: 'ArrowLeft' })
    await waitFor(() => expect(sub.style.pointerEvents).toBe('none'))

    rerender(view(false))
    const menu = screen.getAllByRole('menu', { hidden: true })[0] as HTMLElement
    await waitFor(() => expect(menu.style.pointerEvents).toBe('none'))
    await waitFor(() => expect(screen.queryByText('More')).toBeNull(), { timeout: 3000 })
  })
})
