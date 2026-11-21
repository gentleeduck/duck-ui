'use client'

import { HoverCardTrigger, MotionHoverCard, MotionHoverCardContent } from '@gentleduck/registry-ui/hover-card'

const SIDES = ['top', 'right', 'bottom', 'left'] as const

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {SIDES.map((side) => (
        <MotionHoverCard key={side} openDelay={150} placement={side}>
          <HoverCardTrigger variant="outline">{side}</HoverCardTrigger>
          <MotionHoverCardContent className="w-48">Opens on the {side} and animates from it.</MotionHoverCardContent>
        </MotionHoverCard>
      ))}
    </div>
  )
}
