```tsx title="components/label-1.tsx"
// import from your project: import Demo from '@/components/label-1'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
    </div>
  )
}
```

## Philosophy

Labels are the accessibility backbone of every form. A form control without a label is invisible to screen readers. We ship Label as a standalone component rather than baking it into every form element because composition is more flexible than configuration  -  you decide where the label goes and how it connects.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add label
```

Install the following dependencies:

```bash
npm install @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Label } from "@/components/ui/label"
```

```tsx
<Label htmlFor="email">Your email address</Label>
```

A double click on a label toggles its control twice without selecting the label's text. A control inside the label keeps its own double click.

## Examples

### With an input

Point `htmlFor` at the control's `id`, and the label names it for screen readers and focuses it on a click.

```tsx title="components/label-2.tsx"
// import from your project: import Demo from '@/components/label-2'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email-2">Email</Label>
      <Input id="email-2" placeholder="you@example.com" type="email" />
    </div>
  )
}
```

### Disabled

A label right after a disabled `Checkbox` or `Switch`, or one wrapped around a disabled control, dims and shows a not-allowed cursor. A label before its control, such as one above an `Input`, cannot see it, so dim that one yourself.

```tsx title="components/label-5.tsx"
// import from your project: import Demo from '@/components/label-5'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'

export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox defaultChecked disabled id="label-disabled-digest" />
        <Label htmlFor="label-disabled-digest">Weekly digest</Label>
      </div>
      <Label className="flex items-center gap-2">
        <Switch disabled />
        Beta features
      </Label>
    </div>
  )
}
```

### Your own onMouseDown

```tsx title="components/label-6.tsx"
// import from your project: import Demo from '@/components/label-6'
'use client'

import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import * as React from 'react'

export default function Demo() {
  const [presses, setPresses] = React.useState(0)

  return (
    <div className="flex w-[280px] flex-col gap-2">
      <Label htmlFor="label-6-email" onMouseDown={() => setPresses((count) => count + 1)}>
        Double-click this label
      </Label>
      <Input id="label-6-email" placeholder="you@example.com" />
      <p className="text-muted-foreground text-sm">
        onMouseDown ran {presses} times, and a double click still selects none of the label's text.
      </p>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `Label` follows it. No `dir` prop needed.

```tsx title="components/label-3.tsx"
// import from your project: import Demo from '@/components/label-3'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="flex items-center gap-2">
        <Checkbox id="label-terms-rtl" />
        <Label htmlFor="label-terms-rtl">أوافق على الشروط والأحكام</Label>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionLabel` for a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition, powered by [motion](https://motion.dev). Pairs well with `MotionInput` for staggered form field entrance.

```tsx title="components/label-4.tsx"
// import from your project: import Demo from '@/components/label-4'
'use client'

import { MotionInput } from '@gentleduck/registry-ui/input'
import { MotionLabel } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 p-4">
      <div className="flex flex-col gap-1.5">
        <MotionLabel htmlFor="motion-label-name" index={0}>
          Full name
        </MotionLabel>
        <MotionInput id="motion-label-name" placeholder="Jane Doe" index={0} />
      </div>
      <div className="flex flex-col gap-1.5">
        <MotionLabel htmlFor="motion-label-email" index={1}>
          Email address
        </MotionLabel>
        <MotionInput id="motion-label-email" type="email" placeholder="jane@example.com" index={1} />
      </div>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionLabel` instead of `Label`. Pass `index` for stagger delay.

## API Reference

### Label

Renders an accessible label element associated with form controls.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional class names for the label element |
| `htmlFor` | `string` | - | The `id` of the form element this label is associated with |
| `onMouseDown` | `React.MouseEventHandler<HTMLLabelElement>` | - | Called on every press. A double click is then kept from selecting the label's text unless the handler called `preventDefault` or the press is inside a control. |
| `children` | `React.ReactNode` | - | Label text or elements |
| `ref` | `React.Ref<HTMLLabelElement>` | - | Ref forwarded to the label element |
| `...props` | `React.HTMLProps<HTMLLabelElement>` | - | Additional props to spread to the label element |

### MotionLabel

Same props as `Label` plus an optional `index` prop for stagger delay (50ms per index). Adds a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition. Requires the `motion` package.