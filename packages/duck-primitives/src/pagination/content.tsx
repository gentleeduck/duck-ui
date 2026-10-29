import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { IPagination } from './pagination.types'

const CONTENT_NAME = 'PaginationContent'

const PaginationContent = React.forwardRef<HTMLUListElement, IPagination.IContentProps>(
  (props: IPagination.IScoped<IPagination.IContentProps>, forwardedRef) => {
    const { __scopePagination: _, ...contentProps } = props
    return <Primitive.ul data-slot="pagination-content" {...contentProps} ref={forwardedRef} />
  },
)

PaginationContent.displayName = CONTENT_NAME

export { PaginationContent }
