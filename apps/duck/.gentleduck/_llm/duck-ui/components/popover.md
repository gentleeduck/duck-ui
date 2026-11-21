```tsx title="components/popover-1.tsx"
// import from your project: import Demo from '@/components/popover-1'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input className="col-span-2 h-8" defaultValue="100%" id="width" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input className="col-span-2 h-8" defaultValue="300px" id="maxWidth" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input className="col-span-2 h-8" defaultValue="25px" id="height" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input className="col-span-2 h-8" defaultValue="none" id="maxHeight" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

## About

Popover built with [@floating-ui/react](https://floating-ui.com/) and Popper-based primitives for collision-aware positioning.

## Philosophy

Popovers bridge the gap between tooltips (hover, no interaction) and dialogs (heavy, blocking). They're the right choice for inline forms, color pickers, and contextual actions that need more space than a tooltip but shouldn't interrupt the user's flow. We handle positioning and collision detection so you can focus on content.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add popover
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/primitives
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
```

```tsx showLineNumbers
<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>
    <PopoverTitle>Dimensions</PopoverTitle>
    <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
  </PopoverContent>
</Popover>
```

`PopoverTitle` names the popover for screen readers and `PopoverDescription` describes it: while either is mounted, the content's `aria-labelledby` or `aria-describedby` points at it.

## Examples

### Sides

```tsx title="components/popover-2.tsx"
// import from your project: import Demo from '@/components/popover-2'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm grid-cols-2 gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent side={'top'} className="w-80">
          <div className="grid gap-4">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Dimensions</h4>
              <p className="text-muted-foreground text-sm">Set the values for the layer.</p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="width">Width</Label>
                <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="maxWidth">Max</Label>
                <Input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="height">Height</Label>
                <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="maxHeight">Max</Label>
                <Input id="maxHeight" defaultValue="none" className="col-span-2 h-8" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Right</Button>
        </PopoverTrigger>
        <PopoverContent side={'right'} className="w-80">
          {/* same content */}
          <div className="grid gap-4">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Dimensions</h4>
              <p className="text-muted-foreground text-sm">Set the values for the layer.</p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="width-r">Width</Label>
                <Input id="width-r" defaultValue="100%" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="maxWidth-r">Max</Label>
                <Input id="maxWidth-r" defaultValue="300px" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="height-r">Height</Label>
                <Input id="height-r" defaultValue="25px" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="maxHeight-r">Max</Label>
                <Input id="maxHeight-r" defaultValue="none" className="col-span-2 h-8" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side={'bottom'} className="w-80">
          {/* same content */}
          <div className="grid gap-4">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Dimensions</h4>
              <p className="text-muted-foreground text-sm">Set the values for the layer.</p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="width-b">Width</Label>
                <Input id="width-b" defaultValue="100%" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="maxWidth-b">Max</Label>
                <Input id="maxWidth-b" defaultValue="300px" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="height-b">Height</Label>
                <Input id="height-b" defaultValue="25px" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="maxHeight-b">Max</Label>
                <Input id="maxHeight-b" defaultValue="none" className="col-span-2 h-8" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Left</Button>
        </PopoverTrigger>
        <PopoverContent side={'left'} className="w-80">
          {/* same content */}
          <div className="grid gap-4">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Dimensions</h4>
              <p className="text-muted-foreground text-sm">Set the values for the layer.</p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="width-l">Width</Label>
                <Input id="width-l" defaultValue="100%" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="maxWidth-l">Max</Label>
                <Input id="maxWidth-l" defaultValue="300px" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="height-l">Height</Label>
                <Input id="height-l" defaultValue="25px" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="maxHeight-l">Max</Label>
                <Input id="maxHeight-l" defaultValue="none" className="col-span-2 h-8" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

### Form

```tsx title="components/popover-3.tsx"
// import from your project: import Demo from '@/components/popover-3'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Set dimensions</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
          }}>
          <div className="space-y-2">
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Configure the dimensions for the layer.</PopoverDescription>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p3-width">Width</Label>
              <Input className="col-span-2 h-8" defaultValue="100%" id="p3-width" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p3-height">Height</Label>
              <Input className="col-span-2 h-8" defaultValue="25px" id="p3-height" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <PopoverClose asChild>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </PopoverClose>
            <Button size="sm" type="submit">
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
```

### Focus

`initialFocus` names the element focused on open, here the note rather than the Cancel button before it. `finalFocus` does the same on close, in place of the trigger.

```tsx title="components/popover-8.tsx"
// import from your project: import Demo from '@/components/popover-8'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Popover, PopoverClose, PopoverContent, PopoverTitle, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { Textarea } from '@gentleduck/registry-ui/textarea'
import * as React from 'react'

