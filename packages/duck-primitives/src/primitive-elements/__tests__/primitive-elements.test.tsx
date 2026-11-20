import { render } from '@testing-library/react'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import * as PrimitiveModule from '..'
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

  it('keeps asChild to itself, so a primitive it slots onto renders its own element', () => {
    const { container } = render(
      <Primitive.div asChild>
        <Primitive.button type="button">Save</Primitive.button>
      </Primitive.div>,
    )

    expect(container.innerHTML).toBe('<button type="button">Save</button>')
  })

  it('passes props through', () => {
    const { container } = render(<Primitive.div data-testid="test" className="my-class" />)
    const el = container.querySelector('[data-testid="test"]')!
    expect(el.className).toContain('my-class')
  })

  it('renders every element Radix renders, select included, each named for React DevTools', () => {
    const { container } = render(
      <>
        {Object.entries(Primitive).map(([node, Node]) => (
          <Node key={node} />
        ))}
      </>,
    )

    const nodes = 'a button div form h2 h3 img input label li nav ol p select span svg ul'.split(' ')
    expect([...container.children].map((child) => child.tagName.toLowerCase())).toEqual(nodes)
    expect(Object.values(Primitive).map((Node) => Node.displayName)).toEqual(nodes.map((node) => `Primitive.${node}`))
  })

  it('names its element in the error a child it cannot slot onto throws', () => {
    expect(() => render(<Primitive.button asChild>text</Primitive.button>)).toThrow(
      'Primitive.button failed to slot onto its children.',
    )
  })

  it('is exported as Root too, as Radix exports it', () => {
    expect(PrimitiveModule.Root).toBe(Primitive)
  })

  it('renders nav element', () => {
    const { container } = render(<Primitive.nav aria-label="main">nav content</Primitive.nav>)
    expect(container.querySelector('nav')).not.toBeNull()
  })
})

describe('Primitive on the page and the server', () => {
  it('marks the window it loads in', () => {
    expect((window as unknown as Record<symbol, boolean>)[Symbol.for('gentleduck-ui')]).toBe(true)
  })

  it('loads and renders where there is no window', async () => {
    const serverCopy = '../primitive-elements.tsx?server'
    const page = globalThis.window
    Reflect.deleteProperty(globalThis, 'window')
    const server: typeof import('../primitive-elements') = await import(serverCopy).finally(() => {
      globalThis.window = page
    })

    expect(renderToString(<server.Primitive.span>server</server.Primitive.span>)).toBe('<span>server</span>')
  })
})
