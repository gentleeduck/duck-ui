import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { RovingFocusGroup, RovingFocusGroupItem } from '../index'

describe('RovingFocusGroup', () => {
  it('renders children', () => {
    const { container } = render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>
          <button>A</button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem>
          <button>B</button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    expect(container.querySelectorAll('button').length).toBe(2)
  })

  it('renders group as a div by default', () => {
    const { container } = render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>
          <button>A</button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    expect(container.querySelector('div')).not.toBeNull()
  })

  it('items render with tabindex', () => {
    const { container } = render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>
          <button>A</button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem>
          <button>B</button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    const items = container.querySelectorAll('span[tabindex]')
    // Items start with tabindex=-1 (roving tabindex pattern)
    expect(items.length).toBeGreaterThan(0)
    const tabindexes = Array.from(items).map((item) => item.getAttribute('tabindex'))
    expect(tabindexes.every((t) => t === '0' || t === '-1')).toBe(true)
  })

  it('forwards ref to group', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <RovingFocusGroup ref={ref}>
        <RovingFocusGroupItem>
          <button>A</button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts orientation prop', () => {
    expect(() =>
      render(
        <RovingFocusGroup orientation="horizontal">
          <RovingFocusGroupItem>
            <button>A</button>
          </RovingFocusGroupItem>
        </RovingFocusGroup>,
      ),
    ).not.toThrow()
  })
})
