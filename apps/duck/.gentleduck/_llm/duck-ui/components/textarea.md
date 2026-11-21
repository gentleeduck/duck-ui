```tsx title="components/textarea-1.tsx"
// import from your project: import Demo from '@/components/textarea-1'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return <Textarea aria-label="Message" placeholder="Type your message here." />
}
```

## Philosophy

When a single line isn't enough, Textarea steps in. It's the same design philosophy as Input  -  a thin wrapper around the native element with consistent styling. We don't add auto-resize or character counting because those are features you compose on top, not defaults everyone pays for.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add textarea
```

Install the following dependencies:

```bash
npm install @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Textarea } from '@/components/ui/textarea'
```

```tsx
<Textarea />
```

## Examples

### Character count

`maxLength` stops typing at the limit. Point `aria-describedby` at the count so a screen reader reads it with the field.

```tsx title="components/textarea-2.tsx"
// import from your project: import Demo from '@/components/textarea-2'
'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'
import * as React from 'react'

const LIMIT = 140

export default function Demo() {
  const [text, setText] = React.useState('')

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="textarea-count">Status</Label>
      <Textarea
        aria-describedby="textarea-count-left"
        id="textarea-count"
        maxLength={LIMIT}
        onChange={(event) => setText(event.target.value)}
        placeholder="What are you working on?"
        value={text}
      />
      <p className="text-end text-muted-foreground text-sm tabular-nums" id="textarea-count-left">
        {LIMIT - text.length} characters left
      </p>
    </div>
  )
}
```

### Disabled

```tsx title="components/textarea-3.tsx"
// import from your project: import Demo from '@/components/textarea-3'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return <Textarea aria-label="Message" disabled placeholder="Type your message here." />
}
```

### With Label

```tsx title="components/textarea-4.tsx"
// import from your project: import Demo from '@/components/textarea-4'
import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here." />
    </div>
  )
}
```

### With Text

```tsx title="components/textarea-5.tsx"
// import from your project: import Demo from '@/components/textarea-5'
import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message-5">Your message</Label>
      <Textarea aria-describedby="message-5-hint" id="message-5" placeholder="Type your message here." />
      <p className="text-muted-foreground text-sm" id="message-5-hint">
        Your message will be copied to the support team.
      </p>
    </div>
  )
}
```

### With Button

```tsx title="components/textarea-6.tsx"
// import from your project: import Demo from '@/components/textarea-6'
import { Button } from '@gentleduck/registry-ui/button'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-2">
      <Textarea aria-label="Message" placeholder="Type your message here." />
      <Button>Send message</Button>
    </div>
  )
}
```

### Form

```tsx title="components/textarea-7.tsx"
// import from your project: import Demo from '@/components/textarea-7'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { Textarea } from '@gentleduck/registry-ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const FormSchema = z.object({
  bio: z
    .string()
    .min(10, {
      message: 'Bio must be at least 10 characters.',
    })
    .max(160, {
      message: 'Bio must not be longer than 160 characters.',
    }),
})

export default function Demo() {
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: { bio: '' },
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast('You submitted the following values:', {
      description: (
        <div>
          <pre className="mt-2 w-[300px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      ),
    })
  }

  return (
    <form className="w-2/3 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="bio"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-textarea-bio">Bio</FieldLabel>
              <Textarea
                {...field}
                id="form-rhf-textarea-bio"
                aria-invalid={fieldState.invalid}
                className="resize-none"
                placeholder="Tell us a little bit about yourself"
              />
              <FieldDescription>
                You can <span>@mention</span> other users and organizations.
              </FieldDescription>
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

### Invalid and warning

`aria-invalid="true"` draws the textarea in the destructive colour and `aria-warning="true"` in the warning colour, as on `Input`. Link the message with `aria-describedby`.

```tsx title="components/textarea-11.tsx"
// import from your project: import Demo from '@/components/textarea-11'
import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-6">
      <div className="grid gap-1.5">
        <Label htmlFor="textarea-invalid">Reason for refund</Label>
        <Textarea aria-describedby="textarea-invalid-error" aria-invalid="true" defaultValue="" id="textarea-invalid" />
        <p className="text-destructive text-sm" id="textarea-invalid-error">
          Tell us why, so we can process the refund.
        </p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="textarea-warning">Note to the courier</Label>
        <Textarea
          aria-describedby="textarea-warning-hint"
          aria-warning="true"
          defaultValue="Call me on 0100 000 0000 when you arrive."
          id="textarea-warning"
        />
        <p className="text-sm text-warning" id="textarea-warning-hint">
          Couriers see this note. Leave out anything private.
        </p>
      </div>
    </div>
  )
}
```

### Grows with its text

The textarea grows with its text through `field-sizing: content`. Cap it with a `max-h-*` class and it scrolls past that. A browser without `field-sizing` keeps it at its minimum height and scrolls.

```tsx title="components/textarea-12.tsx"
// import from your project: import Demo from '@/components/textarea-12'
import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="textarea-grow">Release notes</Label>
      <Textarea className="max-h-40 resize-none" id="textarea-grow" placeholder="Each new line makes the box taller." />
    </div>
  )
}
```

### Direction from the text

`dir="auto"` is kept as it is, so the text typed decides the direction rather than the page. Use it where people may write in either a right-to-left or a left-to-right language.

```tsx title="components/textarea-10.tsx"
// import from your project: import Demo from '@/components/textarea-10'
import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="textarea-auto">Review</Label>
      <Textarea
        defaultValue="شكراً، وصل الطلب في موعده."
        dir="auto"
        id="textarea-auto"
        placeholder="Write in any language"
      />
      <p className="text-muted-foreground text-sm">
        With <code>dir="auto"</code> the text sets its own direction: Arabic starts on the right, English on the left.
      </p>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `Textarea` follows it. No `dir` prop needed.

```tsx title="components/textarea-8.tsx"
// import from your project: import Demo from '@/components/textarea-8'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="message-rtl">رسالتك</Label>
        <Textarea id="message-rtl" placeholder="اكتب رسالتك هنا." />
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionTextarea` for a smooth entrance animation powered by [motion](https://motion.dev). The textarea uses a `scaleIn` entrance (fade, scale, and blur) with a `springBouncy` transition on mount.

```tsx title="components/textarea-9.tsx"
// import from your project: import Demo from '@/components/textarea-9'
'use client'

import { MotionTextarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return <MotionTextarea aria-label="Message" placeholder="Type your message here." />
}
```

}>
  Requires the `motion` package. Use `MotionTextarea` instead of `Textarea`. Same props. The regular `Textarea` is perfectly fine - this is an optional enhancement.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl' \| 'auto'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). `'auto'` is kept as it is, so the text typed decides |
| `aria-invalid` | `boolean \| 'true'` | - | Draws the border and ring in the destructive colour |
| `aria-warning` | `'true'` | - | Draws the border and ring in the warning colour. Not an ARIA attribute, so pair it with a message linked by `aria-describedby` |
| `className` | `string` | - | Additional CSS class names |
| `...props` | `React.HTMLProps<HTMLTextAreaElement>` | - | Additional props to spread to the textarea element |

### MotionTextarea

`scaleIn` entrance (fade, scale, and blur) with `springBouncy` transition on mount. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `TextareaProps` | - | All props from `Textarea` are supported |

## See also

* [Input](/duck-ui/components/input)  -  Single-line text input
* [Label](/duck-ui/components/label)  -  Accessible label for form controls