'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Pinned tip</Button>
        </TooltipTrigger>
        <TooltipContent
          align="start"
          alignOffset={4}
          avoidCollisions
          collisionPadding={12}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          sideOffset={10}>
          Escape and a press outside leave this open.
          <TooltipArrow height={8} width={16} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
