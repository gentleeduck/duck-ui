import * as React from 'react'
import { PaginationControl } from './control'
import { usePaginationContext } from './pagination'
import type { IPagination } from './pagination.types'

function createTrigger(name: string, slot: string, label: string, step: (page: number, pageCount: number) => number) {
  const Trigger = React.forwardRef<HTMLElement, IPagination.ITriggerProps>(
    (props: IPagination.IScoped<IPagination.ITriggerProps>, forwardedRef) => {
      const { disabled, ...triggerProps } = props
      const { page, pageCount } = usePaginationContext(name, props.__scopePagination)
      const target = Math.min(Math.max(step(page, pageCount), 1), pageCount)

      return (
        <PaginationControl
          data-slot={slot}
          aria-label={label}
          {...triggerProps}
          name={name}
          target={target}
          disabled={disabled || target === page}
          ref={forwardedRef}
        />
      )
    },
  )

  Trigger.displayName = name
  return Trigger
}

const PaginationFirst = createTrigger('PaginationFirst', 'pagination-first', 'First page', () => 1)
const PaginationPrevious = createTrigger(
  'PaginationPrevious',
  'pagination-previous',
  'Previous page',
  (page) => page - 1,
)
const PaginationNext = createTrigger('PaginationNext', 'pagination-next', 'Next page', (page) => page + 1)
const PaginationLast = createTrigger('PaginationLast', 'pagination-last', 'Last page', (_, pageCount) => pageCount)

export { PaginationFirst, PaginationLast, PaginationNext, PaginationPrevious }
