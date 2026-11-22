```tsx title="components/sheet-1.tsx"
// import from your project: import Demo from '@/components/sheet-1'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

const SHEET_SIDES = ['right'] as const

export default function Demo() {
  return (
    <div className="grid grid-cols-1 gap-2">
      {SHEET_SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant={'outline'}>{side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name">Name</Label>
                <Input className="col-span-3" id="name" defaultValue="Pedro Duarte" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username">Username</Label>
                <Input className="col-span-3" id="username" defaultValue="@peduarte" />
              </div>
            </div>
            <SheetFooter className="mt-2">
              <SheetClose asChild>
                <Button>Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
```

## Philosophy

Sheets are dialogs that slide in from the edge  -  they maintain spatial context better than centered modals. Use them for supplementary content (settings panels, detail views, mobile navigation) where the user needs to reference what's behind the overlay. The side prop makes the direction of information flow explicit.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add sheet
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs @gentleduck/variants lucide-react
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
```

```tsx
<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Are you absolutely sure?</SheetTitle>
      <SheetDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

## Examples

### Side

Use the `side` property to `<SheetContent />` to indicate the edge of the screen where the component will appear. The values can be `top`, `right`, `bottom` or `left`. The default is `right`; `left` and `right` mirror in RTL.

```tsx title="components/sheet-2.tsx"
// import from your project: import Demo from '@/components/sheet-2'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

const SHEET_SIDES = ['top', 'right', 'bottom', 'left'] as const

export default function Demo() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SHEET_SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant={'outline'}>{side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name">Name</Label>
                <Input className="col-span-3" id="name" defaultValue="Pedro Duarte" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username">Username</Label>
                <Input className="col-span-3" id="username" defaultValue="@peduarte" />
              </div>
            </div>
            <SheetFooter className="mt-2">
              <SheetClose asChild>
                <Button>Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
```

### Size

A left or right sheet is three quarters of the screen wide and stops at `max-w-sm` from the `sm` breakpoint up, so a wider sheet lifts that cap with a class such as `sm:max-w-xl`. A width class alone stays under the cap. A top or bottom sheet takes a height class.

```tsx title="components/sheet-6.tsx"
// import from your project: import Demo from '@/components/sheet-6'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

export default function Demo() {
  return (
    <div className="flex gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Wide</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Release notes</SheetTitle>
            <SheetDescription>A side sheet stops at a small width unless its class lifts the cap.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Short</Button>
        </SheetTrigger>
        <SheetContent className="h-1/3" side="bottom">
          <SheetHeader>
            <SheetTitle>Cookie settings</SheetTitle>
            <SheetDescription>A top or bottom sheet takes a height class.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

### Controlled

Hold `open` in state to close the sheet from code, here once its form saves. With `hideClose`, a `SheetClose` in the footer is the way out.

```tsx title="components/sheet-7.tsx"
// import from your project: import Demo from '@/components/sheet-7'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('Pedro Duarte')

  return (
    <div className="flex items-center gap-3">
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger asChild>
          <Button variant="outline">Rename</Button>
        </SheetTrigger>
        <SheetContent hideClose>
          <form
            className="flex flex-1 flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setName(String(new FormData(event.currentTarget).get('name')))
              setOpen(false)
            }}>
            <SheetHeader>
              <SheetTitle>Rename the account</SheetTitle>
              <SheetDescription>Saving closes the sheet. Cancel leaves the name as it was.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-2">
              <Label htmlFor="sheet-7-name">Name</Label>
              <Input defaultValue={name} id="sheet-7-name" name="name" required />
            </div>
            <SheetFooter className="mt-auto">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <span className="text-muted-foreground text-sm">{name}</span>
    </div>
  )
}
```

### Scrolling body

The content is a column, and a top or bottom sheet is no taller than the screen, so a body with `min-h-0 flex-1 overflow-y-auto` scrolls between a header and a footer that stay put, on every side.

```tsx title="components/sheet-8.tsx"
// import from your project: import Demo from '@/components/sheet-8'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

const CHAPTERS = Array.from({ length: 30 }, (_, index) => `Chapter ${index + 1}`)

