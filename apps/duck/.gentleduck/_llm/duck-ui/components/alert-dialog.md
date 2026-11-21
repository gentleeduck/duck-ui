```tsx title="components/alert-dialog-1.tsx"
// import from your project: import Demo from '@/components/alert-dialog-1'
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

export default function Demo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Open</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone This will permanently delete your account and remove your data from our servers
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button>Continue</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

## Philosophy

Alert dialogs are the nuclear option of UI interruption. Unlike regular dialogs, they can't be dismissed by clicking outside or pressing Escape  -  the user must explicitly choose an action. Reserve them for destructive operations where an accidental dismissal could mean data loss.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add alert-dialog
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs
```

Make sure you have the [`Button`](/duck-ui/components/button) component installed in your project.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
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
} from '@/components/ui/alert-dialog';
```

```tsx
<AlertDialog>
  <AlertDialogTrigger>Open</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Examples

### Focus

An alert dialog focuses its Cancel button on open. `initialFocus` names another element, here the field that asks for the project's name before deleting it. `finalFocus` does the same on close, in place of the trigger.

```tsx title="components/alert-dialog-5.tsx"
// import from your project: import Demo from '@/components/alert-dialog-5'
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
```

### An action that waits

An action closes the dialog on click unless its `onClick` calls `event.preventDefault()`. Here it deletes first and closes once the work is done, and `onOpenChange` ignores Escape while it runs.

```tsx title="components/alert-dialog-6.tsx"
// import from your project: import Demo from '@/components/alert-dialog-6'
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
import * as React from 'react'

const deleteProject = () => new Promise((resolve) => setTimeout(resolve, 1200))

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  return (
    <AlertDialog open={open} onOpenChange={(next) => !deleting && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete the project?</AlertDialogTitle>
          <AlertDialogDescription>The dialog stays open until the project is gone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            disabled={deleting}
            onClick={async (event) => {
              event.preventDefault()
              setDeleting(true)
              await deleteProject()
              setDeleting(false)
              setOpen(false)
            }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Active Trigger on Open

Style the trigger to appear active while the alert dialog is open using `data-[state=open]`:

```tsx title="components/alert-dialog-3.tsx"
// import from your project: import Demo from '@/components/alert-dialog-3'
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
import { Trash2 } from 'lucide-react'

export default function Demo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="data-[state=open]:opacity-90 data-[state=open]:ring-2 data-[state=open]:ring-destructive/50">
          <Trash2 className="me-2 h-4 w-4" />
          Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The trigger button is highlighted while this dialog is open.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Focus after closing

```tsx title="components/alert-dialog-7.tsx"
// import from your project: import Demo from '@/components/alert-dialog-7'
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
```

### Kept mounted

```tsx title="components/alert-dialog-8.tsx"
// import from your project: import Demo from '@/components/alert-dialog-8'
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
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the alert dialog follows. It extends `Dialog`, so the portaled content gets the resolved `dir` and the footer actions mirror without any extra props.

```tsx
<DirectionProvider dir="rtl">
  <AlertDialog>
    <AlertDialogTrigger>حذف الحساب</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
        <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>إلغاء</AlertDialogCancel>
        <AlertDialogAction>متابعة</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</DirectionProvider>
