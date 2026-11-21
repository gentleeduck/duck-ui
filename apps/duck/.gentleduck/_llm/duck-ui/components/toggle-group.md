```tsx title="components/toggle-group-1.tsx"
// import from your project: import Demo from '@/components/toggle-group-1'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <ToggleGroup aria-label="Text style" type="single">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

## Philosophy

When multiple toggles share context, they become a group. ToggleGroup manages mutual exclusivity (single mode) or multi-selection, keeping the state logic out of your components. Built on `@gentleduck/primitives/toggle-group` with roving focus keyboard navigation  -  arrow keys move between items, Space/Enter toggles them.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add toggle-group
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/variants @gentleduck/libs
```

Add the [`Toggle`](/duck-ui/components/toggle) component to your project 

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
```

```tsx
<ToggleGroup type="single">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
  <ToggleGroupItem value="c">C</ToggleGroupItem>
</ToggleGroup>
```

## Examples

### Default

```tsx title="components/toggle-group-2.tsx"
// import from your project: import Demo from '@/components/toggle-group-2'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <ToggleGroup aria-label="Text formatting" type="multiple">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

### Outline

```tsx title="components/toggle-group-3.tsx"
// import from your project: import Demo from '@/components/toggle-group-3'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <ToggleGroup aria-label="Text style" type="single" variant="outline">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

### Single

```tsx title="components/toggle-group-4.tsx"
// import from your project: import Demo from '@/components/toggle-group-4'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <ToggleGroup aria-label="Text style" defaultValue="bold" type="single">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

### Small

```tsx title="components/toggle-group-5.tsx"
// import from your project: import Demo from '@/components/toggle-group-5'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <ToggleGroup aria-label="Text style" size="sm" type="single" variant="outline">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

### Large

```tsx title="components/toggle-group-6.tsx"
// import from your project: import Demo from '@/components/toggle-group-6'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <ToggleGroup aria-label="Text style" size="lg" type="single" variant="outline">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

### Disabled

`disabled` on the group turns off every item. Put it on one `ToggleGroupItem` to turn off only that item, as the vertical example below does.

```tsx title="components/toggle-group-7.tsx"
// import from your project: import Demo from '@/components/toggle-group-7'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <ToggleGroup aria-label="Text style" disabled type="single">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

### Controlled, one always on

Hold the value with `value` and `onValueChange`. `deselectable={false}` keeps the item that is on from being turned off, so the group always has a value.

```tsx title="components/toggle-group-10.tsx"
// import from your project: import Demo from '@/components/toggle-group-10'
'use client'

import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { LayoutGrid, List } from 'lucide-react'
import * as React from 'react'

const files = ['invoice.pdf', 'logo.svg', 'notes.md', 'photo.jpg']

