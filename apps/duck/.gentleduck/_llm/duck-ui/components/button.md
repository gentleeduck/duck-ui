```tsx title="components/button-1.tsx"
// import from your project: import Demo from '@/components/button-1'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { CommandShortcut } from '@gentleduck/registry-ui/command'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { ArrowBigUpDash, Command } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export default function Demo() {
  const [open, setOpen] = React.useState<boolean>(false)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-expanded={open}
            aria-label={'advanced button'}
            icon={<ArrowBigUpDash />}
            isCollapsed={open}
            loading={false}
            onClick={() => setOpen((prev) => !prev)}
            size="default">
            Button
          </Button>
        </TooltipTrigger>
        <TooltipContent forceMount side="top" className="flex items-center gap-2">
          <CommandShortcut
            keys="mod+i"
            onKeysPressed={() => {
              setOpen((prev) => !prev)
              toast.success('Advanced button')
            }}
            variant="secondary">
            <Command />
            +i
          </CommandShortcut>
          <p>Advanced button</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

## Philosophy

Buttons are the primary call to action in any interface. We ship an intentionally rich variant system because buttons carry the most visual weight in UI decisions  -  primary, destructive, ghost, and outline each communicate different levels of commitment. The `asChild` pattern lets you render any element as a button, because sometimes a link needs to look like one.

* Multiple **styles**, **sizes**, and **border** options out of the box
* Built-in **loading state** with spinner and auto-disable
* Supports **icons**, **dual icons**, and **collapsed icon-only mode**
* Flexible `asChild` rendering for links and custom wrappers
* Smooth **hover animations** with optional `AnimationIcon`
* Fully **typed**, **accessible**, and **responsive**
* Powered by `@gentleduck/variants` for scalable theming
* Clean, composable, and **Tailwind-optimized**

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add button
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/variants @gentleduck/libs lucide-react
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Button } from '@/components/ui/button'
```

```tsx
<Button>Button</Button>
```

### Button

`Button` is a versatile and customizable React component designed to render a button with various styles and functionalities. It supports different sizes, variants, and additional features like loading states and icons. The component is flexible and can be used in a variety of scenarios, from simple buttons to complex interactive elements.

#### Example Usage:

```tsx
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const MyButton = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="lg" variant="default">
          Submit
        </Button>
      </TooltipTrigger>
      <TooltipContent>Submit Button</TooltipContent>
    </Tooltip>
  )
}
```

### Link

You can use the `buttonVariants` helper to create any element like a link that looks like a button.

```tsx
import { buttonVariants } from '@/components/ui/button'
```

```tsx
<Link className={buttonVariants({ variant: 'outline' })}>I'm a Link 🦆</Link>
```

Alternatively, you can set the `asChild` parameter and nest the link component.

```tsx
<Button asChild>
  <Link href="/tos">I'm a Link to ToS 🦆</Link>
</Button>
```

A link has no `disabled` of its own, so with `disabled` or `loading` the button marks it `aria-disabled`, dims it, and stops its click, from a pointer or from Enter, before the link or anything around it hears it. The link stays in the tab order, so a screen reader still finds it.

```tsx title="components/button-25.tsx"
// import from your project: import Demo from '@/components/button-25'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button asChild variant="outline">
        <a href="#ponds">Ponds</a>
      </Button>
      <Button asChild disabled variant="outline">
        <a href="#lakes">Lakes</a>
      </Button>
    </div>
  )
}
```

## Examples

### Primary

```tsx title="components/button-2.tsx"
// import from your project: import Demo from '@/components/button-2'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Simple button" type="button" variant={'default'}>
      Button
    </Button>
  )
}
```

### Secondary

```tsx title="components/button-3.tsx"
// import from your project: import Demo from '@/components/button-3'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" type="button" variant={'secondary'}>
      Button
    </Button>
  )
}
```

### Ghost

