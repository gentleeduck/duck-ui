import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { IPagination } from './pagination.types'

const ITEM_NAME = 'PaginationItem'

const PaginationItem = React.forwardRef<HTMLLIElement, IPagination.IItemProps>(
  (props: IPagination.IScoped<IPagination.IItemProps>, forwardedRef) => {
    const { __scopePagination: _, ...itemProps } = props
    return <Primitive.li data-slot="pagination-item" {...itemProps} ref={forwardedRef} />
  },
)

PaginationItem.displayName = ITEM_NAME

export { PaginationItem }
