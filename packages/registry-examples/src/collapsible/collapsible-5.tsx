'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import { ChevronsUpDown } from 'lucide-react'

export default function Demo() {
  return (
    <Collapsible className="w-80 space-y-2" defaultOpen>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Release notes</h4>
        <CollapsibleTrigger asChild>
          <Button size="sm" variant="ghost">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle release notes</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-1 text-muted-foreground text-sm">
        <p>Command takes a fuzzy filter and a result limit.</p>
        <p>Calendar pages every month it shows.</p>
      </CollapsibleContent>
    </Collapsible>
  )
}
