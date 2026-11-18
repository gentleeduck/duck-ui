'use client'

import { PaginationWrapper } from '@gentleduck/registry-ui/pagination'
import * as React from 'react'

const pageCount = 8

export default function Demo() {
  const [page, setPage] = React.useState(1)
  const first = page === 1
  const last = page === pageCount

  return (
    <div className="flex items-center gap-4">
      <p className="text-muted-foreground text-sm">
        Page {page} of {pageCount}
      </p>
      <PaginationWrapper
        left={{ disabled: first, onClick: () => setPage(page - 1) }}
        maxLeft={{ disabled: first, onClick: () => setPage(1) }}
        maxRight={{ disabled: last, onClick: () => setPage(pageCount) }}
        right={{ disabled: last, onClick: () => setPage(page + 1) }}
        wrapper={{ 'aria-label': 'Invoices' }}
      />
    </div>
  )
}
