import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { DirectionProvider } from '../../direction'
import { MotionSidebar } from '../motion-sidebar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '../sidebar'
import { getPhysicalSidebarSide, persistSidebarOpen } from '../sidebar.constants'
import { SidebarContext, useSidebar } from '../sidebar.hooks'

const sidebarContextValue = {
  state: 'expanded' as const,
  open: true,
  setOpen: () => {},
  openMobile: false,
  setOpenMobile: () => {},
  isMobile: false,
  toggleSidebar: () => {},
  dir: 'ltr' as const,
}

let phone = false

beforeEach(() => {
  const matchMedia = (query: string) => ({
    addEventListener: () => {},
    matches: phone,
    media: query,
    removeEventListener: () => {},
  })
  Object.assign(globalThis, { matchMedia })
  Object.assign(window, { matchMedia })
})

afterEach(() => {
  cleanup()
  phone = false
  document.cookie = 'sidebar_state=; max-age=0; path=/'
})

const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))
const part = (slot: string) => document.querySelector<HTMLElement>(`[data-slot="${slot}"]`)

function State() {
  const { state, dir, open, openMobile } = useSidebar()
  return <output aria-label="state">{`${state} ${dir} ${open} ${openMobile}`}</output>
}

function Flip() {
  const { setOpen } = useSidebar()
  return (
    <button onClick={() => setOpen((open) => !open)} type="button">
      Flip
    </button>
  )
}

describe('registry-ui SidebarProvider', () => {
  test('the trigger collapses the sidebar and expands it again, and the cookie keeps the last state', () => {
    render(
      <SidebarProvider>
        <Sidebar>body</Sidebar>
        <SidebarTrigger />
        <State />
      </SidebarProvider>,
    )
    const sidebar = part('sidebar')

    expect(sidebar?.getAttribute('data-state')).toBe('expanded')
    expect(sidebar?.getAttribute('data-collapsible')).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))

    expect(sidebar?.getAttribute('data-state')).toBe('collapsed')
    expect(sidebar?.getAttribute('data-collapsible')).toBe('offcanvas')
    expect(document.cookie).toContain('sidebar_state=false')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))

    expect(screen.getByLabelText('state').textContent).toBe('expanded ltr true false')
    expect(document.cookie).toContain('sidebar_state=true')
  })

  test('defaultOpen={false} starts collapsed, and collapsible="icon" names the collapse it does', () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon">body</Sidebar>
      </SidebarProvider>,
    )

    expect(part('sidebar')?.getAttribute('data-state')).toBe('collapsed')
    expect(part('sidebar')?.getAttribute('data-collapsible')).toBe('icon')
  })

  test('controlled, the trigger asks onOpenChange and the open prop decides', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <SidebarProvider onOpenChange={onOpenChange} open>
        <Sidebar>body</Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(part('sidebar')?.getAttribute('data-state')).toBe('expanded')

    rerender(
      <SidebarProvider onOpenChange={onOpenChange} open={false}>
        <Sidebar>body</Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    )

    expect(part('sidebar')?.getAttribute('data-state')).toBe('collapsed')
  })

  test('Ctrl+B toggles the sidebar and keeps the keystroke from the page', () => {
    render(
      <SidebarProvider>
        <Sidebar>body</Sidebar>
      </SidebarProvider>,
    )

    const reached = fireEvent.keyDown(document, { ctrlKey: true, key: 'b' })

    expect(reached).toBe(false)
    expect(part('sidebar')?.getAttribute('data-state')).toBe('collapsed')
  })

  test('setOpen takes a value too', () => {
    function Close() {
      const { setOpen } = useSidebar()
      return (
        <button onClick={() => setOpen(false)} type="button">
          Close
        </button>
      )
    }
    render(
      <SidebarProvider>
        <Close />
        <State />
      </SidebarProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.getByLabelText('state').textContent).toBe('collapsed ltr false false')
  })

  test('setOpen takes an updater, as a state setter does', () => {
    render(
      <SidebarProvider>
        <Flip />
        <State />
      </SidebarProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Flip' }))

    expect(screen.getByLabelText('state').textContent).toBe('collapsed ltr false false')
  })

  test('the wrapper carries the width variables, lets a style override one, and takes the direction', () => {
    render(
      <SidebarProvider className="min-h-0" dir="rtl" style={{ '--sidebar-width': '20rem' } as React.CSSProperties}>
        <State />
        <SidebarMenuButton>Home</SidebarMenuButton>
      </SidebarProvider>,
    )
    const wrapper = part('sidebar-wrapper')

    expect(wrapper?.style.getPropertyValue('--sidebar-width')).toBe('20rem')
    expect(wrapper?.style.getPropertyValue('--sidebar-width-icon')).toBe('3rem')
    expect(wrapper?.dir).toBe('rtl')
    expect(wrapper?.className.split(' ')).toEqual(expect.arrayContaining(['min-h-0', 'w-full']))
    expect(wrapper?.className.split(' ')).not.toContain('min-h-svh')
    expect(screen.getByLabelText('state').textContent).toBe('expanded rtl true false')
    expect(screen.getByRole('button', { name: 'Home' }).dir).toBe('rtl')
  })

  test('on a phone the trigger opens the sidebar in a sheet named by mobileTitle, and Escape closes it', async () => {
    phone = true
    render(
      <SidebarProvider>
        <Sidebar mobileDescription="Every page of the pond." mobileTitle="Navigation">
          <a href="#home">Home</a>
        </Sidebar>
        <SidebarTrigger />
        <State />
      </SidebarProvider>,
    )

    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))
    const sheet = screen.getByRole('dialog', { name: 'Navigation' })

    expect(screen.getByText('Every page of the pond.')).toBeTruthy()
    expect(sheet.contains(screen.getByRole('link', { name: 'Home' }))).toBe(true)
    expect(screen.getByLabelText('state', { selector: 'output' }).textContent).toBe('expanded ltr true true')

    fireEvent.keyDown(sheet, { key: 'Escape' })
    await wait(400)

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('the rail toggles the sidebar under its own name and stays out of the tab order', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarRail text="Resize the sidebar" />
        </Sidebar>
      </SidebarProvider>,
    )
    const rail = screen.getByRole('button', { name: 'Resize the sidebar' })

    fireEvent.click(rail)

    expect(rail.tabIndex).toBe(-1)
    expect(part('sidebar')?.getAttribute('data-state')).toBe('collapsed')
  })

  test('the trigger runs its own onClick first, and takes its label from text', () => {
    const onClick = vi.fn()
    render(
      <SidebarProvider>
        <SidebarTrigger onClick={onClick} text="Menu" />
        <State />
      </SidebarProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('state').textContent).toBe('collapsed ltr false false')
  })

  test('useSidebar outside a provider throws and names the provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<State />)).toThrow('useSidebar must be used within a SidebarProvider.')
    error.mockRestore()
  })
})

