import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { Progress } from '../progress'

describe('Progress', () => {
  it('renders with data-slot="progress"', () => {
    const { container } = render(<Progress value={50} />)
    expect(container.querySelector('[data-slot="progress"]')).not.toBeNull()
  })

  it('has role="progressbar"', () => {
    const { container } = render(<Progress value={50} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el).not.toBeNull()
  })

  it('sets aria-valuemin, aria-valuemax, aria-valuenow', () => {
    const { container } = render(<Progress value={30} max={100} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuemin')).toBe('0')
    expect(el.getAttribute('aria-valuemax')).toBe('100')
    expect(el.getAttribute('aria-valuenow')).toBe('30')
  })

  it('defaults max to 100', () => {
    const { container } = render(<Progress value={50} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuemax')).toBe('100')
  })

  it('computes aria-valuetext as percentage', () => {
    const { container } = render(<Progress value={75} max={100} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuetext')).toBe('75%')
  })

  it('uses custom getValueLabel', () => {
    const { container } = render(<Progress value={3} max={10} getValueLabel={(v, m) => `${v} of ${m} steps`} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuetext')).toBe('3 of 10 steps')
  })

  it('sets data-state="loading" when value < max', () => {
    const { container } = render(<Progress value={50} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('data-state')).toBe('loading')
  })

  it('sets data-state="complete" when value === max', () => {
    const { container } = render(<Progress value={100} max={100} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('data-state')).toBe('complete')
  })

  it('sets data-state="indeterminate" when value is null', () => {
    const { container } = render(<Progress value={null} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('data-state')).toBe('indeterminate')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Progress ref={ref} value={50} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('value=0 is loading, not indeterminate', () => {
    const { container } = render(<Progress value={0} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('data-state')).toBe('loading')
    expect(el.getAttribute('aria-valuenow')).toBe('0')
  })

  it('handles custom max value', () => {
    const { container } = render(<Progress value={5} max={10} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuemax')).toBe('10')
    expect(el.getAttribute('aria-valuenow')).toBe('5')
  })

  it('sets data-value and data-max attributes', () => {
    const { container } = render(<Progress value={30} max={100} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('data-value')).toBe('30')
    expect(el.getAttribute('data-max')).toBe('100')
  })

  it('indeterminate has no aria-valuenow', () => {
    const { container } = render(<Progress value={null} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuenow')).toBeNull()
  })

  it('passes className', () => {
    const { container } = render(<Progress value={50} className="my-progress" />)
    expect(container.querySelector('.my-progress')).not.toBeNull()
  })

  it('sets dir attribute', () => {
    const { container } = render(<Progress value={50} dir="rtl" />)
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('dir')).toBe('rtl')
  })
})
