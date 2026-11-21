'use client'

import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <ToggleGroup aria-label="Status filters" rovingFocus={false} type="multiple" variant="outline">
        <ToggleGroupItem value="open">Open</ToggleGroupItem>
        <ToggleGroupItem value="closed">Closed</ToggleGroupItem>
        <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup aria-label="Sort" defaultValue="new" loop={false} type="single" variant="outline">
        <ToggleGroupItem value="new">Newest</ToggleGroupItem>
        <ToggleGroupItem value="old">Oldest</ToggleGroupItem>
        <ToggleGroupItem value="top">Top</ToggleGroupItem>
      </ToggleGroup>
      <p className="text-muted-foreground text-sm">
        The first makes each item a Tab stop. The second stops the arrows at either end.
      </p>
    </div>
  )
}