export default function Demo() {
  const [view, setView] = React.useState('list')

  return (
    <div className="grid w-full max-w-sm gap-3">
      <ToggleGroup
        aria-label="View"
        className="justify-self-end"
        deselectable={false}
        onValueChange={setView}
        type="single"
        value={view}
        variant="outline">
        <ToggleGroupItem aria-label="List" value="list">
          <List />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Grid" value="grid">
          <LayoutGrid />
        </ToggleGroupItem>
      </ToggleGroup>
      <ul className={view === 'grid' ? 'grid grid-cols-2 gap-2' : 'grid gap-1'}>
        {files.map((file) => (
          <li className="rounded-md border px-3 py-2 text-sm" key={file}>
            {file}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Vertical

`orientation="vertical"` stacks the items, rounds the group at its top and bottom, and moves focus with `ArrowDown` and `ArrowUp`. Arrow keys pass over a disabled item.

```tsx title="components/toggle-group-11.tsx"
// import from your project: import Demo from '@/components/toggle-group-11'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'

export default function Demo() {
  return (
    <ToggleGroup
      aria-label="Map style"
      className="w-40"
      defaultValue="map"
      deselectable={false}
      orientation="vertical"
      type="single"
      variant="outline">
      <ToggleGroupItem value="map">Map</ToggleGroupItem>
      <ToggleGroupItem value="satellite">Satellite</ToggleGroupItem>
      <ToggleGroupItem disabled title="Terrain is not available for this area" value="terrain">
        Terrain
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

### Several on at once

With `type="multiple"` each item turns on and off by itself, and `onValueChange` hands over every value that is on.

```tsx title="components/toggle-group-12.tsx"
// import from your project: import Demo from '@/components/toggle-group-12'
'use client'

import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import * as React from 'react'

const days = [
  ['mon', 'M', 'Monday'],
  ['tue', 'T', 'Tuesday'],
  ['wed', 'W', 'Wednesday'],
  ['thu', 'T', 'Thursday'],
  ['fri', 'F', 'Friday'],
  ['sat', 'S', 'Saturday'],
  ['sun', 'S', 'Sunday'],
] as const

const list = new Intl.ListFormat('en', { type: 'conjunction' })

export default function Demo() {
  const [picked, setPicked] = React.useState<string[]>(['mon', 'wed', 'fri'])
  const names = days.filter(([value]) => picked.includes(value)).map(([, , name]) => name)

  return (
    <div className="grid gap-3">
      <ToggleGroup
        aria-label="Repeat on"
        className="justify-start"
        onValueChange={setPicked}
        size="sm"
        type="multiple"
        value={picked}
        variant="outline">
        {days.map(([value, letter, name]) => (
          <ToggleGroupItem aria-label={name} className="w-9" key={value} value={value}>
            {letter}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {names.length > 0 ? `Repeats every ${list.format(names)}.` : 'Does not repeat.'}
      </p>
    </div>
  )
}
```

### Without roving focus or looping

```tsx title="components/toggle-group-13.tsx"
// import from your project: import Demo from '@/components/toggle-group-13'
'use client'

import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <ToggleGroup aria-label="Status filters" rovingFocus={false} type="multiple" variant="outline">
        <ToggleGroupItem value="open">Open</ToggleGroupItem>
        <ToggleGroupItem value="closed">Closed</ToggleGroupItem>
        <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup aria-label="Sort" defaultValue="new" loop={false} type="single" variant="outline">
        <ToggleGroupItem value="new">Newest</ToggleGroupItem>
        <ToggleGroupItem value="old">Oldest</ToggleGroupItem>
        <ToggleGroupItem value="top">Top</ToggleGroupItem>
      </ToggleGroup>
      <p className="text-muted-foreground text-sm">
        The first makes each item a Tab stop. The second stops the arrows at either end.
      </p>
    </div>
  )
}
```

## Keyboard Navigation

| Key | Description |
| --- | --- |
| `Tab` | Moves focus into the toggle group (focuses the active or first item) |
| `ArrowRight` | Moves focus to the next item |
| `ArrowLeft` | Moves focus to the previous item |
| `ArrowDown` | Moves focus to the next item |
| `ArrowUp` | Moves focus to the previous item |
| `Home` | Moves focus to the first item |
| `End` | Moves focus to the last item |
| `Space` / `Enter` | Toggles the focused item |

The arrows skip a disabled item and wrap at either end unless `loop={false}`. A vertical group listens to `ArrowDown` and `ArrowUp` only, a horizontal one to `ArrowRight` and `ArrowLeft` only, and right-to-left turns `ArrowRight` and `ArrowLeft` around. With `rovingFocus={false}` the arrows do nothing and every item is its own `Tab` stop.

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `ToggleGroup` follows it, including the joined corners and flipped Left/Right arrow keys. No `dir` prop needed.

```tsx title="components/toggle-group-8.tsx"
// import from your project: import Demo from '@/components/toggle-group-8'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <ToggleGroup aria-label="تنسيق النص" type="multiple" variant="outline">
        <ToggleGroupItem aria-label="غامق" value="bold">
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="مائل" value="italic">
          <Italic />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="تسطير" value="underline">
          <Underline />
        </ToggleGroupItem>
      </ToggleGroup>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionToggleGroup` and `MotionToggleGroupItem` for a sliding active-item indicator and tap press feedback powered by [motion](https://motion.dev). In a single group one background indicator slides between items via `layoutId`. In a multiple group each item that is on fades in its own. Each item presses to 0.97 on tap.

```tsx title="components/toggle-group-9.tsx"
// import from your project: import Demo from '@/components/toggle-group-9'
'use client'

import { MotionToggleGroup, MotionToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <MotionToggleGroup aria-label="Text style" type="single">
      <MotionToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </MotionToggleGroupItem>
      <MotionToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </MotionToggleGroupItem>
      <MotionToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </MotionToggleGroupItem>
    </MotionToggleGroup>
  )
}
```

}>
  Requires the `motion` package. Use `MotionToggleGroup` + `MotionToggleGroupItem` instead of `ToggleGroup` + `ToggleGroupItem`. Same props. The regular components are perfectly fine - this is an optional enhancement.

## API Reference

### ToggleGroup

A `type="single"` group is a `radiogroup` of radios, and a `type="multiple"` one a `toolbar` of toggle buttons.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'single' \| 'multiple'` | (required) | Determines selection behavior. `'single'` allows one toggle at a time and renders a `radiogroup` of `radio` items with `aria-checked`; `'multiple'` allows multiple and renders a `toolbar` (a `group` without roving focus) of buttons with `aria-pressed` |
| `value` | `string \| string[]` | - | Controlled selected value(s) |
| `defaultValue` | `string \| string[]` | - | Uncontrolled initial selected value(s) |
| `onValueChange` | `(value: string \| string[]) => void` | - | Callback invoked when the value changes |
| `variant` | `'default' \| 'outline'` | `'default'` | Visual style variant for the toggles (passed to items via context) |
| `size` | `'default' \| 'sm' \| 'lg'` | `'default'` | Size variant for the toggles (passed to items via context) |
| `disabled` | `boolean` | `false` | Disables all items in the group |
| `deselectable` | `boolean` | `true` | Lets the last item that is on be turned off. `false` keeps one item on |
| `rovingFocus` | `boolean` | `true` | Whether to use roving focus for keyboard navigation |
| `loop` | `boolean` | `true` | Whether keyboard navigation should loop at boundaries |
| `orientation` | `'horizontal' \| 'vertical'` | - | The axis of the arrow keys. `'vertical'` also stacks the items in a column |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional CSS class names to apply |
| `children` | `React.ReactNode` | - | ToggleGroupItem elements to render inside the group |
| `ref` | `React.Ref<HTMLDivElement>` | - | Ref forwarded to the underlying div element |

### ToggleGroupItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | (required) | The unique value identifying this toggle item |
| `variant` | `'default' \| 'outline'` | - | Visual style variant for this item (overrides group context) |
| `size` | `'default' \| 'sm' \| 'lg'` | - | Size variant for this item (overrides group context) |
| `disabled` | `boolean` | `false` | Disables this specific item |
| `className` | `string` | - | Additional CSS class names to apply |
| `children` | `React.ReactNode \| ((pressed: boolean) => React.ReactNode)` | - | Content rendered inside the toggle item, or a function of whether it is on |
| `ref` | `React.Ref<HTMLButtonElement>` | - | Ref forwarded to the underlying button element |

### Data Attributes

| Attribute | Values | Description |
| --- | --- | --- |
| `data-state` | `"on" \| "off"` | The pressed state of the item |
| `data-disabled` | Present when disabled | Whether the item is disabled |

### MotionToggleGroup

Wraps `ToggleGroup` in a `LayoutGroup` (scoped to a unique group ID) so its items can share the `layoutId`-based sliding indicator. Has no entrance animation of its own. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ToggleGroupProps` | - | All props from `ToggleGroup` are supported |

### MotionToggleGroupItem

Adds `whileTap` press feedback (scale 0.97). When on, renders a background indicator. In a single group it is one shared `layoutId` that slides between items with `springSmooth`. In a multiple group each item fades its own in and out, since items on together cannot share one `layoutId`. The indicator is in the first render, so the server markup has it too. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `Omit<ToggleGroupItemProps, 'onDrag' \| 'onDragStart' \| 'onDragEnd' \| 'onAnimationStart'>` | - | All props from `ToggleGroupItem` except motion event handlers |