```tsx title="components/table-1.tsx"
// import from your project: import Demo from '@/components/table-1'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@gentleduck/registry-ui/table'

const invoices = [
  {
    invoice: 'INV101',
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Unpaid',
    totalAmount: '$180.00',
  },
  {
    invoice: 'INV102',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    totalAmount: '$720.00',
  },
  {
    invoice: 'INV103',
    paymentMethod: 'PayPal',
    paymentStatus: 'Pending',
    totalAmount: '$95.00',
  },
  {
    invoice: 'INV104',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid',
    totalAmount: '$1,250.00',
  },
  {
    invoice: 'INV105',
    paymentMethod: 'Debit Card',
    paymentStatus: 'Unpaid',
    totalAmount: '$430.00',
  },
  {
    invoice: 'INV106',
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Pending',
    totalAmount: '$610.00',
  },
  {
    invoice: 'INV107',
    paymentMethod: 'Google Pay',
    paymentStatus: 'Paid',
    totalAmount: '$390.00',
  },
]

export default function Demo() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice} className="[&_td]:py-2">
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-end">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow className="[&_td]:py-2">
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-end">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
```

## Philosophy

HTML tables are semantically powerful but visually bland. Our Table components add consistent styling while preserving the native table structure  -  `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`  -  because screen readers depend on these elements for data navigation. For interactive features like sorting and filtering, see Data Table.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add table
```

Install the following dependencies:

```bash
npm install @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
```

```tsx showLineNumbers
<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-end">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-end">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Examples

### Row selection

A `Checkbox` in the first column selects a row, and one in the header selects them all, reading `'indeterminate'` while only some are. `data-state="selected"` on a `TableRow` shades it. A head or cell holding a checkbox drops its end padding, whether the checkbox is a native input or carries `role="checkbox"`.

```tsx title="components/table-4.tsx"
// import from your project: import Demo from '@/components/table-4'
'use client'

import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@gentleduck/registry-ui/table'
import * as React from 'react'

const members = [
  { email: 'ada@example.com', name: 'Ada Lovelace', role: 'Owner' },
  { email: 'alan@example.com', name: 'Alan Turing', role: 'Admin' },
  { email: 'grace@example.com', name: 'Grace Hopper', role: 'Member' },
  { email: 'linus@example.com', name: 'Linus Pauling', role: 'Member' },
]

export default function Demo() {
  const [selected, setSelected] = React.useState<string[]>([])
  const all = selected.length === members.length ? true : selected.length > 0 ? 'indeterminate' : false

  return (
    <div className="flex w-full flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                aria-label="Select all"
                checked={all}
                onCheckedChange={(checked) => setSelected(checked === true ? members.map((m) => m.email) : [])}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isSelected = selected.includes(member.email)
            return (
              <TableRow data-state={isSelected ? 'selected' : undefined} key={member.email}>
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${member.name}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      setSelected((emails) =>
                        checked === true ? [...emails, member.email] : emails.filter((email) => email !== member.email),
                      )
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {selected.length} of {members.length} selected.
      </p>
    </div>
  )
}
```

### Sorting and row headers

`aria-sort` on the active `TableHead` tells a screen reader which column orders the rows and which way. The first cell of each row is a `TableHead` with `scope="row"`, so a reader announces the city before each value.