```tsx title="components/button-4.tsx"
// import from your project: import Demo from '@/components/button-4'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" type="button" variant={'ghost'}>
      Button
    </Button>
  )
}
```

### Outline

```tsx title="components/button-5.tsx"
// import from your project: import Demo from '@/components/button-5'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" type="button" variant={'outline'}>
      Button
    </Button>
  )
}
```

### Link

```tsx title="components/button-6.tsx"
// import from your project: import Demo from '@/components/button-6'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" type="button" variant={'link'}>
      Button
    </Button>
  )
}
```

### Destructive

```tsx title="components/button-7.tsx"
// import from your project: import Demo from '@/components/button-7'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" type="button" variant={'destructive'}>
      Button
    </Button>
  )
}
```

### Warning

```tsx title="components/button-8.tsx"
// import from your project: import Demo from '@/components/button-8'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" type="button" variant="warning">
      Button
    </Button>
  )
}
```

### Dashed

```tsx title="components/button-9.tsx"
// import from your project: import Demo from '@/components/button-9'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" type="button" variant={'dashed'}>
      Button
    </Button>
  )
}
```

### Nothing

```tsx title="components/button-22.tsx"
// import from your project: import Demo from '@/components/button-22'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return <Button variant="nothing">Button</Button>
}
```

### Sizes

`sm`, `default` and `lg` set the height and padding, and `icon-sm`, `icon` and `icon-lg` make a square button for an icon alone, which takes an `aria-label`.

```tsx title="components/button-23.tsx"
// import from your project: import Demo from '@/components/button-23'
import { Button } from '@gentleduck/registry-ui/button'
import { Plus } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button variant="outline">Default</Button>
        <Button size="lg" variant="outline">
          Large
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button aria-label="Add, small" size="icon-sm" variant="outline">
          <Plus aria-hidden="true" />
        </Button>
        <Button aria-label="Add" size="icon" variant="outline">
          <Plus aria-hidden="true" />
        </Button>
        <Button aria-label="Add, large" size="icon-lg" variant="outline">
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
```

### With Border

```tsx title="components/button-11.tsx"
// import from your project: import Demo from '@/components/button-11'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" border={'primary'} type="button" variant={'nothing'}>
      Button
    </Button>
  )
}
```

### With Border Destructive

```tsx title="components/button-12.tsx"
// import from your project: import Demo from '@/components/button-12'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" border="destructive" type="button" variant="destructive">
      Button
    </Button>
  )
}
```

### With Border Warning

```tsx title="components/button-13.tsx"
// import from your project: import Demo from '@/components/button-13'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" border="warning" type="button" variant="warning">
      Button
    </Button>
  )
}
```

### With Border Secondary

```tsx title="components/button-14.tsx"
// import from your project: import Demo from '@/components/button-14'
import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" border="secondary" type="button" variant="secondary">
      Button
    </Button>
  )
}
```

### With Icon

```tsx title="components/button-15.tsx"
// import from your project: import Demo from '@/components/button-15'
import { Button } from '@gentleduck/registry-ui/button'
import { Inbox } from 'lucide-react'

export default function Demo() {
  return (
    <Button aria-label="Inbox button" icon={<Inbox />} type="button">
      Button
    </Button>
  )
}
```

### Loading

```tsx title="components/button-16.tsx"
// import from your project: import Demo from '@/components/button-16'
import { Button } from '@gentleduck/registry-ui/button'
import { Inbox } from 'lucide-react'

export default function Demo() {
  return (
    <Button aria-busy="true" aria-label="Loading inbox button" icon={<Inbox />} loading={true} type="button">
      <span>Button</span>
    </Button>
  )
}
```

When `loading` is `true`, `Button` renders a `lucide-react` `<Loader />` with `animate-spin`, disables interaction, and replaces the leading `icon` until loading completes. The spinner holds still when the user has asked for reduced motion.

### With Second Icon

