'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@gentleduck/registry-ui/dialog'
import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [notes, setNotes] = React.useState('')
  const [warned, setWarned] = React.useState(false)
  const keepWhileUnsaved = (event: Event) => {
    if (notes === '') return
    event.preventDefault()
    setWarned(true)
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setNotes('')
          setWarned(false)
        }
      }}
      open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">Add a note</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onEscapeKeyDown={keepWhileUnsaved} onPointerDownOutside={keepWhileUnsaved}>
        <DialogHeader>
          <DialogTitle>Add a note</DialogTitle>
          <DialogDescription>
            Escape and a click outside close it only while the note is empty. The buttons always do.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="dialog-note">Note</Label>
          <Textarea id="dialog-note" onChange={(event) => setNotes(event.target.value)} value={notes} />
          {warned && <p className="text-destructive text-sm">Save the note or discard it to close.</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Discard</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
