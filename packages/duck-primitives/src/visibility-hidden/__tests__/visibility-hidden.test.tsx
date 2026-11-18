import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { VisuallyHidden } from '../visibility-hidden'

describe('VisuallyHidden', () => {
  it('renders with data-slot="visually-hidden"', () => {
    const { container } = render(<VisuallyHidden>Hidden text</VisuallyHidden>)
    expect(container.querySelector('[data-slot="visually-hidden"]')).not.toBeNull()
  })

  it('renders as a span', () => {
    const { container } = render(<VisuallyHidden>Hidden text</VisuallyHidden>)
    expect(container.querySelector('span')).not.toBeNull()
  })

  it('applies visually hidden styles', () => {
    const { container } = render(<VisuallyHidden>Hidden text</VisuallyHidden>)
    const el = container.querySelector('span')!
    expect(el.style.position).toBe('absolute')
    expect(el.style.width).toBe('1px')
    expect(el.style.height).toBe('1px')
    expect(el.style.overflow).toBe('hidden')
  })

  it('renders children as text content', () => {
    const { container } = render(<VisuallyHidden>Screen reader only</VisuallyHidden>)
    expect(container.textContent).toBe('Screen reader only')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(<VisuallyHidden ref={ref}>text</VisuallyHidden>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('merges custom styles', () => {
    const { container } = render(<VisuallyHidden style={{ color: 'red' }}>text</VisuallyHidden>)
    const el = container.querySelector('span')!
    expect(el.style.color).toBe('red')
    expect(el.style.position).toBe('absolute')
  })
})
