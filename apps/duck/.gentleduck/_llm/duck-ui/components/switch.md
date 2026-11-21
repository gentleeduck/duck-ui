```tsx title="components/switch-1.tsx"
// import from your project: import Demo from '@/components/switch-1'
'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'

export default function Demo() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane mode</Label>
    </div>
  )
}
```

## Philosophy

Switches represent immediate, binary state changes  -  unlike checkboxes, which defer action to a form submission. This semantic distinction matters for UX: a switch should take effect instantly. We support custom SVG indicators so the on/off metaphor can match your design language without sacrificing the accessible `role="switch"` foundation.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add switch
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/motion @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Switch } from "@/components/ui/switch"
```

```tsx
<Switch />
```

## Examples

### Form

```tsx title="components/switch-2.tsx"
// import from your project: import Demo from '@/components/switch-2'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@gentleduck/registry-ui/field'
import { Switch } from '@gentleduck/registry-ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const FormSchema = z.object({
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean(),
})

export default function Demo() {
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      security_emails: true,
    },
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.info(
      <div>
        <h4 className="font-medium text-lg">You submitted the following values:</h4>
        <pre className="mt-2 w-[270px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>,
    )
  }

  return (
    <form className="w-full space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <h3 className="mb-4 font-medium text-lg">Email Notifications</h3>
        <FieldGroup className="space-y-4">
          <Controller
            control={form.control}
            name="marketing_emails"
            render={({ field, fieldState }) => (
              <Field
                className="justify-between rounded-lg border p-3 shadow-sm"
                orientation="horizontal"
                data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor="switch-marketing-emails">Marketing emails</FieldLabel>
                  <FieldDescription>Receive emails about new products, features, and more.</FieldDescription>
                  {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
                <Switch
                  id="switch-marketing-emails"
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="security_emails"
            render={({ field, fieldState }) => (
              <Field
                className="justify-between rounded-lg border p-3 shadow-sm"
                orientation="horizontal"
                data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor="switch-security-emails">Security emails</FieldLabel>
                  <FieldDescription>Receive emails about your account security.</FieldDescription>
                  {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
                <Switch
                  id="switch-security-emails"
                  name={field.name}
                  checked={field.value}
                  disabled
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
              </Field>
            )}
          />
        </FieldGroup>
      </div>
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

Inside a `<form>`, a form reset puts the switch back on `defaultChecked` and calls `onCheckedChange` with that value. A value set through `checked` fires the form's `change` event as a click would, without running the switch's own `onChange`, `onClick` or `onCheckedChange`. If the owner does not follow a reset, a controlled switch goes back to its `checked` before the next paint. `MotionSwitch` does the same.

### Native form

With a `name`, a checked switch submits `name=on` and an unchecked one submits nothing, as a checkbox does. Reset puts it back on `defaultChecked` and tells `onCheckedChange`, so the label follows.

```tsx title="components/switch-6.tsx"
// import from your project: import Demo from '@/components/switch-6'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [newsletter, setNewsletter] = React.useState(true)
  const [submitted, setSubmitted] = React.useState('')

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        const entries = Array.from(new FormData(event.currentTarget), ([name, value]) => `${name}=${value}`)
        setSubmitted(entries.join('&') || 'nothing')
      }}>
      <div className="flex items-center gap-2">
        <Switch defaultChecked id="form-newsletter" name="newsletter" onCheckedChange={setNewsletter} />
        <Label htmlFor="form-newsletter">Newsletter: {newsletter ? 'on' : 'off'}</Label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" type="submit">
          Save
        </Button>
        <Button onClick={() => setSubmitted('')} size="sm" type="reset" variant="outline">
          Reset
        </Button>
      </div>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {submitted ? `Submitted ${submitted}.` : 'Nothing submitted yet.'}
      </p>
    </form>
  )
}
```

### Icons, controlled and disabled

`indicator` is drawn on the thumb while the switch is off and `checkedIndicator` while it is on. `checked` with `onCheckedChange` holds the value, and `disabled` keeps it where it is.

```tsx title="components/switch-5.tsx"
// import from your project: import Demo from '@/components/switch-5'
'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import { Moon, Sun } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [dark, setDark] = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch
          checked={dark}
          checkedIndicator={<Moon />}
          id="theme-switch"
          indicator={<Sun />}
          onCheckedChange={setDark}
        />
        <Label htmlFor="theme-switch">Dark theme: {dark ? 'on' : 'off'}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch defaultChecked disabled id="sync-switch" />
        <Label htmlFor="sync-switch">Sync (managed by your organisation)</Label>
      </div>
    </div>
  )
}
```

### The native change event

```tsx title="components/switch-7.tsx"
// import from your project: import Demo from '@/components/switch-7'
'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [events, setEvents] = React.useState(0)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Switch id="switch-7" name="beta" onChange={() => setEvents((count) => count + 1)} />
        <Label htmlFor="switch-7">Join the beta</Label>
      </div>
      <p className="text-muted-foreground text-sm">The native change event fired {events} times.</p>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `Switch` follows it: the thumb starts on the right and slides left when checked. No `dir` prop or `rtl:` classes needed.

```tsx title="components/switch-3.tsx"
// import from your project: import Demo from '@/components/switch-3'
'use client'

import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="flex items-center gap-2">
        <Switch id="airplane-mode-rtl" />
        <Label htmlFor="airplane-mode-rtl">وضع الطيران</Label>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionSwitch` for a physical-feeling toggle powered by [motion](https://motion.dev). The thumb slides with a bouncy spring, stretches in the direction of travel when pressed, and the track color crossfades between border and primary.

```tsx title="components/switch-4.tsx"
// import from your project: import Demo from '@/components/switch-4'
'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { MotionSwitch } from '@gentleduck/registry-ui/switch'

export default function Demo() {
  return (
    <div className="flex items-center gap-2">
      <MotionSwitch id="motion-wifi" />
      <Label htmlFor="motion-wifi">Wi-Fi</Label>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionSwitch` instead of `Switch`. The motion variant renders its own track + thumb so it does not support the `indicator` / `checkedIndicator` props: use the base `Switch` if you need custom SVG indicators.

## API Reference

### Switch

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional class names for the checkbox input |
| `indicator` | `React.ReactElement` | - | Icon drawn on the thumb while off. Without `checkedIndicator` the thumb is plain while on |
| `checkedIndicator` | `React.ReactElement` | - | Icon drawn on the thumb while on |
| `onChange` | `(event: ChangeEvent) => void` | - | Native checkbox `change` event handler |
| `onCheckedChange` | `(checked: boolean) => void` | - | Called with the new checked state on a click, and on a form reset that moves it back |
| `ref` | `React.Ref<HTMLInputElement>` | - | Ref forwarded to the native checkbox input |
| `style` | `React.CSSProperties` | - | Inline styles applied to the input element |
| `...props` | `React.HTMLProps<HTMLInputElement>` | - | Additional props to spread to the input element |

### MotionSwitch

Renders its own motion-controlled track and thumb. The thumb slides with a bouncy spring, stretches in the direction of travel while pressed, and the track color crossfades between `border` and `primary`. Requires the `motion` package. Does **not** support the `indicator` / `checkedIndicator` props: use the base `Switch` for custom SVG indicators.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. In RTL the thumb starts on the right and the stretch origin flips. |
| `checked` | `boolean` | - | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Uncontrolled initial checked state |
| `disabled` | `boolean` | `false` | Disables interaction and lowers opacity |
| `onChange` | `(event: ChangeEvent) => void` | - | Native checkbox `change` event handler |
| `onCheckedChange` | `(checked: boolean) => void` | - | Called with the new checked state on a click, and on a form reset that moves it back |
| `className` | `string` | - | Additional class names for the outer track label |
| `style` | `React.CSSProperties` | - | Inline styles applied to the outer track label |
| `...props` | `React.HTMLProps<HTMLInputElement>` | - | Additional props spread onto the hidden input element |

## See also

* [Checkbox](/duck-ui/components/checkbox)  -  Multi-selection toggle control
* [Radio Group](/duck-ui/components/radio-group)  -  Single selection from a set of options