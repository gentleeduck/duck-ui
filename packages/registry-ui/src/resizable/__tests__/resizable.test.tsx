import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import { MotionResizablePanelGroup } from '../motion-resizable'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../resizable'

const resizeObserver = window.ResizeObserver
const offsetWidth = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'offsetWidth')

// The panels library measures each panel before it lays them out, and jsdom measures everything at zero.
beforeAll(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 200 })
})
afterAll(() => {
  window.ResizeObserver = resizeObserver
  if (offsetWidth) Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', offsetWidth)
})
afterEach(cleanup)

const groups: [string, typeof ResizablePanelGroup][] = [
  ['ResizablePanelGroup', ResizablePanelGroup],
  ['MotionResizablePanelGroup', MotionResizablePanelGroup],
]

function panelGroup() {
  const group = document.querySelector('[data-slot="panel-group"]')
  if (!(group instanceof HTMLElement)) throw new Error('no panel group')
  return group
}

describe.each(groups)('registry-ui %s', (_, Group) => {
  test('takes the direction from DirectionProvider, and hands a ref the group element', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <DirectionProvider dir="rtl">
        <Group ref={ref}>
          <ResizablePanel defaultSize="50%">One</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="50%">Two</ResizablePanel>
        </Group>
      </DirectionProvider>,
    )

    expect(panelGroup().getAttribute('dir')).toBe('rtl')
    expect(panelGroup().classList.contains('size-full')).toBe(true)
    expect(ref.current).toBe(panelGroup())
  })

  test('its own dir wins over the provider', () => {
    render(
      <DirectionProvider dir="rtl">
        <Group dir="ltr">
          <ResizablePanel>One</ResizablePanel>
        </Group>
      </DirectionProvider>,
    )

    expect(panelGroup().getAttribute('dir')).toBe('ltr')
  })
})

describe('registry-ui ResizablePanelGroup className', () => {
  test('lands on the group beside its own layout classes', () => {
    render(
      <ResizablePanelGroup className="rounded-lg border">
        <ResizablePanel>One</ResizablePanel>
      </ResizablePanelGroup>,
    )

    expect(panelGroup().className).toBe('flex size-full rounded-lg border')
  })
})

describe('registry-ui MotionResizablePanelGroup className', () => {
  test('lands on the animated wrapper, so the group keeps its own layout classes', () => {
    render(
      <MotionResizablePanelGroup className="rounded-lg border">
        <ResizablePanel>One</ResizablePanel>
      </MotionResizablePanelGroup>,
    )

    expect(panelGroup().className).toBe('flex size-full')
    expect(panelGroup().parentElement?.className).toBe('size-full rounded-lg border')
  })
})

describe('registry-ui ResizableHandle', () => {
  function renderHandle(handle: React.ReactElement) {
    render(
      <ResizablePanelGroup>
        <ResizablePanel defaultSize="50%">One</ResizablePanel>
        {handle}
        <ResizablePanel defaultSize="50%">Two</ResizablePanel>
      </ResizablePanelGroup>,
    )
    return screen.getByRole('separator')
  }

  test('is a named separator with a grip, and a ref reaches it', () => {
    const ref = React.createRef<HTMLDivElement>()
    const separator = renderHandle(<ResizableHandle ref={ref} />)

    expect(separator.getAttribute('aria-label')).toBe('Resize panels')
    expect(separator.querySelector('[data-slot="panel-handle"] svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(ref.current).toBe(separator)
  })

  test('takes a name of its own, and draws only the line with withHandle={false}', () => {
    const separator = renderHandle(<ResizableHandle aria-label="Resize the sidebar" withHandle={false} />)

    expect(separator.getAttribute('aria-label')).toBe('Resize the sidebar')
    expect(separator.querySelector('[data-slot="panel-handle"]')).toBeNull()
  })

  test('ArrowRight moves it a step, growing the panel before it', () => {
    const separator = renderHandle(<ResizableHandle />)

    fireEvent.keyDown(separator, { key: 'ArrowRight' })

    expect(separator.getAttribute('aria-valuenow')).toBe('55')
  })

  test('disabled, it leaves the tab order and dims, so it does not look ready to drag', () => {
    const separator = renderHandle(<ResizableHandle disabled />)

    expect(separator.getAttribute('aria-disabled')).toBe('true')
    expect(separator.getAttribute('tabindex')).toBeNull()
    expect(separator.className).toContain('aria-disabled:opacity-50')
  })

  test('enabled after mounting disabled, it moves with the arrow keys', () => {
    const { rerender } = render(
      <ResizablePanelGroup>
        <ResizablePanel defaultSize="50%">One</ResizablePanel>
        <ResizableHandle disabled />
        <ResizablePanel defaultSize="50%">Two</ResizablePanel>
      </ResizablePanelGroup>,
    )
    rerender(
      <ResizablePanelGroup>
        <ResizablePanel defaultSize="50%">One</ResizablePanel>
        <ResizableHandle disabled={false} />
        <ResizablePanel defaultSize="50%">Two</ResizablePanel>
      </ResizablePanelGroup>,
    )
    const separator = screen.getByRole('separator')

    fireEvent.keyDown(separator, { key: 'ArrowRight' })

    expect(separator.getAttribute('aria-valuenow')).toBe('55')
  })
})
