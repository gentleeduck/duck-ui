'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { toast } from 'sonner'

const POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const

export default function Demo() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {POSITIONS.map((position) => (
        <Button
          key={position}
          onClick={() => toast(`Shown ${position.replace('-', ' ')}`, { position })}
          size="sm"
          variant="outline">
          {position}
        </Button>
      ))}
    </div>
  )
}
