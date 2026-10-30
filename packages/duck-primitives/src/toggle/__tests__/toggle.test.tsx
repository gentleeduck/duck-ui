import { describe, expect, it, mock, spyOn } from 'bun:test'
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

  it('takes a type passed to it over its own', () => {
    const { container } = render(<Toggle type="submit">Bold</Toggle>)

    expect(container.querySelector('button')?.getAttribute('type')).toBe('submit')
  })

  it('is named Toggle in React DevTools', () => {
    expect(Toggle.displayName).toBe('Toggle')
  })

  it('names itself when it switches from uncontrolled to controlled', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = render(<Toggle>Bold</Toggle>)
    rerender(<Toggle pressed>Bold</Toggle>)
    const starts = warn.mock.calls.map(([message]) => String(message).split('.')[0])
    warn.mockRestore()

    expect(starts).toEqual(['Toggle is changing from uncontrolled to controlled'])
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

  it('does not toggle when disabled and rendered as an element a click still reaches', () => {
    const handler = mock(() => {})
    const { container } = render(
      <Toggle asChild disabled onPressedChange={handler}>
        <a href="#bold">Bold</a>
      </Toggle>,
    )
    const link = container.querySelector('a')!

    fireEvent.click(link)

    expect([handler.mock.calls.length, link.getAttribute('aria-pressed')]).toEqual([0, 'false'])
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

  it('leaves the direction to the document when no dir is passed', () => {
    const { container } = render(<Toggle>Bold</Toggle>)
    expect(container.querySelector('button')?.hasAttribute('dir')).toBe(false)
  })

  it('sets dir attribute', () => {
    const { container } = render(<Toggle dir="rtl">Bold</Toggle>)
    expect(container.querySelector('button')?.getAttribute('dir')).toBe('rtl')
  })

  it('takes any dir an element takes, auto included, since it reads none', () => {
    const { container } = render(<Toggle dir="auto">Bold</Toggle>)
    expect(container.querySelector('button')?.getAttribute('dir')).toBe('auto')
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

describe('Toggle children as a function', () => {
  it('renders what the function returns for the pressed state', () => {
    const { container } = render(<Toggle>{(pressed) => (pressed ? 'Muted' : 'Mute')}</Toggle>)
    const btn = container.querySelector('button')!
    expect(btn.textContent).toBe('Mute')

    fireEvent.click(btn)

    expect(btn.textContent).toBe('Muted')
  })

  it('follows a controlled pressed state', () => {
    const { container, rerender } = render(<Toggle pressed>{(pressed) => String(pressed)}</Toggle>)
    expect(container.querySelector('button')?.textContent).toBe('true')

    rerender(<Toggle pressed={false}>{(pressed) => String(pressed)}</Toggle>)

    expect(container.querySelector('button')?.textContent).toBe('false')
  })

  it('hands the element it returns to asChild', () => {
    const { container } = render(
      <Toggle asChild defaultPressed>
        {(pressed) => <a href="#bold">{pressed ? 'On' : 'Off'}</a>}
      </Toggle>,
    )
    const link = container.querySelector('a')!

    expect(link.textContent).toBe('On')
    expect(link.getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelector('button')).toBeNull()
  })
})
