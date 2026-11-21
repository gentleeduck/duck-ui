```tsx title="components/dialog-1.tsx"
// import from your project: import Demo from '@/components/dialog-1'
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

export default function Demo() {
  return (
    <Dialog>
      <form onSubmit={(e) => e.preventDefault()}>
        <DialogTrigger asChild>
          <Button variant={'outline'}>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input defaultValue="Pedro Duarte" id="name-1" name="name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input defaultValue="@peduarte" id="username-1" name="username" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'}>Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
```

## Philosophy

Dialogs demand attention and block interaction  -  use them when the user *must* make a decision before continuing. We split the anatomy into DialogTrigger, DialogContent, DialogHeader, etc. because every dialog has different needs but the same accessibility requirements: focus trapping, escape dismissal, and return focus.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add dialog
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs @gentleduck/hooks lucide-react
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
```

```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

## Examples

### Controlled Dialog

```tsx title="components/dialog-2.tsx"
// import from your project: import Demo from '@/components/dialog-2'
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
import React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <form onSubmit={(e) => e.preventDefault()}>
        <DialogTrigger asChild>
          <Button variant={'outline'}>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input defaultValue="Pedro Duarte" id="name-1" name="name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input defaultValue="@peduarte" id="username-1" name="username" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'}>Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
```

### Active Trigger on Open

Style the trigger to appear active while the dialog is open using `data-[state=open]`:

```tsx title="components/dialog-4.tsx"
// import from your project: import Demo from '@/components/dialog-4'
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
```

### Nested Dialog

A dialog opened from another dialog's content stacks on it. The one underneath steps back a little for each dialog in front of it, and only the first overlay dims the page. The step is a transition, which `prefers-reduced-motion` turns off.

```tsx title="components/dialog-6.tsx"
// import from your project: import Demo from '@/components/dialog-6'
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

export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open settings</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account settings</DialogTitle>
          <DialogDescription>Manage your account and the data it holds.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete account</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[380px]">
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>Your projects and settings go with it. This cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Keep it</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive">Delete</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Focus on open and on close

`initialFocus` names what takes focus when the dialog opens, in place of the first tabbable element, and `finalFocus` what takes it back when it closes, in place of the trigger. `hideClose` drops the corner close button when the footer already has one.

```tsx title="components/dialog-7.tsx"
// import from your project: import Demo from '@/components/dialog-7'
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
```

### Keep it open while unsaved

`onEscapeKeyDown` and `onPointerDownOutside` on `DialogContent` get the event before the dialog closes, and `event.preventDefault()` keeps it open. A `DialogClose` still closes it.

```tsx title="components/dialog-8.tsx"
// import from your project: import Demo from '@/components/dialog-8'
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
```

### Scrollable content

A body taller than the screen scrolls inside the dialog while the page behind it stays locked. Cap the content's height and give the middle row `minmax(0, 1fr)`, so the header and footer stay put.

```tsx title="components/dialog-10.tsx"
// import from your project: import Demo from '@/components/dialog-10'
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

const TERMS = [
  ['Your account', 'You keep your password to yourself and tell us when someone else may have it.'],
  ['What you post', 'You own what you upload. You let us store it and show it to the people you share it with.'],
  ['What we keep', 'We keep your files while your account is open, and for 30 days after you close it.'],
  ['Payment', 'A paid plan renews each month until you cancel it. A cancelled plan runs to the end of its month.'],
  ['Refunds', 'We refund a plan cancelled within 14 days of its first payment, and none after that.'],
  ['Fair use', 'You do not use the service to send spam, to break the law, or to slow it down for others.'],
  ['Changes', 'We tell you a month before these terms change. Using the service after that accepts them.'],
  ['Ending', 'You can close your account at any time. We close one that breaks these terms, after a warning.'],
] as const

