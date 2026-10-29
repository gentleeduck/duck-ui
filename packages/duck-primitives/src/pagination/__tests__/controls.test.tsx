import { afterEach, describe, expect, it, mock } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import * as Pagination from '..'

function Pager(props: React.ComponentProps<typeof Pagination.Root>) {
  return (
    <Pagination.Root {...props}>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.First />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Previous />
        </Pagination.Item>
        <Pagination.Pages />
        <Pagination.Item>
          <Pagination.Next />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Last />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}

afterEach(cleanup)

const current = () => document.querySelector('[aria-current="page"]')?.textContent

describe('Pagination pages', () => {
  it('marks the page it starts on', () => {
    render(<Pager pageCount={5} defaultPage={3} />)

    const page = screen.getByRole('button', { name: '3' })
    expect(page.getAttribute('aria-current')).toBe('page')
    expect(page.hasAttribute('data-selected')).toBe(true)
    expect(screen.getByRole('button', { name: '2' }).hasAttribute('aria-current')).toBe(false)
  })

  it('starts on the first page', () => {
    render(<Pager pageCount={5} />)

    expect(current()).toBe('1')
  })

  it('moves to a clicked page and reports it', () => {
    const onPageChange = mock()
    render(<Pager pageCount={5} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: '4' }))

    expect(current()).toBe('4')
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('folds the pages it cannot fit into ellipses', () => {
    const { container } = render(<Pager pageCount={20} defaultPage={10} />)

    const ellipses = Array.from(
      container.querySelectorAll('[data-slot="pagination-ellipsis"]'),
      (gap) => gap.textContent,
    )
    expect(ellipses).toEqual(['\u2026', '\u2026'])
    expect(screen.getByRole('button', { name: '20' })).toBeDefined()
  })

  it('draws the window the root asks for', () => {
    const { container } = render(<Pager pageCount={20} defaultPage={10} siblingCount={0} boundaryCount={2} />)

    const pages = Array.from(container.querySelectorAll('[data-slot="pagination-page"]'), (page) => page.textContent)
    expect(pages).toEqual(['1', '2', '10', '19', '20'])
  })

  it('hands the range to a render function', () => {
    const { container } = render(
      <Pagination.Root pageCount={10} defaultPage={5}>
        <Pagination.Pages>{(items) => items.join(' ')}</Pagination.Pages>
      </Pagination.Root>,
    )

    expect(container.textContent).toBe('1 start-ellipsis 4 5 6 end-ellipsis 10')
  })
})

describe('Pagination triggers', () => {
  it('steps forward and back', () => {
    render(<Pager pageCount={5} defaultPage={3} />)

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(current()).toBe('4')

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(current()).toBe('2')
  })

  it('jumps to either end', () => {
    render(<Pager pageCount={5} defaultPage={3} />)

    fireEvent.click(screen.getByRole('button', { name: 'Last page' }))
    expect(current()).toBe('5')

    fireEvent.click(screen.getByRole('button', { name: 'First page' }))
    expect(current()).toBe('1')
  })

  it('disables the triggers that would leave the range', () => {
    render(<Pager pageCount={5} />)

    const first = screen.getByRole('button', { name: 'First page' })
    expect(first.hasAttribute('disabled')).toBe(true)
    expect(first.hasAttribute('data-disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Previous page' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Last page' }))

    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Last page' }).hasAttribute('disabled')).toBe(true)
  })

  it('stays inert until it knows how many pages there are', () => {
    render(<Pager />)

    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(true)
    expect(current()).toBe('1')
  })

  it('draws no pages and disables every trigger with no pages', () => {
    const { container } = render(<Pager pageCount={0} />)

    expect(container.querySelectorAll('[data-slot="pagination-page"]')).toHaveLength(0)
    for (const name of ['First page', 'Previous page', 'Next page', 'Last page']) {
      expect(screen.getByRole('button', { name }).hasAttribute('disabled')).toBe(true)
    }
  })

  it('marks each part with its slot', () => {
    const { container } = render(<Pager pageCount={5} />)

    const slot = (name: string) => screen.getByRole('button', { name }).getAttribute('data-slot')
    expect(container.querySelector('ul')?.getAttribute('data-slot')).toBe('pagination-content')
    expect(container.querySelector('li')?.getAttribute('data-slot')).toBe('pagination-item')
    expect(['First page', 'Previous page', 'Next page', 'Last page'].map(slot)).toEqual([
      'pagination-first',
      'pagination-previous',
      'pagination-next',
      'pagination-last',
    ])
  })

  it('hands each part its element through a ref', () => {
    const content = React.createRef<HTMLUListElement>()
    const item = React.createRef<HTMLLIElement>()
    const page = React.createRef<HTMLElement>()
    const next = React.createRef<HTMLElement>()
    const ellipsis = React.createRef<HTMLSpanElement>()
    render(
      <Pagination.Root pageCount={3}>
        <Pagination.Content ref={content}>
          <Pagination.Item ref={item}>
            <Pagination.Page ref={page} value={2} />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Next ref={next} />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Ellipsis ref={ellipsis} />
          </Pagination.Item>
        </Pagination.Content>
      </Pagination.Root>,
    )

    expect([
      content.current?.tagName,
      item.current?.tagName,
      page.current?.textContent,
      next.current?.getAttribute('aria-label'),
      ellipsis.current?.tagName,
    ]).toEqual(['UL', 'LI', '2', 'Next page', 'SPAN'])
  })

  it('does not submit the form it sits in', () => {
    const onSubmit = mock((event: React.FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Pager pageCount={5} />
      </form>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))

    expect(current()).toBe('2')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('takes a label in place of its own', () => {
    render(
      <Pagination.Root pageCount={3}>
        <Pagination.Next aria-label="Suivant" />
      </Pagination.Root>,
    )

    expect(screen.getByRole('button', { name: 'Suivant' })).toBeDefined()
  })

  it('does not move when the handler prevents it', () => {
    const onPageChange = mock()
    render(
      <Pagination.Root pageCount={3} onPageChange={onPageChange}>
        <Pagination.Next onClick={(event) => event.preventDefault()} />
      </Pagination.Root>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))

    expect(onPageChange).not.toHaveBeenCalled()
  })
})

describe('Pagination outside the range', () => {
  it('disables a page past either end, staying where it is and reporting nothing', () => {
    const onPageChange = mock()
    render(
      <Pagination.Root defaultPage={2} onPageChange={onPageChange} pageCount={3}>
        <Pagination.Page value={0} />
        <Pagination.Page value={4} />
      </Pagination.Root>,
    )

    fireEvent.click(screen.getByRole('button', { name: '0' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))

    expect(onPageChange.mock.calls).toEqual([])
    expect(screen.getByRole('button', { name: '4' }).hasAttribute('disabled')).toBe(true)
  })

  it('gives a page link past either end no address', () => {
    render(
      <Pagination.Root pageCount={3} getPageHref={(page) => `/posts?page=${page}`}>
        <Pagination.Page value={0} />
        <Pagination.Page value={4} />
      </Pagination.Root>,
    )

    for (const name of ['0', '4']) {
      const link = screen.getByRole('link', { name })
      expect([link.hasAttribute('href'), link.getAttribute('aria-disabled')]).toEqual([false, 'true'])
    }
  })
})

describe('Pagination controlled', () => {
  it('asks for the page and waits for it', () => {
    const onPageChange = mock()
    render(<Pager pageCount={5} page={2} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))

    expect(onPageChange).toHaveBeenCalledWith(3)
    expect(current()).toBe('2')
  })

  it('follows the page it is given', () => {
    const { rerender } = render(<Pager pageCount={5} page={2} />)

    rerender(<Pager pageCount={5} page={4} />)

    expect(current()).toBe('4')
  })

  it('shows the first page for a page before it', () => {
    render(<Pager pageCount={5} page={0} />)

    expect(current()).toBe('1')
    expect(screen.getByRole('button', { name: 'Previous page' }).hasAttribute('disabled')).toBe(true)
  })

  it('shows the last page when the count shrinks below the page', () => {
    render(<Pager pageCount={3} page={7} />)

    expect(current()).toBe('3')
    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(true)
  })
})

describe('Pagination links', () => {
  const href = (page: number) => `/posts?page=${page}`

  it('renders every control as a link to its page', () => {
    render(<Pager pageCount={5} defaultPage={3} getPageHref={href} />)

    expect(screen.getByRole('link', { name: '4' }).getAttribute('href')).toBe('/posts?page=4')
    expect(screen.getByRole('link', { name: 'Next page' }).getAttribute('href')).toBe('/posts?page=4')
    expect(screen.getByRole('link', { name: 'First page' }).getAttribute('href')).toBe('/posts?page=1')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('keeps a link that would leave the range a link, with no address and no effect', () => {
    render(<Pager pageCount={5} getPageHref={href} />)

    const previous = screen.getByRole('link', { name: 'Previous page' })
    expect(previous.hasAttribute('href')).toBe(false)
    expect(previous.getAttribute('aria-disabled')).toBe('true')
    expect(previous.hasAttribute('data-disabled')).toBe(true)
    expect(fireEvent.click(previous)).toBe(false)
  })

  it('moves to the page a link points at', () => {
    render(<Pager pageCount={5} getPageHref={href} />)

    fireEvent.click(screen.getByRole('link', { name: '3' }))

    expect(current()).toBe('3')
  })

  it('runs no click handler on a link with nowhere to go, as a disabled button runs none', () => {
    const onClick = mock()
    render(
      <Pagination.Root pageCount={3} getPageHref={href}>
        <Pagination.Previous onClick={onClick} />
      </Pagination.Root>,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Previous page' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('runs no click handler of a slotted link with nowhere to go', () => {
    const onClick = mock()
    render(
      <Pagination.Root pageCount={3} getPageHref={href}>
        <Pagination.Previous asChild>
          <a href="/posts?page=0" onClick={onClick}>
            Back
          </a>
        </Pagination.Previous>
      </Pagination.Root>,
    )

    expect(fireEvent.click(screen.getByRole('link', { name: 'Previous page' }))).toBe(false)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('stays on its page when a click opens the link somewhere else', () => {
    render(<Pager pageCount={5} getPageHref={href} />)

    for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']) {
      fireEvent.click(screen.getByRole('link', { name: '3' }), { [key]: true })
    }

    expect(current()).toBe('1')
    fireEvent.click(screen.getByRole('link', { name: '3' }))
    expect(current()).toBe('3')
  })

  it('moves when a client router prevents the browser from following the link', () => {
    const onPageChange = mock()
    render(
      <Pagination.Root pageCount={5} getPageHref={href} onPageChange={onPageChange}>
        <Pagination.Pages>
          {(items) =>
            items.map((item) =>
              typeof item === 'number' ? (
                <Pagination.Page key={item} value={item} onClick={(event) => event.preventDefault()} />
              ) : null,
            )
          }
        </Pagination.Pages>
      </Pagination.Root>,
    )

    fireEvent.click(screen.getByRole('link', { name: '3' }))

    expect(current()).toBe('3')
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})

describe('Pagination scope', () => {
  const usePaginationScope = Pagination.createPaginationScope()

  function ScopedPager() {
    const scope = usePaginationScope(undefined)
    return (
      <Pagination.Root {...scope} pageCount={5} defaultPage={2}>
        <Pagination.Root pageCount={3} defaultPage={3}>
          <Pagination.Content {...scope}>
            <Pagination.Item {...scope}>
              <Pagination.Next {...scope} />
            </Pagination.Item>
            <Pagination.Pages {...scope} />
          </Pagination.Content>
        </Pagination.Root>
      </Pagination.Root>
    )
  }

  it('reads the root its scope names over a nearer one', () => {
    const { container } = render(<ScopedPager />)

    const pages = Array.from(container.querySelectorAll('[data-slot="pagination-page"]'), (page) => page.textContent)
    expect(pages).toEqual(['1', '2', '3', '4', '5'])
    expect(current()).toBe('2')
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(current()).toBe('3')
    expect(container.innerHTML).not.toContain('scope')
  })
})
