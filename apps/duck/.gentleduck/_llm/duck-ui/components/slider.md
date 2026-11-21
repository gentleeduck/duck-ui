```tsx title="components/slider-1.tsx"
// import from your project: import Demo from '@/components/slider-1'
import { Slider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return <Slider aria-label="Volume" defaultValue={[75]} max={100} step={1} className="mx-auto w-full max-w-xs" />
}
```

## Philosophy

Sliders let users select values within a range through direct manipulation. The `@gentleduck/primitives/slider` layer provides its own accessible foundation (keyboard arrows, ARIA attributes, RTL support), and this component adds the visual track/range/thumb styling on top. The Root/Track/Range/Thumb decomposition lets you restyle any part without rebuilding the interaction logic.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add slider
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/primitives
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Slider } from "@/components/ui/slider"
```

```tsx
<Slider aria-label="Volume" defaultValue={[33]} max={100} step={1} />
```

## Examples

### Range

```tsx title="components/slider-2.tsx"
// import from your project: import Demo from '@/components/slider-2'
import { Slider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return (
    <Slider aria-label="Price range" defaultValue={[25, 50]} max={100} step={5} className="mx-auto w-full max-w-xs" />
  )
}
```

### Horizontal

```tsx title="components/slider-3.tsx"
// import from your project: import Demo from '@/components/slider-3'
import { cn } from '@gentleduck/libs/cn'
import { Slider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <Slider aria-label="Opacity" className={cn('w-[60%]')} defaultValue={[33]} max={100} orientation="horizontal" />
    </div>
  )
}
```

### Vertical

```tsx title="components/slider-4.tsx"
// import from your project: import Demo from '@/components/slider-4'
import { Slider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return (
    <div className="mx-auto flex w-full max-w-xs items-center justify-center gap-6">
      <Slider aria-label="Bass" defaultValue={[50]} max={100} step={1} orientation="vertical" className="h-40" />
      <Slider aria-label="Treble" defaultValue={[25]} max={100} step={1} orientation="vertical" className="h-40" />
    </div>
  )
}
```

### Controlled

Hold the values with `value` and `onValueChange`, and save them in `onValueCommit`, which fires once when a drag ends or a key moves a thumb. `min`, `max` and `step` set the scale, and `largeStep` sets how far <Kbd>PageUp</Kbd> and <Kbd>PageDown</Kbd> move. Name it with `aria-labelledby` when the label is on the page.

```tsx title="components/slider-7.tsx"
// import from your project: import Demo from '@/components/slider-7'
'use client'

import { Slider } from '@gentleduck/registry-ui/slider'
import * as React from 'react'

export default function Demo() {
  const id = React.useId()
  const [zoom, setZoom] = React.useState([100])
  const [saved, setSaved] = React.useState([100])

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium" id={id}>
          Zoom
        </span>
        <span className="text-muted-foreground tabular-nums">{zoom[0]}%</span>
      </div>
      <Slider
        aria-labelledby={id}
        largeStep={50}
        max={200}
        min={50}
        onValueChange={setZoom}
        onValueCommit={setSaved}
        step={10}
        value={zoom}
      />
      <p className="text-muted-foreground text-xs">
        Saved at {saved[0]}%. Page Up and Page Down move 50, Home and End go to the ends.
      </p>
    </div>
  )
}
```

### Form

Inside a `<form>`, or with `form`, the slider submits its values under `name`, a range as `name[]`, and a form reset restores the values it started with. A change the user makes fires the form's `change` event and bubbles `input` to ancestors; a value set through `value` fires the form's `change` but not an ancestor's `input`.

```tsx title="components/slider-8.tsx"
// import from your project: import Demo from '@/components/slider-8'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Slider } from '@gentleduck/registry-ui/slider'
import * as React from 'react'

export default function Demo() {
  const id = React.useId()
  const [submitted, setSubmitted] = React.useState('')

  return (
    <form
      className="mx-auto flex w-full max-w-xs flex-col gap-4"
      onReset={() => setSubmitted('')}
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(new FormData(event.currentTarget).getAll('price[]').join(' to '))
      }}>
      <span className="font-medium text-sm" id={id}>
        Price
      </span>
      <Slider aria-labelledby={id} defaultValue={[20, 80]} name="price" step={5} />
      <div className="flex gap-2">
        <Button size="sm" type="submit">
          Apply
        </Button>
        <Button size="sm" type="reset" variant="outline">
          Reset
        </Button>
      </div>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {submitted ? `Submitted a price from ${submitted}.` : 'Nothing submitted yet.'}
      </p>
    </form>
  )
}
```

### Keeping thumbs in order

By default a range thumb dragged past its neighbour swaps places with it. Set `preserveThumbOrder` to stop it at the neighbour instead, `minStepsBetweenThumbs` away. <Kbd>Home</Kbd> and <Kbd>End</Kbd> move the focused thumb, as far as its neighbour allows.

```tsx title="components/slider-9.tsx"
// import from your project: import Demo from '@/components/slider-9'
'use client'

import { Slider } from '@gentleduck/registry-ui/slider'
import * as React from 'react'

const hour = (value: number | undefined) => `${String(value).padStart(2, '0')}:00`

