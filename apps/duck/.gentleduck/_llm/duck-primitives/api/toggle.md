```tsx
import * as Toggle from '@gentleduck/primitives/toggle'
```

## Anatomy

```tsx
<Toggle.Root />
```

***

## Usage

```tsx
import * as Toggle from '@gentleduck/primitives/toggle'
import { Bold } from 'lucide-react'

function BoldToggle() {
  return (
    <Toggle.Root aria-label="Toggle bold" className="rounded p-2 data-[state=on]:bg-accent">
      <Bold className="size-4" />
    </Toggle.Root>
  )
}
```

***

## Examples

### Basic

```tsx title="components/toggle-basic.tsx"
// import from your project: import Demo from '@/components/toggle-basic'
'use client'

import * as Toggle from '@gentleduck/primitives/toggle'
import styles from '../primitives.module.css'

export default function ToggleBasicExample() {
  return (
    <div className={styles.row}>
      <Toggle.Root aria-label="Bold" className={styles.toggle}>
        B
      </Toggle.Root>
      <Toggle.Root aria-label="Italic" className={styles.toggle} defaultPressed>
        I
      </Toggle.Root>
      <Toggle.Root aria-label="Underline" className={styles.toggle} disabled>
        U
      </Toggle.Root>
    </div>
  )
}
```

### Controlled

```tsx title="components/toggle-controlled.tsx"
// import from your project: import Demo from '@/components/toggle-controlled'
'use client'

import * as Toggle from '@gentleduck/primitives/toggle'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ToggleControlledExample() {
  const [muted, setMuted] = React.useState(false)

  return (
    <div className={styles.stack}>
      <Toggle.Root className={styles.toggle} onPressedChange={setMuted} pressed={muted}>
        {(pressed) => (pressed ? 'Unmute' : 'Mute')}
      </Toggle.Root>
      <p className={styles.note}>Muted: {String(muted)}. A function child reads the pressed state.</p>
    </div>
  )
}
```

***

## API

### `Toggle.Root`

A button that toggles between on and off states. Renders a `<button>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `pressed` | `boolean` | - | Controlled pressed state |
| `defaultPressed` | `boolean` | `false` | Initial pressed state |
| `onPressedChange` | `(pressed: boolean) => void` | - | Called when pressed state changes |
| `disabled` | `boolean` | `false` | Disables the toggle |
| `dir` | `string` | - | Sets the `dir` attribute, `auto` included. Leave it out and the toggle follows the page |
| `children` | `ReactNode \| ((pressed: boolean) => ReactNode)` | - | The content, or a function of the pressed state, as React Aria's `ToggleButton` takes. With `asChild`, the function returns the element to render |
| `asChild` | `boolean` | - | Render as child element |

Exposes `aria-pressed`, `data-state` (`on` | `off`), and `data-disabled` attributes.