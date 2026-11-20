import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Collapsible, CollapsibleContent, CollapsibleTrigger, useCollapsible } from '../collapsible'

afterEach(cleanup)

function markup(content: React.ReactNode, open = false) {
  return renderToStaticMarkup(
    <Collapsible open={open}>
      <CollapsibleTrigger>Details</CollapsibleTrigger>
      {content}
    </Collapsible>,
  )
}

describe('useCollapsible', () => {
  test('refuses to run outside a Collapsible', () => {
    const Orphan = () => {
      useCollapsible()
      return null
    }
    const quiet = console.error
    console.error = () => {}

    try {
      expect(() => render(<Orphan />)).toThrow('useCollapsible must be used within a Collapsible')
    } finally {
      console.error = quiet
    }
  })
})

describe('CollapsibleContent', () => {
  test('renders its children while open', () => {
    expect(markup(<CollapsibleContent>Ships in two days.</CollapsibleContent>, true)).toContain('Ships in two days.')
  })

  test('leaves its children out while closed', () => {
    expect(markup(<CollapsibleContent>Ships in two days.</CollapsibleContent>)).not.toContain('Ships in two days.')
  })

  test('keeps its children in the page while closed with forceMount', () => {
    expect(markup(<CollapsibleContent forceMount>Ships in two days.</CollapsibleContent>)).toContain(
      'Ships in two days.',
    )
  })
})

describe('Collapsible', () => {
  const details = (props: React.ComponentProps<typeof Collapsible>) => (
    <Collapsible {...props}>
      <CollapsibleTrigger>Details</CollapsibleTrigger>
      <CollapsibleContent>Ships in two days.</CollapsibleContent>
    </Collapsible>
  )

  test('follows its open prop after the first render', () => {
    const { rerender } = render(details({ open: false }))
    rerender(details({ open: true }))

    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true')
    expect(screen.queryByText('Ships in two days.')).not.toBeNull()
  })

  test('calls onOpenChange once per click with the new state', () => {
    const onOpenChange = vi.fn()
    render(details({ onOpenChange }))

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))

    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  test('stays as its open prop says when a click asks to change it', () => {
    const onOpenChange = vi.fn()
    render(details({ onOpenChange, open: false }))

    fireEvent.click(screen.getByRole('button'))

    expect(onOpenChange.mock.calls).toEqual([[true]])
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false')
  })

  test('keeps its state when the trigger onClick prevents the default', () => {
    const onOpenChange = vi.fn()
    render(
      <Collapsible onOpenChange={onOpenChange}>
        <CollapsibleTrigger onClick={(event) => event.preventDefault()}>Details</CollapsibleTrigger>
      </Collapsible>,
    )

    fireEvent.click(screen.getByRole('button'))

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false')
  })

  test('carries a dir attribute only when given one', () => {
    const { container, rerender } = render(details({}))
    expect(container.firstElementChild?.hasAttribute('dir')).toBe(false)

    rerender(details({ dir: 'rtl' }))
    expect(container.firstElementChild?.getAttribute('dir')).toBe('rtl')
  })

  test('hands each element to its forwarded ref and to useCollapsible', () => {
    const rootRef = React.createRef<HTMLDivElement>()
    const contentRef = React.createRef<HTMLElement>()
    let refs: ReturnType<typeof useCollapsible> | undefined
    const Reader = () => {
      refs = useCollapsible()
      return null
    }
    render(
      <Collapsible defaultOpen ref={rootRef}>
        <Reader />
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <CollapsibleContent ref={contentRef}>Ships in two days.</CollapsibleContent>
      </Collapsible>,
    )

    expect(rootRef.current?.dataset.slot).toBe('collapsible')
    expect(refs?.wrapperRef.current).toBe(rootRef.current)
    expect(refs?.triggerRef.current).toBe(screen.getByRole('button'))
    expect(contentRef.current?.tagName).toBe('SECTION')
    expect(refs?.contentRef.current).toBe(contentRef.current)
  })
})

describe('Collapsible refs', () => {
  test('runs the cleanup a callback ref returns, on every part', () => {
    const cleanup = vi.fn()
    const { unmount } = render(
      <Collapsible open ref={() => cleanup}>
        <CollapsibleTrigger ref={() => cleanup}>Details</CollapsibleTrigger>
        <CollapsibleContent ref={() => cleanup}>Body</CollapsibleContent>
      </Collapsible>,
    )

    unmount()

    expect(cleanup).toHaveBeenCalledTimes(3)
  })
})
