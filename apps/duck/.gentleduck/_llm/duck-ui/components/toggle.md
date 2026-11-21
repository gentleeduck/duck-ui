```tsx title="components/toggle-1.tsx"
// import from your project: import Demo from '@/components/toggle-1'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Bold } from 'lucide-react'

export default function Demo() {
  return (
    <Toggle aria-label="Toggle bold">
      <Bold />
    </Toggle>
  )
}
```

## Philosophy

Toggles represent a stateful action  -  not navigation, not form submission, but "turn this on or off." The distinction from buttons matters: toggles carry `aria-pressed` state and communicate their current value visually. Built on `@gentleduck/primitives/toggle` for proper keyboard and accessibility behavior, styled with `@gentleduck/variants` to keep visual states clean and type-safe.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add toggle
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/variants @gentleduck/libs
```

Add the `Toggle` component to your project.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Toggle } from '@/components/ui/toggle'
```

```tsx
<Toggle>Toggle</Toggle>
```

## Examples

### Default

```tsx title="components/toggle-2.tsx"
// import from your project: import Demo from '@/components/toggle-2'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Italic } from 'lucide-react'

export default function Demo() {
  return (
    <Toggle aria-label="Toggle italic">
      <Italic />
    </Toggle>
  )
}
```

### Outline

```tsx title="components/toggle-3.tsx"
// import from your project: import Demo from '@/components/toggle-3'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Bold } from 'lucide-react'

export default function Demo() {
  return (
    <Toggle aria-label="Toggle bold" variant={'outline'}>
      <Bold />
    </Toggle>
  )
}
```

### With Text

```tsx title="components/toggle-4.tsx"
// import from your project: import Demo from '@/components/toggle-4'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Italic } from 'lucide-react'

export default function Demo() {
  return (
    <Toggle>
      <Italic />
      Italic
    </Toggle>
  )
}
```

### Small

```tsx title="components/toggle-5.tsx"
// import from your project: import Demo from '@/components/toggle-5'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Italic } from 'lucide-react'

export default function Demo() {
  return (
    <Toggle aria-label="Toggle italic" size="sm">
      <Italic />
    </Toggle>
  )
}
```

### Large

```tsx title="components/toggle-6.tsx"
// import from your project: import Demo from '@/components/toggle-6'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Italic } from 'lucide-react'

export default function Demo() {
  return (
    <Toggle aria-label="Toggle italic" size="lg">
      <Italic />
    </Toggle>
  )
}
```

### Disabled

```tsx title="components/toggle-7.tsx"
// import from your project: import Demo from '@/components/toggle-7'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Underline } from 'lucide-react'

export default function Demo() {
  return (
    <Toggle aria-label="Toggle underline" disabled>
      <Underline />
    </Toggle>
  )
}
```

### Content that follows the state

Pass a function as the child to render content from the pressed state, such as an icon that changes when the toggle turns on.

```tsx title="components/toggle-10.tsx"
// import from your project: import Demo from '@/components/toggle-10'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Volume2, VolumeX } from 'lucide-react'

export default function Demo() {
  return (
    <Toggle aria-label="Mute" variant="outline">
      {(pressed) => (pressed ? <VolumeX /> : <Volume2 />)}
    </Toggle>
  )
}
```

### Controlled

Hold the state yourself with `pressed` and `onPressedChange` when something else reads it, here the password field's `type`.

```tsx title="components/toggle-11.tsx"
// import from your project: import Demo from '@/components/toggle-11'
'use client'

import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [shown, setShown] = React.useState(false)

  return (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="toggle-password">Password</Label>
      <div className="flex gap-2">
        <Input autoComplete="current-password" id="toggle-password" type={shown ? 'text' : 'password'} />
        <Toggle aria-label="Show password" onPressedChange={setShown} pressed={shown} variant="outline">
          {shown ? <EyeOff /> : <Eye />}
        </Toggle>
      </div>
    </div>
  )
}
```

