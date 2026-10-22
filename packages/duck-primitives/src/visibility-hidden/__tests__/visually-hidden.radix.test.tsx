// From Radix UI primitives, packages/react/visually-hidden/src/visually-hidden.test.tsx. MIT, see src/__tests__/radix/LICENSE.

import { afterEach, describe, expect, it } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { radixEnvironment, vi } from '../../__tests__/radix/harness'
import * as VisuallyHidden from '../index'

radixEnvironment()

describe('VisuallyHidden.Root', () => {
  afterEach(cleanup)
  it('spreads props it does not consume onto the element it renders', () => {
    const ref = React.createRef<HTMLSpanElement>()
    const onClick = vi.fn()

    render(
      <VisuallyHidden.Root
        ref={ref}
        data-testid="visually-hidden"
        className="custom-class"
        style={{ outlineColor: 'rgb(1, 2, 3)' }}
        onClick={onClick}>
        Hidden
      </VisuallyHidden.Root>,
    )

    const visuallyHidden = screen.getByTestId('visually-hidden')
    expect(visuallyHidden).toHaveClass('custom-class')
    expect(visuallyHidden.style.outlineColor).toBe('rgb(1, 2, 3)')
    expect(visuallyHidden.style.position).toBe('absolute')
    expect(visuallyHidden.style.overflow).toBe('hidden')
    expect(ref.current).toBe(visuallyHidden)

    fireEvent.click(visuallyHidden)
    expect(onClick).toHaveBeenCalled()
  })

  it('forwards props to the child element when `asChild` is set', () => {
    const ref = React.createRef<HTMLSpanElement>()
    const onClick = vi.fn()

    render(
      <VisuallyHidden.Root
        asChild
        ref={ref}
        data-testid="visually-hidden"
        className="custom-class"
        style={{ outlineColor: 'rgb(1, 2, 3)' }}
        onClick={onClick}>
        <article>Hidden</article>
      </VisuallyHidden.Root>,
    )

    const visuallyHidden = screen.getByTestId('visually-hidden')
    expect(visuallyHidden.tagName).toBe('ARTICLE')
    expect(visuallyHidden).toHaveClass('custom-class')
    expect(visuallyHidden.style.outlineColor).toBe('rgb(1, 2, 3)')
    expect(visuallyHidden.style.position).toBe('absolute')
    expect(visuallyHidden.style.overflow).toBe('hidden')
    expect(ref.current).toBe(visuallyHidden)

    fireEvent.click(visuallyHidden)
    expect(onClick).toHaveBeenCalled()
  })
})