describe('registry-ui Sidebar', () => {
  test('collapsible="none" is a plain column that takes its props, class and ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <SidebarContext.Provider value={sidebarContextValue}>
        <Sidebar className="border-e" collapsible="none" id="nav" ref={ref}>
          body
        </Sidebar>
      </SidebarContext.Provider>,
    )
    const sidebar = part('sidebar')

    expect(ref.current).toBe(sidebar)
    expect(sidebar?.id).toBe('nav')
    expect(sidebar?.hasAttribute('data-state')).toBe(false)
    expect(sidebar?.className.split(' ')).toEqual(expect.arrayContaining(['border-e', 'w-(--sidebar-width)']))
  })

  test.each([
    ['sidebar', false],
    ['floating', true],
    ['inset', true],
  ] as const)('the %s variant %s pads the container', (variant, padded) => {
    render(
      <SidebarContext.Provider value={sidebarContextValue}>
        <Sidebar variant={variant}>body</Sidebar>
      </SidebarContext.Provider>,
    )
    const container = part('sidebar-container')?.className.split(' ')

    expect(part('sidebar')?.getAttribute('data-variant')).toBe(variant)
    expect(container?.includes('p-2')).toBe(padded)
    expect(container?.includes('group-data-[side=left]:border-e')).toBe(!padded)
    expect(part('sidebar-gap')?.className.includes('calc(var(--sidebar-width-icon)+(--spacing(4)))')).toBe(padded)
  })

  test('its class and props land on the container, and side names the edge', () => {
    render(
      <SidebarContext.Provider value={sidebarContextValue}>
        <Sidebar aria-label="Main" className="shadow-lg" side="right">
          body
        </Sidebar>
      </SidebarContext.Provider>,
    )
    const container = part('sidebar-container')

    expect(container?.getAttribute('aria-label')).toBe('Main')
    expect(container?.getAttribute('data-side')).toBe('right')
    expect(container?.className.split(' ')).toContain('shadow-lg')
    expect(part('sidebar')?.getAttribute('data-side')).toBe('right')
  })

  test('SidebarTrigger prefers a provided icon over the default panel icon', () => {
    const html = renderToStaticMarkup(
      <SidebarContext.Provider value={sidebarContextValue}>
        <SidebarTrigger icon={<span data-icon="custom">C</span>} />
      </SidebarContext.Provider>,
    )

    expect(html).toContain('data-icon="custom"')
    expect(html).not.toContain('lucide-panel-left')
  })

  test('SidebarTrigger still renders the default panel icon when no icon is provided', () => {
    const html = renderToStaticMarkup(
      <SidebarContext.Provider value={sidebarContextValue}>
        <SidebarTrigger />
      </SidebarContext.Provider>,
    )

    expect(html).toContain('lucide-panel-left')
  })

  test('getPhysicalSidebarSide treats `side` as flow-relative', () => {
    expect(getPhysicalSidebarSide('left', 'ltr')).toBe('left')
    expect(getPhysicalSidebarSide('right', 'ltr')).toBe('right')
    expect(getPhysicalSidebarSide('left', 'rtl')).toBe('right')
    expect(getPhysicalSidebarSide('right', 'rtl')).toBe('left')
  })

  test('Sidebar pins itself with logical insets so an RTL ancestor mirrors it', () => {
    const html = renderToStaticMarkup(
      <DirectionProvider dir="rtl">
        <SidebarContext.Provider value={{ ...sidebarContextValue, dir: 'rtl' }}>
          <Sidebar>content</Sidebar>
        </SidebarContext.Provider>
      </DirectionProvider>,
    )

    expect(html).toContain('data-side="left"')
    expect(html).toContain('dir="rtl"')
    expect(html).toContain('data-[side=left]:start-0')
    expect(html).toContain('group-data-[side=left]:border-e')
    expect(html).not.toContain('data-[side=left]:left-0')
  })

  test('the mobile sheet takes the sidebar width in place of the sheet width', async () => {
    for (const Component of [Sidebar, MotionSidebar]) {
      render(
        <SidebarContext.Provider value={{ ...sidebarContextValue, isMobile: true, openMobile: true }}>
          <Component>content</Component>
        </SidebarContext.Provider>,
      )
      await act(async () => {})

      const classes = document.querySelector('[data-mobile="true"]')?.className.split(' ')
      expect(classes).toContain('w-(--sidebar-width)')
      expect(classes).not.toContain('w-3/4')
      cleanup()
    }
  })
})

