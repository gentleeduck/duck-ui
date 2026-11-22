import { useMotionContent } from '@gentleduck/motion/use-motion-root'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { hydrateOnMac } from '../../_internal/__tests__/hydrate-on-mac'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../context-menu'
import {
  MotionContextMenu,
  MotionContextMenuContent,
  MotionContextMenuSub,
  MotionContextMenuSubContent,
} from '../motion-context-menu'

afterEach(cleanup)

function MotionState() {
  const { isOpen, showContent } = useMotionContent()
  return <output>{`${isOpen}:${showContent}`}</output>
}

describe('registry-ui motion context menu', () => {
  test('animates in when a controlled `open` is true', () => {
    const html = renderToStaticMarkup(
      <MotionContextMenu open>
        <ContextMenuTrigger>Canvas</ContextMenuTrigger>
        <MotionState />
      </MotionContextMenu>,
    )

    expect(html).toContain('<output>true:true</output>')
  })

  test('stays closed without one', () => {
    const html = renderToStaticMarkup(
      <MotionContextMenu>
        <ContextMenuTrigger>Canvas</ContextMenuTrigger>
        <MotionState />
      </MotionContextMenu>,
    )

    expect(html).toContain('<output>false:false</output>')
  })
})

const MENUS = [
  ['ContextMenu', ContextMenu, ContextMenuContent, ContextMenuSub, ContextMenuSubContent],
  ['MotionContextMenu', MotionContextMenu, MotionContextMenuContent, MotionContextMenuSub, MotionContextMenuSubContent],
] as const

describe('registry-ui ContextMenu content', () => {
  test.each(MENUS)(
    '%s grows each menu from where the popper placed it and scrolls one taller than the viewport',
    async (_, Root, Content, Sub, SubContent) => {
      render(
        <Root>
          <ContextMenuTrigger>Canvas</ContextMenuTrigger>
          <Content data-testid="content">
            <Sub>
              <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
              <SubContent data-testid="sub-content">
                <ContextMenuItem>Mail</ContextMenuItem>
              </SubContent>
            </Sub>
          </Content>
        </Root>,
      )
      fireEvent.contextMenu(screen.getByText('Canvas'))
      fireEvent.keyDown(screen.getByText('Share'), { key: 'ArrowRight' })
      await act(() => new Promise((resolve) => setTimeout(resolve, 0)))

      for (const testId of ['content', 'sub-content']) {
        const classes = screen.getByTestId(testId).className.split(' ')
        expect(classes).toContain('origin-(--gentleduck-context-menu-content-transform-origin)')
        expect(classes).toContain('max-h-(--gentleduck-context-menu-content-available-height)')
        expect(classes.filter((name) => name.startsWith('overflow-') || name.startsWith('origin-'))).toEqual([
          'origin-(--gentleduck-context-menu-content-transform-origin)',
          'overflow-y-auto',
          'overflow-x-hidden',
        ])
      }
    },
  )
})

describe('registry-ui ContextMenu items', () => {
  function View({ onShow, onZoom }: { onShow: (checked: boolean) => void; onZoom: (value: string) => void }) {
    const [ruler, setRuler] = React.useState(true)
    const [zoom, setZoom] = React.useState('fit')
    return (
      <ContextMenu>
        <ContextMenuTrigger>Canvas</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel inset>View</ContextMenuLabel>
          <ContextMenuCheckboxItem
            checked={ruler}
            onCheckedChange={(checked) => {
              setRuler(checked === true)
              onShow(checked === true)
            }}>
            Ruler
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator data-testid="separator" />
          <ContextMenuRadioGroup
            onValueChange={(value) => {
              setZoom(value)
              onZoom(value)
            }}
            value={zoom}>
            <ContextMenuRadioItem value="fit">Fit</ContextMenuRadioItem>
            <ContextMenuRadioItem value="actual">Actual size</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuItem inset>Reset zoom</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Export</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>PNG</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  test('marks the checked item and the chosen radio, and hands each change to its owner', async () => {
    const onShow = vi.fn()
    const onZoom = vi.fn()
    render(<View onShow={onShow} onZoom={onZoom} />)
    fireEvent.contextMenu(screen.getByText('Canvas'))
    await act(async () => {})
    const ruler = screen.getByRole('menuitemcheckbox', { name: 'Ruler' })
    const actual = screen.getByRole('menuitemradio', { name: 'Actual size' })
    expect(screen.getByRole('menuitem', { name: 'Reset zoom' }).className.split(' ')).toContain('ps-8')
    expect(screen.getByRole('menuitem', { name: 'Export' }).className.split(' ')).toContain('ps-8')
    expect([ruler.getAttribute('aria-checked'), ruler.querySelector('svg') !== null]).toEqual(['true', true])
    expect([actual.getAttribute('aria-checked'), actual.querySelector('svg')]).toEqual(['false', null])
    expect(screen.getByText('View').className).toContain('ps-8')
    expect(screen.getByTestId('separator').className).toContain('bg-border')

    fireEvent.click(ruler)

    expect(onShow).toHaveBeenCalledWith(false)
    fireEvent.contextMenu(screen.getByText('Canvas'))
    await act(async () => {})
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Actual size' }))
    expect(onZoom).toHaveBeenCalledWith('actual')
  })
})

describe('registry-ui ContextMenuShortcut', () => {
  test('spells its keys out when it has no label, and runs onKeysPressed on them', () => {
    const onKeysPressed = vi.fn()
    const { unmount } = render(<ContextMenuShortcut keys="ctrl+shift+d" onKeysPressed={onKeysPressed} />)
    expect(document.querySelector('[data-slot="context-menu-shortcut"]')?.textContent).not.toBe('')

    fireEvent.keyDown(document, { ctrlKey: true, key: 'd', shiftKey: true })
    expect(onKeysPressed).toHaveBeenCalledTimes(1)

    unmount()
    fireEvent.keyDown(document, { ctrlKey: true, key: 'd', shiftKey: true })
    expect(onKeysPressed).toHaveBeenCalledTimes(1)
  })

  test('shows its label over the keys, and binds nothing without onKeysPressed', () => {
    render(<ContextMenuShortcut keys="ctrl+shift+d">Duplicate</ContextMenuShortcut>)

    expect(document.querySelector('[data-slot="context-menu-shortcut"]')?.textContent).toBe('Duplicate')
  })

  test("hydrates the keys a server drew, then shows the browser's own", async () => {
    const { container, errors, html, unmount } = await hydrateOnMac(<ContextMenuShortcut keys="mod+shift+e" />)

    expect(html).toContain('>Ctrl+Shift+E</span>')
    expect(errors).toEqual([])
    expect(container.querySelector('[data-slot="context-menu-shortcut"]')?.textContent).toBe('Cmd+Shift+E')
    unmount()
  })
})

describe('registry-ui MotionContextMenuContent while it closes', () => {
  async function openThenChoose() {
    const onOpenChange = vi.fn()
    render(
      <>
        <MotionContextMenu onOpenChange={onOpenChange}>
          <ContextMenuTrigger>Canvas</ContextMenuTrigger>
          <MotionContextMenuContent>
            <ContextMenuItem>Paste</ContextMenuItem>
          </MotionContextMenuContent>
        </MotionContextMenu>
        <button type="button">Elsewhere</button>
      </>,
    )
    fireEvent.contextMenu(screen.getByText('Canvas'))
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Paste' }))
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
    return { elsewhere: screen.getByRole('button', { name: 'Elsewhere', hidden: true }), onOpenChange }
  }

  test('takes no second close from a press outside as it animates out', async () => {
    const { elsewhere, onOpenChange } = await openThenChoose()

    fireEvent.pointerDown(elsewhere)

    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  test('opens again on the first right-click while it animates out', async () => {
    const { onOpenChange } = await openThenChoose()
    const canvas = screen.getByText('Canvas')

    fireEvent.pointerDown(canvas, { button: 2 })
    fireEvent.contextMenu(canvas)
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)))

    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]])
    expect(screen.getAllByRole('menu').map((menu) => menu.getAttribute('data-state'))).toEqual(['open'])
  })

  test('takes no second close from focus moving outside as it animates out', async () => {
    const { elsewhere, onOpenChange } = await openThenChoose()

    act(() => elsewhere.focus())

    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })
})

