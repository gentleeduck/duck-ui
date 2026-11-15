'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    return (
      <div className="relative w-full overflow-auto" dir={direction}>
        <table className={cn('w-full caption-bottom text-sm', className)} data-slot="table" ref={ref} {...props} />
      </div>
    )
  },
)
Table.displayName = 'Table'

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead className={cn('[&_tr]:border-b', className)} data-slot="table-header" ref={ref} {...props} />
  ),
)
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} data-slot="table-body" ref={ref} {...props} />
  ),
)
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      data-slot="table-footer"
      ref={ref}
      {...props}
    />
  ),
)
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)}
      data-slot="table-row"
      ref={ref}
      {...props}
    />
  ),
)
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, scope = 'col', ...props }, ref) => (
    <th
      className={cn(
        'px-4 py-2 text-start align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pe-0 [&:has([type=checkbox])]:pe-0',
        className,
      )}
      data-slot="table-head"
      ref={ref}
      scope={scope}
      {...props}
    />
  ),
)
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pe-0 [&:has([type=checkbox])]:pe-0', className)}
      data-slot="table-cell"
      ref={ref}
      {...props}
    />
  ),
)
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      data-slot="table-caption"
      ref={ref}
      {...props}
    />
  ),
)
TableCaption.displayName = 'TableCaption'

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
