```tsx
import * as Progress from '@gentleduck/primitives/progress'
```

## Anatomy

```tsx
<Progress.Root>
  <Progress.Label />
  <Progress.Value />
  <Progress.Indicator />
</Progress.Root>
```

## Usage

```tsx
<Progress.Root
  className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200"
  value={65}
  max={100}
>
  <Progress.Label>Uploading</Progress.Label>
  <Progress.Value />
  <Progress.Indicator
    className="h-full bg-blue-500 transition-all"
    style={{ width: `${65}%` }}
  />
</Progress.Root>
```

## Examples

### With a label and a value

```tsx title="components/progress-basic.tsx"
// import from your project: import Demo from '@/components/progress-basic'
'use client'

import * as Progress from '@gentleduck/primitives/progress'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ProgressBasicExample() {
  const [value, setValue] = React.useState(20)

  React.useEffect(() => {
    const timer = setInterval(() => setValue((current) => (current >= 100 ? 0 : current + 10)), 600)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={styles.stack}>
      <Progress.Root className={styles.stack} value={value}>
        <div className={styles.row} style={{ justifyContent: 'space-between', width: '14rem' }}>
          <Progress.Label className={styles.label}>Uploading</Progress.Label>
          <Progress.Value className={styles.note} />
        </div>
        <div className={styles.progress}>
          <Progress.Indicator
            className={styles.progressIndicator}
            style={{ transform: `translateX(-${100 - value}%)` }}
          />
        </div>
      </Progress.Root>
    </div>
  )
}
```

### Indeterminate

```tsx title="components/progress-indeterminate.tsx"
// import from your project: import Demo from '@/components/progress-indeterminate'
'use client'

import * as Progress from '@gentleduck/primitives/progress'
import styles from '../primitives.module.css'

export default function ProgressIndeterminateExample() {
  return (
    <Progress.Root aria-label="Connecting" className={styles.progress} value={null}>
      <Progress.Indicator className={styles.progressIndicator} />
    </Progress.Root>
  )
}
```

### A label of your own

```tsx title="components/progress-range-label.tsx"
// import from your project: import Demo from '@/components/progress-range-label'
'use client'

import * as Progress from '@gentleduck/primitives/progress'
import styles from '../primitives.module.css'

export default function ProgressRangeLabelExample() {
  const used = 7.5
  const total = 15

  return (
    <Progress.Root
      className={styles.stack}
      getValueLabel={(value, max) => `${value} of ${max} GB`}
      max={total}
      value={used}>
      <Progress.Label className={styles.label}>Storage</Progress.Label>
      <div className={styles.progress}>
        <Progress.Indicator
          className={styles.progressIndicator}
          style={{ transform: `translateX(-${100 - (used / total) * 100}%)` }}
        />
      </div>
      <Progress.Value className={styles.note}>{(label) => `${label} used`}</Progress.Value>
    </Progress.Root>
  )
}
```

### A minimum above zero

```tsx title="components/progress-min.tsx"
// import from your project: import Demo from '@/components/progress-min'
'use client'

import * as Progress from '@gentleduck/primitives/progress'
import styles from '../primitives.module.css'

export default function ProgressMinExample() {
  const year = 2026
  return (
    <Progress.Root className={styles.stack} max={2030} min={2020} value={year}>
      <Progress.Label className={styles.label}>Plan from 2020 to 2030</Progress.Label>
      <div className={styles.progress}>
        <Progress.Indicator
          className={styles.progressIndicator}
          style={{ transform: `translateX(-${100 - (year - 2020) * 10}%)` }}
        />
      </div>
      <Progress.Value className={styles.note} />
    </Progress.Root>
  )
}
```

***

## API

### `Progress.Root`

Renders a `<div>` with `role="progressbar"` and appropriate ARIA attributes.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number \| null` | `null` | Current value, from `min` to `max`. `null` = indeterminate. |
| `min` | `number` | `0` | The value an empty bar stands for, announced as `aria-valuemin`, as in Base UI, Ark and React Aria |
| `max` | `number` | `100` | Maximum value. One not above `min` falls back to `100`, and is logged in development |
| `getValueLabel` | `(value: number, max: number, min: number) => string` | Percentage of the way from `min` to `max` | Custom label for screen readers |
| `dir` | `string` | - | Sets the `dir` attribute, `auto` included. Leave it out and the progress bar follows the page |

Exposes `data-state` as `indeterminate`, `loading`, or `complete`, and `data-value` / `data-max`.

### `Progress.Indicator`

Visual fill indicator. Inherits `data-state`, `data-value`, and `data-max` from context. Takes `asChild`, so an animated element can be the fill.

### `Progress.Label`

Renders a `<span>` that names the progress bar: while it is mounted, the root's `aria-labelledby` points at its `id`, which it generates unless you pass one. An `aria-labelledby` passed to the root wins. Exposes `data-state`.

### `Progress.Value`

Renders a `<span>` showing the root's `getValueLabel` result, and nothing while indeterminate. It is `aria-hidden`, because the root already announces the same text as `aria-valuetext`. Exposes `data-state`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode \| (valueLabel: string \| undefined, value: number \| null) => ReactNode` | the label | Replaces the label, or formats it when a function |

## Indeterminate state

}>
  Pass `value={null}` for an indeterminate progress bar. The `data-state` will be set to `indeterminate`, which you can target in CSS for a loading animation.

```tsx
<Progress.Root value={null} className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200">
  <Progress.Indicator className="h-full bg-blue-500 animate-indeterminate" />
</Progress.Root>
```

```css
@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
.animate-indeterminate {
  width: 30%;
  animation: indeterminate 1.5s ease-in-out infinite;
}
```