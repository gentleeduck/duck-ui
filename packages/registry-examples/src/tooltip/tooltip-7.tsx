'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  MotionTooltip,
  MotionTooltipContent,
  TooltipArrow,
  TooltipProvider,
  TooltipTrigger,
} from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider>
      <MotionTooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Share</Button>
        </TooltipTrigger>
        <MotionTooltipContent side="right">
          <p>Copies a link anyone can open</p>
          <TooltipArrow />
        </MotionTooltipContent>
      </MotionTooltip>
    </TooltipProvider>
  )
}