type IPart = [string, React.ElementType, string, Record<string, unknown>]

const parts: IPart[] = [
  ['SidebarInset', SidebarInset, 'MAIN', {}],
  ['SidebarInput', SidebarInput, 'INPUT', {}],
  ['SidebarHeader', SidebarHeader, 'DIV', {}],
  ['SidebarFooter', SidebarFooter, 'DIV', {}],
  ['SidebarSeparator', SidebarSeparator, 'HR', {}],
  ['SidebarContent', SidebarContent, 'DIV', {}],
  ['SidebarGroup', SidebarGroup, 'DIV', {}],
  ['SidebarGroupLabel', SidebarGroupLabel, 'DIV', {}],
  ['SidebarGroupAction', SidebarGroupAction, 'BUTTON', {}],
  ['SidebarGroupContent', SidebarGroupContent, 'DIV', {}],
  ['SidebarMenu', SidebarMenu, 'UL', {}],
  ['SidebarMenuItem', SidebarMenuItem, 'LI', {}],
  ['SidebarMenuButton', SidebarMenuButton, 'BUTTON', {}],
  ['SidebarMenuAction', SidebarMenuAction, 'BUTTON', {}],
  ['SidebarMenuBadge', SidebarMenuBadge, 'DIV', {}],
  ['SidebarMenuSkeleton', SidebarMenuSkeleton, 'DIV', {}],
  ['SidebarMenuSub', SidebarMenuSub, 'UL', {}],
  ['SidebarMenuSubItem', SidebarMenuSubItem, 'LI', {}],
  ['SidebarMenuSubButton', SidebarMenuSubButton, 'A', { href: '#page' }],
  ['SidebarRail', SidebarRail, 'BUTTON', {}],
  ['SidebarTrigger', SidebarTrigger, 'BUTTON', {}],
]

