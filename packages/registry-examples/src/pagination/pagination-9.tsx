'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationWrapper,
} from '@gentleduck/registry-ui/pagination'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <Pagination>
        <PaginationContent>
          {(['sm', 'icon', 'default'] as const).map((size, index) => (
            <PaginationItem key={size}>
              <PaginationLink href="#" isActive={index === 1} size={size}>
                {size}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
      </Pagination>
      <PaginationWrapper content={{ className: 'gap-4' }} item={{ className: 'rounded-full' }} />
    </div>
  )
}