### Starts pressed

`defaultPressed` starts the toggle on and leaves the state to it. `onPressedChange` still reports each change.

```tsx title="components/toggle-12.tsx"
// import from your project: import Demo from '@/components/toggle-12'
'use client'

import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Pin } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [pinned, setPinned] = React.useState(true)

  return (
    <div className="flex items-center gap-3">
      <Toggle aria-label="Pin to the sidebar" defaultPressed onPressedChange={setPinned} variant="outline">
        <Pin />
      </Toggle>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {pinned ? 'Pinned to the sidebar.' : 'Not pinned.'}
      </p>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `Toggle` follows it. No `dir` prop needed.

```tsx title="components/toggle-8.tsx"
// import from your project: import Demo from '@/components/toggle-8'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Bookmark } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Toggle variant="outline">
        <Bookmark />
        إشارة مرجعية
      </Toggle>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionToggle` for tap feedback and a staggered entrance animation powered by [motion](https://motion.dev). Each child is wrapped in a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition, staggered by 50ms per child, and the toggle scales to 0.97 on tap for a physical press feel and back on the same 15ms tween.

```tsx title="components/toggle-9.tsx"
// import from your project: import Demo from '@/components/toggle-9'
'use client'

import { MotionToggle } from '@gentleduck/registry-ui/toggle'
import { AlignLeft, Bold, Italic, Star, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <MotionToggle aria-label="Toggle bold" variant="outline">
        <Bold />
      </MotionToggle>
      <MotionToggle aria-label="Toggle italic" variant="outline">
        <Italic />
        Italic
      </MotionToggle>
      <MotionToggle aria-label="Toggle underline" variant="outline">
        <Underline />
        Underline
      </MotionToggle>
      <MotionToggle aria-label="Toggle align" variant="outline" size="lg">
        <AlignLeft />
        Align Left
      </MotionToggle>
      <MotionToggle aria-label="Toggle favorite" variant="outline" size="sm">
        <Star />
      </MotionToggle>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionToggle` instead of `Toggle`. Same props. The regular `Toggle` is perfectly fine - this is an optional enhancement.

## API Reference

### Toggle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names to apply |
| `pressed` | `boolean` | - | The controlled pressed state of the toggle |
| `defaultPressed` | `boolean` | `false` | The pressed state when initially rendered |
| `onPressedChange` | `(pressed: boolean) => void` | - | Event handler called when the pressed state changes |
| `variant` | `'default' \| 'outline'` | `'default'` | Visual style variant of the toggle |
| `size` | `'default' \| 'sm' \| 'lg'` | `'default'` | Size variant of the toggle |
| `disabled` | `boolean` | `false` | Disables the toggle if set to `true` |
| `dir` | `string` | - | Sets the `dir` attribute, `auto` included. Leave it out and the toggle follows the page |
| `children` | `React.ReactNode \| ((pressed: boolean) => React.ReactNode)` | - | Content rendered inside the toggle button, or a function of the pressed state |
| `asChild` | `boolean` | `false` | Render the child element instead of a `button`, merging the toggle's props, state and ref onto it |
| `ref` | `React.Ref<HTMLButtonElement>` | - | Ref forwarded to the underlying button element |

### Data Attributes

| Attribute | Values | Description |
| --- | --- | --- |
| `data-state` | `"on" \| "off"` | The pressed state of the toggle |
| `data-disabled` | Present when disabled | Whether the toggle is disabled |

### MotionToggle

Adds `whileTap` press feedback (scale 0.97, in and out on a 15ms tween) and a staggered `scaleIn` entrance (fade, scale, and blur) on each child, delayed 50ms per index, with a `springBouncy` transition. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `Omit<ToggleProps, 'onDrag' \| 'onDragStart' \| 'onDragEnd' \| 'onAnimationStart'>` | - | All props from `Toggle` except motion event handlers |