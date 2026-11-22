import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { Badge } from '../badge'

afterEach(cleanup)

describe('registry-ui Badge', () => {
  test('renders a span in the primary colours, with its own class', () => {
    render(<Badge className="ms-2">New</Badge>)

    const badge = screen.getByText('New')
    expect(badge.tagName).toBe('SPAN')
    expect(badge.getAttribute('data-slot')).toBe('badge')
    expect(badge.className.split(' ')).toEqual(
      expect.arrayContaining(['bg-primary', 'text-primary-foreground', 'ms-2']),
    )
  })

  test('with asChild, draws its styles onto the element it is given', () => {
    render(
      <Badge asChild variant="secondary">
        <a href="/changelog">Changelog</a>
      </Badge>,
    )

    const link = screen.getByRole('link', { name: 'Changelog' })
    expect(link.getAttribute('data-slot')).toBe('badge')
    expect(link.className.split(' ')).toEqual(expect.arrayContaining(['bg-secondary', 'text-secondary-foreground']))
  })
})