```

```tsx title="components/alert-dialog-2.tsx"
// import from your project: import Demo from '@/components/alert-dialog-2'
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
import { DirectionProvider } from '@gentleduck/registry-ui/direction'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">حذف الحساب</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيؤدي ذلك إلى حذف حسابك نهائيًا وإزالة بياناتك من خوادمنا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">إلغاء</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button>متابعة</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionAlertDialog` and `MotionAlertDialogContent` for smooth enter/exit animations powered by [motion](https://motion.dev). Uses a stiffer spring to convey urgency compared to the regular dialog.

```tsx title="components/alert-dialog-4.tsx"
// import from your project: import Demo from '@/components/alert-dialog-4'
'use client'

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  MotionAlertDialog,
  MotionAlertDialogContent,
} from '@gentleduck/registry-ui/alert-dialog'
import { MotionButton } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <MotionAlertDialog>
      <AlertDialogTrigger asChild>
        <MotionButton variant="outline">Open</MotionButton>
      </AlertDialogTrigger>
      <MotionAlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone This will permanently delete your account and remove your data from our servers
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <MotionButton variant="outline">Cancel</MotionButton>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <MotionButton>Continue</MotionButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </MotionAlertDialogContent>
    </MotionAlertDialog>
  )
}
```

}>
  Requires the `motion` package. Use `MotionAlertDialog` instead of `AlertDialog` and `MotionAlertDialogContent` instead of `AlertDialogContent`. All other sub-components (`AlertDialogTrigger`, `AlertDialogAction`, etc.) stay the same.

## API Reference

### AlertDialog

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultOpen` | `boolean` | `-` | Determines if the dialog should be open by default |
| `open` | `boolean` | `-` | Controls the visibility of the dialog |
| `onOpenChange` | `(open: boolean) => void` | `-` | Callback fired when the dialog opens or closes |
| `dir` | `'ltr' \| 'rtl'` | `-` | Optional override. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). Inherited from the Dialog primitive. |
| `children` | `React.ReactNode` | (required) | Child elements (typically Trigger and Content) |
| `...props` | `React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>` | - | Additional props inherited from `AlertDialogPrimitive.Root` |

### AlertDialogTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `--` | Content of the trigger |
| `...props` | `React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>` | - | Additional props inherited from `AlertDialogPrimitive.Trigger` |

### AlertDialogPortal

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Optional portal container |
| `forceMount` | `true` | - | Forces mounted state for all portal children |
| `...props` | `React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Portal>` | - | Additional props inherited from `AlertDialogPrimitive.Portal` |

### AlertDialogOverlay

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names to apply |
| `...props` | `React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>` | - | Additional props inherited from `AlertDialogPrimitive.Overlay` |

Clear when the alert dialog is opened from a dialog's content, since the dialog's overlay already dims the page.

### AlertDialogContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `-` | Additional class names to apply |
| `children` | `React.ReactNode` | `-` | Content displayed inside the dialog |
| `forceMount` | `true` | - | Keeps the content, and what it holds, in the page while the dialog is closed. Its portal is kept with it, and the overlay holds the end of its fade and lets presses through, so it never covers the page |
| `initialFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on open in place of `AlertDialogCancel`. `false` leaves focus on the trigger |
| `finalFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on close in place of the trigger. `false` moves focus nowhere |
| `...props` | `React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>` | - | Additional props inherited from `AlertDialogPrimitive.Content` |

### MotionAlertDialog

Same props as `AlertDialog`. Wraps with `useMotionRoot` for exit animation support. Requires the `motion` package.

### MotionAlertDialogContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `-` | Additional class names to apply |
| `children` | `React.ReactNode` | `-` | Content displayed inside the dialog |

Requires `motion` package installed. Content uses a `scaleIn` entrance (fade, scale, and blur) with a spring transition (stiffness 400, damping 30) for a snappier feel that conveys urgency; the overlay fades in independently. Automatically respects `prefers-reduced-motion`.

### AlertDialogHeader

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional class names to apply |
| `children` | `React.ReactNode` | `--` | Header content (typically Title and Description) |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Additional props to spread to the header container |

### AlertDialogFooter

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional class names to apply |
| `children` | `React.ReactNode` | `--` | Footer content (typically Action and Cancel buttons) |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Additional props to spread to the footer div |

### AlertDialogTitle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional class names to apply |
| `children` | `React.ReactNode` | `--` | Title text content |
| `...props` | `React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>` | - | Additional props inherited from `AlertDialogPrimitive.Title` |

### AlertDialogDescription

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional class names to apply |
| `children` | `React.ReactNode` | `--` | Description text content |
| `...props` | `React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>` | - | Additional props inherited from `AlertDialogPrimitive.Description` |

### AlertDialogAction

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names merged with default button styles |
| `children` | `React.ReactNode` | - | Action button content |
| `...props` | `React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>` | - | Additional props inherited from `AlertDialogPrimitive.Action` |

### AlertDialogCancel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names merged with outline button styles |
| `children` | `React.ReactNode` | - | Cancel button content |
| `...props` | `React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>` | - | Additional props inherited from `AlertDialogPrimitive.Cancel` |