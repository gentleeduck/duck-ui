```tsx
import * as Slider from '@gentleduck/primitives/slider'
```

## Anatomy

```tsx
<Slider.Root>
  <Slider.Value />
  <Slider.Track>
    <Slider.Range />
  </Slider.Track>
  <Slider.Thumb />
</Slider.Root>
```

***

## Usage

```tsx
import * as Slider from '@gentleduck/primitives/slider'

function VolumeSlider() {
  return (
    <Slider.Root defaultValue={[50]} max={100} step={1} className="relative flex w-64 items-center">
      <Slider.Track className="relative h-1 w-full grow rounded-full bg-gray-200">
        <Slider.Range className="absolute h-full rounded-full bg-blue-500" />
      </Slider.Track>
      <Slider.Thumb className="block size-4 rounded-full border bg-white shadow" />
    </Slider.Root>
  )
}
```

### Range slider (multiple thumbs)

```tsx
function PriceRange() {
  return (
    <Slider.Root defaultValue={[20, 80]} max={100} step={5} className="relative flex w-64 items-center">
      <Slider.Track className="relative h-1 w-full grow rounded-full bg-gray-200">
        <Slider.Range className="absolute h-full rounded-full bg-blue-500" />
      </Slider.Track>
      <Slider.Thumb className="block size-4 rounded-full border bg-white shadow" />
      <Slider.Thumb className="block size-4 rounded-full border bg-white shadow" />
    </Slider.Root>
  )
}
```

***

## Examples

### Basic

```tsx title="components/slider-basic.tsx"
// import from your project: import Demo from '@/components/slider-basic'
'use client'

import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

export default function SliderBasicExample() {
  return (
    <div className={styles.stack}>
      <Slider.Root className={styles.slider} defaultValue={[40]} max={100} step={5}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Volume" className={styles.thumb} />
      </Slider.Root>
      <p className={styles.note}>step 5; Shift with an arrow, or PageUp and PageDown, take larger steps.</p>
    </div>
  )
}
```

### A range

```tsx title="components/slider-range.tsx"
// import from your project: import Demo from '@/components/slider-range'
'use client'

import * as Slider from '@gentleduck/primitives/slider'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SliderRangeExample() {
  const [range, setRange] = React.useState([200, 800])

  return (
    <div className={styles.stack}>
      <Slider.Root
        className={styles.slider}
        max={1000}
        minStepsBetweenThumbs={10}
        onValueChange={setRange}
        preserveThumbOrder
        step={10}
        value={range}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Minimum price" className={styles.thumb} />
        <Slider.Thumb aria-label="Maximum price" className={styles.thumb} />
      </Slider.Root>
      <p className={styles.note}>
        ${range[0]} to ${range[1]}. The thumbs stop 10 steps apart instead of crossing.
      </p>
    </div>
  )
}
```

### Vertical

```tsx title="components/slider-vertical.tsx"
// import from your project: import Demo from '@/components/slider-vertical'
'use client'

import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

export default function SliderVerticalExample() {
  return (
    <div className={styles.row} style={{ gap: '2rem' }}>
      {['Bass', 'Mid', 'Treble'].map((band) => (
        <Slider.Root className={styles.slider} defaultValue={[50]} key={band} orientation="vertical">
          <Slider.Track className={styles.track}>
            <Slider.Range className={styles.range} />
          </Slider.Track>
          <Slider.Thumb aria-label={band} className={styles.thumb} />
        </Slider.Root>
      ))}
    </div>
  )
}
```

### Change and commit

```tsx title="components/slider-commit.tsx"
// import from your project: import Demo from '@/components/slider-commit'
'use client'

import * as Slider from '@gentleduck/primitives/slider'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SliderCommitExample() {
  const [live, setLive] = React.useState([30])
  const [saved, setSaved] = React.useState([30])

  return (
    <div className={styles.stack}>
      <Slider.Root className={styles.slider} onValueChange={setLive} onValueCommit={setSaved} value={live}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Brightness" className={styles.thumb} />
      </Slider.Root>
      <p className={styles.note}>
        While dragging: {live[0]}. Saved once the drag ends: {saved[0]}.
      </p>
    </div>
  )
}
```

### Inverted, with a large step

