'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [newsletter, setNewsletter] = React.useState(true)
  const [submitted, setSubmitted] = React.useState('')

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        const entries = Array.from(new FormData(event.currentTarget), ([name, value]) => `${name}=${value}`)
        setSubmitted(entries.join('&') || 'nothing')
      }}>
      <div className="flex items-center gap-2">
        <Switch defaultChecked id="form-newsletter" name="newsletter" onCheckedChange={setNewsletter} />
        <Label htmlFor="form-newsletter">Newsletter: {newsletter ? 'on' : 'off'}</Label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" type="submit">
          Save
        </Button>
        <Button onClick={() => setSubmitted('')} size="sm" type="reset" variant="outline">
          Reset
        </Button>
      </div>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {submitted ? `Submitted ${submitted}.` : 'Nothing submitted yet.'}
      </p>
    </form>
  )
}
