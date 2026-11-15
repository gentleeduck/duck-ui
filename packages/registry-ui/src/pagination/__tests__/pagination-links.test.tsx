import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import {
  MotionPagination,
  MotionPaginationLink,
  MotionPaginationNext,
  MotionPaginationPrevious,
} from '../motion-pagination'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../pagination'

afterEach(cleanup)

const classes = (element: Element) => element.className.split(' ')

describe('registry-ui pagination links', () => {
  test('marks the current page and outlines it, leaving the others ghost', () => {
    const ref = React.createRef<HTMLAnchorElement>()
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#2" isActive ref={ref}>
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )
    const current = screen.getByRole('link', { name: '2' })

    expect(ref.current).toBe(current as HTMLAnchorElement)
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(classes(current)).toContain('border')
    expect(screen.getByRole('link', { name: '1' }).hasAttribute('aria-current')).toBe(false)
    expect(classes(screen.getByRole('link', { name: '1' }))).toContain('hover:bg-accent')
    expect(classes(current)).toContain('size-9')
  })

  test('labels previous and next for a screen reader, shows the text given, and mirrors the chevrons', () => {
    render(
      <>
        <PaginationPrevious href="#back" text="Back" />
        <PaginationNext href="#on" text="On" />
      </>,
    )
    const previous = screen.getByRole('link', { name: 'Go to previous page' })
    const next = screen.getByRole('link', { name: 'Go to next page' })

    expect(previous.textContent).toBe('Back')
    expect(next.textContent).toBe('On')
    expect(previous.getAttribute('data-slot')).toBe('pagination-previous')
    expect(next.getAttribute('data-slot')).toBe('pagination-next')
    expect(classes(previous)).not.toContain('size-9')
    expect(previous.querySelector('svg')?.getAttribute('class')).toContain('rtl:rotate-180')
    expect(next.querySelector('svg')?.getAttribute('class')).toContain('rtl:rotate-180')
  })

  test('names the ellipsis as the pages it stands for', () => {
    render(<PaginationEllipsis text="Pages 4 to 9" />)

    expect(screen.getByRole('img', { name: 'Pages 4 to 9' }).querySelector('svg')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })
})

describe('registry-ui motion pagination', () => {
  test('scales the nav and each link in, staggered by index, and keeps the index off the link', () => {
    render(
      <MotionPagination>
        <PaginationContent>
          <PaginationItem>
            <MotionPaginationPrevious href="#back" index={0} />
          </PaginationItem>
          <PaginationItem>
            <MotionPaginationLink href="#3" index={1} isActive>
              3
            </MotionPaginationLink>
          </PaginationItem>
          <PaginationItem>
            <MotionPaginationLink href="#4">4</MotionPaginationLink>
          </PaginationItem>
          <PaginationItem>
            <MotionPaginationNext href="#on" index={2} />
          </PaginationItem>
        </PaginationContent>
      </MotionPagination>,
    )
    const nav = screen.getByRole('navigation', { name: 'pagination' })
    const current = screen.getByRole('link', { name: '3' })

    expect((nav.parentElement as HTMLElement).style.transform).toContain('scale(')
    expect(current.style.transform).toBe('scaleX(0.95) scaleY(0.95)')
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.hasAttribute('index')).toBe(false)
    expect(screen.getByRole('link', { name: '4' }).hasAttribute('aria-current')).toBe(false)
    expect(screen.getByRole('link', { name: 'Go to previous page' }).textContent).toBe('Previous')
    expect(screen.getByRole('link', { name: 'Go to next page' }).textContent).toBe('Next')
  })
})
