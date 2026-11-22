import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { hydrateOnMac } from '../../_internal/__tests__/hydrate-on-mac'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../menubar'
import { MotionMenubarContent } from '../motion-menubar'

afterEach(cleanup)

const bar = (props: React.ComponentProps<typeof Menubar>) =>
  renderToStaticMarkup(
    <Menubar {...props}>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
      </MenubarMenu>
    </Menubar>,
  )

describe('registry-ui menubar', () => {
  test('a vertical bar carries the orientation its column layout keys on', () => {
    const html = bar({ orientation: 'vertical' })

    expect(html).toContain('aria-orientation="vertical"')
    expect(html).toMatch(/role="menubar"[^>]*data-orientation="vertical"/)
  })

  test('a disabled bar disables its triggers', () => {
    const html = bar({ disabled: true })

    expect(html).toMatch(/data-slot="menubar-trigger"[^>]*data-disabled=""[^>]*disabled=""/)
  })
})

const CONTENTS = [
  ['MenubarContent', MenubarContent],
  ['MotionMenubarContent', MotionMenubarContent],
] as const

async function openFileAndShare(Content: (typeof CONTENTS)[number][1]) {
  render(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <Content data-testid="content">
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent data-testid="sub-content">
              <MenubarItem>Mail</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </Content>
      </MenubarMenu>
    </Menubar>,
  )
  fireEvent.keyDown(screen.getByText('File'), { key: 'Enter' })
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
  fireEvent.keyDown(screen.getByText('Share'), { key: 'ArrowRight' })
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
}

describe('registry-ui menubar content', () => {
  test.each(CONTENTS)(
    '%s grows each menu from where the popper placed it and scrolls one taller than the viewport',
    async (_, Content) => {
      await openFileAndShare(Content)

      for (const testId of ['content', 'sub-content']) {
        const classes = screen.getByTestId(testId).className.split(' ')
        expect(classes).toContain('max-h-(--gentleduck-menubar-content-available-height)')
        expect(classes.filter((name) => name.startsWith('overflow-') || name.startsWith('origin-'))).toEqual([
          'origin-(--gentleduck-menubar-content-transform-origin)',
          'overflow-y-auto',
          'overflow-x-hidden',
        ])
      }
    },
  )

  test('MotionMenubarContent leaves its entrance to the spring', async () => {
    await openFileAndShare(MotionMenubarContent)

    const content = screen.getByTestId('content')
    expect(content.getAttribute('role')).toBe('menu')
    expect(content.className.split(' ').filter((name) => name.includes('animate-') || name.includes('-in-'))).toEqual(
      [],
    )
  })
})

describe('registry-ui MenubarShortcut', () => {
  test('spells its keys out when it has no label, and runs onKeysPressed on them while mounted', () => {
    const onKeysPressed = vi.fn()
    const { unmount } = render(<MenubarShortcut keys="shift+n" onKeysPressed={onKeysPressed} />)

    expect(document.querySelector('[data-slot="menubar-shortcut"]')?.textContent).toBe('Shift+N')
    fireEvent.keyDown(document, { key: 'N', shiftKey: true })
    expect(onKeysPressed).toHaveBeenCalledTimes(1)

    unmount()
    fireEvent.keyDown(document, { key: 'N', shiftKey: true })
    expect(onKeysPressed).toHaveBeenCalledTimes(1)
  })

  test('shows its label over the keys, and draws nothing for no keys and no label', () => {
    render(
      <>
        <MenubarShortcut keys="shift+n">New</MenubarShortcut>
        <MenubarShortcut />
      </>,
    )

    expect(Array.from(document.querySelectorAll('[data-slot="menubar-shortcut"]'), (node) => node.textContent)).toEqual(
      ['New', ''],
    )
  })

  test("hydrates the keys a server drew, then shows the browser's own", async () => {
    const { container, errors, html, unmount } = await hydrateOnMac(<MenubarShortcut keys="mod+shift+e" />)

    expect(html).toContain('>Ctrl+Shift+E</span>')
    expect(errors).toEqual([])
    expect(container.querySelector('[data-slot="menubar-shortcut"]')?.textContent).toBe('Cmd+Shift+E')
    unmount()
  })
})

function View({ onShow, onSort }: { onShow: (show: boolean) => void; onSort: (sort: string) => void }) {
  const [show, setShow] = React.useState(true)
  const [sort, setSort] = React.useState('name')

  return (
    <Menubar>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarLabel inset>Columns</MenubarLabel>
            <MenubarCheckboxItem
              checked={show}
              onCheckedChange={(next) => {
                setShow(next === true)
                onShow(next === true)
              }}>
              Status
            </MenubarCheckboxItem>
          </MenubarGroup>
          <MenubarSeparator data-testid="separator" />
          <MenubarRadioGroup
            onValueChange={(next) => {
              setSort(next)
              onSort(next)
            }}
            value={sort}>
            <MenubarRadioItem value="name">Name</MenubarRadioItem>
            <MenubarRadioItem value="date">Date</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarItem inset>Reset</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger inset>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Link</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

const openView = async () => {
  fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'View' }), { button: 0, ctrlKey: false })
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
}

describe('registry-ui menubar items', () => {
  test('marks the checked item and radio, insets a label and an item, and reports each choice', async () => {
    const onShow = vi.fn()
    const onSort = vi.fn()
    render(<View onShow={onShow} onSort={onSort} />)
    await openView()

    const status = screen.getByRole('menuitemcheckbox', { name: 'Status' })
    expect(status.getAttribute('aria-checked')).toBe('true')
    expect(status.querySelectorAll('svg').length).toBe(1)
    expect(screen.getByRole('menuitemradio', { name: 'Name' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('menuitemradio', { name: 'Date' }).querySelectorAll('svg').length).toBe(0)
    expect(screen.getByText('Columns').className.split(' ')).toContain('ps-8')
    expect(screen.getByTestId('separator').getAttribute('role')).toBe('separator')
    expect(screen.getByTestId('separator').className.split(' ')).toContain('bg-muted')
    expect(screen.getByRole('menuitem', { name: 'Reset' }).className.split(' ')).toContain('ps-8')
    expect(screen.getByRole('menuitem', { name: 'Share' }).className.split(' ')).toContain('ps-8')

    fireEvent.click(status)
    expect(onShow.mock.calls).toEqual([[false]])

    await openView()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Status' }).querySelectorAll('svg').length).toBe(0)
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Date' }))
    expect(onSort.mock.calls).toEqual([['date']])
  })
})

describe('registry-ui Menubar container', () => {
  test.each(CONTENTS)('%s portals into the element it is given', async (_, Content) => {
    const element = document.createElement('section')
    document.body.append(element)
    render(
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <Content container={element}>
            <MenubarItem>New tab</MenubarItem>
          </Content>
        </MenubarMenu>
      </Menubar>,
    )

    fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'File' }), { button: 0, ctrlKey: false })
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))

    expect(element.contains(screen.getByRole('menuitem', { name: 'New tab' }))).toBe(true)
    element.remove()
  })
})
