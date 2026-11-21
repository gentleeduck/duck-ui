```tsx
import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
```

## Anatomy

```tsx
<ToggleGroup.Root>
  <ToggleGroup.Item />
</ToggleGroup.Root>
```

***

## Usage

### Single selection

```tsx
import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

function TextAlign() {
  return (
    <ToggleGroup.Root type="single" defaultValue="left" className="flex gap-1">
      <ToggleGroup.Item value="left" aria-label="Align left" className="rounded p-2 data-[state=on]:bg-accent">
        <AlignLeft className="size-4" />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="center" aria-label="Align center" className="rounded p-2 data-[state=on]:bg-accent">
        <AlignCenter className="size-4" />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="right" aria-label="Align right" className="rounded p-2 data-[state=on]:bg-accent">
        <AlignRight className="size-4" />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}
```

### Multiple selection

```tsx
function FormatOptions() {
  return (
    <ToggleGroup.Root type="multiple" className="flex gap-1">
      <ToggleGroup.Item value="bold" className="rounded p-2 data-[state=on]:bg-accent">B</ToggleGroup.Item>
      <ToggleGroup.Item value="italic" className="rounded p-2 data-[state=on]:bg-accent">I</ToggleGroup.Item>
      <ToggleGroup.Item value="underline" className="rounded p-2 data-[state=on]:bg-accent">U</ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}
```

***

## Examples

### Single

```tsx title="components/toggle-group-single.tsx"
// import from your project: import Demo from '@/components/toggle-group-single'
'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import styles from '../primitives.module.css'

export default function ToggleGroupSingleExample() {
  return (
    <ToggleGroup.Root aria-label="Text alignment" className={styles.group} defaultValue="left" type="single">
      {['left', 'center', 'right'].map((value) => (
        <ToggleGroup.Item aria-label={`Align ${value}`} className={styles.toggle} key={value} value={value}>
          {value}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
```

### Multiple

```tsx title="components/toggle-group-multiple.tsx"
// import from your project: import Demo from '@/components/toggle-group-multiple'
'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ToggleGroupMultipleExample() {
  const [marks, setMarks] = React.useState<string[]>(['bold'])

  return (
    <div className={styles.stack}>
      <ToggleGroup.Root
        aria-label="Formatting"
        className={styles.group}
        onValueChange={setMarks}
        type="multiple"
        value={marks}>
        {['bold', 'italic', 'underline'].map((value) => (
          <ToggleGroup.Item className={styles.toggle} key={value} value={value}>
            {value}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <p className={styles.note}>On: {marks.join(', ') || 'none'}</p>
    </div>
  )
}
```

### Always one on

```tsx title="components/toggle-group-segmented.tsx"
// import from your project: import Demo from '@/components/toggle-group-segmented'
'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import styles from '../primitives.module.css'

export default function ToggleGroupSegmentedExample() {
  return (
    <div className={styles.stack}>
      <ToggleGroup.Root
        aria-label="View"
        className={styles.group}
        defaultValue="list"
        deselectable={false}
        type="single">
        {['list', 'grid', 'board'].map((value) => (
          <ToggleGroup.Item className={styles.toggle} key={value} value={value}>
            {value}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <p className={styles.note}>deselectable off keeps one item on, as a segmented control does.</p>
    </div>
  )
}
```

### Vertical

```tsx title="components/toggle-group-vertical.tsx"
// import from your project: import Demo from '@/components/toggle-group-vertical'
'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import styles from '../primitives.module.css'

export default function ToggleGroupVerticalExample() {
  return (
    <ToggleGroup.Root
      aria-label="Tool"
      className={styles.group}
      defaultValue="pen"
      loop={false}
      orientation="vertical"
      type="single">
      {['select', 'pen', 'eraser'].map((value) => (
        <ToggleGroup.Item className={styles.toggle} disabled={value === 'eraser'} key={value} value={value}>
          {value}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
```

### Without roving focus

