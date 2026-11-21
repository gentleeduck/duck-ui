```tsx title="components/collapsible-1.tsx"
// import from your project: import Demo from '@/components/collapsible-1'
'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import { ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible className="flex w-[350px] flex-col gap-2" onOpenChange={setIsOpen} open={isOpen}>
      <div className="flex items-center justify-between gap-4 px-4">
        <h4 className="font-semibold text-sm">@peduarte starred 3 repositories</h4>
        <CollapsibleTrigger size={'icon'}>
          <ChevronsUpDown aria-hidden="true" />
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">@gentleduck/primitives</div>
      <CollapsibleContent className="flex flex-col gap-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm">@gentleduck/variants</div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">@stitches/react</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

## Philosophy

Collapsible is the simplest disclosure primitive  -  it shows and hides content. Unlike Accordion, it doesn't manage a group of items or enforce single-selection. Use it for individual expand/collapse needs like "show more" sections, advanced settings, or code blocks. It's the building block that Accordion is built on.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add collapsible
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/primitives
```

Add the `Button` component to your project.

The `Collapsible` component uses the [`Button`](/duck-ui/components/button) component. Make sure you have it installed in your project.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
```

```tsx showLineNumbers
<Collapsible>
  <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
  <CollapsibleContent>
    Yes. Free to use for personal and commercial projects. No attribution
    required.
  </CollapsibleContent>
</Collapsible>
```

## Examples

### Active Trigger on Open

Style the trigger to appear active while the collapsible is expanded using `data-[state=open]`:

```tsx title="components/collapsible-3.tsx"
// import from your project: import Demo from '@/components/collapsible-3'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import { ChevronsUpDown } from 'lucide-react'

export default function Demo() {
  return (
    <Collapsible className="w-72 space-y-2">
      <div className="flex items-center justify-between space-x-4">
        <h4 className="font-semibold text-sm">3 dependencies</h4>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">@gentleduck/primitives</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm">@gentleduck/variants</div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">@gentleduck/libs</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

### Open by default

`defaultOpen` starts it open and leaves it to the user from there, with no state of your own.

```tsx title="components/collapsible-5.tsx"
// import from your project: import Demo from '@/components/collapsible-5'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import { ChevronsUpDown } from 'lucide-react'

export default function Demo() {
  return (
    <Collapsible className="w-80 space-y-2" defaultOpen>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Release notes</h4>
        <CollapsibleTrigger asChild>
          <Button size="sm" variant="ghost">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle release notes</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-1 text-muted-foreground text-sm">
        <p>Command takes a fuzzy filter and a result limit.</p>
        <p>Calendar pages every month it shows.</p>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

### Guarded and kept mounted

```tsx title="components/collapsible-6.tsx"
// import from your project: import Demo from '@/components/collapsible-6'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import * as React from 'react'

export default function Demo() {
  const [unlocked, setUnlocked] = React.useState(false)

  return (
    <div className="flex w-[350px] flex-col gap-3">
      <label className="flex items-center gap-2 text-sm">
        <input checked={unlocked} onChange={(event) => setUnlocked(event.target.checked)} type="checkbox" />I have read
        the warning
      </label>
      <Collapsible>
        <CollapsibleTrigger asChild onClick={(event) => unlocked || event.preventDefault()}>
          <Button variant="outline">Advanced settings</Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 rounded-md border p-3 text-sm data-[state=closed]:hidden" forceMount>
          Kept in the page while closed, so a search of the page or a form inside still sees it.
        </CollapsibleContent>
      </Collapsible>
      <p className="text-muted-foreground text-sm">
        The trigger's onClick prevents the toggle until the box is ticked.
      </p>
    </div>
  )
}
```

### Reading its state

```tsx title="components/collapsible-7.tsx"
// import from your project: import Demo from '@/components/collapsible-7'
'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  useCollapsible,
} from '@gentleduck/registry-ui/collapsible'

function Status() {
  const { open, contentId, onOpenChange } = useCollapsible()
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span>
        {open ? 'Open' : 'Closed'}, controlling #{contentId}
      </span>
      <button className="underline" onClick={() => onOpenChange(!open)} type="button">
        Toggle from inside
      </button>
    </div>
  )
}

