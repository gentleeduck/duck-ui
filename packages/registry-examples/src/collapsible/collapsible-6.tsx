'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import * as React from 'react'

export default function Demo() {
  const [unlocked, setUnlocked] = React.useState(false)

  return (
    <div className="flex w-[350px] flex-col gap-3">
      <label className="flex items-center gap-2 text-sm">
        <input checked={unlocked} onChange={(event) => setUnlocked(event.target.checked)} type="checkbox" />I have read
        the warning
      </label>
      <Collapsible>
        <CollapsibleTrigger asChild onClick={(event) => unlocked || event.preventDefault()}>
          <Button variant="outline">Advanced settings</Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 rounded-md border p-3 text-sm data-[state=closed]:hidden" forceMount>
          Kept in the page while closed, so a search of the page or a form inside still sees it.
        </CollapsibleContent>
      </Collapsible>
      <p className="text-muted-foreground text-sm">
        The trigger's onClick prevents the toggle until the box is ticked.
      </p>
    </div>
  )
}
