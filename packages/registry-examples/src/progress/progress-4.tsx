'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Progress } from '@gentleduck/registry-ui/progress'
import * as React from 'react'

const FILES = 8

export default function Demo() {
  const [uploaded, setUploaded] = React.useState(3)
  const labelId = React.useId()

  return (
    <div className="flex w-[60%] flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium" id={labelId}>
          Uploading files
        </span>
        <span aria-hidden="true" className="text-muted-foreground tabular-nums">
          {uploaded} of {FILES}
        </span>
      </div>
      <Progress
        aria-labelledby={labelId}
        className="*:data-[state=complete]:bg-emerald-600"
        getValueLabel={(value, max) => `${value} of ${max} files`}
        max={FILES}
        value={uploaded}
      />
      <div className="flex gap-2">
        <Button disabled={uploaded === FILES} onClick={() => setUploaded((count) => count + 1)} size="sm">
          Upload next
        </Button>
        <Button onClick={() => setUploaded(0)} size="sm" variant="outline">
          Start over
        </Button>
      </div>
    </div>
  )
}
