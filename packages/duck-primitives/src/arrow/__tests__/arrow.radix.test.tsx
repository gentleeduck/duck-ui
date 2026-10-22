// From Radix UI primitives, packages/react/arrow/src/arrow.test.tsx. MIT, see src/__tests__/radix/LICENSE.

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { RenderResult } from '@testing-library/react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { axe, radixEnvironment, vi } from '../../__tests__/radix/harness'
import * as Arrow from '../index'

radixEnvironment()

const WIDTH = 40
const HEIGHT = 30

describe('given a default Arrow', () => {
  let rendered: RenderResult
  let svg: HTMLElement

  afterEach(cleanup)

  beforeEach(() => {
    rendered = render(<Arrow.Root width={WIDTH} height={HEIGHT} data-testid="test-arrow" />)
    svg = rendered.getByTestId('test-arrow')
  })

  it('should have no accessibility violations', async () => {
    expect(await axe(rendered.container)).toHaveNoViolations()
  })

  it('should have width attribute', () => {
    expect(svg).toHaveAttribute('width', String(WIDTH))
  })

  it('should have height attribute', () => {
    expect(svg).toHaveAttribute('height', String(HEIGHT))
  })
})

describe('Arrow.Root', () => {
  afterEach(cleanup)

  it('spreads props it does not consume onto the element it renders', () => {
    const ref = React.createRef<SVGSVGElement>()
    const onClick = vi.fn()

    render(
      <Arrow.Root
        ref={ref}
        data-testid="arrow"
        className="custom-class"
        style={{ outlineColor: 'rgb(1, 2, 3)' }}
        onClick={onClick}
      />,
    )

    const arrow = screen.getByTestId('arrow')
    expect(arrow).toHaveClass('custom-class')
    expect(arrow.style.outlineColor).toBe('rgb(1, 2, 3)')
    expect(ref.current).toBe(arrow)

    fireEvent.click(arrow)
    expect(onClick).toHaveBeenCalled()
  })

  it('forwards props to the child element when `asChild` is set', () => {
    const ref = React.createRef<SVGSVGElement>()
    const onClick = vi.fn()

    render(
      <Arrow.Root
        asChild
        ref={ref}
        data-testid="arrow"
        className="custom-class"
        style={{ outlineColor: 'rgb(1, 2, 3)' }}
        onClick={onClick}>
        <svg />
      </Arrow.Root>,
    )

    const arrow = screen.getByTestId('arrow')
    expect(arrow.tagName).toBe('svg')
    expect(arrow).toHaveAttribute('viewBox', '0 0 30 10')
    expect(arrow).toHaveAttribute('preserveAspectRatio', 'none')
    expect(arrow).toHaveClass('custom-class')
    expect(arrow.style.outlineColor).toBe('rgb(1, 2, 3)')
    expect(ref.current).toBe(arrow)

    fireEvent.click(arrow)
    expect(onClick).toHaveBeenCalled()
  })
})
