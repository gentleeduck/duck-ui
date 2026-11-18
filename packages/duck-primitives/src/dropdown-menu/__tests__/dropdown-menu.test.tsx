import { afterEach, describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../index'

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
    const handler = mock(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="dropdown-menu-trigger"]')!, { key: 'Enter' })
    expect(handler).toHaveBeenCalled()
  })

  it('trigger opens on Space key', () => {
    const handler = mock(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="dropdown-menu-trigger"]')!, { key: ' ' })
    expect(handler).toHaveBeenCalled()
  })

  it('trigger opens on ArrowDown key', () => {
    const handler = mock(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="dropdown-menu-trigger"]')!, { key: 'ArrowDown' })
    expect(handler).toHaveBeenCalledWith(true)
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
    const handler = mock(() => {})
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
})
