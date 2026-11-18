'use client'

import { Slider } from '@gentleduck/registry-ui/slider'
import * as React from 'react'

const hour = (value: number | undefined) => `${String(value).padStart(2, '0')}:00`

export default function Demo() {
  const [hours, setHours] = React.useState([9, 17])

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-3">
      <Slider
        aria-label="Opening hours"
        max={24}
        minStepsBetweenThumbs={2}
        onValueChange={setHours}
        preserveThumbOrder
        value={hours}
      />
      <p className="text-muted-foreground text-sm tabular-nums">
        Open {hour(hours[0])} to {hour(hours[1])}, at least two hours.
      </p>
    </div>
  )
}
