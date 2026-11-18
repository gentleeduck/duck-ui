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