```tsx title="components/table-5.tsx"
// import from your project: import Demo from '@/components/table-5'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@gentleduck/registry-ui/table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import * as React from 'react'

type Key = 'city' | 'population' | 'area'

const cities = [
  { area: 1572, city: 'London', population: 8_866_000 },
  { area: 105, city: 'Paris', population: 2_103_000 },
  { area: 891, city: 'Berlin', population: 3_878_000 },
  { area: 1302, city: 'Madrid', population: 3_332_000 },
]

const COLUMNS: { key: Key; label: string; numeric?: boolean }[] = [
  { key: 'city', label: 'City' },
  { key: 'population', label: 'Population', numeric: true },
  { key: 'area', label: 'Area (km2)', numeric: true },
]

export default function Demo() {
  const [sort, setSort] = React.useState<{ key: Key; direction: 'ascending' | 'descending' }>({
    direction: 'ascending',
    key: 'city',
  })
  const rows = [...cities].sort((a, b) => {
    const order = a[sort.key] < b[sort.key] ? -1 : a[sort.key] > b[sort.key] ? 1 : 0
    return sort.direction === 'ascending' ? order : -order
  })

  return (
    <Table>
      <TableCaption>European capitals. Sort by any column.</TableCaption>
      <TableHeader>
        <TableRow>
          {COLUMNS.map(({ key, label, numeric }) => {
            const active = sort.key === key
            const Icon = !active ? ArrowUpDown : sort.direction === 'ascending' ? ArrowUp : ArrowDown
            return (
              <TableHead
                aria-sort={active ? sort.direction : 'none'}
                className={numeric ? 'text-end' : undefined}
                key={key}>
                <Button
                  className="-mx-3"
                  onClick={() =>
                    setSort({
                      direction: active && sort.direction === 'ascending' ? 'descending' : 'ascending',
                      key,
                    })
                  }
                  size="sm"
                  variant="ghost">
                  {label}
                  <Icon aria-hidden="true" />
                </Button>
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.city}>
            <TableHead className="font-medium text-foreground" scope="row">
              {row.city}
            </TableHead>
            <TableCell className="text-end tabular-nums">{row.population.toLocaleString('en')}</TableCell>
            <TableCell className="text-end tabular-nums">{row.area.toLocaleString('en')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Data Table

You can use the `<Table />` component to build more complex data tables. Combine it with
[TanStack Table](https://tanstack.com/table) to add sorting, filtering, and pagination.

See the [Data Table](/duck-ui/components/data-table) documentation for a full guide.

You can also see data-table examples in the [Blocks Library](/blocks).

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the table follows it: cells align to the start side. No `dir` prop or `rtl:` classes needed.

```tsx title="components/table-2.tsx"
// import from your project: import Demo from '@/components/table-2'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@gentleduck/registry-ui/table'

const invoices = [
  {
    invoice: 'INV101',
    paymentMethod: 'Apple Pay',
    paymentStatus: 'غير مدفوع',
    totalAmount: '$180.00',
  },
  {
    invoice: 'INV102',
    paymentMethod: 'بطاقة ائتمان',
    paymentStatus: 'مدفوع',
    totalAmount: '$720.00',
  },
  {
    invoice: 'INV103',
    paymentMethod: 'PayPal',
    paymentStatus: 'قيد الانتظار',
    totalAmount: '$95.00',
  },
  {
    invoice: 'INV104',
    paymentMethod: 'تحويل بنكي',
    paymentStatus: 'مدفوع',
    totalAmount: '$1,250.00',
  },
  {
    invoice: 'INV105',
    paymentMethod: 'بطاقة خصم',
    paymentStatus: 'غير مدفوع',
    totalAmount: '$430.00',
  },
  {
    invoice: 'INV106',
    paymentMethod: 'Apple Pay',
    paymentStatus: 'قيد الانتظار',
    totalAmount: '$610.00',
  },
  {
    invoice: 'INV107',
    paymentMethod: 'Google Pay',
    paymentStatus: 'مدفوع',
    totalAmount: '$390.00',
  },
]

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Table>
        <TableCaption>{'قائمة بأحدث فواتيرك.'}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{'الفاتورة'}</TableHead>
            <TableHead>{'الحالة'}</TableHead>
            <TableHead>{'طريقة الدفع'}</TableHead>
            <TableHead className="text-end">{'المبلغ'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice} className="[&_td]:py-2">
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-end">{invoice.totalAmount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="[&_td]:py-2">
            <TableCell colSpan={3}>{'الإجمالي'}</TableCell>
            <TableCell className="text-end">$3,675.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionTable` and `MotionTableRow` for staggered entrance animations powered by [motion](https://motion.dev). The table uses a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition, and each row staggers by 50ms via the `index` prop.

```tsx title="components/table-3.tsx"
// import from your project: import Demo from '@/components/table-3'
import {
  MotionTable,
  MotionTableRow,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
} from '@gentleduck/registry-ui/table'

