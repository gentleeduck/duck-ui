import { afterEach, describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuPortal, ContextMenuTrigger } from '../index'

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

  it('sets dir attribute on trigger', () => {
    const { container } = render(
      <ContextMenu dir="rtl">
        <ContextMenuTrigger>Right click</ContextMenuTrigger>
      </ContextMenu>,
    )
    expect(container.querySelector('[data-slot="context-menu-trigger"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('trigger renders children as text', () => {
    const { container } = renderContextMenu()
    expect(container.querySelector('[data-slot="context-menu-trigger"]')?.textContent).toBe('Right click me')
  })
})

describe('ContextMenu direction', () => {
  const mounted: Array<() => void> = []

  afterEach(() => {
    for (const unmount of mounted.splice(0)) unmount()
  })

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
    mounted.push(utils.unmount)
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
