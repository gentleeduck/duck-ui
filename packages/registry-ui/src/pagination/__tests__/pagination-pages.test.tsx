import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import {
  Pagination,
  PaginationContent,
  PaginationFirstTrigger,
  PaginationLastTrigger,
  PaginationNextTrigger,
  PaginationPages,
  PaginationPreviousTrigger,
} from '../pagination'

const count = (html: string, text: string) => html.split(text).length - 1

function Pager(props: React.ComponentProps<typeof Pagination>) {
  return (
    <Pagination {...props}>
      <PaginationContent>
        <PaginationFirstTrigger />
        <PaginationPreviousTrigger />
        <PaginationPages />
        <PaginationNextTrigger />
        <PaginationLastTrigger />
      </PaginationContent>
    </Pagination>
  )
}

describe('registry-ui pagination pages', () => {
  test('draws the pages around the current one, marked, with an ellipsis for each gap', () => {
    const html = renderToStaticMarkup(<Pager pageCount={20} defaultPage={10} />)

    expect(count(html, 'data-slot="pagination-page"')).toBe(5)
    expect(count(html, 'data-slot="pagination-ellipsis"')).toBe(2)
    expect(html).toMatch(/aria-current="page"[^>]*>10</)
  })

  test('sizes an ellipsis like a page, so the triggers keep their place', () => {
    const html = renderToStaticMarkup(<Pager pageCount={20} defaultPage={10} />)
    const sized = (slot: string) =>
      Array.from(html.matchAll(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`, 'g')), ([tag]) => tag.includes('size-9'))

    expect(sized('pagination-page')).toEqual([true, true, true, true, true])
    expect(sized('pagination-ellipsis')).toEqual([true, true])
  })

  test('disables the triggers that would leave the range and labels each one', () => {
    const html = renderToStaticMarkup(<Pager pageCount={5} />)
    const trigger = (label: string) => html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? ''

    expect(trigger('First page')).toContain(' disabled=""')
    expect(trigger('Previous page')).toContain(' disabled=""')
    expect(trigger('Next page')).not.toContain(' disabled=""')
    expect(trigger('Last page')).not.toContain(' disabled=""')
    expect(html).toContain('lucide-chevrons-left')
    expect(html).toContain('lucide-chevrons-right')
  })

  test('renders links when the root gives each page an address', () => {
    const html = renderToStaticMarkup(<Pager pageCount={5} getPageHref={(page) => `/posts?page=${page}`} />)

    expect(html).toContain('href="/posts?page=2"')
    expect(html).toMatch(
      /<a[^>]*aria-disabled="true"[^>]*aria-label="Previous page"|<a[^>]*aria-label="Previous page"[^>]*aria-disabled="true"/,
    )
    expect(html).not.toContain('<button')
  })

  test('takes children in place of a trigger icon', () => {
    const html = renderToStaticMarkup(
      <Pagination pageCount={3}>
        <PaginationNextTrigger>Next</PaginationNextTrigger>
      </Pagination>,
    )

    expect(html).toContain('>Next</button>')
    expect(html).not.toContain('lucide-chevron-right')
  })
})
