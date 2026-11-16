import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { MotionSidebar } from '../motion-sidebar'
import { SidebarProvider, SidebarTrigger } from '../sidebar'

const settle = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 800)))
const part = (slot: string) => document.querySelector<HTMLElement>(`[data-slot="${slot}"]`)

beforeEach(() => {
  const matchMedia = (query: string) => ({
    addEventListener: () => {},
    matches: false,
    media: query,
    removeEventListener: () => {},
  })
  Object.assign(globalThis, { matchMedia })
  Object.assign(window, { matchMedia })
})
afterEach(cleanup)

function Shell(props: React.ComponentProps<typeof MotionSidebar>) {
  return (
    <SidebarProvider>
      <MotionSidebar {...props}>body</MotionSidebar>
      <SidebarTrigger />
    </SidebarProvider>
  )
}

describe('registry-ui MotionSidebar', () => {
  test('the widths it animates to are the provider variables, so a provider that sets them is followed', async () => {
    render(<Shell collapsible="icon" />)
    await settle()
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))
    await settle()

    expect(part('sidebar-container')?.style.width).toBe('var(--sidebar-width-icon)')
    expect(part('sidebar-gap')?.style.width).toBe('var(--sidebar-width-icon)')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))
    await settle()

    expect(part('sidebar-container')?.style.width).toBe('var(--sidebar-width)')
  })

  test('offcanvas slides out by the provider width', async () => {
    render(<Shell />)
    await settle()
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))
    await settle()

    expect(part('sidebar-container')?.style.left).toBe('calc(var(--sidebar-width) * -1)')
    expect(part('sidebar-gap')?.style.width).toBe('0px')
  })

  test('floating and inset make room for their padding in the icon widths', async () => {
    render(<Shell collapsible="icon" variant="floating" />)
    await settle()
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))
    await settle()

    expect(part('sidebar-container')?.style.width).toBe('calc(var(--sidebar-width-icon) + 1rem + 2px)')
    expect(part('sidebar-gap')?.style.width).toBe('calc(var(--sidebar-width-icon) + 1rem)')
    expect(part('sidebar-container')?.className.split(' ')).toContain('p-2')
  })

  test.each([
    ['right', 'ltr', 'right'],
    ['left', 'rtl', 'right'],
    ['right', 'rtl', 'left'],
  ] as const)('side="%s" under %s slides out by its %s edge', async (side, dir, edge) => {
    render(<Shell dir={dir} side={side} />)
    await settle()
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))
    await settle()
    const container = part('sidebar-container')

    expect(container?.style.getPropertyValue(edge)).toBe('calc(var(--sidebar-width) * -1)')
    expect(container?.className.split(' ')).toEqual(
      expect.arrayContaining([`${edge}-0`, edge === 'right' ? 'border-l' : 'border-r']),
    )
  })

  test('collapsible="none" is a plain column that takes its props, class and ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <SidebarProvider>
        <MotionSidebar className="border-e" collapsible="none" dir="rtl" id="nav" ref={ref}>
          body
        </MotionSidebar>
      </SidebarProvider>,
    )

    expect(ref.current?.id).toBe('nav')
    expect(ref.current?.dir).toBe('rtl')
    expect(ref.current?.hasAttribute('data-state')).toBe(false)
    expect(ref.current?.className.split(' ')).toEqual(expect.arrayContaining(['border-e', 'w-(--sidebar-width)']))
  })

  test('the props it is given land on the container, as on Sidebar', () => {
    render(<Shell aria-label="Main" className="shadow-lg" id="nav" />)

    expect(part('sidebar-container')?.id).toBe('nav')
    expect(part('sidebar-container')?.getAttribute('aria-label')).toBe('Main')
    expect(part('sidebar-container')?.className.split(' ')).toContain('shadow-lg')
  })
})