```tsx title="components/toggle-group-no-roving.tsx"
// import from your project: import Demo from '@/components/toggle-group-no-roving'
'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import styles from '../primitives.module.css'

export default function ToggleGroupNoRovingExample() {
  return (
    <div className={styles.stack}>
      <ToggleGroup.Root aria-label="Filters" className={styles.group} rovingFocus={false} type="multiple">
        {['open', 'closed', 'draft'].map((value) => (
          <ToggleGroup.Item className={styles.toggle} key={value} value={value}>
            {value}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <p className={styles.note}>rovingFocus off makes every item its own Tab stop.</p>
    </div>
  )
}
```

### Right to left

```tsx title="components/toggle-group-rtl.tsx"
// import from your project: import Demo from '@/components/toggle-group-rtl'
'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import styles from '../primitives.module.css'

export default function ToggleGroupRtlExample() {
  return (
    <ToggleGroup.Root aria-label="المحاذاة" className={styles.group} defaultValue="right" dir="rtl" type="single">
      {[
        { value: 'right', label: 'يمين' },
        { value: 'center', label: 'وسط' },
        { value: 'left', label: 'يسار' },
      ].map((item) => (
        <ToggleGroup.Item className={styles.toggle} key={item.value} value={item.value}>
          {item.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
```

***

## API

### `ToggleGroup.Root`

The root container. Renders a `<div>`. Supports two modes: `single` and `multiple`. A single group is a `radiogroup`, a multiple one a `toolbar`, or a `group` when `rovingFocus` is off and the arrow keys do nothing. A `role` passed to it wins. A group given no `type`, which only JavaScript allows, is single.

#### Single mode

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'single'` | - | Only one item can be active |
| `value` | `string` | - | Controlled active value. `''` means no item is on, so an item whose value is empty stays off |
| `defaultValue` | `string` | - | Initial active value |
| `onValueChange` | `(value: string) => void` | - | Called when active value changes |

#### Multiple mode

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'multiple'` | - | Multiple items can be active |
| `value` | `string[]` | - | Controlled active values |
| `defaultValue` | `string[]` | - | Initial active values |
| `onValueChange` | `(value: string[]) => void` | - | Called when active values change |

#### Shared props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rovingFocus` | `boolean` | `true` | Enable roving focus keyboard navigation |
| `disabled` | `boolean` | `false` | Disables the entire group |
| `deselectable` | `boolean` | `true` | Lets the last item that is on be turned off. `false` keeps one item on, as a segmented control does |
| `orientation` | `'horizontal' \| 'vertical'` | - | Arrow key navigation direction, also set as `aria-orientation` while `rovingFocus` is on |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction |
| `loop` | `boolean` | `true` | Keyboard navigation wraps around |
| `asChild` | `boolean` | - | Render as child element |

Exposes `data-orientation` attribute.

### `ToggleGroup.Item`

An individual toggle button within the group. Renders a `<button>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | **Required.** Unique value for this item |
| `disabled` | `boolean` | - | Disables this item (inherits from group) |
| `children` | `ReactNode \| ((pressed: boolean) => ReactNode)` | - | The content, or a function of whether the item is on, as `Toggle.Root` takes. With `asChild`, the function returns the element to render |
| `asChild` | `boolean` | - | Render as child element |

Exposes `aria-pressed` (multiple mode), `role="radio"` (single mode), `data-state` (`on` | `off`), and `data-disabled` attributes.

***

## Keyboard interactions

| Key | Action |
| --- | --- |
| <Kbd>Tab</Kbd> | Moves focus into the group and to the active item |
| <Kbd>ArrowRight</Kbd> | Moves focus to the next item (horizontal) |
| <Kbd>ArrowLeft</Kbd> | Moves focus to the previous item (horizontal) |
| <Kbd>ArrowDown</Kbd> | Moves focus to the next item (vertical) |
| <Kbd>ArrowUp</Kbd> | Moves focus to the previous item (vertical) |
| <Kbd>Home</Kbd> | Moves focus to the first item |
| <Kbd>End</Kbd> | Moves focus to the last item |
| <Kbd>Space</Kbd> / <Kbd>Enter</Kbd> | Toggles the focused item |