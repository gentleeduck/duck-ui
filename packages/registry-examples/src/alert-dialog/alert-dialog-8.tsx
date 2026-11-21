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
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete repository</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="data-[state=closed]:hidden" forceMount>
        <AlertDialogHeader>
          <AlertDialogTitle>Type the name to confirm</AlertDialogTitle>
          <AlertDialogDescription>forceMount keeps what you typed if you cancel and come back.</AlertDialogDescription>
        </AlertDialogHeader>
        <Input placeholder="gentleduck/duck-ui" />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
