```tsx
import * as RadioGroup from '@gentleduck/primitives/radio-group'
```

## Anatomy

```tsx
<RadioGroup.Root>
  <RadioGroup.Item value="comfortable">
    <RadioGroup.Indicator />
  </RadioGroup.Item>
</RadioGroup.Root>
```

## Usage

```tsx
import * as RadioGroup from '@gentleduck/primitives/radio-group'

function DensityPicker() {
  return (
    <RadioGroup.Root defaultValue="comfortable" name="density" className="grid gap-2">
      <RadioGroup.Item value="compact" textValue="Compact" aria-label="Compact density">
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <RadioGroup.Item value="comfortable" textValue="Comfortable" aria-label="Comfortable density">
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <RadioGroup.Item value="spacious" textValue="Spacious" aria-label="Spacious density">
        <RadioGroup.Indicator />
      </RadioGroup.Item>
    </RadioGroup.Root>
  )
}
```

## Examples

### Basic

```tsx title="components/radio-group-basic.tsx"
// import from your project: import Demo from '@/components/radio-group-basic'
'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import styles from '../primitives.module.css'

export default function RadioGroupBasicExample() {
  return (
    <RadioGroup.Root aria-label="Density" className={styles.choices} defaultValue="comfortable">
      {['default', 'comfortable', 'compact'].map((value) => (
        <div className={styles.choice} key={value}>
          <RadioGroup.Item className={styles.radio} id={`density-${value}`} value={value}>
            <RadioGroup.Indicator className={styles.dot} />
          </RadioGroup.Item>
          <label htmlFor={`density-${value}`}>{value}</label>
        </div>
      ))}
    </RadioGroup.Root>
  )
}
```

### Horizontal

```tsx title="components/radio-group-horizontal.tsx"
// import from your project: import Demo from '@/components/radio-group-horizontal'
'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import styles from '../primitives.module.css'

export default function RadioGroupHorizontalExample() {
  return (
    <RadioGroup.Root
      aria-label="Size"
      className={styles.choices}
      defaultValue="m"
      loop={false}
      orientation="horizontal">
      {['s', 'm', 'l', 'xl'].map((value) => (
        <div className={styles.choice} key={value}>
          <RadioGroup.Item className={styles.radio} id={`size-${value}`} value={value}>
            <RadioGroup.Indicator className={styles.dot} />
          </RadioGroup.Item>
          <label htmlFor={`size-${value}`}>{value.toUpperCase()}</label>
        </div>
      ))}
    </RadioGroup.Root>
  )
}
```

### In a form

```tsx title="components/radio-group-form.tsx"
// import from your project: import Demo from '@/components/radio-group-form'
'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function RadioGroupFormExample() {
  const [sent, setSent] = React.useState('')

  return (
    <form
      className={styles.stack}
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get('plan')))
      }}>
      <RadioGroup.Root aria-label="Plan" className={styles.choices} name="plan" required>
        {['free', 'pro', 'team'].map((value) => (
          <div className={styles.choice} key={value}>
            <RadioGroup.Item className={styles.radio} id={`plan-${value}`} value={value}>
              <RadioGroup.Indicator className={styles.dot} />
            </RadioGroup.Item>
            <label htmlFor={`plan-${value}`}>{value}</label>
          </div>
        ))}
      </RadioGroup.Root>
      <div className={styles.row}>
        <button className={`${styles.button} ${styles.primary}`} type="submit">
          Continue
        </button>
        <button className={styles.button} type="reset">
          Reset
        </button>
      </div>
      <p className={styles.note}>
        {sent ? `Submitted plan=${sent}` : 'required refuses to submit with nothing picked.'}
      </p>
    </form>
  )
}
```

### Disabled and read-only

