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