```tsx title="components/button-17.tsx"
// import from your project: import Demo from '@/components/button-17'
import { Button } from '@gentleduck/registry-ui/button'
import { ChevronsRight } from 'lucide-react'

export default function Demo() {
  return (
    <Button aria-label="Inbox button with 23 notifications" secondIcon={<ChevronsRight />} type="button">
      Button
    </Button>
  )
}
```

### Collapsible

`isCollapsed` draws the icon alone and drops `children` and `secondIcon`, so a collapsed button has no name of its own. Give it an `aria-label` while it is collapsed.

```tsx title="components/button-18.tsx"
// import from your project: import Demo from '@/components/button-18'
import { Button } from '@gentleduck/registry-ui/button'
import { Inbox } from 'lucide-react'
import React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState<boolean>(false)

  return (
    <Button
      aria-label={open ? 'Inbox' : undefined}
      icon={<Inbox />}
      isCollapsed={open}
      onClick={() => setOpen(!open)}
      type="button">
      Inbox
    </Button>
  )
}
```

A row of collapsed buttons shows each one's name in a tooltip, the eye's copy of the `aria-label`. Once the labels show, the tooltips go.

```tsx title="components/button-20.tsx"
// import from your project: import Demo from '@/components/button-20'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { Archive, Inbox, Send } from 'lucide-react'
import * as React from 'react'

const actions = [
  { icon: <Inbox />, label: 'Inbox' },
  { icon: <Send />, label: 'Sent' },
  { icon: <Archive />, label: 'Archive' },
]

export default function Demo() {
  const [collapsed, setCollapsed] = React.useState(true)

  return (
    <div className="flex flex-col items-start gap-4">
      <Toggle onPressedChange={(pressed) => setCollapsed(!pressed)} pressed={!collapsed} size="sm" variant="outline">
        Show labels
      </Toggle>
      <TooltipProvider>
        <div className="flex gap-2">
          {actions.map(({ icon, label }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button
                  aria-label={collapsed ? label : undefined}
                  icon={icon}
                  isCollapsed={collapsed}
                  variant="outline">
                  {label}
                </Button>
              </TooltipTrigger>
              {collapsed ? <TooltipContent>{label}</TooltipContent> : null}
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  )
}
```

### Expand Icon

The `expandIcon` variant makes the button a hover group, and `AnimationIcon` slides its icon in on hover, before the label or after it as `iconPlacement` says.

```tsx title="components/button-19.tsx"
// import from your project: import Demo from '@/components/button-19'
import { AnimationIcon, Button } from '@gentleduck/registry-ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="expandIcon">
        <AnimationIcon animationIcon={{ icon: <ArrowLeft aria-hidden="true" />, iconPlacement: 'left' }}>
          Back
        </AnimationIcon>
      </Button>
      <Button variant="expandIcon">
        <AnimationIcon animationIcon={{ icon: <ArrowRight aria-hidden="true" />, iconPlacement: 'right' }}>
          Next
        </AnimationIcon>
      </Button>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `Button` follows it: `icon` sits at the start and `secondIcon` at the end. Icons you pass render as-is, so choose ones that point the right way, such as `ChevronRight` for "Previous" in RTL.

```tsx title="components/button-21.tsx"
// import from your project: import Demo from '@/components/button-21'
import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { ChevronLeft, ChevronRight, Save, Trash2 } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="flex flex-wrap items-center gap-4">
        <Button icon={<Save />}>حفظ</Button>
        <Button icon={<ChevronRight />} variant="outline">
          السابق
        </Button>
        <Button secondIcon={<ChevronLeft />} variant="outline">
          التالي
        </Button>
        <Button variant="secondary">تسجيل الدخول</Button>
        <Button icon={<Trash2 />} variant="destructive">
          حذف
        </Button>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionButton` for a mount entrance plus press feedback powered by [motion](https://motion.dev). The button fades, scales and sharpens in on mount with a bouncy spring, and scales to 0.97 on tap for a physical press feel. The entrance scales on `scaleX` and `scaleY`, so `scale` keeps the 15ms tap tween and a press releases at once.

```tsx title="components/button-10.tsx"
// import from your project: import Demo from '@/components/button-10'
'use client'

