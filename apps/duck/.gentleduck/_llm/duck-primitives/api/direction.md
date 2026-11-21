```tsx
import { DirectionProvider, useDirection } from '@gentleduck/primitives/direction'
```

## What it does

}>
  `DirectionProvider` sets `ltr` or `rtl` once for a subtree. `useDirection` resolves a component's own `dir` first, then the nearest provider, then `<html dir>`.

This is the single direction module used by primitives and registry-ui components. A change to `<html dir>` is picked up at runtime. `RTL` reads as `rtl`, and anything else, `auto` included, as `ltr`. On the server there is no document, so `useDirection` answers `ltr` there; a provider gives the right direction on first paint.

The provider renders a `div` with `data-slot="direction"`, `dir` and `display: contents`. The `dir` attribute is what makes the page's CSS follow the provider, logical properties and `[dir='rtl']` selectors included, and `display: contents` keeps the `div` out of layout, so a grid or flex parent still lays out the provider's children. Those children are ordered by the parent's direction, though, so put the provider around a row that should mirror, not inside it. A child selector across the provider, such as `.list > li`, does not match, since the `div` sits between the two.

## Usage

```tsx
import { DirectionProvider } from '@gentleduck/primitives/direction'
import * as Dialog from '@gentleduck/primitives/dialog'

export function App() {
  return (
    <DirectionProvider dir="rtl">
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
      </Dialog.Root>
    </DirectionProvider>
  )
}
```

## Examples

### One provider for every primitive

```tsx title="components/direction-provider.tsx"
// import from your project: import Demo from '@/components/direction-provider'
'use client'

import { DirectionProvider } from '@gentleduck/primitives/direction'
import * as Slider from '@gentleduck/primitives/slider'
import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DirectionProviderExample() {
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('rtl')

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setDir(dir === 'rtl' ? 'ltr' : 'rtl')} type="button">
        Direction: {dir}
      </button>
      <DirectionProvider dir={dir}>
        <div className={styles.stack}>
          <Slider.Root className={styles.slider} defaultValue={[30]}>
            <Slider.Track className={styles.track}>
              <Slider.Range className={styles.range} />
            </Slider.Track>
            <Slider.Thumb aria-label="Volume" className={styles.thumb} />
          </Slider.Root>
          <ToggleGroup.Root aria-label="Alignment" className={styles.group} defaultValue="start" type="single">
            {['start', 'center', 'end'].map((value) => (
              <ToggleGroup.Item className={styles.toggle} key={value} value={value}>
                {value}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      </DirectionProvider>
      <p className={styles.note}>
        Every primitive inside reads the provider: the slider fills from the right and the arrow keys flip.
      </p>
    </div>
  )
}
```

### Reading it in your own component

```tsx title="components/direction-use-direction.tsx"
// import from your project: import Demo from '@/components/direction-use-direction'
'use client'

import { DirectionProvider, useDirection } from '@gentleduck/primitives/direction'
import styles from '../primitives.module.css'

function Breadcrumb({ dir }: { dir?: 'ltr' | 'rtl' }) {
  const direction = useDirection(dir)
  const separator = direction === 'rtl' ? '<' : '>'
  return (
    <p className={styles.note} dir={direction}>
      Home {separator} Docs {separator} Direction ({direction})
    </p>
  )
}

export default function DirectionUseDirectionExample() {
  return (
    <DirectionProvider dir="rtl">
      <div className={styles.stack}>
        <Breadcrumb />
        <Breadcrumb dir="ltr" />
      </div>
    </DirectionProvider>
  )
}
```

### Nested providers

```tsx title="components/direction-nested.tsx"
// import from your project: import Demo from '@/components/direction-nested'
'use client'

import { DirectionProvider } from '@gentleduck/primitives/direction'
import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

function Volume({ label }: { label: string }) {
  return (
    <div className={styles.stack}>
      <span className={styles.label}>{label}</span>
      <Slider.Root className={styles.slider} defaultValue={[25]}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label={label} className={styles.thumb} />
      </Slider.Root>
    </div>
  )
}

export default function DirectionNestedExample() {
  return (
    <DirectionProvider dir="rtl">
      <div className={styles.stack}>
        <Volume label="مستوى الصوت" />
        <DirectionProvider dir="ltr">
          <Volume label="Left to right inside" />
        </DirectionProvider>
      </div>
    </DirectionProvider>
  )
}
```

***

## API

### `DirectionProvider`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Direction for the subtree, set on its `div` and read by `useDirection` |
| `children` | `React.ReactNode` | - | Wrapped subtree |

### `useDirection`

```tsx
const direction = useDirection(localDir)
```

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `localDir` | `'ltr' \| 'rtl' \| undefined` | `undefined` | Optional local override |

Returns:

* `localDir` when provided
* the nearest provider's `dir` when there is one
* `'rtl'` when `<html dir>` is `rtl`, and `'ltr'` otherwise, which is also the answer on the server

### Other exports

| Export | Type | Description |
| --- | --- | --- |
| `Provider` | `React.FC<{ dir: 'ltr' \| 'rtl'; children?: ReactNode }>` | `DirectionProvider` under Radix's name |
| `DirectionContext` | `React.Context<'ltr' \| 'rtl' \| undefined>` | The context the provider fills |
| `DIRECTION_DICTIONARY` | `{ ltr: 'ltr'; rtl: 'rtl' }` | The two values |