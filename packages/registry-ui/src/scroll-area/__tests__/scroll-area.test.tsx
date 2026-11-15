import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import { MotionScrollArea } from '../motion-scroll-area'
import { ScrollArea } from '../scroll-area'

afterEach(cleanup)

const areas: [string, typeof ScrollArea][] = [
  ['ScrollArea', ScrollArea],
  ['MotionScrollArea', MotionScrollArea],
]

describe.each(areas)('registry-ui %s', (_, Area) => {
  test('styles and names the frame, and scrolls in a viewport inside it', () => {
    const ref = React.createRef<HTMLDivElement>()
    const viewportRef = React.createRef<HTMLDivElement>()
    render(
      <Area
        aria-label="Release tags"
        className="h-72 rounded-md border"
        ref={ref}
        role="region"
        style={{ width: 192 }}
        viewportClassName="scrollbar-none"
        viewportRef={viewportRef}>
        <p>v1.2.0</p>
      </Area>,
    )
    const frame = screen.getByRole('region', { name: 'Release tags' })
    const viewport = screen.getByText('v1.2.0').parentElement

    expect(ref.current).toBe(frame)
    expect(frame.getAttribute('data-slot')).toBe('scroll-area')
    expect(frame.className).toBe('relative overflow-hidden h-72 rounded-md border')
    expect(frame.style.width).toBe('192px')
    expect(viewportRef.current).toBe(viewport)
    expect(viewport?.parentElement).toBe(frame)
    expect(viewport?.className).toBe('size-full overflow-auto scrollbar-none')
  })

  test('takes the direction from DirectionProvider, and its own dir wins', () => {
    render(
      <DirectionProvider dir="rtl">
        <Area data-testid="inherits">One</Area>
        <Area data-testid="own" dir="ltr">
          Two
        </Area>
      </DirectionProvider>,
    )

    expect(screen.getByTestId('inherits').getAttribute('dir')).toBe('rtl')
    expect(screen.getByTestId('own').getAttribute('dir')).toBe('ltr')
  })

  test('keeps its slot when a consumer passes one', () => {
    render(<Area data-slot="tags">One</Area>)

    expect(screen.getByText('One').parentElement?.getAttribute('data-slot')).toBe('scroll-area')
  })
})

describe('registry-ui MotionScrollArea entrance', () => {
  test('scales in from slightly small and settles at full size', async () => {
    render(<MotionScrollArea data-testid="area">One</MotionScrollArea>)
    const area = screen.getByTestId('area')

    expect(area.style.transform).toBe('scale(0.95)')

    await waitFor(() => expect(area.style.transform).toBe('none'), { timeout: 3000 })
  })
})
