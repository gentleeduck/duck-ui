```tsx title="components/input-otp-1.tsx"
// import from your project: import Demo from '@/components/input-otp-1'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@gentleduck/registry-ui/input-otp'

export default function Demo() {
  return (
    <InputOTP aria-label="One-time code" maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </InputOTP>
  )
}
```

## Philosophy

OTP inputs are deceptively complex: they need to handle paste, auto-fill, focus management across segments, and mobile keyboard optimization. We isolate this complexity in a dedicated component rather than stretching Input to cover it. Each slot is its own element, giving you full control over styling and animation per digit.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add input-otp
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/primitives lucide-react
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
```

```tsx showLineNumbers
<InputOTP aria-label="One-time code" maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot />
    <InputOTPSlot />
    <InputOTPSlot />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot />
    <InputOTPSlot />
    <InputOTPSlot />
  </InputOTPGroup>
</InputOTP>
```

## Examples

### Pattern

Use the `pattern` prop to set which characters a slot takes. It is tested against one character at a time. `REGEXP_ONLY_DIGITS` also opens the numeric keyboard on a phone.

```tsx title="components/input-otp-2.tsx"
// import from your project: import Demo from '@/components/input-otp-2'
'use client'
import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS } from '@gentleduck/registry-ui/input-otp'

export default function Demo() {
  return (
    <InputOTP aria-label="One-time code" maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </InputOTP>
  )
}
```

```tsx showLineNumbers {1,5}
import { REGEXP_ONLY_DIGITS } from "@/components/ui/input-otp"

...

<InputOTP aria-label="One-time code" maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
  <InputOTPGroup>
    <InputOTPSlot />
    {/* ... */}
  </InputOTPGroup>
</InputOTP>
```

The default, `REGEXP_ONLY_DIGITS_AND_CHARS`, takes a digit or a letter from `a` to `z` in either case. `REGEXP_ONLY_CHARS` takes the letters alone.

### Separator

You can use the `<InputOTPSeparator />` component to add a separator between the input groups.

```tsx title="components/input-otp-3.tsx"
// import from your project: import Demo from '@/components/input-otp-3'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@gentleduck/registry-ui/input-otp'

export default function Demo() {
  return (
    <InputOTP aria-label="One-time code" maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </InputOTP>
  )
}
```

```tsx showLineNumbers {4,15}
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

...

<InputOTP aria-label="One-time code" maxLength={4}>
  <InputOTPGroup>
    <InputOTPSlot />
    <InputOTPSlot />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot />
    <InputOTPSlot />
  </InputOTPGroup>
</InputOTP>
```

### Controlled

You can use the `value` and `onValueChange` props to control the input value.

```tsx title="components/input-otp-4.tsx"
// import from your project: import Demo from '@/components/input-otp-4'
'use client'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@gentleduck/registry-ui/input-otp'
import React from 'react'

export default function Demo() {
  const [value, setValue] = React.useState('')

  return (
    <div className="space-y-2">
      <InputOTP aria-label="One-time code" maxLength={6} onValueChange={(value) => setValue(value)} value={value}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>
      <div className="text-center text-sm">
        {value === '' ? 'Enter your one-time password.' : <>You entered: {value}</>}
      </div>
    </div>
  )
}
```

### Custom separator

```tsx title="components/input-otp-5.tsx"
// import from your project: import Demo from '@/components/input-otp-5'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@gentleduck/registry-ui/input-otp'
import { Minus } from 'lucide-react'

export default function Demo() {
  return (
    <InputOTP aria-label="One-time code" maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
      <InputOTPSeparator>
        <Minus aria-hidden="true" />
      </InputOTPSeparator>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </InputOTP>
  )
}
```

### Form

```tsx title="components/input-otp-6.tsx"
// import from your project: import Demo from '@/components/input-otp-6'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@gentleduck/registry-ui/input-otp'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
})

