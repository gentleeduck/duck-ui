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
  const panel = React.useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Ask in the dark panel</Button>
        </AlertDialogTrigger>
        <AlertDialogContent container={panel}>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive the project?</AlertDialogTitle>
            <AlertDialogDescription>
              The question portals into the panel below and takes its dark theme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="dark rounded-md border bg-background p-4 text-foreground text-sm" ref={panel}>
        The alert dialog renders inside this element.
      </div>
    </div>
  )
}
