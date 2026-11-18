'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import * as React from 'react'

export default function Demo() {
  const [title, setTitle] = React.useState('')
  const [published, setPublished] = React.useState('')
  const ready = title.trim() !== ''

  return (
    <TooltipProvider>
      <form
        className="flex w-full max-w-sm flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (ready) setPublished(title.trim())
        }}>
        <Label htmlFor="post-title">Title</Label>
        <div className="flex gap-2">
          <Input id="post-title" onChange={(event) => setTitle(event.target.value)} value={title} />
          <Tooltip disabled={ready}>
            <TooltipTrigger asChild>
              {/* aria-disabled, not disabled: a disabled button takes no focus or hover, so it could never explain itself. */}
              <Button aria-disabled={!ready || undefined} className="aria-disabled:opacity-50" type="submit">
                Publish
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add a title before you publish.</TooltipContent>
          </Tooltip>
        </div>
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {published ? `Published "${published}".` : ''}
        </p>
      </form>
    </TooltipProvider>
  )
}
