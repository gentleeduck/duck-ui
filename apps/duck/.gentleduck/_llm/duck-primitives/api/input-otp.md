```tsx
import * as InputOTP from '@gentleduck/primitives/input-otp'
```

## Anatomy

```tsx
<InputOTP.Root>
  <InputOTP.Group>
    <InputOTP.Slot />
  </InputOTP.Group>
  <InputOTP.Separator />
  <InputOTP.HiddenInput />
</InputOTP.Root>
```

## Usage

```tsx
<form action="/verify">
  <InputOTP.Root maxLength={6} name="code" pattern={REGEXP_ONLY_DIGITS} onComplete={(code) => verify(code)}>
    <InputOTP.Group>
      <InputOTP.Slot autoComplete="one-time-code" />
      <InputOTP.Slot />
      <InputOTP.Slot />
    </InputOTP.Group>
    <InputOTP.Separator>-</InputOTP.Separator>
    <InputOTP.Group>
      <InputOTP.Slot />
      <InputOTP.Slot />
      <InputOTP.Slot />
    </InputOTP.Group>
    <InputOTP.HiddenInput />
  </InputOTP.Root>
</form>
```

## Keyboard and input

| Input | Result |
| --- | --- |
| A character the `pattern` accepts | Goes into the focused slot, or the first empty one when the slot is past the end of the code, and focus moves on |
| A character it refuses | Nothing changes |
| `Backspace` | Removes the character in the focused slot, or the one before an empty slot, and focus lands where it was |
| `Delete` | Removes the character in the focused slot, and the rest of the code moves back one |
| `Tab` | Stops once in the code, at the slot typing goes to: the first empty one, or the last |
| `ArrowLeft` / `ArrowRight` | Moves focus one slot, flipped in RTL |
| `Enter` | Submits the form the slots sit in. A form with a submit button is left to the browser, which presses that button |
| Paste | Fills from the focused slot with the characters the `pattern` accepts, as far as the slots go |
| Autofill or an on-screen keyboard | Read from the input event, so a code the browser fills into one slot spreads across all of them |

A slot selects its character when it takes focus. A key held with `Ctrl`, `Meta` or `Alt` is left to the browser.

Pressing a slot past the end of the code puts the caret in the first empty slot, where typing goes. The arrow keys still reach every slot.

Resetting the form puts the root back to `defaultValue`, or empties it, and a controlled root is told through `onValueChange`. A reset another listener cancels changes nothing.

A browser fills a code from a text message into the slot with focus, and the root spreads it across the slots. A slot has no `maxLength`, which would cut that code to its first character.

## Examples

### Six digits in two groups

```tsx title="components/input-otp-basic.tsx"
// import from your project: import Demo from '@/components/input-otp-basic'
'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function InputOTPBasicExample() {
  const [done, setDone] = React.useState('')

  return (
    <div className={styles.stack}>
      <InputOTP.Root aria-label="Verification code" className={styles.otp} onComplete={setDone}>
        <InputOTP.Group className={styles.otp}>
          {[0, 1, 2].map((slot) => (
            <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} key={slot} />
          ))}
        </InputOTP.Group>
        <InputOTP.Separator>-</InputOTP.Separator>
        <InputOTP.Group className={styles.otp}>
          {[3, 4, 5].map((slot) => (
            <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} key={slot} />
          ))}
        </InputOTP.Group>
      </InputOTP.Root>
      <p className={styles.note}>
        {done ? `Complete: ${done}` : 'Type or paste a code. Backspace, Delete and the arrows move as in one field.'}
      </p>
    </div>
  )
}
```

### Patterns

```tsx title="components/input-otp-pattern.tsx"
// import from your project: import Demo from '@/components/input-otp-pattern'
'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import styles from '../primitives.module.css'

function Code({ label, pattern }: { label: string; pattern: RegExp }) {
  return (
    <div className={styles.stack}>
      <span className={styles.label}>{label}</span>
      <InputOTP.Root aria-label={label} className={styles.otp} pattern={pattern}>
        {[0, 1, 2, 3].map((slot) => (
          <InputOTP.Slot aria-label={`${label} ${slot + 1}`} className={styles.slot} key={slot} />
        ))}
      </InputOTP.Root>
    </div>
  )
}

export default function InputOTPPatternExample() {
  return (
    <div className={styles.row}>
      <Code label="Digits only" pattern={InputOTP.REGEXP_ONLY_DIGITS} />
      <Code label="Letters only" pattern={InputOTP.REGEXP_ONLY_CHARS} />
      <Code label="Hex" pattern={/^[0-9a-fA-F]$/} />
    </div>
  )
}
```

