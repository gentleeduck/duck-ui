import { PaginationEllipsis } from './ellipsis'
import { PaginationItem } from './item'
import { PaginationPage } from './page'
import { usePaginationContext } from './pagination'
import type { IPagination } from './pagination.types'
import { getPaginationRange } from './range'

const PAGES_NAME = 'PaginationPages'

function PaginationPages(props: IPagination.IScoped<IPagination.IPagesProps>) {
  const { children, ...scope } = props
  const context = usePaginationContext(PAGES_NAME, scope.__scopePagination)
  const items = getPaginationRange(context.page, context.pageCount, context.siblingCount, context.boundaryCount)

  if (children) return children(items)

  return items.map((item) => (
    <PaginationItem key={item}>
      {typeof item === 'number' ? <PaginationPage value={item} {...scope} /> : <PaginationEllipsis />}
    </PaginationItem>
  ))
}

export { PaginationPages }