export default function Demo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Contents</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Contents</SheetTitle>
          <SheetDescription>The list scrolls, and the header and footer stay put.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Chapters" className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6">
          <ul className="grid gap-1 text-sm">
            {CHAPTERS.map((chapter) => (
              <li key={chapter}>
                <a className="block rounded-md px-2 py-1.5 hover:bg-accent" href={`#${chapter.replace(' ', '-')}`}>
                  {chapter}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <SheetFooter>
          <Button variant="secondary">Download the book</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

### Nested

A sheet opened from a sheet's content stacks over it with a clear overlay, and Escape closes only the top one.

```tsx title="components/sheet-9.tsx"
// import from your project: import Demo from '@/components/sheet-9'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

export default function Demo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Order</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Order 1042</SheetTitle>
          <SheetDescription>Two items, paid by card.</SheetDescription>
        </SheetHeader>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="self-start" variant="secondary">
              Show the customer
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xs">
            <SheetHeader>
              <SheetTitle>Ada Lovelace</SheetTitle>
              <SheetDescription>Escape closes this sheet and leaves the order open.</SheetDescription>
            </SheetHeader>
            <SheetFooter className="mt-auto">
              <SheetClose asChild>
                <Button variant="outline">Back to the order</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </SheetContent>
    </Sheet>
  )
}
```

### Non-modal

With `modal={false}` the sheet draws no overlay, leaves focus free and the page usable. A press outside still closes it unless `onInteractOutside` prevents it.

```tsx title="components/sheet-10.tsx"
// import from your project: import Demo from '@/components/sheet-10'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'
import * as React from 'react'

export default function Demo() {
  const [count, setCount] = React.useState(0)

  return (
    <div className="flex items-center gap-2">
      <Sheet modal={false}>
        <SheetTrigger asChild>
          <Button variant="outline">Help</Button>
        </SheetTrigger>
        <SheetContent onInteractOutside={(event) => event.preventDefault()}>
          <SheetHeader>
            <SheetTitle>Help</SheetTitle>
            <SheetDescription>
              The page behind stays usable, and the sheet stays open until it is closed.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Button onClick={() => setCount((value) => value + 1)} variant="secondary">
        Clicked {count} times
      </Button>
    </div>
  )
}
```

### Active Trigger on Open

Style the trigger to appear active while the sheet is open using `data-[state=open]`:

```tsx title="components/sheet-4.tsx"
// import from your project: import Demo from '@/components/sheet-4'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'
import { Menu } from 'lucide-react'

export default function Demo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:ring-2 data-[state=open]:ring-ring">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>The menu icon stays active while the sheet is open.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
```

### From the top, with chosen focus

```tsx title="components/sheet-11.tsx"
// import from your project: import Demo from '@/components/sheet-11'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'
import * as React from 'react'

export default function Demo() {
  const search = React.useRef<HTMLInputElement>(null)
  const after = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Search from the top</Button>
        </SheetTrigger>
        <SheetContent finalFocus={after} initialFocus={search} side="top">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
            <SheetDescription>Focus starts in the field and lands on Results once closed.</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <Input placeholder="Search the docs" ref={search} />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button>Search</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Button ref={after} variant="outline">
        Results
      </Button>
    </div>
  )
}
```

### Every side

```tsx title="components/sheet-12.tsx"
// import from your project: import Demo from '@/components/sheet-12'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@gentleduck/registry-ui/sheet'

export default function Demo() {
  return (
    <div className="flex flex-wrap gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline">{side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>From the {side}</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
```

### Kept mounted

```tsx title="components/sheet-13.tsx"
// import from your project: import Demo from '@/components/sheet-13'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@gentleduck/registry-ui/sheet'

export default function Demo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Search</Button>
      </SheetTrigger>
      <SheetContent aria-describedby={undefined} className="data-[state=closed]:hidden" forceMount>
        <SheetHeader>
          <SheetTitle>Search</SheetTitle>
        </SheetHeader>
        <div className="px-4">
          <Input placeholder="The query survives closing" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

### Into an element of your own

```tsx title="components/sheet-14.tsx"
// import from your project: import Demo from '@/components/sheet-14'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'
import * as React from 'react'

export default function Demo() {
  const panel = React.useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open in the dark panel</Button>
        </SheetTrigger>
        <SheetContent container={panel}>
          <SheetHeader>
            <SheetTitle>Rendered in the panel</SheetTitle>
            <SheetDescription>The sheet portals into the panel below and takes its dark theme.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <div className="dark rounded-md border bg-background p-4 text-foreground text-sm" ref={panel}>
        The sheet renders inside this element.
      </div>
    </div>
  )
}
```

### Open on mount

```tsx title="components/sheet-15.tsx"
// import from your project: import Demo from '@/components/sheet-15'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@gentleduck/registry-ui/sheet'
import * as React from 'react'

export default function Demo() {
  const [shown, setShown] = React.useState(false)

  return (
    <>
      <Button onClick={() => setShown(true)} variant="outline">
        Show the filters
      </Button>
      {shown && (
        <Sheet defaultOpen onOpenChange={(open) => !open && setShown(false)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>defaultOpen opens the sheet as it mounts, with no trigger of its own.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the sheet follows. In RTL, `left` and `right` mirror, so the default `side="right"` slides in from the left.

```tsx title="components/sheet-3.tsx"
// import from your project: import Demo from '@/components/sheet-3'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant={'outline'}>فتح اللوحة</Button>
        </SheetTrigger>
        <SheetContent closeText="إغلاق">
          <SheetHeader>
            <SheetTitle>تعديل الملف الشخصي</SheetTitle>
            <SheetDescription>عدّل بيانات ملفك الشخصي هنا، ثم اضغط على حفظ عند الانتهاء.</SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">الاسم</Label>
              <Input className="col-span-3" defaultValue="أحمد محمد" id="name" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input className="col-span-3" defaultValue="ahmad_mohamed" id="username" />
            </div>
          </div>
          <SheetFooter className="mt-2">
            <SheetClose asChild>
              <Button>حفظ التغييرات</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionSheet` and `MotionSheetContent` for smooth slide-in/out animations powered by [motion](https://motion.dev). The content slides from the edge based on the `side` prop while the overlay fades.

```tsx title="components/sheet-5.tsx"
// import from your project: import Demo from '@/components/sheet-5'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  MotionSheet,
  MotionSheetContent,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

const SHEET_SIDES = ['right'] as const

export default function Demo() {
  return (
    <div className="grid grid-cols-1 gap-2">
      {SHEET_SIDES.map((side) => (
        <MotionSheet key={side}>
          <SheetTrigger asChild>
            <Button variant={'outline'}>{side}</Button>
          </SheetTrigger>
          <MotionSheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="s5-name">Name</Label>
                <Input className="col-span-3" id="s5-name" defaultValue="Pedro Duarte" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="s5-username">Username</Label>
                <Input className="col-span-3" id="s5-username" defaultValue="@peduarte" />
              </div>
            </div>
            <SheetFooter className="mt-2">
              <SheetClose asChild>
                <Button>Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </MotionSheetContent>
        </MotionSheet>
      ))}
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionSheet` instead of `Sheet` and `MotionSheetContent` instead of `SheetContent`. All other sub-components (`SheetTrigger`, `SheetHeader`, etc.) stay the same.

## API Reference

### Sheet

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultOpen` | `boolean` | `false` | Initial open state for uncontrolled usage |
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `modal` | `boolean` | `true` | Enables modal focus/interaction behavior |
| `children` | `React.ReactNode` | - | Sheet sub-components (`SheetTrigger`, `SheetContent`, etc.) |
| `...props` | `React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>` | - | Additional props inherited from `SheetPrimitive.Root` |

### SheetTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | `false` | Renders child as trigger element instead of a default button |
| `children` | `React.ReactNode` | - | Trigger content |
| `...props` | `React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger>` | - | Additional props inherited from `SheetPrimitive.Trigger` |

### SheetPortal

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Optional portal container |
| `forceMount` | `true` | - | Forces mounted state for all portal children |
| `...props` | `React.ComponentPropsWithoutRef<typeof SheetPrimitive.Portal>` | - | Additional props inherited from `SheetPrimitive.Portal` |

`SheetContent` renders a portal of its own, so pass `container` to `SheetContent` to place it; `SheetPortal` is for a content built from the primitive.

### SheetOverlay

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `...props` | `React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>` | - | Additional props inherited from `SheetPrimitive.Overlay` |

Clear when the sheet is opened from a dialog's content, since the dialog's overlay already dims the page.

### SheetContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Where the content portals to, such as an element carrying another theme |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | The side from which the sheet slides in. `left` and `right` mirror in RTL |
| `closeText` | `string` | `'Close'` | Screen-reader label for the built-in close button |
| `hideClose` | `boolean` | `false` | When `true`, hides the built-in close button |
| `forceMount` | `true` | - | Keeps the content, and what it holds, in the page while the sheet is closed. Its portal is kept with it, and the overlay holds the end of its fade and lets presses through, so it never covers the page |
| `initialFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on open in place of the first tabbable element. `false` leaves focus on the trigger |
| `finalFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on close in place of the trigger. `false` moves focus nowhere |
| `className` | `string` | - | Additional CSS class names |
| `children` | `React.ReactNode` | - | Sheet content |
| `...props` | `React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & VariantProps<typeof sheetVariants>` | - | Additional props inherited from `SheetPrimitive.Content` and the local `sheetVariants` |

`SheetContent` lays its children out in a column with a gap between them, so a header, a scrolling body with `flex-1` and a footer stack without classes of their own.

`SheetContent` renders a built-in close button in the top-end corner (top-right in LTR, top-left in RTL). Set `hideClose` to remove it when you close the sheet from your own UI.

### SheetHeader

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Additional props to spread to the header container |

### SheetFooter

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Additional props to spread to the footer div |

### SheetTitle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `...props` | `React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>` | - | Additional props inherited from `SheetPrimitive.Title` |

### SheetDescription

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `...props` | `React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>` | - | Additional props inherited from `SheetPrimitive.Description` |

### SheetClose

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | `false` | Renders child as close control |
| `children` | `React.ReactNode` | - | Close control content |
| `...props` | `React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close>` | - | Additional props inherited from `SheetPrimitive.Close` |

### MotionSheet

Same props as `Sheet`. Wraps with `useMotionRoot` for exit animation support. Requires the `motion` package.

### MotionSheetContent

Same props as `SheetContent`. Adds directional slide enter/exit animation with blur and opacity fade using tweenSlow (300ms). Under `prefers-reduced-motion` the panel and the overlay jump into place. Requires the `motion` package.

## See also

* [Dialog](/duck-ui/components/dialog)  -  Centered modal overlay
* [Drawer](/duck-ui/components/drawer)  -  Bottom drawer overlay, great for mobile