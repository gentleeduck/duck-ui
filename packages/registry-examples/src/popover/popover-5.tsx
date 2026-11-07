'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'
import { Settings } from 'lucide-react'

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:ring-2 data-[state=open]:ring-ring">
          <Settings className="me-2 h-4 w-4" />
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <PopoverTitle>Preferences</PopoverTitle>
          <PopoverDescription>The trigger stays active while this is open.</PopoverDescription>
        </div>
      </PopoverContent>
    </Popover>
  )
}
