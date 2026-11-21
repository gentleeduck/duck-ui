```tsx title="components/progress-1.tsx"
// import from your project: import Demo from '@/components/progress-1'
'use client'

import { Progress } from '@gentleduck/registry-ui/progress'
import * as React from 'react'

export default function Demo() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return <Progress className="w-[60%]" value={progress} />
}
```

## Philosophy

Progress bars answer the most anxious user question: "Is this working?" A determinate progress indicator builds trust by showing measurable advancement. We keep the API to `value`, `min` and `max`, because progress is one-dimensional: the visual treatment handles the rest.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add progress
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Progress } from "@/components/ui/progress"
```

```tsx
<Progress value={33} />
```

## Examples

### Labelled, counting files

A progress bar needs a name. Point `aria-labelledby` at a visible label, or pass `aria-label`. `getValueLabel` turns the value into what a screen reader says, here `3 of 8 files` where the default would be `38%`. At `max` the fill takes `data-state="complete"`, which the `className` uses to turn it green.

```tsx title="components/progress-4.tsx"
// import from your project: import Demo from '@/components/progress-4'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Progress } from '@gentleduck/registry-ui/progress'
import * as React from 'react'

const FILES = 8

export default function Demo() {
  const [uploaded, setUploaded] = React.useState(3)
  const labelId = React.useId()

  return (
    <div className="flex w-[60%] flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium" id={labelId}>
          Uploading files
        </span>
        <span aria-hidden="true" className="text-muted-foreground tabular-nums">
          {uploaded} of {FILES}
        </span>
      </div>
      <Progress
        aria-labelledby={labelId}
        className="*:data-[state=complete]:bg-emerald-600"
        getValueLabel={(value, max) => `${value} of ${max} files`}
        max={FILES}
        value={uploaded}
      />
      <div className="flex gap-2">
        <Button disabled={uploaded === FILES} onClick={() => setUploaded((count) => count + 1)} size="sm">
          Upload next
        </Button>
        <Button onClick={() => setUploaded(0)} size="sm" variant="outline">
          Start over
        </Button>
      </div>
    </div>
  )
}
```

### From a minimum

`min` is the value an empty bar stands for. Steps 1 to 5 fill a quarter of the bar each, so step 1 shows an empty bar.

```tsx title="components/progress-5.tsx"
// import from your project: import Demo from '@/components/progress-5'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Progress } from '@gentleduck/registry-ui/progress'
import * as React from 'react'

const STEPS = 5

export default function Demo() {
  const [step, setStep] = React.useState(1)

  return (
    <div className="flex w-[60%] flex-col gap-3">
      <p className="font-medium text-sm">
        Step {step} of {STEPS}
      </p>
      <Progress
        aria-label="Setup"
        getValueLabel={(value, max) => `Step ${value} of ${max}`}
        max={STEPS}
        min={1}
        value={step}
      />
      <div className="flex gap-2">
        <Button disabled={step === 1} onClick={() => setStep((at) => at - 1)} size="sm" variant="outline">
          Back
        </Button>
        <Button disabled={step === STEPS} onClick={() => setStep((at) => at + 1)} size="sm">
          Next
        </Button>
      </div>
    </div>
  )
}
```

### Indeterminate

A `value` of `null` says the work has no known end yet. The bar fills and pulses, so it still shows something is happening, and carries `data-state="indeterminate"` with no `aria-valuenow`. A value outside `min` to `max` is read the same way, as the primitive reads it. Under reduced motion the plain bar stays still at half strength.

```tsx title="components/progress-6.tsx"
// import from your project: import Demo from '@/components/progress-6'
import { MotionProgress, Progress } from '@gentleduck/registry-ui/progress'

export default function Demo() {
  return (
    <div className="flex w-[60%] flex-col gap-4">
      <Progress aria-label="Preparing the export" value={null} />
      <MotionProgress aria-label="Preparing the import" value={null} />
    </div>
  )
}
```

## RTL Support

Set the direction anywhere above the bar, with `DirectionProvider`, `<html dir="rtl">` or a `dir` on any element, and `Progress` and `MotionProgress` fill from the right. No `dir` prop or `rtl:` classes needed.

```tsx title="components/progress-2.tsx"
// import from your project: import Demo from '@/components/progress-2'
'use client'

import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Progress } from '@gentleduck/registry-ui/progress'
import * as React from 'react'

export default function Demo() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <DirectionProvider dir="rtl">
      <Progress className="w-[60%]" value={progress} />
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionProgress` for smooth value animations powered by [motion](https://motion.dev). The bar scales in from the start edge and fades to full opacity over a 0.6s eased transition when the value changes, with a continuously looping shimmer highlight layered on top.

```tsx title="components/progress-3.tsx"
// import from your project: import Demo from '@/components/progress-3'
'use client'

import { MotionProgress } from '@gentleduck/registry-ui/progress'
import * as React from 'react'

export default function Demo() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return <MotionProgress className="w-[60%]" value={progress} />
}
```

}>
  Requires the `motion` package. Use `MotionProgress` instead of `Progress`. Same props. The regular `Progress` is perfectly fine - this is an optional enhancement.

## API Reference

### Progress

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number \| null` | `null` | Progress from `min` to `max`. `null`, or a value outside that range, is indeterminate: the bar fills and pulses |
| `min` | `number` | `0` | The value at which the bar is empty |
| `max` | `number` | `100` | The value at which the bar is full. A `max` no greater than `min` falls back to `100`, as the primitive does |
| `dir` | `string` | - | Sets `dir` on the bar. Leave it out and the bar fills from the side the element around it reads from |
| `className` | `string` | - | Additional CSS classes for the progress bar container |
| `...props` | `Progress.Root` props | - | Every prop of the primitive's [`Progress.Root`](/duck-primitives/api/progress), `getValueLabel` included |

### MotionProgress

The animated fill is the primitive's `Progress.Indicator`, so it carries `data-slot="progress-indicator"` and `data-state` as the `Progress` fill does.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number \| null` | `null` | Progress from `min` to `max`. Value changes animate the bar's scale and opacity over a 0.6s eased transition (not a spring). Includes a continuously looping shimmer overlay. While indeterminate the bar fills and its opacity pulses every 2s. |
| `min` | `number` | `0` | The value at which the bar is empty |
| `max` | `number` | `100` | The value at which the bar is full. A `max` no greater than `min` falls back to `100`, as the primitive does |
| `dir` | `string` | - | Sets `dir` on the bar. Leave it out and the bar grows, and its shimmer runs, from the side the element around it reads from |
| `className` | `string` | - | Additional CSS classes for the progress bar container |
| `...props` | `Progress.Root` props | - | Every prop of the primitive's [`Progress.Root`](/duck-primitives/api/progress) |