import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import { Popper, PopperAnchor, PopperContent } from '../index'

describe('Popper', () => {
  it('renders children', () => {
    const { container } = render(
      <Popper>
        <span data-testid="child">inside popper</span>
      </Popper>,
    )
    expect(container.querySelector('[data-testid="child"]')?.textContent).toBe('inside popper')
  })

  it('renders anchor with data-slot="popper-anchor"', () => {
    const { container } = render(
      <Popper>
        <PopperAnchor>
          <button>Anchor</button>
        </PopperAnchor>
      </Popper>,
    )
    expect(container.querySelector('[data-slot="popper-anchor"]')).not.toBeNull()
  })

  it('renders anchor as a div by default', () => {
    const { container } = render(
      <Popper>
        <PopperAnchor>anchor content</PopperAnchor>
      </Popper>,
    )
    expect(container.querySelector('div[data-slot="popper-anchor"]')).not.toBeNull()
  })

  it('anchor supports asChild', () => {
    const { container } = render(
      <Popper>
        <PopperAnchor asChild>
          <button>Anchor button</button>
        </PopperAnchor>
      </Popper>,
    )
    expect(container.querySelector('button')?.textContent).toBe('Anchor button')
  })

  it('anchor forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Popper>
        <PopperAnchor ref={ref}>anchor</PopperAnchor>
      </Popper>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('mirrors left and right sides in RTL', () => {
    const renderSide = (dir: 'ltr' | 'rtl', side: 'left' | 'right' | 'top') =>
      render(
        <DirectionProvider dir={dir}>
          <Popper>
            <PopperAnchor>anchor</PopperAnchor>
            <PopperContent dir={dir} side={side}>
              content
            </PopperContent>
          </Popper>
        </DirectionProvider>,
      )
    const cases = [
      ['ltr', 'right', 'right'],
      ['rtl', 'right', 'left'],
      ['rtl', 'left', 'right'],
      ['rtl', 'top', 'top'],
    ] as const
    for (const [dir, side, expected] of cases) {
      const { container, unmount } = renderSide(dir, side)
      expect(container.querySelector('[data-slot="popper-content"]')?.getAttribute('data-side')).toBe(expected)
      unmount()
    }
  })
})
