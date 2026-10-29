import * as React from 'react'
import { PaginationControl } from './control'
import { usePaginationContext } from './pagination'
import type { IPagination } from './pagination.types'

const PAGE_NAME = 'PaginationPage'

const PaginationPage = React.forwardRef<HTMLElement, IPagination.IPageProps>(
  (props: IPagination.IScoped<IPagination.IPageProps>, forwardedRef) => {
    const { value, children, ...pageProps } = props
    const selected = usePaginationContext(PAGE_NAME, props.__scopePagination).page === value

    return (
      <PaginationControl
        data-slot="pagination-page"
        aria-current={selected ? 'page' : undefined}
        data-selected={selected ? '' : undefined}
        {...pageProps}
        name={PAGE_NAME}
        target={value}
        ref={forwardedRef}>
        {children ?? value}
      </PaginationControl>
    )
  },
)

PaginationPage.displayName = PAGE_NAME

export { PaginationPage }
