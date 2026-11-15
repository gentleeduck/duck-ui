'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import { Input } from '@gentleduck/registry-ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@gentleduck/registry-ui/table'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

const data: Payment[] = [
  {
    amount: 316,
    email: 'ken99@example.com',
    id: 'm5gr84i9',
    status: 'success',
  },
  {
    amount: 242,
    email: 'Abe45@example.com',
    id: '3u1reuv4',
    status: 'success',
  },
  {
    amount: 837,
    email: 'Monserrat44@example.com',
    id: 'derv1ws0',
    status: 'processing',
  },
  {
    amount: 874,
    email: 'Silas22@example.com',
    id: '5kma53ae',
    status: 'success',
  },
  {
    amount: 721,
    email: 'carmella@example.com',
    id: 'bhqecj4p',
    status: 'failed',
  },
]

export type Payment = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    id: 'select',
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => <div className="capitalize">{row.getValue('status')}</div>,
    header: 'Status',
  },
  {
    accessorKey: 'email',
    cell: ({ row }) => <div className="text-sm lowercase">{row.getValue('email')}</div>,
    header: ({ column }) => {
      return (
        <Button
          className="text-sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          size={'sm'}
          variant="ghost">
          Email
          <ArrowUpDown />
        </Button>
      )
    },
  },
  {
    accessorKey: 'amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))

      const formatted = new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency',
      }).format(amount)

      return <div className="text-end font-medium text-sm">{formatted}</div>
    },
    header: () => <div className="text-end">Amount</div>,
  },
  {
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="ms-auto h-8 w-8 p-0" size={'sm'} variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-[170px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableHiding: false,
    id: 'actions',
  },
]

export default function Demo() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      sorting,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          className="max-w-sm"
          onChange={(event) => table.getColumn('email')?.setFilterValue(event.currentTarget.value)}
          placeholder="Filter emails..."
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="ms-auto text-sm" variant="outline">
              Columns <ChevronDown aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    className="capitalize"
                    key={column.id}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow data-state={row.getIsSelected() && 'selected'} key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={columns.length}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="outline">
            Previous
          </Button>
          <Button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} size="sm" variant="outline">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