```tsx title="components/radio-group-disabled.tsx"
// import from your project: import Demo from '@/components/radio-group-disabled'
'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import styles from '../primitives.module.css'

const OPTIONS = [
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank transfer (unavailable)', disabled: true },
  { value: 'paypal', label: 'PayPal' },
]

export default function RadioGroupDisabledExample() {
  return (
    <div className={styles.row} style={{ alignItems: 'start', gap: '2rem' }}>
      <RadioGroup.Root aria-label="Payment" className={styles.choices} defaultValue="card">
        {OPTIONS.map((option) => (
          <div className={styles.choice} key={option.value}>
            <RadioGroup.Item
              className={styles.radio}
              disabled={option.disabled}
              id={`pay-${option.value}`}
              value={option.value}>
              <RadioGroup.Indicator className={styles.dot} />
            </RadioGroup.Item>
            <label htmlFor={`pay-${option.value}`}>{option.label}</label>
          </div>
        ))}
      </RadioGroup.Root>
      <RadioGroup.Root aria-label="Locked payment" className={styles.choices} defaultValue="paypal" readOnly>
        {OPTIONS.map((option) => (
          <div className={styles.choice} key={option.value}>
            <RadioGroup.Item className={styles.radio} id={`locked-${option.value}`} value={option.value}>
              <RadioGroup.Indicator className={styles.dot} />
            </RadioGroup.Item>
            <label htmlFor={`locked-${option.value}`}>{option.label} (read only)</label>
          </div>
        ))}
      </RadioGroup.Root>
    </div>
  )
}
```

### Controlled

```tsx title="components/radio-group-controlled.tsx"
// import from your project: import Demo from '@/components/radio-group-controlled'
'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function RadioGroupControlledExample() {
  const [value, setValue] = React.useState<string | null>(null)

  return (
    <div className={styles.stack}>
      <RadioGroup.Root aria-label="Shipping" className={styles.choices} onValueChange={setValue} value={value}>
        {['standard', 'express'].map((option) => (
          <div className={styles.choice} key={option}>
            <RadioGroup.Item className={styles.radio} id={`ship-${option}`} value={option}>
              <RadioGroup.Indicator className={styles.dot} />
            </RadioGroup.Item>
            <label htmlFor={`ship-${option}`}>{option}</label>
          </div>
        ))}
      </RadioGroup.Root>
      <button className={styles.button} onClick={() => setValue(null)} type="button">
        Clear the choice
      </button>
      <p className={styles.note}>Picked: {value ?? 'nothing'}. null selects nothing.</p>
    </div>
  )
}
```

### Right to left

```tsx title="components/radio-group-rtl.tsx"
// import from your project: import Demo from '@/components/radio-group-rtl'
'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import styles from '../primitives.module.css'

export default function RadioGroupRtlExample() {
  return (
    <RadioGroup.Root aria-label="اللغة" className={styles.choices} defaultValue="ar" dir="rtl" orientation="horizontal">
      {[
        { value: 'ar', label: 'العربية' },
        { value: 'en', label: 'الإنجليزية' },
      ].map((option) => (
        <div className={styles.choice} key={option.value}>
          <RadioGroup.Item className={styles.radio} id={`lang-${option.value}`} value={option.value}>
            <RadioGroup.Indicator className={styles.dot} />
          </RadioGroup.Item>
          <label htmlFor={`lang-${option.value}`}>{option.label}</label>
        </div>
      ))}
    </RadioGroup.Root>
  )
}
```

***

## API

### `RadioGroup.Root`

Container for a single-selection radio set. Uses roving focus and, when it has a `name`, a hidden native radio input per item, so a form submits, validates and resets it like native radios.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| null` | - | Controlled selected value. `null` or `''` selects nothing |
| `defaultValue` | `string` | - | Initial selected value (uncontrolled) |
| `onValueChange` | `(value: string) => void` | - | Called when selected value changes |
| `disabled` | `boolean` | `false` | Disables all items in the group |
| `readOnly` | `boolean` | `false` | Keeps the selection fixed while items stay focusable. Sets `aria-readonly` |
| `required` | `boolean` | `false` | Marks the hidden inputs required, so the form refuses to submit with nothing selected |
| `name` | `string` | - | Name used for hidden native radio inputs |
| `form` | `string` | - | Id of a form outside the group that the hidden inputs belong to |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved with `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `orientation` | `'horizontal' \| 'vertical'` | - | Limits arrow-key navigation axis |
| `loop` | `boolean` | `true` | Wraps focus from end to start (and reverse) |
| `...props` | `React.ComponentPropsWithoutRef<'div'>` | - | Additional props for the radiogroup container |

