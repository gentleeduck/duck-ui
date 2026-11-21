'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Kept in the page</Button>
        </TooltipTrigger>
        <TooltipContent
          className="transition-opacity data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0"
          forceMount>
          forceMount keeps the tooltip mounted, so its own transition fades it.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