export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Read the terms</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(32rem,85vh)] grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>The terms scroll inside the dialog, and the page behind it stays put.</DialogDescription>
        </DialogHeader>
        <section
          aria-label="Terms"
          className="-mx-6 overflow-y-auto px-6 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: the terms hold nothing focusable, so without Tab a keyboard cannot scroll them
          tabIndex={0}>
          {TERMS.map(([heading, text]) => (
            <div className="mb-4" key={heading}>
              <h3 className="mb-1 font-medium">{heading}</h3>
              <p className="text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Non-modal

`modal={false}` leaves the page usable while the dialog is open: there is no overlay, focus is not trapped, the page scrolls, and a screen reader still reaches it. A press outside closes it unless `onInteractOutside` prevents that, as it does here.

```tsx title="components/dialog-11.tsx"
// import from your project: import Demo from '@/components/dialog-11'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@gentleduck/registry-ui/dialog'
import { Kbd, KbdGroup } from '@gentleduck/registry-ui/kbd'
import * as React from 'react'

const SHORTCUTS = [
  ['Search', ['Ctrl', 'K']],
  ['New file', ['Ctrl', 'N']],
  ['Save', ['Ctrl', 'S']],
] as const

export default function Demo() {
  const [presses, setPresses] = React.useState(0)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dialog modal={false}>
        <DialogTrigger asChild>
          <Button variant="outline">Show shortcuts</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xs" onInteractOutside={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>It stays open while you use the page behind it.</DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[1fr_auto] gap-2 text-sm">
            {SHORTCUTS.map(([action, keys]) => (
              <React.Fragment key={action}>
                <dt>{action}</dt>
                <dd>
                  <KbdGroup>
                    {keys.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </KbdGroup>
                </dd>
              </React.Fragment>
            ))}
          </dl>
        </DialogContent>
      </Dialog>
      <Button onClick={() => setPresses((count) => count + 1)} variant="secondary">
        Pressed {presses} times
      </Button>
    </div>
  )
}
```

### Selects and popovers inside

A `Select`, `Popover` or menu opened from the dialog renders outside it in a portal, and still takes focus and scrolls while the dialog keeps the rest of the page locked. Escape closes the one in front first.

```tsx title="components/dialog-12.tsx"
// import from your project: import Demo from '@/components/dialog-12'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
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
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [until, setUntil] = React.useState<Date | null>(null)
  const [picking, setPicking] = React.useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite a member</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>The role list and the calendar open over the dialog and take focus.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dialog-invite-email">Email</Label>
            <Input id="dialog-invite-email" placeholder="ada@example.com" type="email" />
          </div>
          <div className="grid gap-2">
            <Label id="dialog-invite-role">Role</Label>
            <Select defaultValue="viewer">
              <SelectTrigger aria-labelledby="dialog-invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label id="dialog-invite-until">Access until</Label>
            <Popover onOpenChange={setPicking} open={picking}>
              <PopoverTrigger asChild>
                <Button
                  aria-labelledby="dialog-invite-until dialog-invite-until-value"
                  className="justify-start"
                  variant="outline">
                  <CalendarIcon aria-hidden="true" />
                  <span id="dialog-invite-until-value">{until ? until.toDateString() : 'No end date'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  defaultMonth={until ?? undefined}
                  mode="single"
                  onSelect={(day) => {
                    setUntil(day)
                    requestAnimationFrame(() => setPicking(false))
                  }}
                  selected={until}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Send invite</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Dialog on desktop, drawer on mobile

The responsive parts draw a `Dialog` at 768px and wider and a `Drawer` below that, from one tree.

```tsx title="components/dialog-9.tsx"
// import from your project: import Demo from '@/components/dialog-9'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  DialogCloseResponsive,
  DialogContentResponsive,
  DialogDescriptionResponsive,
  DialogFooterResponsive,
  DialogHeaderResponsive,
  DialogResponsive,
  DialogTitleResponsive,
  DialogTriggerResponsive,
} from '@gentleduck/registry-ui/dialog'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <DialogResponsive>
      <DialogTriggerResponsive asChild>
        <Button variant="outline">Share</Button>
      </DialogTriggerResponsive>
      <DialogContentResponsive className="sm:max-w-md">
        <DialogHeaderResponsive>
          <DialogTitleResponsive>Share the board</DialogTitleResponsive>
          <DialogDescriptionResponsive>
            A dialog at 768px and wider, a drawer from the bottom below that.
          </DialogDescriptionResponsive>
        </DialogHeaderResponsive>
        <div className="px-4 sm:px-0">
          <Input aria-label="Link" defaultValue="https://duck.example/board/42" readOnly />
        </div>
        <DialogFooterResponsive>
          <DialogCloseResponsive asChild>
            <Button>Done</Button>
          </DialogCloseResponsive>
        </DialogFooterResponsive>
      </DialogContentResponsive>
    </DialogResponsive>
  )
}
```

### Kept mounted

```tsx title="components/dialog-13.tsx"
// import from your project: import Demo from '@/components/dialog-13'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@gentleduck/registry-ui/dialog'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Write feedback</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="data-[state=closed]:hidden" forceMount>
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
        </DialogHeader>
        <Textarea placeholder="Close and reopen: the text is still here" rows={4} />
      </DialogContent>
    </Dialog>
  )
}
```

## Component Composition

## Notes

To use the `Dialog` component from within a `Context Menu` or `Dropdown Menu`, you must encase the `Context Menu` or
`Dropdown Menu` component in the `Dialog` component.

```tsx {1, 26}
<Dialog>
  <ContextMenu>
    <ContextMenuTrigger>Right click</ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem>Open</ContextMenuItem>
      <ContextMenuItem>Download</ContextMenuItem>
      <DialogTrigger asChild>
        <ContextMenuItem>
          <span>Delete</span>
        </ContextMenuItem>
      </DialogTrigger>
    </ContextMenuContent>
  </ContextMenu>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Are you sure you want to permanently
        delete this file from our servers?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button type="submit">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the dialog follows. The portaled overlay and content get the resolved `dir`, so text, the close button and the footer order mirror without any extra props.

