'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@gentleduck/registry-ui/alert-dialog'
import { Button } from '@gentleduck/registry-ui/button'
import * as React from 'react'

export default function Demo() {
  const undo = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Remove member</Button>
        </AlertDialogTrigger>
        <AlertDialogContent finalFocus={undo}>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Sam from the team?</AlertDialogTitle>
            <AlertDialogDescription>
              On close, focus moves to Undo instead of back to this button.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button ref={undo} variant="outline">
        Undo
      </Button>
    </div>
  )
}