### In a form

```tsx title="components/input-otp-form.tsx"
// import from your project: import Demo from '@/components/input-otp-form'
'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function InputOTPFormExample() {
  const [submitted, setSubmitted] = React.useState('')

  return (
    <form
      className={styles.stack}
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(String(new FormData(event.currentTarget).get('code')))
      }}>
      <InputOTP.Root aria-label="Code" autoSubmit className={styles.otp} defaultValue="12" name="code">
        {[0, 1, 2, 3].map((slot) => (
          <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} key={slot} />
        ))}
        <InputOTP.HiddenInput />
      </InputOTP.Root>
      <div className={styles.row}>
        <button className={styles.button} type="reset">
          Reset to 12
        </button>
      </div>
      <p className={styles.note}>
        {submitted
          ? `Submitted code=${submitted}`
          : 'autoSubmit sends the form once the last slot fills, under the name "code".'}
      </p>
    </form>
  )
}
```

### Masked

```tsx title="components/input-otp-password.tsx"
// import from your project: import Demo from '@/components/input-otp-password'
'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import styles from '../primitives.module.css'

export default function InputOTPPasswordExample() {
  return (
    <InputOTP.Root aria-label="PIN" className={styles.otp} pattern={InputOTP.REGEXP_ONLY_DIGITS} type="password">
      {[0, 1, 2, 3].map((slot) => (
        <InputOTP.Slot aria-label={`PIN digit ${slot + 1}`} className={styles.slot} key={slot} />
      ))}
    </InputOTP.Root>
  )
}
```

### Controlled

```tsx title="components/input-otp-controlled.tsx"
// import from your project: import Demo from '@/components/input-otp-controlled'
'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function InputOTPControlledExample() {
  const [value, setValue] = React.useState('')

  return (
    <div className={styles.stack}>
      <InputOTP.Root aria-label="Code" className={styles.otp} onValueChange={setValue} value={value}>
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} key={slot} />
        ))}
      </InputOTP.Root>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setValue('424242')} type="button">
          Fill from SMS
        </button>
        <button className={styles.button} onClick={() => setValue('')} type="button">
          Clear
        </button>
      </div>
      <p className={styles.note}>Value: {value || 'empty'}</p>
    </div>
  )
}
```

### Read-only and disabled

```tsx title="components/input-otp-disabled.tsx"
// import from your project: import Demo from '@/components/input-otp-disabled'
'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import styles from '../primitives.module.css'

export default function InputOTPDisabledExample() {
  return (
    <div className={styles.stack}>
      <span className={styles.label}>Read only: focus moves, typing changes nothing</span>
      <InputOTP.Root aria-label="Read-only code" className={styles.otp} defaultValue="8261" readOnly>
        {[0, 1, 2, 3].map((slot) => (
          <InputOTP.Slot aria-label={`Read-only digit ${slot + 1}`} className={styles.slot} key={slot} />
        ))}
      </InputOTP.Root>
      <span className={styles.label}>Disabled: no focus at all</span>
      <InputOTP.Root aria-label="Disabled code" className={styles.otp} defaultValue="8261" disabled>
        {[0, 1, 2, 3].map((slot) => (
          <InputOTP.Slot aria-label={`Disabled digit ${slot + 1}`} className={styles.slot} key={slot} />
        ))}
      </InputOTP.Root>
    </div>
  )
}
```

### maxLength

```tsx title="components/input-otp-max-length.tsx"
// import from your project: import Demo from '@/components/input-otp-max-length'
'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function InputOTPMaxLengthExample() {
  const [length, setLength] = React.useState(4)
  const [done, setDone] = React.useState('')

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        {[4, 6].map((value) => (
          <button className={styles.button} key={value} onClick={() => setLength(value)} type="button">
            {value === length ? `[${value} digits]` : `${value} digits`}
          </button>
        ))}
      </div>
      <InputOTP.Root aria-label="Code" className={styles.otp} maxLength={length} onComplete={setDone}>
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} hidden={slot >= length} key={slot} />
        ))}
      </InputOTP.Root>
      <p className={styles.note}>
        {done ? `Complete at ${done.length}: ${done}` : 'maxLength counts only the first slots as the code.'}
      </p>
    </div>
  )
}
```