import { MotionButton } from '@gentleduck/registry-ui/button'
import { ArrowRight, Mail, PanelLeftClose, RefreshCw, Send } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [loading1, setLoading1] = React.useState(false)
  const [loading2, setLoading2] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)

  const handleLoad = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <MotionButton>Default</MotionButton>
      <MotionButton variant="outline" icon={<Mail />}>
        Email
      </MotionButton>
      <MotionButton variant="ghost" secondIcon={<ArrowRight />}>
        Next
      </MotionButton>
      <MotionButton variant="default" icon={<Send />} loading={loading1} onClick={() => handleLoad(setLoading1)}>
        Submit
      </MotionButton>
      <MotionButton
        variant="secondary"
        icon={<RefreshCw />}
        secondIcon={<ArrowRight />}
        loading={loading2}
        onClick={() => handleLoad(setLoading2)}>
        Sync
      </MotionButton>
      <MotionButton
        variant="outline"
        icon={<PanelLeftClose />}
        isCollapsed={collapsed}
        onClick={() => setCollapsed((c) => !c)}>
        Sidebar
      </MotionButton>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionButton` instead of `Button`, with the same props. The regular `Button` is perfectly fine - this is an optional enhancement.

With `asChild`, `MotionButton` animates a wrapper around the element you give it, and disables a link the way `Button` does.

```tsx title="components/button-24.tsx"
// import from your project: import Demo from '@/components/button-24'
import { MotionButton } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <MotionButton asChild variant="outline">
        <a href="#ponds">Ponds</a>
      </MotionButton>
      <MotionButton asChild disabled variant="outline">
        <a href="#lakes">Lakes</a>
      </MotionButton>
    </div>
  )
}
```

## API Reference

### Button

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'destructive' \| 'warning' \| 'outline' \| 'dashed' \| 'secondary' \| 'ghost' \| 'link' \| 'expandIcon' \| 'nothing'` | `'default'` | Visual style variant |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon' \| 'icon-sm' \| 'icon-lg'` | `'default'` | Size of the button |
| `border` | `'default' \| 'primary' \| 'secondary' \| 'destructive' \| 'warning'` | `'default'` | Border style variant |
| `asChild` | `boolean` | `-` | If `true`, renders using a custom child element via `Slot` (e.g. a `Link`) |
| `loading` | `boolean` | `-` | If `true`, renders `<Loader className="animate-spin motion-reduce:animate-none" />`, disables the button, and temporarily overrides `icon` |
| `disabled` | `boolean` | `-` | Disables the button manually |
| `icon` | `React.ReactNode` | `-` | Primary icon displayed before the content (or centered if collapsed) |
| `secondIcon` | `React.ReactNode` | `-` | Secondary icon displayed after the content |
| `isCollapsed` | `boolean` | `-` | Draws the icon alone, at the `icon` size, and drops `children` and `secondIcon`. Pair it with an `aria-label`. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native HTML button type |
| `...props` | `Omit<React.HTMLProps<HTMLButtonElement>, 'size'>` | - | Additional props to spread to the button element |

### AnimationIcon

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | (required) | Content inside the animation icon wrapper |
| `animationIcon` | `{ icon?: React.ReactNode; iconPlacement?: 'left' \| 'right' }` | `-` | Animation icon configuration with icon element and placement direction |

### MotionButton

Adds a `scaleIn` entrance with a `springBouncy` transition on mount, `whileTap` press feedback (scale 0.97) that `useMotionPreset`'s `tap` releases at once, and animated icon/text transitions via `AnimatePresence`. With `asChild` it animates a wrapper around the child and marks the child `aria-disabled` while `disabled` or `loading`. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ButtonProps` | - | All props from `Button` |