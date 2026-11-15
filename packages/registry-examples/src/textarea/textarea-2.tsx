'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'
import * as React from 'react'

const LIMIT = 140

export default function Demo() {
  const [text, setText] = React.useState('')

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="textarea-count">Status</Label>
      <Textarea
        aria-describedby="textarea-count-left"
        id="textarea-count"
        maxLength={LIMIT}
        onChange={(event) => setText(event.target.value)}
        placeholder="What are you working on?"
        value={text}
      />
      <p className="text-end text-muted-foreground text-sm tabular-nums" id="textarea-count-left">
        {LIMIT - text.length} characters left
      </p>
    </div>
  )
}