const invoices = [
  { invoice: 'INV101', paymentMethod: 'Apple Pay', paymentStatus: 'Unpaid', totalAmount: '$180.00' },
  { invoice: 'INV102', paymentMethod: 'Credit Card', paymentStatus: 'Paid', totalAmount: '$720.00' },
  { invoice: 'INV103', paymentMethod: 'PayPal', paymentStatus: 'Pending', totalAmount: '$95.00' },
  { invoice: 'INV104', paymentMethod: 'Bank Transfer', paymentStatus: 'Paid', totalAmount: '$1,250.00' },
  { invoice: 'INV105', paymentMethod: 'Debit Card', paymentStatus: 'Unpaid', totalAmount: '$430.00' },
  { invoice: 'INV106', paymentMethod: 'Apple Pay', paymentStatus: 'Pending', totalAmount: '$610.00' },
  { invoice: 'INV107', paymentMethod: 'Google Pay', paymentStatus: 'Paid', totalAmount: '$390.00' },
]

export default function Demo() {
  return (
    <MotionTable>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <MotionTableRow index={0}>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-end">Amount</TableHead>
        </MotionTableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice, i) => (
          <MotionTableRow key={invoice.invoice} className="[&_td]:py-2" index={i + 1}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-end">{invoice.totalAmount}</TableCell>
          </MotionTableRow>
        ))}
      </TableBody>
      <TableFooter>
        <MotionTableRow className="[&_td]:py-2" index={invoices.length + 1}>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-end">$2,500.00</TableCell>
        </MotionTableRow>
      </TableFooter>
    </MotionTable>
  )
}
```

}>
  Requires the `motion` package. Use `MotionTable` instead of `Table` and `MotionTableRow` instead of `TableRow`. All other sub-components stay the same. The regular components are perfectly fine - this is an optional enhancement.

## API Reference

### Table

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional CSS class names |
| `children` | `React.ReactNode` | - | Table content (`TableHeader`, `TableBody`, `TableFooter`, `TableCaption`) |
| `...props` | `React.HTMLProps<HTMLTableElement>` | - | Additional props to spread to the table element |

### TableHeader

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `children` | `React.ReactNode` | - | Header rows |
| `...props` | `React.HTMLProps<HTMLTableSectionElement>` | - | Additional props to spread to the thead element |

### TableBody

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `children` | `React.ReactNode` | - | Body rows |
| `...props` | `React.HTMLProps<HTMLTableSectionElement>` | - | Additional props to spread to the tbody element |

### TableFooter

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `children` | `React.ReactNode` | - | Footer rows |
| `...props` | `React.HTMLProps<HTMLTableSectionElement>` | - | Additional props to spread to the tfoot element |

### TableRow

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `children` | `React.ReactNode` | - | Row cells (`TableHead` or `TableCell`) |
| `...props` | `React.HTMLProps<HTMLTableRowElement>` | - | Additional props to spread to the tr element |

### TableHead

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scope` | `string` | `'col'` | HTML `scope` attribute. `'row'` makes the head a row header |
| `className` | `string` | - | Additional CSS class names |
| `children` | `React.ReactNode` | - | Header cell content |
| `...props` | `React.ThHTMLAttributes<HTMLTableCellElement>` | - | Additional props to spread to the th element |

### TableCell

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `children` | `React.ReactNode` | - | Cell content |
| `...props` | `React.TdHTMLAttributes<HTMLTableCellElement>` | - | Additional props to spread to the td element |

### TableCaption

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `children` | `React.ReactNode` | - | Caption text |
| `...props` | `React.HTMLProps<HTMLTableCaptionElement>` | - | Additional props to spread to the caption element |

### MotionTable

`scaleIn` entrance (fade, scale, and blur) with `springBouncy` transition on mount. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `TableProps` | - | All props from `Table` are supported |

### MotionTableRow

Staggered `scaleIn` entrance (fade, scale, and blur) with `springBouncy` transition. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | `0` | Stagger delay index (50ms per index) for entrance animation |
| `...props` | `TableRowProps` | - | All props from `TableRow` are supported |