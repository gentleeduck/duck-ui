'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNextTrigger,
  PaginationPages,
  PaginationPreviousTrigger,
} from '@gentleduck/registry-ui/pagination'

export default function Demo() {
  return (
    <Pagination getPageHref={(page) => `#results-page-${page}`} pageCount={12}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPreviousTrigger />
        </PaginationItem>
        <PaginationPages />
        <PaginationItem>
          <PaginationNextTrigger />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
