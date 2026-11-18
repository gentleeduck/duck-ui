import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { FocusScope } from '../focus-scope'

describe('FocusScope', () => {
  it('renders children', () => {
    const { container } = render(
      <FocusScope>
        <button>Inside</button>
      </FocusScope>,
    )
    expect(container.querySelector('button')?.textContent).toBe('Inside')
  })

  it('renders as a div', () => {
    const { container } = render(
      <FocusScope>
        <input type="text" />
      </FocusScope>,
    )
    expect(container.querySelector('div')).not.toBeNull()
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <FocusScope ref={ref}>
        <span>content</span>
      </FocusScope>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('passes className through', () => {
    const { container } = render(
      <FocusScope className="scope-class">
        <span>content</span>
      </FocusScope>,
    )
    expect(container.querySelector('.scope-class')).not.toBeNull()
  })

  it('accepts loop prop without error', () => {
    expect(() =>
      render(
        <FocusScope loop>
          <button>A</button>
          <button>B</button>
        </FocusScope>,
      ),
    ).not.toThrow()
  })

  it('accepts trapped prop without error', () => {
    expect(() =>
      render(
        <FocusScope trapped>
          <button>Trapped</button>
        </FocusScope>,
      ),
    ).not.toThrow()
  })
})
