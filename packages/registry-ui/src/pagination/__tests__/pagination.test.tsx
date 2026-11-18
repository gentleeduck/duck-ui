import { describe, expect, test } from 'bun:test'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PaginationWrapper } from '../pagination'

describe('registry-ui pagination', () => {
  test('PaginationWrapper prefers provided button icons over the default chevrons', () => {
    const html = renderToStaticMarkup(
      <PaginationWrapper
        left={{ icon: <span data-icon="left">L</span> }}
        maxLeft={{ icon: <span data-icon="max-left">ML</span> }}
        right={{ icon: <span data-icon="right">R</span> }}
        maxRight={{ icon: <span data-icon="max-right">MR</span> }}
      />,
    )

    expect(html).toContain('data-icon="left"')
    expect(html).toContain('data-icon="max-left"')
    expect(html).toContain('data-icon="right"')
    expect(html).toContain('data-icon="max-right"')
    expect(html).not.toContain('lucide-chevron-left')
    expect(html).not.toContain('lucide-chevron-right')
    expect(html).not.toContain('lucide-chevrons-left')
    expect(html).not.toContain('lucide-chevrons-right')
  })

  test('PaginationWrapper still renders default chevrons when icons are not provided', () => {
    const html = renderToStaticMarkup(<PaginationWrapper />)

    expect(html).toContain('lucide-chevron-left')
    expect(html).toContain('lucide-chevron-right')
    expect(html).toContain('lucide-chevrons-left')
    expect(html).toContain('lucide-chevrons-right')
  })

  test('PaginationWrapper applies a wrapper dir override to the nav and mirrors the default icons', () => {
    const html = renderToStaticMarkup(<PaginationWrapper wrapper={{ dir: 'rtl' }} />)

    expect(html).toContain('dir="rtl"')
    expect(html.indexOf('lucide-chevrons-right')).toBeLessThan(html.indexOf('lucide-chevrons-left'))
  })
})