### Focus on mount

```tsx title="components/input-otp-auto-focus.tsx"
// import from your project: import Demo from '@/components/input-otp-auto-focus'
'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function InputOTPAutoFocusExample() {
  const [shown, setShown] = React.useState(false)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setShown((value) => !value)} type="button">
        {shown ? 'Hide the code' : 'Ask for the code'}
      </button>
      {shown ? (
        <InputOTP.Root aria-label="Code" autoFocus className={styles.otp} defaultValue="5">
          {[0, 1, 2, 3].map((slot) => (
            <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} key={slot} />
          ))}
        </InputOTP.Root>
      ) : null}
      <p className={styles.note}>autoFocus puts the caret in the slot typing goes to, here the second.</p>
    </div>
  )
}
```

### Right to left

```tsx title="components/input-otp-rtl.tsx"
// import from your project: import Demo from '@/components/input-otp-rtl'
'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import styles from '../primitives.module.css'

export default function InputOTPRtlExample() {
  return (
    <InputOTP.Root aria-label="رمز التحقق" className={styles.otp} dir="rtl">
      {[0, 1, 2, 3].map((slot) => (
        <InputOTP.Slot aria-label={`رقم ${slot + 1}`} className={styles.slot} key={slot} />
      ))}
    </InputOTP.Root>
  )
}
```

***

## API

### `InputOTP.Root`

A `role="group"` with no label of its own; pass `aria-label` or `aria-labelledby`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Controlled code |
| `defaultValue` | `string` | `''` | Code to start with when uncontrolled, and to go back to when the form is reset |
| `onValueChange` | `(value: string) => void` | - | Called with the whole code whenever it changes |
| `onComplete` | `(value: string) => void` | - | Called with the code once every slot is filled |
| `autoSubmit` | `boolean` | `false` | Submits the form the slots sit in once every slot is filled, after `HiddenInput` holds the whole code, as in Ark |
| `pattern` | `RegExp` | `REGEXP_ONLY_DIGITS_AND_CHARS` | Tested against each character typed, pasted or filled |
| `maxLength` | `number` | - | Counts only the first `maxLength` slots as part of the code |
| `disabled` | `boolean` | - | Disables every slot and sets `data-disabled` on the root |
| `readOnly` | `boolean` | - | Makes every slot read-only; focus still moves |
| `type` | `'text' \| 'password'` | `'text'` | Input type of every slot, `'password'` to mask the code |
| `name` | `string` | - | Name `HiddenInput` submits the code under |
| `dir` | `'ltr' \| 'rtl'` | inherited | Local direction override |
| `...props` | `React.ComponentPropsWithoutRef<'div'>` | - | Additional root props, `role` included |

### `InputOTP.Group`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<'div'>` | - | Additional group props |

### `InputOTP.Slot`

Takes the root's `type`, `disabled` and `readOnly`, and `inputMode="numeric"` when the pattern is `REGEXP_ONLY_DIGITS`. It carries `autoComplete="one-time-code"`, so the browser can offer a code from a text message; pass `autoComplete="off"` to stop it. A slot with no `aria-label` of its own is labelled `Digit 1`, `Digit 2` and so on.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<'input'>` | - | Additional input props |

### `InputOTP.HiddenInput`

An `<input type="hidden">` holding the code, so a form submits it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | root `name` | Name the code is submitted under |
| `...props` | `Omit<React.ComponentPropsWithoutRef<'input'>, 'value' \| 'defaultValue' \| 'type'>` | - | Additional input props, such as `form` |

### `InputOTP.Separator`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | Separator content |
| `...props` | `React.ComponentPropsWithoutRef<'div'>` | - | Additional separator props |

## Exports

* `InputOTP.Root`, `InputOTP.Group`, `InputOTP.Slot`, `InputOTP.HiddenInput`, `InputOTP.Separator`
* `REGEXP_ONLY_DIGITS`: a digit
* `REGEXP_ONLY_CHARS`: a letter, `a` to `z` in either case
* `REGEXP_ONLY_DIGITS_AND_CHARS`: a digit or such a letter