```tsx
<DirectionProvider dir="rtl">
  <Dialog>
    <DialogTrigger>فتح</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>عنوان النافذة</DialogTitle>
        <DialogDescription>وصف النافذة هنا.</DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
</DirectionProvider>
```

```tsx title="components/dialog-3.tsx"
// import from your project: import Demo from '@/components/dialog-3'
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
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Dialog>
        <form onSubmit={(e) => e.preventDefault()}>
          <DialogTrigger asChild>
            <Button variant={'outline'}>فتح النافذة</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" closeText="إغلاق">
            <DialogHeader>
              <DialogTitle>تعديل الملف الشخصي</DialogTitle>
              <DialogDescription>عدّل بيانات ملفك الشخصي هنا، ثم اضغط على حفظ عند الانتهاء.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">الاسم</Label>
                <Input defaultValue="أحمد خالد" id="name-1" name="name" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="username-1">اسم المستخدم</Label>
                <Input defaultValue="ahmad_khaled" id="username-1" name="username" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={'outline'}>إلغاء</Button>
              </DialogClose>
              <Button type="submit">حفظ التغييرات</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionDialog` and `MotionDialogContent` for smooth enter/exit animations powered by [motion](https://motion.dev). The dialog scales and fades in with a blur effect, and reverses on exit.

```tsx title="components/dialog-5.tsx"
// import from your project: import Demo from '@/components/dialog-5'
'use client'

import { MotionButton } from '@gentleduck/registry-ui/button'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  MotionDialog,
  MotionDialogContent,
} from '@gentleduck/registry-ui/dialog'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <MotionDialog>
      <form onSubmit={(e) => e.preventDefault()}>
        <DialogTrigger asChild>
          <MotionButton variant={'outline'}>Open Dialog</MotionButton>
        </DialogTrigger>
        <MotionDialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-5">Name</Label>
              <Input defaultValue="Pedro Duarte" id="name-5" name="name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-5">Username</Label>
              <Input defaultValue="@peduarte" id="username-5" name="username" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <MotionButton variant={'outline'}>Cancel</MotionButton>
            </DialogClose>
            <MotionButton type="submit">Save changes</MotionButton>
          </DialogFooter>
        </MotionDialogContent>
      </form>
    </MotionDialog>
  )
}
```

}>
  Requires the `motion` package. Use `MotionDialog` instead of `Dialog` and `MotionDialogContent` instead of `DialogContent`. All other sub-components (`DialogTrigger`, `DialogHeader`, etc.) stay the same.

## API Reference

