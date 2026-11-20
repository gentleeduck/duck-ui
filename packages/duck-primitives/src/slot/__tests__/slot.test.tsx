import { act, render } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSlot, createSlottable, Slot, Slottable } from '../slot'

describe('Slot', () => {
  it('renders children directly when no asChild', () => {
    const { container } = render(
      <Slot>
        <span>hello</span>
      </Slot>,
    )
    expect(container.querySelector('span')?.textContent).toBe('hello')
  })

  it('names itself after its owner, for React DevTools', () => {
    expect([createSlot('Menu.Item').displayName, createSlottable('Menu.Item').displayName]).toEqual([
      'Menu.Item.Slot',
      'Menu.Item.Slottable',
    ])
  })

  it('keeps a class set on the child alone as it is', () => {
    const { container } = render(
      <Slot>
        <span className="child-class">text</span>
      </Slot>,
    )
    expect(container.querySelector('span')?.getAttribute('class')).toBe('child-class')
  })

  it('hands the child its own ref when it has none of its own, so the child can read the ref object', () => {
    const own = React.createRef<HTMLButtonElement>()
    let received: unknown
    const Child = React.forwardRef<HTMLButtonElement>((_, ref) => {
      received = ref
      return <button ref={ref} type="button" />
    })
    render(
      <Slot>
        <Child ref={own} />
      </Slot>,
    )
    expect(received).toBe(own)
  })

  it('leaves a prop that only starts with on, such as onlyIcon, to the child', () => {
    let received: unknown
    function Probe({ onlyIcon }: { onlyIcon?: boolean }) {
      received = onlyIcon
      return null
    }
    render(
      <Slot {...{ onlyIcon: true }}>
        <Probe onlyIcon />
      </Slot>,
    )
    expect(received).toBe(true)
  })

  it('hands back what the child handler returns', () => {
    let returned: unknown
    function Probe({ onPick }: { onPick?: () => unknown }) {
      returned = onPick?.()
      return null
    }
    render(
      <Slot {...{ onPick: () => 'slot' }}>
        <Probe onPick={() => 'child'} />
      </Slot>,
    )
    expect(returned).toBe('child')
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

  it('joins conflicting classes as written, slot first, leaving the merge to the styled layer', () => {
    const { container } = render(
      <Slot className="px-2 text-sm">
        <span className="px-4">text</span>
      </Slot>,
    )
    expect(container.querySelector('span')?.className).toBe('px-2 text-sm px-4')
  })

  it('composes event handlers from slot and child', () => {
    const slotClick = vi.fn(() => {})
    const childClick = vi.fn(() => {})
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
  it('keeps the state inside its element when a child before it comes and goes', async () => {
    function Count() {
      const [count, setCount] = React.useState(0)
      return <button onClick={() => setCount(count + 1)}>{count}</button>
    }
    function Link({ icon }: { icon: boolean }) {
      return (
        <Slot>
          {icon && <i>icon</i>}
          <Slottable>
            <a href="/">
              <Count />
            </a>
          </Slottable>
        </Slot>
      )
    }
    const { container, rerender } = render(<Link icon />)

    await act(async () => container.querySelector('button')!.click())
    rerender(<Link icon={false} />)

    expect(container.querySelector('button')?.textContent).toBe('1')
  })

  it('lands on the first of two Slottables, rendering the second as it stands', () => {
    const { container } = render(
      <Slot className="slot">
        <Slottable>
          <a href="/a">A</a>
        </Slottable>
        <Slottable>
          <b>B</b>
        </Slottable>
      </Slot>,
    )
    expect(container.innerHTML).toBe('<a href="/a" class="slot">A<b>B</b></a>')
  })

  it('leaves a component marked with another library symbol where it stands', () => {
    const Marked = Object.assign(({ children }: { children: React.ReactNode }) => children, {
      __radixId: Symbol.for('radix.slottable'),
    })
    const { container } = render(
      <Slot className="slot">
        <Marked>
          <a href="/">link</a>
        </Marked>
      </Slot>,
    )
    expect(container.innerHTML).toBe('<a href="/">link</a>')
  })

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

  it('leaves out an aria-describedby the child sets to false', () => {
    const { container } = render(
      <Slot aria-describedby="tip">
        <button aria-describedby={false as unknown as string}>described</button>
      </Slot>,
    )
    expect(container.querySelector('button')?.getAttribute('aria-describedby')).toBe('tip')
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

describe('Slot (children it cannot slot onto)', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => errorSpy.mockRestore())

  it('throws for a 0 child, which a falsy count before `&&` leaves behind', () => {
    expect(() => render(<Slot>{0}</Slot>)).toThrow(/failed to slot onto its children/)
  })

  it('unwraps a lazy node only when its payload is a promise, so use is never handed anything else', () => {
    const resolved = { $$typeof: Symbol.for('react.lazy'), _init: () => 'text', _payload: { status: 'fulfilled' } }
    expect(() => render(<Slot>{resolved as unknown as React.ReactNode}</Slot>)).toThrow(
      /failed to slot onto its children/,
    )
  })

  it('leaves an object that only carries a promise as its payload to React, which refuses it', () => {
    const lookalike = { $$typeof: Symbol.for('react.context'), _payload: Promise.resolve(<a href="/">link</a>) }
    expect(() => render(<Slot>{lookalike as unknown as React.ReactNode}</Slot>)).toThrow(/Objects are not valid/)
  })

  it('hands a Fragment child no ref, which React refuses on a Fragment', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <Slot ref={ref}>
        <>
          <span>text</span>
        </>
      </Slot>,
    )
    expect(errorSpy).not.toHaveBeenCalled()
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
    const slotClick = vi.fn(() => {})
    const childClick = vi.fn(() => {})
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
