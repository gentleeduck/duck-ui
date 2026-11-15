import { afterEach, describe, expect, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, render, screen } from '@testing-library/react'
import { MotionSeparator } from '../motion-separator'
import { Separator } from '../separator'

afterEach(cleanup)

const SEPARATORS = [
  ['Separator', Separator],
  ['MotionSeparator', MotionSeparator],
] as const

describe('registry-ui Separator', () => {
  test.each(SEPARATORS)('%s runs across by default and up when vertical, in both attributes', (_, Line) => {
    render(
      <>
        <Line data-testid="across" />
        <Line data-testid="up" orientation="vertical" />
      </>,
    )

    const across = screen.getByTestId('across')
    const up = screen.getByTestId('up')
    expect(screen.getAllByRole('separator')).toHaveLength(2)
    expect([across.getAttribute('aria-orientation'), across.getAttribute('data-orientation')]).toEqual([
      'horizontal',
      'horizontal',
    ])
    expect(across.className.split(' ')).toEqual(expect.arrayContaining(['h-px', 'w-full']))
    expect([up.getAttribute('aria-orientation'), up.getAttribute('data-orientation')]).toEqual(['vertical', 'vertical'])
    expect(up.className.split(' ')).toEqual(expect.arrayContaining(['min-h-full', 'w-px']))
    expect(up.getAttribute('data-slot')).toBe('separator')
  })

  test.each(SEPARATORS)('%s takes its direction from a provider', (_, Line) => {
    render(
      <DirectionProvider dir="rtl">
        <Line data-testid="line" />
      </DirectionProvider>,
    )

    expect(screen.getByTestId('line').getAttribute('dir')).toBe('rtl')
  })

  test.each(SEPARATORS)("%s takes a slot of a wrapper's own", (_, Line) => {
    render(<Line data-slot="sidebar-separator" />)

    expect(screen.getByRole('separator').getAttribute('data-slot')).toBe('sidebar-separator')
  })

  test("Separator drops the <hr>'s own border, which covered a one-pixel line and hid a colour class", () => {
    render(<Separator className="bg-primary" />)

    expect(screen.getByRole('separator').className.split(' ')).toEqual(
      expect.arrayContaining(['border-0', 'bg-primary']),
    )
  })

  test('MotionSeparator grows along its own length', () => {
    render(
      <>
        <MotionSeparator data-testid="across" />
        <MotionSeparator data-testid="up" orientation="vertical" />
      </>,
    )

    expect(screen.getByTestId('across').style.transform).toContain('scaleX(0)')
    expect(screen.getByTestId('up').style.transform).toContain('scaleY(0)')
  })
})
