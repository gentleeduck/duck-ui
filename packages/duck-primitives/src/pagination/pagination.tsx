import * as React from 'react'
import { useDirection } from '../direction'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { useControllableState } from '../hooks/use-controllable-state'
import { createContextScope } from '../libs/create-context'
import { Primitive } from '../primitive-elements'
import type { IPagination } from './pagination.types'

const PAGINATION_NAME = 'Pagination'

const [createPaginationContext, createPaginationScope] = createContextScope(PAGINATION_NAME)

const [PaginationProvider, usePaginationContext] = createPaginationContext<IPagination.IContext>(PAGINATION_NAME)

const Pagination = React.forwardRef<HTMLElement, IPagination.IProps>(
  (props: IPagination.IScoped<IPagination.IProps>, forwardedRef) => {
    const {
      __scopePagination,
      dir,
      pageCount = 1,
      page: pageProp,
      defaultPage = 1,
      onPageChange,
      siblingCount = 1,
      boundaryCount = 1,
      getPageHref,
      ...paginationProps
    } = props
    const direction = useDirection(dir)
    const [requestedPage, setRequestedPage] = useControllableState({
      prop: pageProp,
      defaultProp: defaultPage,
      onChange: onPageChange,
      caller: PAGINATION_NAME,
    })
    const setPage = useCallbackRef((next: number) => {
      if (next >= 1 && next <= pageCount) setRequestedPage(next)
    })

    return (
      <PaginationProvider
        scope={__scopePagination}
        page={Math.min(Math.max(requestedPage, 1), pageCount)}
        pageCount={pageCount}
        siblingCount={siblingCount}
        boundaryCount={boundaryCount}
        setPage={setPage}
        getPageHref={getPageHref}>
        <Primitive.nav
          data-slot="pagination"
          dir={direction}
          {...paginationProps}
          aria-label={paginationProps['aria-label'] ?? 'pagination'}
          ref={forwardedRef}
        />
      </PaginationProvider>
    )
  },
)

Pagination.displayName = PAGINATION_NAME

export { createPaginationScope, Pagination, usePaginationContext }
