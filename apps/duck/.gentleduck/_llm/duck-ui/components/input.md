```tsx title="components/input-1.tsx"
// import from your project: import Demo from '@/components/input-1'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return <Input placeholder="Email" type="email" />
}
```

## Philosophy

The input is the most fundamental form primitive  -  a single line of text entry. We keep it deliberately thin: one component, no sub-parts, just a styled `<input>` that composes naturally with Label, Button, and form validation. Complex input patterns like search bars or password fields are built by composing Input with other primitives, not by bloating its API.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add input
```

Install the following dependencies:

```bash
npm install @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Input } from "@/components/ui/input"
```

```tsx
<Input />
```

## Examples

### Default

```tsx title="components/input-2.tsx"
// import from your project: import Demo from '@/components/input-2'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return <Input defaultValue="user@example.com" placeholder="Email" type="email" />
}
```

### File

```tsx title="components/input-3.tsx"
// import from your project: import Demo from '@/components/input-3'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </div>
  )
}
```

### Disabled

```tsx title="components/input-4.tsx"
// import from your project: import Demo from '@/components/input-4'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return <Input disabled placeholder="Email" type="email" />
}
```

### With Label

```tsx title="components/input-5.tsx"
// import from your project: import Demo from '@/components/input-5'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <div className="flex w-full max-w-sm flex-col space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="Email" type="email" />
    </div>
  )
}
```

### With Button

```tsx title="components/input-6.tsx"
// import from your project: import Demo from '@/components/input-6'
import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input placeholder="Email" type="email" />
      <Button type="submit">Subscribe</Button>
    </div>
  )
}
```

### Invalid and Warning

Set `aria-invalid="true"` to draw the input in the destructive colour, or `aria-warning="true"` for the warning colour, for a value that is allowed but worth a second look. Point `aria-describedby` at the message so a screen reader reads it too.

```tsx title="components/input-10.tsx"
// import from your project: import Demo from '@/components/input-10'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div className="grid gap-2">
        <Label htmlFor="email-invalid-r4k">Email</Label>
        <Input
          aria-describedby="email-invalid-r4k-error"
          aria-invalid="true"
          defaultValue="duck@"
          id="email-invalid-r4k"
        />
        <p className="text-destructive text-sm" id="email-invalid-r4k-error">
          Enter the whole address.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password-warning-n8j">Password</Label>
        <Input
          aria-describedby="password-warning-n8j-hint"
          aria-warning="true"
          defaultValue="quackquack"
          id="password-warning-n8j"
          type="password"
        />
        <p className="text-sm text-warning" id="password-warning-n8j-hint">
          This password is allowed, but easy to guess.
        </p>
      </div>
    </div>
  )
}
```

### Form

```tsx title="components/input-7.tsx"
// import from your project: import Demo from '@/components/input-7'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const FormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
})

export default function Demo() {
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      username: '',
    },
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.info(
      <div>
        <h4 className="font-medium text-md">You submitted the following values:</h4>
        <pre className="mt-2 w-[300px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>,
    )
  }

  return (
    <form className="w-2/3 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Username</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="wildduck" />
              <FieldDescription>This is your public display name.</FieldDescription>
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

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `Input` follows it. No `dir` prop needed.

```tsx title="components/input-8.tsx"
// import from your project: import Demo from '@/components/input-8'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Input className="max-w-xs" placeholder="البريد الإلكتروني" type="email" />
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionInput` for a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition, powered by [motion](https://motion.dev). Pass `index` for stagger delay when used in forms.

```tsx title="components/input-9.tsx"
// import from your project: import Demo from '@/components/input-9'
'use client'

import { MotionInput } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 p-4">
      <MotionInput id="motion-name" placeholder="Jane Doe" index={0} />
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionInput` instead of `Input`. All props stay the same.

## API Reference

### Input

A styled `<input>` element that accepts all standard HTML input attributes.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `React.HTMLInputTypeAttribute` | `--` | The HTML input type (e.g., `'text'`, `'password'`, `'email'`, `'file'`). Browsers default to `'text'`. |
| `dir` | `'ltr' \| 'rtl' \| 'auto'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). `'auto'` is kept as it is, so the text typed decides |
| `className` | `string` | `--` | Additional CSS classes to apply |
| `ref` | `React.Ref<HTMLInputElement>` | `--` | Ref forwarded to the underlying `<input>` element |
| `aria-invalid` | `boolean \| 'true' \| 'false'` | - | Draws the border, text and ring in the destructive colour. |
| `aria-warning` | `'true'` | - | Draws the border, text and ring in the warning colour. Not an ARIA attribute, so describe the warning with `aria-describedby` as well. |
| `...props` | `React.HTMLProps<HTMLInputElement>` | - | Additional props to spread to the input element |

### MotionInput

Same props as `Input` plus an optional `index` prop for stagger delay (50ms per index), which stays off the `<input>`. Adds a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition. Requires the `motion` package.

## See also

* [Textarea](/duck-ui/components/textarea)  -  Multi-line text input
* [Label](/duck-ui/components/label)  -  Accessible label for form controls