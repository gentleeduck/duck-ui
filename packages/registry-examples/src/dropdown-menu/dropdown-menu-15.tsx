'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import * as React from 'react'

export default function Demo() {
  const [shown, setShown] = React.useState({ comments: true, history: false })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Panels</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="data-[state=closed]:hidden" forceMount>
        <DropdownMenuCheckboxItem
          checked={shown.comments}
          onCheckedChange={(comments) => setShown((value) => ({ ...value, comments }))}>
          Comments
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={shown.history}
          onCheckedChange={(history) => setShown((value) => ({ ...value, history }))}>
          History
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
