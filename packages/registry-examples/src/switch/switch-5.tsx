'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import { Moon, Sun } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [dark, setDark] = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch
          checked={dark}
          checkedIndicator={<Moon />}
          id="theme-switch"
          indicator={<Sun />}
          onCheckedChange={setDark}
        />
        <Label htmlFor="theme-switch">Dark theme: {dark ? 'on' : 'off'}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch defaultChecked disabled id="sync-switch" />
        <Label htmlFor="sync-switch">Sync (managed by your organisation)</Label>
      </div>
    </div>
  )
}
