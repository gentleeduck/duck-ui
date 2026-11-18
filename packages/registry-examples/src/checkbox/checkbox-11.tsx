'use client'

import { Checkbox, type CheckedState } from '@gentleduck/registry-ui/checkbox'
import { Label } from '@gentleduck/registry-ui/label'
import { Check, Minus } from 'lucide-react'
import * as React from 'react'

const permissions = [
  { id: 'permission-read', label: 'Read' },
  { id: 'permission-write', label: 'Write' },
  { id: 'permission-delete', label: 'Delete' },
]

export default function Demo() {
  const [granted, setGranted] = React.useState(['permission-read'])
  const all: CheckedState = granted.length === permissions.length ? true : granted.length > 0 ? 'indeterminate' : false

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 border-b pb-3">
        <Checkbox
          checked={all}
          checkedIndicator={<Check />}
          id="permission-all"
          indeterminateIndicator={<Minus />}
          onCheckedChange={(next) => setGranted(next ? permissions.map((permission) => permission.id) : [])}
        />
        <Label className="font-medium" htmlFor="permission-all">
          All permissions
        </Label>
      </div>
      <div className="flex flex-col gap-2 ps-6">
        {permissions.map((permission) => (
          <div className="flex items-center gap-3" key={permission.id}>
            <Checkbox
              checked={granted.includes(permission.id)}
              id={permission.id}
              onCheckedChange={(next) =>
                setGranted((previous) =>
                  next ? [...previous, permission.id] : previous.filter((id) => id !== permission.id),
                )
              }
            />
            <Label htmlFor={permission.id}>{permission.label}</Label>
          </div>
        ))}
      </div>
    </div>
  )
}
