import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import { MotionTooltip, MotionTooltipContent } from '../motion-tooltip'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider } from '../tooltip'

afterEach(cleanup)

const CONTENTS = [
  ['Tooltip', Tooltip, TooltipContent],
  ['MotionTooltip', MotionTooltip, MotionTooltipContent],
] as const

describe('registry-ui Tooltip content', () => {
  test.each(CONTENTS)(
    '%s defines the colour its arrow outlines in, which a className can change',
    (_, Root, Content) => {
      render(
        <TooltipProvider>
          <Root defaultOpen>
            <Content className="[--tooltip-border-color:teal]">Ducks only</Content>
          </Root>
        </TooltipProvider>,
      )

      const content = screen.getByRole('tooltip')
      const classes = content.className.split(' ')
      expect(classes).toContain('border-(--tooltip-border-color)')
      expect(classes).toContain('[--tooltip-border-color:teal]')
      expect(classes).not.toContain('[--tooltip-border-color:var(--border)]')
      expect(content.style.getPropertyValue('--tooltip-border-color')).toBe('')
    },
  )

  test.each(CONTENTS)(
    '%s falls back to the border colour for its arrow, on the popover surface it fills',
    (_, Root, Content) => {
      render(
        <TooltipProvider>
          <Root defaultOpen>
            <Content>Ducks only</Content>
          </Root>
        </TooltipProvider>,
      )

      const classes = screen.getByRole('tooltip').className.split(' ')
      expect(classes).toContain('[--tooltip-border-color:var(--border)]')
      expect(classes).toContain('bg-popover')
      expect(classes).not.toContain('overflow-hidden')
    },
  )
})

describe('registry-ui TooltipArrow', () => {
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

  test.each(CONTENTS)(
    'in %s, fills the popover surface first and outlines the curve after, 1px at any size',
    (_, Root, Content) => {
      render(
        <TooltipProvider>
          <Root defaultOpen>
            <Content>
              Ducks only
              <TooltipArrow className="drop-shadow-sm" height={9} style={{ color: 'teal' }} />
            </Content>
          </Root>
        </TooltipProvider>,
      )

      const arrow = screen.getByRole('tooltip').querySelector('svg')
      const [fill, outline] = Array.from(arrow?.querySelectorAll('path') ?? [])

      expect([arrow?.getAttribute('width'), arrow?.getAttribute('height')]).toEqual(['14', '9'])
      expect(arrow?.getAttribute('overflow')).toBe('visible')
      expect(arrow?.getAttribute('class')).toBe('drop-shadow-sm')
      expect(arrow?.style.color).toBe('teal')
      expect(fill?.getAttribute('fill')).toBe('var(--popover)')
      expect(outline?.getAttribute('fill')).toBe('none')
      expect(outline?.getAttribute('stroke')).toBe('var(--tooltip-border-color)')
      expect(outline?.getAttribute('vector-effect')).toBe('non-scaling-stroke')
    },
  )
})
