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
} from '@gentleduck/registry-ui/alert-dialog'
import { Button } from '@gentleduck/registry-ui/button'
import * as React from 'react'

export default function Demo() {
  const [leaving, setLeaving] = React.useState(false)

  return (
    <>
      <Button onClick={() => setLeaving(true)} variant="outline">
        Leave the editor
      </Button>
      {leaving && (
        <AlertDialog defaultOpen onOpenChange={(open) => !open && setLeaving(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
              <AlertDialogDescription>
                defaultOpen asks as soon as the question mounts, here once you try to leave.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction>Leave</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
