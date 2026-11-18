'use client'

import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [shown, setShown] = React.useState(false)

  return (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="toggle-password">Password</Label>
      <div className="flex gap-2">
        <Input autoComplete="current-password" id="toggle-password" type={shown ? 'text' : 'password'} />
        <Toggle aria-label="Show password" onPressedChange={setShown} pressed={shown} variant="outline">
          {shown ? <EyeOff /> : <Eye />}
        </Toggle>
      </div>
    </div>
  )
}
