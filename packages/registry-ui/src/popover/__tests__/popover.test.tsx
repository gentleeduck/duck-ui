import { afterEach, describe, expect, test } from 'bun:test'
import * as PopoverPrimitive from '@gentleduck/primitives/popover'
import { cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MotionPopover, MotionPopoverContent } from '../motion-popover'
import { Popover, PopoverArrow, PopoverContent, PopoverDescription, PopoverTitle } from '../popover'

afterEach(cleanup)

function renderOpen(children: React.ReactNode) {
  return renderToStaticMarkup(
    <PopoverPrimitive.Root defaultOpen>
      <PopoverPrimitive.Content>{children}</PopoverPrimitive.Content>
    </PopoverPrimitive.Root>,
  )
}

describe('registry-ui Popover', () => {
  test('renders the title as a heading and merges its className', () => {
    const html = renderOpen(<PopoverTitle className="tracking-tight">Pond rules</PopoverTitle>)

    expect(html).toMatch(
      /<h2 data-slot="popover-title" id="[^"]+" class="font-medium leading-none tracking-tight">Pond rules<\/h2>/,
    )
  })

  test('renders the description as a muted paragraph', () => {
    const html = renderOpen(<PopoverDescription>No diving</PopoverDescription>)

    expect(html).toMatch(
      /<p data-slot="popover-description" id="[^"]+" class="text-muted-foreground text-sm">No diving<\/p>/,
    )
  })

  test('passes a className and style through to the arrow', () => {
    const html = renderOpen(<PopoverArrow className="drop-shadow" style={{ opacity: 0.5 }} />)

    expect(html).toMatch(/<svg[^>]*class="drop-shadow"/)
    expect(html).toMatch(/<svg[^>]*style="[^"]*opacity:0.5/)
  })
})

describe('registry-ui Popover content', () => {
  test.each([
    ['Popover', Popover, PopoverContent],
    ['MotionPopover', MotionPopover, MotionPopoverContent],
  ] as const)('%s defines the colour its arrow outlines in, which a className can change', (_, Root, Content) => {
    render(
      <Root defaultOpen>
        <Content className="[--popover-border-color:teal]" />
      </Root>,
    )

    const classes = screen.getByRole('dialog').className.split(' ')
    expect(classes).toContain('border-(--popover-border-color)')
    expect(classes).toContain('[--popover-border-color:teal]')
    expect(classes).not.toContain('[--popover-border-color:var(--border)]')
    expect(screen.getByRole('dialog').style.getPropertyValue('--popover-border-color')).toBe('')
  })

  test.each([
    ['Popover', Popover, PopoverContent],
    ['MotionPopover', MotionPopover, MotionPopoverContent],
  ] as const)('%s falls back to the border colour for its arrow', (_, Root, Content) => {
    render(
      <Root defaultOpen>
        <Content />
      </Root>,
    )

    expect(screen.getByRole('dialog').className.split(' ')).toContain('[--popover-border-color:var(--border)]')
  })
})