Exposes `data-disabled` and `data-readonly`. Picking a radio fires the form's `change` event once, as a native radio does. Resetting the form puts back the value the group started with and fires nothing.

### `RadioGroup.Item`

A single radio control. Renders a `button` with `role="radio"`, and inside a form a hidden `<input type="radio">` beside it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | (required) | Unique value for the item |
| `textValue` | `string` | - | Text typeahead matches. Falls back to `aria-label`, then the item's text |
| `disabled` | `boolean` | `false` | Disables this item |
| `...props` | `React.ComponentPropsWithoutRef<'button'>` | - | Additional props for the radio button element |

Exposes `data-state` (`checked` / `unchecked`), `data-disabled`, `data-readonly` and `data-value`. Items take their direction from the group and carry no `dir` of their own.

### `RadioGroup.ItemProvider` / `RadioGroup.ItemTrigger` / `RadioGroup.ItemBubbleInput`

`RadioGroup.Item` is `RadioGroup.ItemTrigger` inside a `RadioGroup.ItemProvider`, with a `RadioGroup.ItemBubbleInput` beside it when the group has a `name`. Compose the three yourself to place the hidden input, give it props of its own, or render it without a `name`.

```tsx
<RadioGroup.Root name="density" defaultValue="compact">
  <RadioGroup.ItemProvider value="compact">
    <RadioGroup.ItemTrigger aria-label="Compact density">
      <RadioGroup.Indicator />
    </RadioGroup.ItemTrigger>
    <RadioGroup.ItemBubbleInput data-testid="compact-input" />
  </RadioGroup.ItemProvider>
</RadioGroup.Root>
```

`RadioGroup.ItemProvider` takes the item's `value` and `disabled`. `RadioGroup.ItemTrigger` takes the props of `RadioGroup.Item` except those two. `RadioGroup.ItemBubbleInput` takes the props of an `<input>`; its `name`, `value`, `checked`, `required`, `disabled` and `form` come from the group and the item. Focus given to it, as when a form refuses an empty submit to a required group, moves to the item's radio.

### `RadioGroup.Indicator`

Indicator content that mounts when the parent item is checked.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `true` | - | Force indicator to stay mounted for animation control |
| `...props` | `React.ComponentPropsWithoutRef<'span'>` | - | Additional props for the indicator element |

## Keyboard interactions

| Key | Action |
| --- | --- |
| <Kbd>ArrowUp</Kbd> / <Kbd>ArrowLeft</Kbd> | Move focus to previous item and select it |
| <Kbd>ArrowDown</Kbd> / <Kbd>ArrowRight</Kbd> | Move focus to next item and select it |
| <Kbd>Home</Kbd> / <Kbd>PageUp</Kbd> | Move to first item and select it |
| <Kbd>End</Kbd> / <Kbd>PageDown</Kbd> | Move to last item and select it |
| <Kbd>a-z</Kbd> | Move to the next item after the focused one whose text starts with it, and select it |
| <Kbd>g</Kbd> <Kbd>g</Kbd> | Jump to first item and select it |
| <Kbd>Shift</Kbd>+<Kbd>g</Kbd> (`G`) | Jump to last item and select it |
| <Kbd>Space</Kbd> | Select focused item |
| <Kbd>Enter</Kbd> | Nothing, as on a native radio |

In a `readOnly` group these keys move focus without selecting.