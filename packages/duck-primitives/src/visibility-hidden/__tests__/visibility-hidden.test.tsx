import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import * as VisuallyHiddenModule from '..'
import { VisuallyHidden } from '../visibility-hidden'

describe('VisuallyHidden', () => {
  it('renders with data-slot="visually-hidden"', () => {
    const { container } = render(<VisuallyHidden>Hidden text</VisuallyHidden>)
    expect(container.querySelector('[data-slot="visually-hidden"]')).not.toBeNull()
  })

  it('leaves the data-slot to the component it slots onto, such as a dialog title it hides', () => {
    const Title = (props: React.ComponentProps<'h2'>) => <h2 data-slot="dialog-title" {...props} />
    const { container } = render(
      <VisuallyHidden asChild>
        <Title>Settings</Title>
      </VisuallyHidden>,
    )
    const title = container.querySelector('h2')!
    expect([title.getAttribute('data-slot'), title.style.position]).toEqual(['dialog-title', 'absolute'])
  })

  it('takes a data-slot it is given over its own', () => {
    const { container } = render(<VisuallyHidden data-slot="label">Hidden text</VisuallyHidden>)
    expect(container.querySelector('span')?.getAttribute('data-slot')).toBe('label')
  })

  it('is exported as Root too, and names itself VisuallyHidden', () => {
    expect([VisuallyHiddenModule.Root === VisuallyHidden, VisuallyHidden.displayName]).toEqual([true, 'VisuallyHidden'])
  })

  it('renders as a span', () => {
    const { container } = render(<VisuallyHidden>Hidden text</VisuallyHidden>)
    expect(container.querySelector('span')).not.toBeNull()
  })

  it('hides its content with the clipping pattern Radix and Bootstrap use, kept on one line', () => {
    const { container } = render(<VisuallyHidden>Hidden text</VisuallyHidden>)
    expect(container.querySelector('span')?.style.cssText).toBe(
      'position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; word-wrap: normal;',
    )
  })

  it('lets a style it is given replace a hidden one, such as fixed in place of absolute', () => {
    const { container } = render(<VisuallyHidden style={{ position: 'fixed' }}>text</VisuallyHidden>)
    expect(container.querySelector('span')?.style.position).toBe('fixed')
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
