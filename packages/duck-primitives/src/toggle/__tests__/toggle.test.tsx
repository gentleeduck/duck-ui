import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { Toggle } from '../toggle'

describe('Toggle', () => {
  it('renders with data-slot="toggle"', () => {
    const { container } = render(<Toggle>Bold</Toggle>)
    expect(container.querySelector('[data-slot="toggle"]')).not.toBeNull()
  })

  it('renders as a button with type="button"', () => {
    const { container } = render(<Toggle>Bold</Toggle>)
    const btn = container.querySelector('button')!
    expect(btn.getAttribute('type')).toBe('button')
  })

  it('starts unpressed by default', () => {
    const { container } = render(<Toggle>Bold</Toggle>)
    const btn = container.querySelector('button')!
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    expect(btn.getAttribute('data-state')).toBe('off')
  })

  it('starts pressed when defaultPressed=true', () => {
    const { container } = render(<Toggle defaultPressed>Bold</Toggle>)
    const btn = container.querySelector('button')!
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    expect(btn.getAttribute('data-state')).toBe('on')
  })

  it('toggles on click', () => {
    const { container } = render(<Toggle>Bold</Toggle>)
    const btn = container.querySelector('button')!
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    expect(btn.getAttribute('data-state')).toBe('on')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    expect(btn.getAttribute('data-state')).toBe('off')
  })

  it('calls onPressedChange on toggle', () => {
    const handler = mock(() => {})
    const { container } = render(<Toggle onPressedChange={handler}>Bold</Toggle>)
    fireEvent.click(container.querySelector('button')!)
    expect(handler).toHaveBeenCalledWith(true)
    fireEvent.click(container.querySelector('button')!)
    expect(handler).toHaveBeenCalledWith(false)
  })

  it('does not toggle when disabled', () => {
    const handler = mock(() => {})
    const { container } = render(
      <Toggle disabled onPressedChange={handler}>
        Bold
      </Toggle>,
    )
    const btn = container.querySelector('button')!
    expect(btn.getAttribute('data-disabled')).toBe('')
    expect(btn.disabled).toBe(true)
    fireEvent.click(btn)
    expect(handler).not.toHaveBeenCalled()
    expect(btn.getAttribute('aria-pressed')).toBe('false')
  })

  it('works as controlled component', () => {
    const { container, rerender } = render(<Toggle pressed={false}>Bold</Toggle>)
    const btn = container.querySelector('button')!
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    rerender(<Toggle pressed={true}>Bold</Toggle>)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Toggle ref={ref}>Bold</Toggle>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('passes className through', () => {
    const { container } = render(<Toggle className="custom-toggle">Bold</Toggle>)
    expect(container.querySelector('button')?.className).toContain('custom-toggle')
  })

  it('defaults to ltr direction', () => {
    const { container } = render(<Toggle>Bold</Toggle>)
    expect(container.querySelector('button')?.getAttribute('dir')).toBe('ltr')
  })

  it('renders children as button text', () => {
    const { container } = render(<Toggle>Bold</Toggle>)
    expect(container.querySelector('button')?.textContent).toBe('Bold')
  })

  it('multiple rapid clicks toggle correctly', () => {
    const { container } = render(<Toggle>Bold</Toggle>)
    const btn = container.querySelector('button')!
    fireEvent.click(btn)
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    expect(btn.getAttribute('data-state')).toBe('on')
  })
})
