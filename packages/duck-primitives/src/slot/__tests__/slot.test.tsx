import { describe, expect, it, mock } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { Slot, Slottable } from '../slot'

describe('Slot', () => {
  it('renders children directly when no asChild', () => {
    const { container } = render(
      <Slot>
        <span>hello</span>
      </Slot>,
    )
    expect(container.querySelector('span')?.textContent).toBe('hello')
  })

  it('merges className from slot and child', () => {
    const { container } = render(
      <Slot className="slot-class">
        <span className="child-class">text</span>
      </Slot>,
    )
    const span = container.querySelector('span')!
    expect(span.className).toContain('slot-class')
    expect(span.className).toContain('child-class')
  })

  it('composes event handlers from slot and child', () => {
    const slotClick = mock(() => {})
    const childClick = mock(() => {})
    const { container } = render(
      <Slot onClick={slotClick}>
        <button onClick={childClick}>click me</button>
      </Slot>,
    )
    container.querySelector('button')!.click()
    expect(childClick).toHaveBeenCalledTimes(1)
    expect(slotClick).toHaveBeenCalledTimes(1)
  })

  it('merges style objects', () => {
    const { container } = render(
      <Slot style={{ color: 'red' }}>
        <div style={{ fontSize: '14px' }}>styled</div>
      </Slot>,
    )
    const div = container.querySelector('div')!
    expect(div.style.color).toBe('red')
    expect(div.style.fontSize).toBe('14px')
  })

  it('forwards ref to the child element', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Slot ref={ref}>
        <button>ref target</button>
      </Slot>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.textContent).toBe('ref target')
  })
})

describe('Slottable', () => {
  it('renders Slottable children through the Slot', () => {
    const { container } = render(
      <Slot>
        <Slottable>
          <a href="/test">link</a>
        </Slottable>
      </Slot>,
    )
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/test')
  })
})

describe('Slot (edge cases)', () => {
  it('passes data-* attributes to child', () => {
    const { container } = render(
      <Slot data-testid="slot-data">
        <div>content</div>
      </Slot>,
    )
    expect(container.querySelector('[data-testid="slot-data"]')).not.toBeNull()
  })

  it('passes aria-* attributes to child', () => {
    const { container } = render(
      <Slot aria-label="accessible">
        <button>labeled</button>
      </Slot>,
    )
    expect(container.querySelector('[aria-label="accessible"]')).not.toBeNull()
  })

  it('child style takes precedence over slot style for same properties', () => {
    const { container } = render(
      <Slot style={{ color: 'red', fontSize: '12px' }}>
        <div style={{ color: 'blue' }}>styled</div>
      </Slot>,
    )
    const div = container.querySelector('div')!
    // child style overrides slot style for same prop
    expect(div.style.color).toBe('blue')
    // slot style preserved when not overridden
    expect(div.style.fontSize).toBe('12px')
  })

  it('child event handlers run before slot handlers', () => {
    const order: string[] = []
    const { container } = render(
      <Slot onClick={() => order.push('slot')}>
        <button onClick={() => order.push('child')}>click</button>
      </Slot>,
    )
    container.querySelector('button')!.click()
    expect(order[0]).toBe('child')
    expect(order[1]).toBe('slot')
  })

  it('handles single text child', () => {
    const { container } = render(
      <Slot>
        <span>just text</span>
      </Slot>,
    )
    expect(container.textContent).toBe('just text')
  })
})

describe('Slot (security)', () => {
  it('drops dangerouslySetInnerHTML supplied by a Slot child', () => {
    const { container } = render(
      <Slot>
        <div dangerouslySetInnerHTML={{ __html: '<img src=x onerror=alert(1)>' }} />
      </Slot>,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(container.innerHTML).not.toContain('onerror')
  })

  it('still merges legitimate onClick and className when child is sanitized', () => {
    const slotClick = mock(() => {})
    const childClick = mock(() => {})
    const { container } = render(
      <Slot className="slot-class" onClick={slotClick}>
        <button className="child-class" onClick={childClick}>
          safe
        </button>
      </Slot>,
    )
    const button = container.querySelector('button')!
    expect(button.className).toContain('slot-class')
    expect(button.className).toContain('child-class')
    button.click()
    expect(childClick).toHaveBeenCalledTimes(1)
    expect(slotClick).toHaveBeenCalledTimes(1)
  })
})
