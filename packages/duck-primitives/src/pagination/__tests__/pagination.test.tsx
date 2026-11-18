import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { Pagination } from '../pagination'

describe('Pagination', () => {
  it('renders with data-slot="pagination"', () => {
    const { container } = render(<Pagination />)
    expect(container.querySelector('[data-slot="pagination"]')).not.toBeNull()
  })

  it('renders as a nav element', () => {
    const { container } = render(<Pagination />)
    expect(container.querySelector('nav')).not.toBeNull()
  })

  it('has default aria-label="pagination"', () => {
    const { container } = render(<Pagination />)
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('pagination')
  })

  it('accepts custom aria-label', () => {
    const { container } = render(<Pagination aria-label="Results pages" />)
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Results pages')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLElement>()
    render(<Pagination ref={ref} />)
    expect(ref.current?.tagName).toBe('NAV')
  })

  it('defaults to ltr direction', () => {
    const { container } = render(<Pagination />)
    expect(container.querySelector('nav')?.getAttribute('dir')).toBe('ltr')
  })

  it('accepts rtl direction', () => {
    const { container } = render(<Pagination dir="rtl" />)
    expect(container.querySelector('nav')?.getAttribute('dir')).toBe('rtl')
  })
})