export default function Demo() {
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      pin: '',
    },
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast('You submitted the following values', {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <form className="w-2/3 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="pin"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel id="form-rhf-input-otp-pin">One-Time Password</FieldLabel>
              <InputOTP
                aria-labelledby="form-rhf-input-otp-pin"
                autoSubmit
                maxLength={6}
                value={field.value}
                onBlur={field.onBlur}
                onValueChange={field.onChange}
                aria-invalid={fieldState.invalid}>
                <InputOTPGroup>
                  <InputOTPSlot />
                  <InputOTPSlot />
                  <InputOTPSlot />
                  <InputOTPSlot />
                  <InputOTPSlot />
                  <InputOTPSlot />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>Please enter the one-time password sent to your phone.</FieldDescription>
              {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

A plain form submits the code through `InputOTPHiddenInput`, under the root's `name`. `autoSubmit` submits the form once every slot is filled, after the hidden input holds the whole code. Calling `requestSubmit` from `onComplete` instead submits the code without its last character, because the hidden input has not caught up yet.

```tsx showLineNumbers
<form action="/verify">
  <InputOTP aria-label="One-time code" maxLength={6} name="code" autoSubmit>
    <InputOTPGroup>
      <InputOTPSlot />
      {/* ... */}
    </InputOTPGroup>
    <InputOTPHiddenInput />
  </InputOTP>
</form>
```

Every slot carries `autoComplete="one-time-code"`, so the browser can offer the code from a text message, and a code filled into one slot spreads across all of them. Give a slot `autoComplete="off"` to stop it.

### PIN

`type="password"` hides each character. `onComplete` gets the code once every slot is filled, here to check it, with `disabled` while it is checked and `readOnly` once it is right.

```tsx title="components/input-otp-9.tsx"
// import from your project: import Demo from '@/components/input-otp-9'
'use client'

import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS } from '@gentleduck/registry-ui/input-otp'
import { Label } from '@gentleduck/registry-ui/label'
import * as React from 'react'

const MESSAGES = {
  checking: 'Checking...',
  idle: 'Type 1234 to unlock.',
  unlocked: 'Unlocked.',
  wrong: 'Wrong PIN, try again.',
}

export default function Demo() {
  const [pin, setPin] = React.useState('')
  const [status, setStatus] = React.useState<keyof typeof MESSAGES>('idle')

  return (
    <div className="flex flex-col items-center gap-3">
      <Label id="pin-label">PIN</Label>
      <InputOTP
        aria-labelledby="pin-label"
        disabled={status === 'checking'}
        maxLength={4}
        onComplete={(code) => {
          setStatus('checking')
          setTimeout(() => {
            setStatus(code === '1234' ? 'unlocked' : 'wrong')
            if (code !== '1234') setPin('')
          }, 800)
        }}
        onValueChange={setPin}
        pattern={REGEXP_ONLY_DIGITS}
        readOnly={status === 'unlocked'}
        type="password"
        value={pin}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {MESSAGES[status]}
      </p>
    </div>
  )
}
```

### Plain form

`InputOTPHiddenInput` submits the code under the root's `name` with no form library. `Enter` sends it, and the form's reset button empties it.

```tsx title="components/input-otp-10.tsx"
// import from your project: import Demo from '@/components/input-otp-10'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPHiddenInput,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from '@gentleduck/registry-ui/input-otp'
import { Label } from '@gentleduck/registry-ui/label'
import * as React from 'react'

export default function Demo() {
  const [sent, setSent] = React.useState('')

  return (
    <form
      className="flex flex-col items-center gap-3"
      onReset={() => setSent('')}
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get('code')))
      }}>
      <Label id="verification-code-label">Verification code</Label>
      <InputOTP aria-labelledby="verification-code-label" maxLength={6} name="code" pattern={REGEXP_ONLY_DIGITS}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
        <InputOTPHiddenInput />
      </InputOTP>
      <Button size="sm" type="reset" variant="outline">
        Clear
      </Button>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {sent ? `Sent ${sent}.` : 'Press Enter to send the code.'}
      </p>
    </form>
  )
}
```

### Focus on mount and a starting code

```tsx title="components/input-otp-11.tsx"
// import from your project: import Demo from '@/components/input-otp-11'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@gentleduck/registry-ui/input-otp'
import * as React from 'react'

export default function Demo() {
  const [asked, setAsked] = React.useState(false)

  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setAsked((value) => !value)} variant="outline">
        {asked ? 'Cancel' : 'Send me a code'}
      </Button>
      {asked ? (
        <InputOTP aria-label="Code" autoFocus defaultValue="4" maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot />
            <InputOTPSlot />
            <InputOTPSlot />
            <InputOTPSlot />
          </InputOTPGroup>
        </InputOTP>
      ) : null}
      <p className="text-muted-foreground text-sm">
        It starts from defaultValue, and autoFocus puts the caret in the slot typing goes to.
      </p>
    </div>
  )
}
```

## Keyboard and paste

* A character goes into the focused slot and focus moves on. One the `pattern` refuses changes nothing.
* `Backspace` removes the focused slot's character, or the one before an empty slot. `Delete` removes the focused slot's character.
* `Enter` submits the form the code sits in, and clicking a slot past the end of the code puts the caret in the first empty one.
* Pasting fills from the focused slot with the characters the `pattern` accepts.
* `onValueChange` is called with the whole code after each change.

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `InputOTP` follows it: the first slot is on the right and the Left/Right arrow keys flip. No `dir` prop needed.

```tsx title="components/input-otp-7.tsx"
// import from your project: import Demo from '@/components/input-otp-7'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@gentleduck/registry-ui/input-otp'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <InputOTP aria-label="رمز التحقق" maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionInputOTP` for a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition on the entire OTP input, powered by [motion](https://motion.dev).

```tsx title="components/input-otp-8.tsx"
// import from your project: import Demo from '@/components/input-otp-8'
'use client'

import { InputOTPGroup, InputOTPSeparator, InputOTPSlot, MotionInputOTP } from '@gentleduck/registry-ui/input-otp'

export default function Demo() {
  return (
    <MotionInputOTP aria-label="One-time code" maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </MotionInputOTP>
  )
}
```

}>
  Requires the `motion` package. Use `MotionInputOTP` instead of `InputOTP`. All other sub-components stay the same.

## API Reference

### InputOTP

The root component that provides OTP context and manages slot focus, paste, and value state. It is a `role="group"` with no label of its own, so give it an `aria-label` or `aria-labelledby`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the wrapper div |
| `children` | `React.ReactNode` | - | OTP groups, slots, and separators |
| `value` | `string` | - | Controlled value of the OTP input |
| `defaultValue` | `string` | `''` | Value to start with when uncontrolled |
| `onValueChange` | `(value: string) => void` | - | Called with the whole code whenever it changes |
| `onComplete` | `(value: string) => void` | - | Called with the code once every slot is filled |
| `autoSubmit` | `boolean` | `false` | Submits the form the slots sit in once every slot is filled, after `InputOTPHiddenInput` holds the whole code |
| `pattern` | `RegExp` | `REGEXP_ONLY_DIGITS_AND_CHARS` | Regex each typed, pasted or filled character is tested against |
| `maxLength` | `number` | - | Counts only the first `maxLength` slots as part of the code |
| `disabled` | `boolean` | - | Disables every slot |
| `readOnly` | `boolean` | - | Makes every slot read-only |
| `type` | `'text' \| 'password'` | `'text'` | Input type of every slot, `'password'` to mask the code |
| `name` | `string` | - | Name `InputOTPHiddenInput` submits the code under |
| `dir` | `'ltr' \| 'rtl'` | inherited | Local direction override |
| `ref` | `React.Ref<HTMLDivElement>` | - | Ref forwarded to the wrapper div |
| `...props` | `React.ComponentPropsWithoutRef<'div'>` | - | Additional props to spread to the wrapper div |

### InputOTPGroup

Groups related OTP slots together with flex layout.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the group div |
| `children` | `React.ReactNode` | - | OTP slots to group together |
| `ref` | `React.Ref<HTMLDivElement>` | - | Ref forwarded to the group div |
| `...props` | `React.ComponentPropsWithoutRef<'div'>` | - | Additional props to spread to the div |

### InputOTPSlot

An individual input element representing a single OTP character. A slot with no `aria-label` of its own is labelled `Digit 1`, `Digit 2` and so on, and every slot carries `autoComplete="one-time-code"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the input element |
| `ref` | `React.Ref<HTMLInputElement>` | - | Ref forwarded to the input element |
| `...props` | `React.ComponentPropsWithoutRef<'input'>` | - | Additional props to spread to the input element |

### InputOTPHiddenInput

An unstyled `<input type="hidden">` holding the code, so a form submits it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | root `name` | Name the code is submitted under |
| `...props` | `Omit<React.ComponentPropsWithoutRef<'input'>, 'value' \| 'defaultValue' \| 'type'>` | - | Additional input props, such as `form` |

### InputOTPSeparator

A visual separator rendered between OTP groups.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the separator div |
| `children` | `React.ReactNode` | `<Dot />` | Content drawn in place of the default dot icon |
| `ref` | `React.Ref<HTMLDivElement>` | - | Ref forwarded to the separator div |
| `...props` | `React.ComponentPropsWithoutRef<'div'>` | - | Additional props to spread to the div |

### MotionInputOTP

Same props as `InputOTP`. Adds a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition on the entire OTP container. Requires the `motion` package.