```tsx title="components/slider-inverted.tsx"
// import from your project: import Demo from '@/components/slider-inverted'
'use client'

import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

export default function SliderInvertedExample() {
  return (
    <div className={styles.stack}>
      <Slider.Root className={styles.slider} defaultValue={[70]} inverted largeStep={25}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Remaining" className={styles.thumb} />
      </Slider.Root>
      <p className={styles.note}>
        inverted fills from the far end, and largeStep sets the PageUp and PageDown step to 25.
      </p>
    </div>
  )
}
```

### Showing the values

```tsx title="components/slider-value.tsx"
// import from your project: import Demo from '@/components/slider-value'
'use client'

import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

export default function SliderValueExample() {
  return (
    <Slider.Root className={styles.stack} defaultValue={[18, 24]} max={30} min={10} step={0.5}>
      <Slider.Value className={styles.note}>{(values) => `${values[0]} C to ${values[1]} C`}</Slider.Value>
      <div className={styles.slider}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Lowest" className={styles.thumb} />
        <Slider.Thumb aria-label="Highest" className={styles.thumb} />
      </div>
    </Slider.Root>
  )
}
```

### In a form

```tsx title="components/slider-form.tsx"
// import from your project: import Demo from '@/components/slider-form'
'use client'

import * as Slider from '@gentleduck/primitives/slider'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SliderFormExample() {
  const [sent, setSent] = React.useState('')

  return (
    <form
      className={styles.stack}
      onSubmit={(event) => {
        event.preventDefault()
        setSent(new FormData(event.currentTarget).getAll('budget').join(' to '))
      }}>
      <Slider.Root className={styles.slider} defaultValue={[20, 60]} name="budget">
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="From" className={styles.thumb} />
        <Slider.Thumb aria-label="To" className={styles.thumb} />
      </Slider.Root>
      <div className={styles.row}>
        <button className={`${styles.button} ${styles.primary}`} type="submit">
          Search
        </button>
        <button className={styles.button} type="reset">
          Reset
        </button>
      </div>
      <p className={styles.note}>
        {sent ? `Submitted budget=${sent}` : 'Each thumb submits a value under the name budget.'}
      </p>
    </form>
  )
}
```

### Disabled

```tsx title="components/slider-disabled.tsx"
// import from your project: import Demo from '@/components/slider-disabled'
'use client'

import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

export default function SliderDisabledExample() {
  return (
    <Slider.Root className={styles.slider} defaultValue={[60]} disabled>
      <Slider.Track className={styles.track}>
        <Slider.Range className={styles.range} />
      </Slider.Track>
      <Slider.Thumb aria-label="Locked level" className={styles.thumb} />
    </Slider.Root>
  )
}
```

***

## API

### `Slider.Root`

The root component that manages slider state, drag interactions, keyboard stepping, and provides context to all children. Renders a `<span>`. Inside a form, or with `form`, each thumb renders a hidden `<input>`, so the values submit under `name` (as `name[]` with more than one thumb), and a form reset restores the values the slider started with, in an iframe too, and leaves focus where it is.

A press with the main button moves the closest thumb to the pointer and focuses it, even when the value stays where it was. A press on a thumb, or on anything inside it, focuses that thumb without moving it. A right click or a Control click moves nothing, since each opens the context menu. A drag the browser cancels ends where it stopped, as a pointer up does.

A change the user makes dispatches a bubbling `input` event from that hidden input, so a form's `onChange` and an ancestor's `onInput` both hear it, including a value a controlled parent adjusts in the same render. A change made through `value` reaches a form's `onChange` but stops before any ancestor's `onInput`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | - | Name for hidden form inputs |
| `disabled` | `boolean` | `false` | Disables the slider |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slider orientation |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction (horizontal only). Resolved with `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`), and written on the root alone, which the parts inherit. |
| `min` | `number` | `0` | Minimum allowed value |
| `max` | `number` | `100` | Maximum allowed value |
| `step` | `number` | `1` | Increment step for values |
| `value` | `number[]` | - | Controlled values array |
| `defaultValue` | `number[]` | `[min]` | Uncontrolled initial values |
| `onValueChange` | `(value: number[]) => void` | - | Called on every value change during interaction |
| `onValueCommit` | `(value: number[]) => void` | - | Called once when the user finishes an interaction that changed any value (pointer up, a cancelled drag, or a key) |
| `inverted` | `boolean` | `false` | Inverts the slider direction |
| `largeStep` | `number` | ten steps | How far <Kbd>PageUp</Kbd>, <Kbd>PageDown</Kbd> and <Kbd>Shift</Kbd> with an arrow key move a thumb, as in Base UI. Give a multiple of `step` |
| `minStepsBetweenThumbs` | `number` | `0` | Minimum number of steps required between thumbs |
| `preserveThumbOrder` | `boolean` | `false` | Stops a thumb at its neighbour, `minStepsBetweenThumbs` away from it, instead of letting it cross and swap places |
| `form` | `string` | - | Associates hidden inputs with a form element by ID |

