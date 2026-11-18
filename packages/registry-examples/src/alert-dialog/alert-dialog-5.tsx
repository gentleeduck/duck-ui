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
import { Button, buttonVariants } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import * as React from 'react'

const PROJECT = 'duck-pond'

export default function Demo() {
  const field = React.useRef<HTMLInputElement>(null)
  const [typed, setTyped] = React.useState('')

  return (
    <AlertDialog onOpenChange={() => setTyped('')}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent initialFocus={field}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {PROJECT}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the project and its deployments. Type its name to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="project-name">Project name</Label>
          <Input
            autoComplete="off"
            id="project-name"
            onChange={(event) => setTyped(event.target.value)}
            placeholder={PROJECT}
            ref={field}
            value={typed}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: 'destructive' })} disabled={typed !== PROJECT}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
