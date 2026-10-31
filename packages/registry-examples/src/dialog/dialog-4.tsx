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
import { Pencil } from 'lucide-react'

export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground data-[state=open]:ring-2 data-[state=open]:ring-primary/50">
          <Pencil className="me-2 h-4 w-4" />
          Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Notice the trigger button stays highlighted while this dialog is open. Use{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">data-[state=open]</code> on the trigger to style its
            active state.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
