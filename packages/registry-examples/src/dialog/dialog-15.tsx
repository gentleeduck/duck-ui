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
} from '@gentleduck/registry-ui/dialog'
import * as React from 'react'

export default function Demo() {
  const [shown, setShown] = React.useState(false)

  return (
    <>
      <Button onClick={() => setShown(true)} variant="outline">
        Show what is new
      </Button>
      {shown && (
        <Dialog defaultOpen onOpenChange={(open) => !open && setShown(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>What is new</DialogTitle>
              <DialogDescription>
                defaultOpen opens the dialog as it mounts, with no trigger of its own.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Got it</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
