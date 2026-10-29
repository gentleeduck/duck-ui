import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { IPagination } from './pagination.types'

const ELLIPSIS_NAME = 'PaginationEllipsis'

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, IPagination.IEllipsisProps>(
  ({ children, ...ellipsisProps }, forwardedRef) => (
    <Primitive.span data-slot="pagination-ellipsis" {...ellipsisProps} ref={forwardedRef}>
      {children ?? '…'}
    </Primitive.span>
  ),
)

PaginationEllipsis.displayName = ELLIPSIS_NAME

export { PaginationEllipsis }