function slotOf(name: string) {
  return name
    .replace(/^Sidebar/, 'sidebar')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

describe('registry-ui sidebar parts', () => {
  test.each(parts)(
    '%s names its slot, forwards its ref, merges a class and takes the direction',
    (name, Part, tag, extra) => {
      const ref = React.createRef<HTMLElement>()
      render(
        <DirectionProvider dir="rtl">
          <SidebarContext.Provider value={sidebarContextValue}>
            <Part className="custom" ref={ref} {...extra} />
          </SidebarContext.Provider>
        </DirectionProvider>,
      )
      const element = part(slotOf(name))

      expect(element?.tagName).toBe(tag)
      expect(ref.current).toBe(element)
      expect(element?.className.split(' ')).toContain('custom')
      expect(element?.dir).toBe('rtl')
    },
  )

  test('an explicit dir on an item, a menu button or a sub button wins over the provider', () => {
    render(
      <SidebarContext.Provider value={sidebarContextValue}>
        <SidebarMenuItem dir="rtl" />
        <SidebarMenuButton dir="rtl" />
        <SidebarMenuSub dir="rtl" />
        <SidebarMenuSubItem dir="rtl" />
        <SidebarMenuSubButton dir="rtl" />
      </SidebarContext.Provider>,
    )

    for (const slot of ['menu-item', 'menu-button', 'menu-sub', 'menu-sub-item', 'menu-sub-button']) {
      expect(part(`sidebar-${slot}`)?.dir).toBe('rtl')
    }
  })

  test.each([
    ['SidebarGroupLabel', SidebarGroupLabel],
    ['SidebarGroupAction', SidebarGroupAction],
    ['SidebarMenuButton', SidebarMenuButton],
    ['SidebarMenuAction', SidebarMenuAction],
    ['SidebarMenuSubButton', SidebarMenuSubButton],
  ] as [string, React.ElementType][])('%s with asChild renders its child in place of its own element', (name, Part) => {
    render(
      <SidebarContext.Provider value={sidebarContextValue}>
        <Part asChild>
          <a href="#child">Child</a>
        </Part>
      </SidebarContext.Provider>,
    )
    const link = screen.getByRole('link', { name: 'Child' })

    expect(link.getAttribute('data-slot')).toBe(slotOf(name))
  })

  test('SidebarMenuButton marks the active item, and takes a size and a variant', () => {
    render(
      <SidebarContext.Provider value={sidebarContextValue}>
        <SidebarMenuButton isActive size="lg" variant="outline">
          Inbox
        </SidebarMenuButton>
        <SidebarMenuButton>Drafts</SidebarMenuButton>
      </SidebarContext.Provider>,
    )
    const inbox = screen.getByRole('button', { name: 'Inbox' })
    const drafts = screen.getByRole('button', { name: 'Drafts' })

    expect(inbox.getAttribute('data-active')).toBe('true')
    expect(inbox.getAttribute('data-size')).toBe('lg')
    expect(inbox.className.split(' ')).toEqual(expect.arrayContaining(['h-12', 'bg-background']))
    expect(drafts.hasAttribute('data-active')).toBe(false)
    expect(drafts.getAttribute('data-size')).toBe('default')
  })

  test('a menu button tooltip needs no provider of its own, and shows only while the sidebar is collapsed to icons', () => {
    const menu = (
      <>
        <SidebarMenuButton tooltip="Inbox">I</SidebarMenuButton>
        <SidebarMenuButton tooltip={{ children: 'Drafts', side: 'left' }}>D</SidebarMenuButton>
      </>
    )
    const { rerender } = render(<SidebarProvider defaultOpen={false}>{menu}</SidebarProvider>)

    // A tooltip opens for keyboard focus, which jsdom takes as focus-visible only after a key.
    fireEvent.keyDown(document, { key: 'Tab' })
    act(() => screen.getByRole('button', { name: 'I' }).focus())

    expect(screen.getByRole('tooltip').textContent).toBe('Inbox')
    expect(screen.getByRole('tooltip').getAttribute('data-side')).toBe('right')

    fireEvent.keyDown(document, { key: 'Tab' })
    act(() => screen.getByRole('button', { name: 'D' }).focus())

    expect(screen.getByRole('tooltip').getAttribute('data-side')).toBe('left')

    rerender(<SidebarProvider open>{menu}</SidebarProvider>)

    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  test('SidebarContent hides its scrollbar unless noScroll is false', () => {
    render(
      <>
        <SidebarContent data-testid="quiet" />
        <SidebarContent data-testid="loud" noScroll={false} />
      </>,
    )

    expect(screen.getByTestId('quiet').className.split(' ')).toContain('no-scrollbar')
    expect(screen.getByTestId('loud').className.split(' ')).not.toContain('no-scrollbar')
  })

  test('SidebarMenuAction with showOnHover hides on wide screens until its item is hovered or focused', () => {
    render(
      <>
        <SidebarMenuAction aria-label="More" showOnHover />
        <SidebarMenuAction aria-label="Pin" />
      </>,
    )

    expect(screen.getByRole('button', { name: 'More' }).className.split(' ')).toEqual(
      expect.arrayContaining([
        'md:opacity-0',
        'group-hover/menu-item:opacity-100',
        'group-focus-within/menu-item:opacity-100',
      ]),
    )
    expect(screen.getByRole('button', { name: 'Pin' }).className.split(' ')).not.toContain('md:opacity-0')
  })

  test('SidebarMenuSkeleton cycles its width by index, takes a fixed one, and can show an icon', () => {
    render(
      <>
        <SidebarMenuSkeleton data-testid="first" />
        <SidebarMenuSkeleton data-testid="seventh" index={6} showIcon />
        <SidebarMenuSkeleton data-testid="fixed" index={3} width="33%" />
      </>,
    )
    const width = (id: string) =>
      screen
        .getByTestId(id)
        .querySelector<HTMLElement>('[data-sidebar="menu-skeleton-text"]')
        ?.style.getPropertyValue('--skeleton-width')

    expect(width('first')).toBe('50%')
    expect(width('seventh')).toBe('60%')
    expect(width('fixed')).toBe('33%')
    expect(screen.getByTestId('seventh').querySelector('[data-sidebar="menu-skeleton-icon"]')).not.toBeNull()
    expect(screen.getByTestId('first').querySelector('[data-sidebar="menu-skeleton-icon"]')).toBeNull()
  })

  test('SidebarMenuSubButton is a link sized md unless asked for sm, and marks the active page', () => {
    render(
      <>
        <SidebarMenuSubButton href="#a" isActive>
          Active
        </SidebarMenuSubButton>
        <SidebarMenuSubButton href="#b" size="sm">
          Small
        </SidebarMenuSubButton>
      </>,
    )
    const active = screen.getByRole('link', { name: 'Active' })
    const small = screen.getByRole('link', { name: 'Small' })

    expect(active.getAttribute('data-size')).toBe('md')
    expect(active.getAttribute('data-active')).toBe('true')
    expect(small.getAttribute('data-size')).toBe('sm')
    expect(small.hasAttribute('data-active')).toBe(false)
  })
})

describe('persistSidebarOpen', () => {
  test('marks the cookie Secure on an https page', () => {
    const cookie = vi.spyOn(document, 'cookie', 'set')
    vi.stubGlobal('location', { protocol: 'https:' })
    try {
      persistSidebarOpen(true)

      expect(cookie.mock.calls[0]?.[0]).toMatch(/^sidebar_state=true; .*SameSite=Lax; Secure$/)
    } finally {
      vi.unstubAllGlobals()
      cookie.mockRestore()
    }
  })

  test('writes nothing where there is no document, as on the server', () => {
    vi.stubGlobal('document', undefined)
    try {
      expect(() => persistSidebarOpen(true)).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