### Dialog

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultOpen` | `boolean` | `false` | Initial open state for uncontrolled usage |
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `modal` | `boolean` | `true` | Enables modal focus/interaction behavior (focus trapping, scroll blocking) |
| `dir` | `'ltr' \| 'rtl'` | - | Optional override. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `children` | `React.ReactNode` | - | Dialog sub-components (`DialogTrigger`, `DialogContent`, etc.) |
| `...props` | `React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>` | - | Additional props inherited from `DialogPrimitive.Root` |

### DialogTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | Trigger content |
| `...props` | `React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>` | - | Additional props inherited from `DialogPrimitive.Trigger` |

### DialogPortal

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Optional portal container |
| `forceMount` | `true` | - | Forces mounted state for all portal children |
| `...props` | `React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>` | - | Additional props inherited from `DialogPrimitive.Portal` |

### DialogOverlay

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>` | - | Additional props inherited from `DialogPrimitive.Overlay` |

Clear on a dialog opened from another dialog's content, since the overlay under it already dims the page.

### DialogContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `true` | - | Keeps the content, and what it holds, in the page while the dialog is closed. Its portal is kept with it, and the overlay holds the end of its fade and lets presses through, so it never covers the page |
| `initialFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on open in place of the first tabbable element. `false` leaves focus on the trigger |
| `finalFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on close in place of the trigger. `false` moves focus nowhere |
| `closeText` | `string` | `'Close'` | Accessible label for the built-in close button |
| `hideClose` | `boolean` | `false` | When `true`, hides the built-in close button entirely |
| `className` | `string` | - | Additional CSS classes applied to the content panel |
| `children` | `React.ReactNode` | - | Dialog inner content |
| `...props` | `React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>` | - | Additional props inherited from `DialogPrimitive.Content` |

`DialogContent` renders a built-in close button in the top-end corner (top-right in LTR, top-left in RTL). Set `hideClose` to remove it when you handle closing via other UI (e.g. a custom header with its own close button). Its props are exported as `IDialogContentProps`.

### DialogHeader

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the header |
| `children` | `React.ReactNode` | - | Header content (typically `DialogTitle` and `DialogDescription`) |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Additional props to spread to the header container |

### DialogFooter

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the footer |
| `children` | `React.ReactNode` | - | Footer content (typically action buttons) |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Additional props to spread to the footer container |

### DialogTitle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the title |
| `children` | `React.ReactNode` | - | Title text |
| `...props` | `React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>` | - | Additional props inherited from `DialogPrimitive.Title` |

### DialogDescription

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the description |
| `children` | `React.ReactNode` | - | Description text |
| `...props` | `React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>` | - | Additional props inherited from `DialogPrimitive.Description` |

### DialogClose

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | Close control content |
| `...props` | `React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>` | - | Additional props inherited from `DialogPrimitive.Close` |

### MotionDialog

Same props as `Dialog`. Wraps with `useMotionRoot` for exit animation support. Requires the `motion` package.

### MotionDialogContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `closeText` | `string` | `'Close'` | Accessible label for the built-in close button |
| `hideClose` | `boolean` | `false` | When `true`, hides the built-in close button |
| `className` | `string` | - | Additional CSS classes applied to the content panel |
| `children` | `React.ReactNode` | - | Dialog inner content |

Requires `motion` package installed. Animates an `m.div` under `LazyMotion`, which loads the animation features on first open. Automatically respects `prefers-reduced-motion`.

### Responsive Variants

The following responsive components automatically render a `Dialog` on desktop (>=768px) and a `Drawer` on mobile. Each accepts the same props as its non-responsive counterpart.

| Component | Desktop renders | Mobile renders |
| --- | --- | --- |
| `DialogResponsive` | `Dialog` | `Drawer` |
| `DialogTriggerResponsive` | `DialogTrigger` | `DrawerTrigger` |
| `DialogContentResponsive` | `DialogContent` | `DrawerContent` |
| `DialogHeaderResponsive` | `DialogHeader` | `DrawerHeader` |
| `DialogFooterResponsive` | `DialogFooter` | `DrawerFooter` |
| `DialogTitleResponsive` | `DialogTitle` | `DrawerTitle` |
| `DialogDescriptionResponsive` | `DialogDescription` | `DrawerDescription` |
| `DialogCloseResponsive` | `DialogClose` | `DrawerClose` |

## See also

* [Sheet](/duck-ui/components/sheet)  -  Side panel overlay, extends Dialog
* [Drawer](/duck-ui/components/drawer)  -  Bottom drawer overlay, great for mobile
* [Alert Dialog](/duck-ui/components/alert-dialog)  -  Confirmation dialog that requires user action