export default function Demo() {
  return (
    <Collapsible className="flex w-[350px] flex-col gap-2 rounded-md border p-3">
      <Status />
      <CollapsibleTrigger className="text-start font-medium">Release notes</CollapsibleTrigger>
      <CollapsibleContent className="text-muted-foreground text-sm">
        Fixed the date picker in Safari.
      </CollapsibleContent>
    </Collapsible>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the collapsible follows it. No `dir` prop or `rtl:` classes needed.

```tsx title="components/collapsible-2.tsx"
// import from your project: import Demo from '@/components/collapsible-2'
'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <DirectionProvider dir="rtl">
      <Collapsible className="flex w-[350px] flex-col gap-2" onOpenChange={setIsOpen} open={isOpen}>
        <div className="flex items-center justify-between gap-4 px-4">
          <h4 className="font-semibold text-sm">أضاف أحمد نجمة إلى 3 مستودعات</h4>
          <CollapsibleTrigger size={'icon'}>
            <ChevronsUpDown aria-hidden="true" />
            <span className="sr-only">إظهار المستودعات أو إخفاؤها</span>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">gentleeduck/duck-ui</div>
        <CollapsibleContent className="flex flex-col gap-2">
          <div className="rounded-md border px-4 py-2 font-mono text-sm">gentleeduck/duck-vim</div>
          <div className="rounded-md border px-4 py-2 font-mono text-sm">gentleeduck/duck-mc</div>
        </CollapsibleContent>
      </Collapsible>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionCollapsibleContent` for smooth height animations powered by [motion](https://motion.dev). The content animates from height 0 to auto with a blur fade.

```tsx title="components/collapsible-4.tsx"
// import from your project: import Demo from '@/components/collapsible-4'
'use client'

import { Collapsible, CollapsibleTrigger, MotionCollapsibleContent } from '@gentleduck/registry-ui/collapsible'
import { ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible className="flex w-[350px] flex-col gap-2" onOpenChange={setIsOpen} open={isOpen}>
      <div className="flex items-center justify-between gap-4 px-4">
        <h4 className="font-semibold text-sm">@peduarte starred 3 repositories</h4>
        <CollapsibleTrigger size={'icon'}>
          <ChevronsUpDown aria-hidden="true" />
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">@gentleduck/primitives</div>
      <MotionCollapsibleContent className="flex flex-col gap-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm">@gentleduck/variants</div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">@stitches/react</div>
      </MotionCollapsibleContent>
    </Collapsible>
  )
}
```

}>
  Requires the `motion` package. Replace `CollapsibleContent` with `MotionCollapsibleContent`. The `Collapsible` root and `CollapsibleTrigger` stay the same.

## API Reference

### Collapsible

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Called once with the new state when the trigger is clicked |
| `defaultOpen` | `boolean` | `false` | Initial open state when uncontrolled |
| `dir` | `'ltr' \| 'rtl'` | - | Lands on the root as its `dir` attribute. Without it the root carries none and follows the page. |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Additional props to spread to the root div |

### CollapsibleTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `ButtonVariant` | `'ghost'` | Button variant passed to the underlying `Button` component |
| `children` | `React.ReactNode` | - | Trigger content |
| `onClick` | `React.MouseEventHandler` | - | Called before the toggle; `event.preventDefault()` keeps the collapsible as it is |
| `...props` | `React.ComponentPropsWithoutRef<typeof Button>` | - | Additional props inherited from `Button`. |

### CollapsibleContent

Its children unmount once the section's close transition ends, a `transition-delay` and the longest of several transitions included. Under `motion-reduce:transition-none` they unmount at once.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `boolean` | `false` | When `true`, content is always mounted in the DOM regardless of open state |
| `...props` | `React.HTMLProps<HTMLElement>` | - | Additional props to spread to the section element |

### useCollapsible

Hook to access collapsible state from within a `Collapsible` tree. Throws if used outside a `Collapsible`.

```tsx
import { useCollapsible } from "@/components/ui/collapsible"

const { open, onOpenChange } = useCollapsible()
```

| Return | Type | Description |
| --- | --- | --- |
| `open` | `boolean` | Current open state |
| `onOpenChange` | `(open: boolean) => void` | Function to update open state |
| `wrapperRef` | `React.RefObject<HTMLDivElement \| null>` | Ref to the root collapsible element |
| `triggerRef` | `React.RefObject<HTMLButtonElement \| null>` | Ref to the trigger button |
| `contentRef` | `React.RefObject<HTMLElement \| null>` | Ref to the content section |
| `contentId` | `string` | Auto-generated ID linking trigger and content via `aria-controls` |

### MotionCollapsibleContent

Animates height from 0 to auto with a blur and opacity fade. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' \| 'onDragStart' \| 'onDragEnd' \| 'onAnimationStart'>` | - | Additional props to spread to the underlying `section` element. This is a separate component from `CollapsibleContent`, not a wrapper around it, so it does not accept `forceMount`. |