describe('registry-ui MotionContextMenu closing', () => {
  function view(props: { modal?: boolean } = {}) {
    return (
      <MotionContextMenu {...props}>
        <ContextMenuTrigger>Canvas</ContextMenuTrigger>
        <MotionContextMenuContent>
          <ContextMenuItem>Paste</ContextMenuItem>
        </MotionContextMenuContent>
      </MotionContextMenu>
    )
  }

  test('closes on a press outside, holding the menu without presses until its exit ends', async () => {
    render(view())
    fireEvent.contextMenu(screen.getByText('Canvas'))
    await act(async () => {})
    const menu = screen.getByRole('menu')

    fireEvent.pointerDown(document.body, { button: 0 })

    await waitFor(() => expect(menu.style.pointerEvents).toBe('none'))
    await waitFor(() => expect(screen.queryByText('Paste')).toBeNull(), { timeout: 3000 })
  })

  test('closes a non-modal menu when focus moves outside it', async () => {
    render(
      <>
        <button type="button">Elsewhere</button>
        {view({ modal: false })}
      </>,
    )
    fireEvent.contextMenu(screen.getByText('Canvas'))
    await act(async () => {})
    const menu = screen.getByRole('menu')

    act(() => screen.getByRole('button', { name: 'Elsewhere' }).focus())

    await waitFor(() => expect(menu.style.pointerEvents).toBe('none'))
  })

  test('holds a closing submenu in the page without presses', async () => {
    render(
      <MotionContextMenu>
        <ContextMenuTrigger>Canvas</ContextMenuTrigger>
        <MotionContextMenuContent>
          <MotionContextMenuSub>
            <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
            <MotionContextMenuSubContent data-testid="sub">
              <ContextMenuItem>Mail</ContextMenuItem>
            </MotionContextMenuSubContent>
          </MotionContextMenuSub>
        </MotionContextMenuContent>
      </MotionContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Canvas'))
    await act(async () => {})
    fireEvent.keyDown(screen.getByText('Share'), { key: 'ArrowRight' })
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    const sub = screen.getByTestId('sub')

    fireEvent.keyDown(screen.getByText('Mail'), { key: 'ArrowLeft' })

    await waitFor(() => expect(sub.style.pointerEvents).toBe('none'))
  })
})

describe('registry-ui ContextMenu container', () => {
  test.each([
    ['ContextMenuContent', ContextMenu, ContextMenuContent],
    ['MotionContextMenuContent', MotionContextMenu, MotionContextMenuContent],
  ] as const)('%s portals into the element it is given', async (_, Root, Content) => {
    const element = document.createElement('section')
    document.body.append(element)
    render(
      <Root>
        <ContextMenuTrigger>Canvas</ContextMenuTrigger>
        <Content container={element}>
          <ContextMenuItem>Paste</ContextMenuItem>
        </Content>
      </Root>,
    )

    fireEvent.contextMenu(screen.getByText('Canvas'))
    await act(async () => {})

    expect(element.contains(screen.getByRole('menuitem', { name: 'Paste' }))).toBe(true)
    element.remove()
  })
})