Exposes `data-disabled` and `data-orientation` attributes. Sets the CSS custom property `--gentleduck-slider-thumb-transform` for thumb positioning.

### `Slider.Track`

The track area the thumbs slide along. Renders a `<span>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as child element |

Exposes `data-disabled` and `data-orientation` attributes.

### `Slider.Range`

The filled portion between thumbs (or from min to a single thumb). Renders a `<span>`. Positioned automatically via inline styles.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as child element |

Exposes `data-disabled` and `data-orientation` attributes.

### `Slider.Thumb`

A draggable thumb. Once it mounts, its index comes from its render order. On the server that order is not known yet, so a lone thumb renders at the slider's one value, and each thumb of a range renders hidden unless given `index`. Renders a `<span>` with `role="slider"`, and inside a form a hidden `<input>` for submission. After a change, focus moves to the thumb that changed, showing the focus ring only when a key moved it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | - | Optional name override for this thumb's hidden input |
| `index` | `number` | - | Where the thumb sits among the values until it mounts, so a range renders its thumbs on the server |
| `asChild` | `boolean` | - | Render as child element |

Sets `aria-valuemin`, `aria-valuenow`, `aria-valuemax`, and `aria-orientation` automatically, and `aria-disabled` when the slider is disabled. Exposes `data-disabled` and `data-orientation` attributes.

### `Slider.Value`

The values as text, as Base UI's `Slider.Value`, Ark's `ValueText` and React Aria's `SliderOutput` show them, following each thumb as it moves. Renders a `<span>` hidden from assistive technology, since each thumb already announces its own value. Without children it shows the values joined with a comma.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode \| ((values: number[]) => ReactNode)` | - | What to show in place of the values, or a function of them |

```tsx
<Slider.Root aria-label="Price" defaultValue={[20, 80]}>
  <Slider.Value>{([low, high]) => `$${low} to $${high}`}</Slider.Value>
  <Slider.Track>
    <Slider.Range />
  </Slider.Track>
  <Slider.Thumb />
  <Slider.Thumb />
</Slider.Root>
```

Exposes `data-disabled` and `data-orientation` attributes.

### `Slider.ThumbProvider` / `Slider.ThumbTrigger` / `Slider.BubbleInput`

`Slider.Thumb` is `Slider.ThumbTrigger` inside a `Slider.ThumbProvider`, with a `Slider.BubbleInput` beside it when the slider is in a form. Compose the three yourself to place the hidden input, give it props of its own, or render it outside a form.

```tsx
<Slider.Root name="volume" defaultValue={[50]}>
  <Slider.Track>
    <Slider.Range />
  </Slider.Track>
  <Slider.ThumbProvider>
    <Slider.ThumbTrigger aria-label="Volume" />
    <Slider.BubbleInput data-testid="volume-input" />
  </Slider.ThumbProvider>
</Slider.Root>
```

`Slider.ThumbProvider` takes the thumb's `name` and `index`. `Slider.ThumbTrigger` takes the props of `Slider.Thumb` except `name`. `Slider.BubbleInput` takes the props of an `<input>` except `value`, which comes from the thumb.

***

## Keyboard interactions

| Key | Action |
| --- | --- |
| <Kbd>ArrowRight</Kbd> | Increments by one step (horizontal LTR) |
| <Kbd>ArrowLeft</Kbd> | Decrements by one step (horizontal LTR) |
| <Kbd>ArrowUp</Kbd> | Increments by one step (vertical) |
| <Kbd>ArrowDown</Kbd> | Decrements by one step (vertical) |
| <Kbd>PageUp</Kbd> | Increments by `largeStep`, ten steps by default |
| <Kbd>PageDown</Kbd> | Decrements by `largeStep`, ten steps by default |
| <Kbd>Shift</Kbd> + <Kbd>ArrowKey</Kbd> | Increments/decrements by `largeStep` |
| <Kbd>Home</Kbd> | Sets the focused thumb to the minimum value |
| <Kbd>End</Kbd> | Sets the focused thumb to the maximum value |

A value off the `step` grid, such as one set through `value`, moves to the next grid line in the direction of the key first, and that counts as one of the steps.