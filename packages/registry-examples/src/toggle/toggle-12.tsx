'use client'

import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Pin } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [pinned, setPinned] = React.useState(true)

  return (
    <div className="flex items-center gap-3">
      <Toggle aria-label="Pin to the sidebar" defaultPressed onPressedChange={setPinned} variant="outline">
        <Pin />
      </Toggle>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {pinned ? 'Pinned to the sidebar.' : 'Not pinned.'}
      </p>
    </div>
  )
}