export default function Demo() {
  const note = React.useRef<HTMLTextAreaElement>(null)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Add note</Button>
      </PopoverTrigger>
      <PopoverContent className="grid w-80 gap-3" initialFocus={note}>
        <div className="flex items-center justify-between">
          <PopoverTitle>Note</PopoverTitle>
          <PopoverClose asChild>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
          </PopoverClose>
        </div>
        <Textarea placeholder="Write a note for this layer." ref={note} />
      </PopoverContent>
    </Popover>
  )
}
```

### Active Trigger on Open

Style the trigger to appear active while the popover is open using `data-[state=open]`:

```tsx title="components/popover-5.tsx"
// import from your project: import Demo from '@/components/popover-5'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'
import { Settings } from 'lucide-react'

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:ring-2 data-[state=open]:ring-ring">
          <Settings className="me-2 h-4 w-4" />
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <PopoverTitle>Preferences</PopoverTitle>
          <PopoverDescription>The trigger stays active while this is open.</PopoverDescription>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

### Arrow

Add a directional caret pointing at the trigger. The arrow tracks the trigger and slides along the content edge during collision avoidance. Use `arrowPadding` to keep it within the rounded corners.

```tsx title="components/popover-7.tsx"
// import from your project: import Demo from '@/components/popover-7'
import { Button } from '@gentleduck/registry-ui/button'
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" arrowPadding={8} className="w-60">
        <p className="text-sm">Settings and configuration options for your account.</p>
        <PopoverArrow />
      </PopoverContent>
    </Popover>
  )
}
```

Customize the border color via `--popover-border-color` on `PopoverContent`, in its `style` or as a class such as `[--popover-border-color:#5865f2]`. `MotionPopoverContent` takes it too:

```tsx
<PopoverContent style={{ '--popover-border-color': '#5865f2' }}>
  ...
  <PopoverArrow />
</PopoverContent>
```

### Custom anchor, controlled and modal

`PopoverAnchor` positions the content against an element other than the trigger, here the whole field around a small trigger. `open` and `onOpenChange` hold the state, so a form can close the popover once it saves. `modal` keeps focus inside, hides the page from a screen reader and stops a click outside from reaching it.

```tsx title="components/popover-9.tsx"
// import from your project: import Demo from '@/components/popover-9'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'
import { Pencil } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('Quarterly report')
  const [draft, setDraft] = React.useState(name)

  return (
    <Popover
      modal
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setDraft(name)
      }}
      open={open}>
      <PopoverAnchor className="flex w-72 items-center justify-between gap-2 rounded-md border px-3 py-1.5">
        <span className="truncate text-sm">{name}</span>
        <PopoverTrigger asChild>
          <Button aria-label="Rename" size="icon-sm" variant="ghost">
            <Pencil />
          </Button>
        </PopoverTrigger>
      </PopoverAnchor>
      <PopoverContent align="start" className="grid w-72 gap-3">
        <div className="grid gap-1.5">
          <PopoverTitle>Rename</PopoverTitle>
          <PopoverDescription>The new name shows wherever the file is listed.</PopoverDescription>
        </div>
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setName(draft.trim() || name)
            setOpen(false)
          }}>
          <Label htmlFor={id}>Name</Label>
          <Input id={id} onChange={(event) => setDraft(event.target.value)} value={draft} />
          <Button type="submit">Save</Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
```

### Open from the start, with offsets

```tsx title="components/popover-10.tsx"
// import from your project: import Demo from '@/components/popover-10'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import * as React from 'react'

export default function Demo() {
  const next = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="flex items-center gap-2">
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="outline">Tip</Button>
        </PopoverTrigger>
        <PopoverContent alignOffset={8} className="w-60 text-sm" finalFocus={next} sideOffset={12}>
          Open from the start, 12px from its trigger, with a wide arrow. On close, focus moves to Next.
          <PopoverArrow height={10} width={20} />
        </PopoverContent>
      </Popover>
      <Button ref={next} variant="outline">
        Next
      </Button>
    </div>
  )
}
```

### Kept mounted

```tsx title="components/popover-11.tsx"
// import from your project: import Demo from '@/components/popover-11'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Draft a note</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 data-[state=closed]:hidden" forceMount>
        <Input placeholder="Type, close and open again" />
        <p className="mt-2 text-muted-foreground text-xs">
          forceMount keeps the field, and what you typed, while closed.
        </p>
      </PopoverContent>
    </Popover>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the popover follows. The portaled content gets the resolved `dir`, and `side="left"`/`side="right"` and `align="start"`/`align="end"` mirror with it.

```tsx
<DirectionProvider dir="rtl">
  <Popover>
    <PopoverTrigger>فتح</PopoverTrigger>
    <PopoverContent>محتوى النافذة المنبثقة هنا.</PopoverContent>
  </Popover>
