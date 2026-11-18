'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Slider } from '@gentleduck/registry-ui/slider'
import * as React from 'react'

export default function Demo() {
  const id = React.useId()
  const [submitted, setSubmitted] = React.useState('')

  return (
    <form
      className="mx-auto flex w-full max-w-xs flex-col gap-4"
      onReset={() => setSubmitted('')}
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(new FormData(event.currentTarget).getAll('price[]').join(' to '))
      }}>
      <span className="font-medium text-sm" id={id}>
        Price
      </span>
      <Slider aria-labelledby={id} defaultValue={[20, 80]} name="price" step={5} />
      <div className="flex gap-2">
        <Button size="sm" type="submit">
          Apply
        </Button>
        <Button size="sm" type="reset" variant="outline">
          Reset
        </Button>
      </div>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {submitted ? `Submitted a price from ${submitted}.` : 'Nothing submitted yet.'}
      </p>
    </form>
  )
}
