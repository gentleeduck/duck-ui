'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNextTrigger,
  PaginationPage,
  PaginationPages,
  PaginationPreviousTrigger,
} from '@gentleduck/registry-ui/pagination'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function Demo() {
  return (
    <Pagination aria-label="Search results" boundaryCount={0} defaultPage={9} pageCount={40} siblingCount={2}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPreviousTrigger aria-label="Newer results" className="w-auto gap-1 px-3">
            <ArrowLeft aria-hidden="true" className="rtl:rotate-180" />
            Newer
          </PaginationPreviousTrigger>
        </PaginationItem>
        <PaginationPages>
          {(items) =>
            items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === 'number' ? (
                  <PaginationPage aria-label={`Results page ${item}`} value={item} />
                ) : (
                  <PaginationEllipsis text={item === 'start-ellipsis' ? 'Newer pages' : 'Older pages'} />
                )}
              </PaginationItem>
            ))
          }
        </PaginationPages>
        <PaginationItem>
          <PaginationNextTrigger aria-label="Older results" className="w-auto gap-1 px-3">
            Older
            <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
          </PaginationNextTrigger>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