</DirectionProvider>
```

```tsx title="components/popover-4.tsx"
// import from your project: import Demo from '@/components/popover-4'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">فتح النافذة المنبثقة</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <PopoverTitle>الأبعاد</PopoverTitle>
              <PopoverDescription>اضبط أبعاد الطبقة.</PopoverDescription>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">العرض</Label>
                <Input className="col-span-2 h-8" defaultValue="100%" id="width" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxWidth">أقصى عرض</Label>
                <Input className="col-span-2 h-8" defaultValue="300px" id="maxWidth" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="height">الارتفاع</Label>
                <Input className="col-span-2 h-8" defaultValue="25px" id="height" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxHeight">أقصى ارتفاع</Label>
                <Input className="col-span-2 h-8" defaultValue="none" id="maxHeight" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionPopover` and `MotionPopoverContent` for smooth enter/exit animations powered by [motion](https://motion.dev). The transform origin matches the placement side automatically.

```tsx title="components/popover-6.tsx"
// import from your project: import Demo from '@/components/popover-6'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  MotionPopover,
  MotionPopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <MotionPopover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <MotionPopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p6-width">Width</Label>
              <Input className="col-span-2 h-8" defaultValue="100%" id="p6-width" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p6-maxWidth">Max. width</Label>
              <Input className="col-span-2 h-8" defaultValue="300px" id="p6-maxWidth" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p6-height">Height</Label>
              <Input className="col-span-2 h-8" defaultValue="25px" id="p6-height" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p6-maxHeight">Max. height</Label>
              <Input className="col-span-2 h-8" defaultValue="none" id="p6-maxHeight" />
            </div>
          </div>
        </div>
      </MotionPopoverContent>
    </MotionPopover>
  )
}
```

}>
  Requires the `motion` package. Use `MotionPopover` instead of `Popover` and `MotionPopoverContent` instead of `PopoverContent`. All other sub-components (`PopoverTrigger`, `PopoverClose`, etc.) stay the same.

## API Reference

### Popover

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `-` | Popover sub-components (`PopoverTrigger`, `PopoverContent`) |
| `defaultOpen` | `boolean` | `-` | Initial open state for uncontrolled usage |
| `open` | `boolean` | `-` | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | `-` | Callback when open state changes |
| `modal` | `boolean` | `false` | Enables modal focus/interaction behavior |
| `dir` | `'ltr' \| 'rtl'` | - | Optional override. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `...props` | `React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>` | - | Additional props inherited from `Popover.Root`. |

### PopoverTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | `false` | Use the child element as the trigger |
| `...props` | `React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>` | - | Additional props inherited from `Popover.Trigger`. |

### PopoverContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `true` | - | Keeps the content in the page while closed, as `data-state="closed"`, for an exit animation to run on |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Preferred side relative to the trigger |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment on the chosen side |
| `sideOffset` | `number` | `4` | Main-axis offset from trigger |
| `alignOffset` | `number` | `0` | Cross-axis offset from trigger |
| `initialFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on open in place of the first tabbable element; `false` leaves focus on the trigger |
| `finalFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on close in place of the trigger; `false` moves focus nowhere |
| `...props` | `React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>` | - | Additional props inherited from `Popover.Content`. |

### PopoverTitle

An `h2` styled `font-medium leading-none` that names the popover. Use `asChild` for another heading level.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Title>` | - | Additional props inherited from `Popover.Title`. |

### PopoverDescription

A muted `p` that describes the popover.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Description>` | - | Additional props inherited from `Popover.Description`. |

### PopoverArrow

A caret drawn in the content's fill and border colors.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `14` | Arrow width in pixels |
| `height` | `number` | `7` | Arrow height in pixels |
| `...props` | `React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>` | - | Additional props inherited from `Popover.Arrow`. |

### PopoverClose

Element that closes the popover when interacted with.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | `false` | Renders child as the close control |
| `children` | `React.ReactNode` | - | Close control content |
| `...props` | `React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>` | - | Additional props inherited from `PopoverPrimitive.Close` |

### PopoverAnchor

Optional custom anchor element for positioning.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>` | - | Additional props inherited from `Popover.Anchor`. |

### MotionPopover

Wraps with `useMotionRoot` for exit animation support. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `PopoverProps` | - | All props from `Popover` are supported |

### MotionPopoverContent

Adds a `scaleIn` enter/exit animation (fade, scale, and blur) with a `springBouncy` transition, like the other motion popups. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `PopoverContentProps` | - | All props from `PopoverContent` are supported |