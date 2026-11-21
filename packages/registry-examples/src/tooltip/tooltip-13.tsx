'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider delayDuration={300} disableHoverableContent skipDelayDuration={800}>
      <div className="flex items-center gap-2">
        {['Bold', 'Italic', 'Underline'].map((mark) => (
          <Tooltip key={mark}>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline">
                {mark[0]}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{mark}</TooltipContent>
          </Tooltip>
        ))}
        <Tooltip defaultOpen disableHoverableContent={false}>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              ?
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open from the start, and hoverable unlike the others</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