export default function Demo() {
  const [hours, setHours] = React.useState([9, 17])

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-3">
      <Slider
        aria-label="Opening hours"
        max={24}
        minStepsBetweenThumbs={2}
        onValueChange={setHours}
        preserveThumbOrder
        value={hours}
      />
      <p className="text-muted-foreground text-sm tabular-nums">
        Open {hour(hours[0])} to {hour(hours[1])}, at least two hours.
      </p>
    </div>
  )
}
```

### Disabled

`disabled` fades the whole slider once and marks each thumb `aria-disabled`, so assistive technology reads it as unavailable.

```tsx title="components/slider-10.tsx"
// import from your project: import Demo from '@/components/slider-10'
import { Slider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return <Slider aria-label="Volume" className="mx-auto w-full max-w-xs" defaultValue={[40]} disabled />
}
```

### Inverted

`inverted` runs the scale the other way: a vertical slider then grows downwards, and a horizontal one from the right.

```tsx title="components/slider-11.tsx"
// import from your project: import Demo from '@/components/slider-11'
'use client'

import { Slider } from '@gentleduck/registry-ui/slider'
import * as React from 'react'

export default function Demo() {
  const [depth, setDepth] = React.useState([30])

  return (
    <div className="mx-auto flex items-center gap-4">
      <Slider
        aria-label="Depth"
        className="h-40"
        inverted
        onValueChange={setDepth}
        orientation="vertical"
        value={depth}
      />
      <span className="text-muted-foreground text-sm tabular-nums">{depth[0]} m down</span>
    </div>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `Slider` follows it: the range fills from the right, and `ArrowRight` decreases the value while `ArrowLeft` increases it. No `dir` prop needed.

```tsx title="components/slider-5.tsx"
// import from your project: import Demo from '@/components/slider-5'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Slider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Slider aria-label="مستوى الصوت" className="mx-auto w-full max-w-xs" defaultValue={[75]} max={100} step={1} />
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionSlider` for a smooth entrance animation powered by [motion](https://motion.dev). The slider uses a `scaleIn` entrance (fade, scale, and blur) with a `springBouncy` transition on mount.

```tsx title="components/slider-6.tsx"
// import from your project: import Demo from '@/components/slider-6'
import { MotionSlider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return <MotionSlider aria-label="Volume" defaultValue={[75]} max={100} step={1} className="mx-auto w-full max-w-xs" />
}
```

}>
  Requires the `motion` package. Use `MotionSlider` instead of `Slider`. Same props. The regular `Slider` is perfectly fine - this is an optional enhancement.

## API Reference

### Slider

A unified slider component that supports both single-thumb and multi-thumb (range) usage. Pass a single-element `defaultValue` array for a single thumb, or a multi-element array for a range slider. Internally composes `SliderPrimitive.Root`, `SliderPrimitive.Track`, `SliderPrimitive.Range`, and dynamically renders `SliderPrimitive.Thumb` elements based on the values array, each given its `index` so a server-rendered range shows its thumbs before it hydrates.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `defaultValue` | `number[]` | - | Uncontrolled initial values. When omitted (and `value` is also omitted), one thumb is rendered at `min`. |
| `value` | `number[]` | - | Controlled values array |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slider orientation |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`) and inherited by slider parts. |
| `min` | `number` | `0` | Minimum allowed value |
| `max` | `number` | `100` | Maximum allowed value |
| `aria-label` | `string` | - | Names the slider. One thumb takes it, since the thumb is the `role="slider"` element. Several thumbs share it through the root, which becomes a `role="group"`, and keep their own Minimum and Maximum names |
| `aria-labelledby` | `string` | - | Names the slider by another element's id, in the same place `aria-label` goes |
| `...props` | `React.ComponentProps<typeof SliderPrimitive.Root>` | - | All other props from `SliderPrimitive.Root` |

### MotionSlider

`scaleIn` entrance (fade, scale, and blur) with `springBouncy` transition on mount. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `SliderProps` | - | All props from `Slider` are supported |

### Primitive Sub-components

The following primitives are used internally by `Slider`:

#### SliderPrimitive.Root

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | - | Name for form submission |
| `disabled` | `boolean` | `false` | Disables the slider |
| `min` | `number` | `0` | Minimum allowed value |
| `max` | `number` | `100` | Maximum allowed value |
| `step` | `number` | `1` | Increment step for values |
| `largeStep` | `number` | ten steps | How far <Kbd>PageUp</Kbd>, <Kbd>PageDown</Kbd> and <Kbd>Shift</Kbd> with an arrow key move a thumb |
| `value` | `number[]` | - | Controlled values array |
| `defaultValue` | `number[]` | `[min]` | Uncontrolled initial values |
| `onValueChange` | `(value: number[]) => void` | - | Callback fired on every value change |
| `onValueCommit` | `(value: number[]) => void` | - | Callback fired when an interaction that changed any value ends (pointer up or a key) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slider orientation |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction for horizontal sliders. Uses the same `useDirection` resolution order. |
| `inverted` | `boolean` | `false` | Inverts the slider direction |
| `minStepsBetweenThumbs` | `number` | `0` | Minimum number of steps between thumbs |
| `preserveThumbOrder` | `boolean` | `false` | Stops a thumb at its neighbour instead of letting it cross and swap places |
| `form` | `string` | - | Associates with a form element by ID, whose reset restores the starting values |

#### SliderPrimitive.Track

Renders a `<span>`. Accepts all standard span props.

#### SliderPrimitive.Range

Renders a `<span>`. Accepts all standard span props.

#### SliderPrimitive.Thumb

Renders a `<span>`. The thumb index is auto-detected from render order.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | - | Optional name override for this thumb's hidden input |