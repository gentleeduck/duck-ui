'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { Monitor, Moon, Sun } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [theme, setTheme] = React.useState('')

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={setTheme} value={theme}>
        <SelectTrigger aria-label="Theme" className="w-[180px]">
          <SelectValue placeholder="Follow the system" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <span className="flex items-center gap-2">
              <Sun aria-hidden="true" className="size-4" />
              Light
            </span>
          </SelectItem>
          <SelectItem value="dark">
            <span className="flex items-center gap-2">
              <Moon aria-hidden="true" className="size-4" />
              Dark
            </span>
          </SelectItem>
          <SelectItem value="contrast">
            <span className="flex items-center gap-2">
              <Monitor aria-hidden="true" className="size-4" />
              High contrast
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
      <Button disabled={theme === ''} onClick={() => setTheme('')} size="sm" variant="outline">
        Clear
      </Button>
    </div>
  )
}
