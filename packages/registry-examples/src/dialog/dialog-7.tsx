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
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import * as React from 'react'

export default function Demo() {
  const nameRef = React.useRef<HTMLInputElement>(null)
  const shareRef = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Rename</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm" finalFocus={shareRef} hideClose initialFocus={nameRef}>
          <DialogHeader>
            <DialogTitle>Rename the project</DialogTitle>
            <DialogDescription>The name field takes focus, and Share takes it back once you close.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="project-name">Name</Label>
            <Input defaultValue="Mill pond" id="project-name" ref={nameRef} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Save</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button ref={shareRef} variant="secondary">
        Share
      </Button>
    </div>
  )
}
