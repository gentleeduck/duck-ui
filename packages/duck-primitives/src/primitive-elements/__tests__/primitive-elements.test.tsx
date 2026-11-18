import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { Primitive } from '../primitive-elements'

describe('Primitive', () => {
  it('renders a div', () => {
    const { container } = render(<Primitive.div>content</Primitive.div>)
    expect(container.querySelector('div')?.textContent).toBe('content')
  })

  it('renders a button', () => {
    const { container } = render(<Primitive.button type="button">click</Primitive.button>)
    expect(container.querySelector('button')).not.toBeNull()
  })

  it('renders a span', () => {
    const { container } = render(<Primitive.span>text</Primitive.span>)
    expect(container.querySelector('span')).not.toBeNull()
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Primitive.div ref={ref}>ref test</Primitive.div>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('supports asChild to render a different element', () => {
    const { container } = render(
      <Primitive.div asChild>
        <span className="custom">via slot</span>
      </Primitive.div>,
    )
    expect(container.querySelector('span.custom')?.textContent).toBe('via slot')
    // Should NOT render a div wrapper when asChild is used
    expect(container.querySelector('div')).toBeNull()
  })

  it('passes props through', () => {
    const { container } = render(<Primitive.div data-testid="test" className="my-class" />)
    const el = container.querySelector('[data-testid="test"]')!
    expect(el.className).toContain('my-class')
  })

  it('renders nav element', () => {
    const { container } = render(<Primitive.nav aria-label="main">nav content</Primitive.nav>)
    expect(container.querySelector('nav')).not.toBeNull()
  })
})
