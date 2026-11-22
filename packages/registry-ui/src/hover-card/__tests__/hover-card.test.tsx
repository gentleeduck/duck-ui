import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import { HoverCard, HoverCardArrow, HoverCardContent, HoverCardTrigger } from '../hover-card'
import { MotionHoverCard, MotionHoverCardContent } from '../motion-hover-card'

afterEach(cleanup)

const CONTENTS = [
  ['HoverCard', HoverCard, HoverCardContent],
  ['MotionHoverCard', MotionHoverCard, MotionHoverCardContent],
] as const

describe('registry-ui HoverCard content', () => {
  test.each(CONTENTS)(
    '%s defines the colour its arrow outlines in, which a className can change',
    (_, Root, Content) => {
      render(
        <Root defaultOpen>
          <Content className="[--hover-card-border-color:teal]">Ducks only</Content>
        </Root>,
      )

      const content = screen.getByText('Ducks only')
      const classes = content.className.split(' ')
      expect(classes).toContain('border-(--hover-card-border-color)')
      expect(classes).toContain('[--hover-card-border-color:teal]')
      expect(classes).not.toContain('[--hover-card-border-color:var(--border)]')
      expect(content.style.getPropertyValue('--hover-card-border-color')).toBe('')
    },
  )

  test.each(CONTENTS)(
    '%s falls back to the border colour for its arrow, on the popover surface it fills',
    (_, Root, Content) => {
      render(
        <Root defaultOpen>
          <Content>Ducks only</Content>
        </Root>,
      )

      const classes = screen.getByText('Ducks only').className.split(' ')
      expect(classes).toContain('[--hover-card-border-color:var(--border)]')
      expect(classes).toContain('bg-popover')
      expect(classes).not.toContain('overflow-hidden')
    },
  )

  test.each([
    ['open', { open: true }],
    ['defaultOpen', { defaultOpen: true }],
  ] as const)('MotionHoverCard opens its content when it is given %s', (_, props) => {
    render(
      <MotionHoverCard {...props}>
        <MotionHoverCardContent>Ducks only</MotionHoverCardContent>
      </MotionHoverCard>,
    )

    expect(screen.getByText('Ducks only').getAttribute('data-state')).toBe('open')
  })
})

describe('registry-ui HoverCardTrigger', () => {
  test('is a link drawn as an outline button, or in the variant and size it is handed', () => {
    render(
      <HoverCard>
        <HoverCardTrigger href="/ducks/mallard">Mallard</HoverCardTrigger>
        <HoverCardTrigger className="italic" href="/ducks/teal" size="sm" variant="link">
          Teal
        </HoverCardTrigger>
      </HoverCard>,
    )

    const mallard = screen.getByRole('link', { name: 'Mallard' })
    expect(mallard.getAttribute('href')).toBe('/ducks/mallard')
    expect(mallard.getAttribute('data-slot')).toBe('hover-card-trigger')
    expect(mallard.className.split(' ')).toEqual(expect.arrayContaining(['border', 'bg-background', 'h-9']))
    const teal = screen.getByRole('link', { name: 'Teal' }).className.split(' ')
    expect(teal).toEqual(expect.arrayContaining(['text-primary', 'h-8', 'italic']))
    expect(teal).not.toContain('bg-background')
  })
})

describe('registry-ui HoverCardArrow', () => {
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

  test('draws an outlined curve over the fill, with the class it is handed', () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardContent>
          Ducks only
          <HoverCardArrow className="drop-shadow" />
        </HoverCardContent>
      </HoverCard>,
    )

    const arrow = screen.getByText('Ducks only').querySelector('svg[overflow="visible"]')
    expect(arrow?.getAttribute('class')).toContain('drop-shadow')
    expect(Array.from(arrow?.querySelectorAll('path') ?? [], (path) => path.getAttribute('stroke'))).toEqual([
      null,
      'var(--hover-card-border-color)',
    ])
  })
})

describe('registry-ui MotionHoverCard closing', () => {
  test('draws nothing closed, and holds its content in the page, taking no presses, until the exit ends', async () => {
    const view = (open: boolean) => (
      <MotionHoverCard open={open}>
        <MotionHoverCardContent>Ducks only</MotionHoverCardContent>
      </MotionHoverCard>
    )
    const { rerender } = render(view(false))
    expect(screen.queryByText('Ducks only')).toBeNull()

    rerender(view(true))
    rerender(view(false))

    const content = screen.getByText('Ducks only')
    await waitFor(() => expect(content.style.pointerEvents).toBe('none'))
    await waitFor(() => expect(screen.queryByText('Ducks only')).toBeNull(), { timeout: 3000 })
  })
})
