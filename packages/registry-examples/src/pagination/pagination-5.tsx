'use client'

import {
  Pagination,
  PaginationContent,
  PaginationFirstTrigger,
  PaginationItem,
  PaginationLastTrigger,
  PaginationNextTrigger,
  PaginationPages,
  PaginationPreviousTrigger,
} from '@gentleduck/registry-ui/pagination'
import * as React from 'react'

export default function Demo() {
  const [page, setPage] = React.useState(6)

  return (
    <div className="flex flex-col items-center gap-3">
      <Pagination onPageChange={setPage} page={page} pageCount={20}>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirstTrigger />
          </PaginationItem>
          <PaginationItem>
            <PaginationPreviousTrigger />
          </PaginationItem>
          <PaginationPages />
          <PaginationItem>
            <PaginationNextTrigger />
          </PaginationItem>
          <PaginationItem>
            <PaginationLastTrigger />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="text-muted-foreground text-sm">Page {page} of 20</p>
    </div>
  )
}
