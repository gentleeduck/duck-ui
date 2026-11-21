'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [sent, setSent] = React.useState('')

  return (
    <form
      className="flex flex-col items-start gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get('country')))
      }}>
      <div className="flex gap-2">
        <Select autoComplete="country" name="country" onOpenChange={setOpen} open={open} required>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EG">Egypt</SelectItem>
            <SelectItem value="DE">Germany</SelectItem>
            <SelectItem value="JP">Japan</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)} type="button" variant="outline">
          Open it
        </Button>
      </div>
      <Button type="submit">Save</Button>
      <p className="text-muted-foreground text-sm">
        {sent
          ? `Submitted country=${sent}`
          : 'The open state is controlled, required refuses no pick, and autoComplete hints autofill.'}
      </p>
    </form>
  )
}
