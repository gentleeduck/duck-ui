// From Ark UI, packages/react/src/components/pagination/tests/pagination.test.tsx. MIT, see src/__tests__/ark/LICENSE.

import { fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import * as Pagination from '../index'

freshDom()

function ComponentUnderTest(props: React.ComponentProps<typeof Pagination.Root>) {
  return (
    <Pagination.Root pageCount={10} {...props}>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous>Previous Page</Pagination.Previous>
        </Pagination.Item>
        <Pagination.Pages />
        <Pagination.Item>
          <Pagination.Next>Next Page</Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}

const current = () => document.querySelector('[aria-current="page"]')?.textContent

describe('Ark UI pagination', () => {
  it('has no axe violations, as buttons and as links', async () => {
    const buttons = render(<ComponentUnderTest />)
    const asButtons = await axe(buttons.container)
    buttons.unmount()
    const links = render(<ComponentUnderTest getPageHref={(page) => `/page/${page}`} />)

    expect(asButtons).toHaveNoViolations()
    expect(await axe(links.container)).toHaveNoViolations()
  })

  it('moves to the page clicked', () => {
    render(<ComponentUnderTest />)

    fireEvent.click(screen.getByText('2'))

    expect(current()).toBe('2')
  })

  it('moves to the next and the previous page from its triggers', () => {
    render(<ComponentUnderTest defaultPage={5} />)

    fireEvent.click(screen.getByText('Next Page'))
    const next = current()
    fireEvent.click(screen.getByText('Previous Page'))
    fireEvent.click(screen.getByText('Previous Page'))

    expect([next, current()]).toEqual(['6', '4'])
  })

  it('renders its pages and triggers as buttons by default, and as links given an address for each page', () => {
    const buttons = render(<ComponentUnderTest />)
    const asButtons = [screen.getByText('2').tagName, screen.getByText('Next Page').tagName]
    buttons.unmount()
    render(<ComponentUnderTest getPageHref={(page) => `/page/${page}`} />)

    expect([asButtons, screen.getByText('2').getAttribute('href'), screen.getByText('Next Page').tagName]).toEqual([
      ['BUTTON', 'BUTTON'],
      '/page/2',
      'A',
    ])
  })

  it('takes anchor attributes on a trigger rendered as a link', () => {
    render(
      <Pagination.Root pageCount={10} getPageHref={(page) => `/page/${page}`}>
        <Pagination.Next target="_blank" rel="noopener">
          Next Page
        </Pagination.Next>
      </Pagination.Root>,
    )
    const next = screen.getByText('Next Page')

    expect([next.getAttribute('target'), next.getAttribute('rel'), next.getAttribute('href')]).toEqual([
      '_blank',
      'noopener',
      '/page/2',
    ])
  })
})
