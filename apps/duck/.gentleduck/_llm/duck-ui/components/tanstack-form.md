This guide explores how to build forms using TanStack Form. You'll learn to create forms with the `<Field />` component, implement schema validation with Zod, handle errors, and ensure accessibility.

## Demo

We'll start by building the following form. It has a simple text input and a textarea. On submit, we'll validate the form data and display any errors.

}>
  **Note:** For the purpose of this demo, we have intentionally disabled browser
  validation to show how schema validation and form errors work in TanStack
  Form. It is recommended to add basic browser validation in your production
  code.

```tsx title="components/form-tanstack-demo.tsx"
// import from your project: import Demo from '@/components/form-tanstack-demo'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import { Textarea } from '@gentleduck/registry-ui/textarea'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters.')
    .max(100, 'Description must be at most 100 characters.'),
  title: z
    .string()
    .min(5, 'Bug title must be at least 5 characters.')
    .max(32, 'Bug title must be at most 32 characters.'),
})

function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === 'string') {
        return { message: error }
      }
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message
        return { message: typeof message === 'string' ? message : undefined }
      }
      return undefined
    })
    .filter((error): error is { message: string | undefined } => Boolean(error))
}

export default function FormTanStackDemo() {
  const form = useForm({
    defaultValues: {
      description: '',
      title: '',
    },
    onSubmit: async ({ value }) => {
      toast.success('Form submitted successfully', {
        description: (
          <pre className="mt-2 max-w-[520px] overflow-x-auto rounded-md border bg-muted p-4 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
      })
    },
    validators: {
      onSubmit: formSchema,
    },
  })

  return (
    <form
      className="w-full max-w-xl space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}>
      <FieldGroup>
        <form.Field
          name="title"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  autoComplete="off"
                  placeholder="Login button not working on mobile"
                />
                <FieldDescription>Provide a concise title for your bug report.</FieldDescription>
                {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="description"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  className="min-h-[120px]"
                  placeholder="Describe the issue and expected behavior..."
                />
                <FieldDescription>Add enough detail for someone else to reproduce the bug.</FieldDescription>
                {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

## Approach

This form uses TanStack Form for headless form handling. We'll build our form using the `<Field />` component, which gives you **full control over the markup and styling**.

* Uses TanStack Form's `useForm` hook for form state management.
* `form.Field` component with render prop pattern for controlled inputs.
* `<Field />` components for building accessible forms.
* Client-side validation using Zod.
* Real-time validation feedback.

## Anatomy

Here's a basic example of a form using TanStack Form with the `<Field />` component.

```tsx showLineNumbers {1-14,29-45}
function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === "string") {
        return { message: error }
      }
      if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message
        return { message: typeof message === "string" ? message : undefined }
      }
      return undefined
    })
    .filter(
      (error): error is { message: string | undefined } => Boolean(error)
    )
}

<form
  onSubmit={(e) => {
    e.preventDefault()
    form.handleSubmit()
  }}
>
  <FieldGroup>
    <form.Field
      name="title"
      children={(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="Login button not working on mobile"
              autoComplete="off"
            />
            <FieldDescription>
              Provide a concise title for your bug report.
            </FieldDescription>
            {isInvalid && (
              <FieldError errors={toFieldErrors(field.state.meta.errors)} />
            )}
          </Field>
        )
      }}
    />
  </FieldGroup>
  <Button type="submit">Submit</Button>
</form>
```

The `toFieldErrors` helper normalizes TanStack Form's error format (which can be strings or objects) into the `{ message: string }` format expected by the `<FieldError />` component.

## Form

### Create a schema

We'll start by defining the shape of our form using a Zod schema.

```tsx showLineNumbers title="form.tsx"
import * as z from "zod"

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
})
```

### Setup the form

Use the `useForm` hook from TanStack Form to create your form instance with Zod validation.

```tsx showLineNumbers title="form.tsx" {10-21}
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

const formSchema = z.object({
  // ...
})

export function BugReportForm() {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast.success("Form submitted successfully")
    },
  })

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      {/* ... */}
    </form>
  )
}
```

We are using `onSubmit` to validate the form data here. TanStack Form supports other validation modes, which you can read about in the [documentation](https://tanstack.com/form/latest/docs/framework/react/guides/dynamic-validation).

### Build the form

We can now build the form using the `form.Field` component from TanStack Form and the `<Field />` component.

### Done

That's it. You now have a fully accessible form with client-side validation.

When you submit the form, the `onSubmit` function will be called with the validated form data. If the form data is invalid, TanStack Form will display the errors next to each field.

## Validation

### Client-side Validation

TanStack Form validates your form data using the Zod schema. Validation happens in real-time as the user types.

```tsx showLineNumbers title="form.tsx" {13-15}
import { useForm } from "@tanstack/react-form"

const formSchema = z.object({
  // ...
})

export function BugReportForm() {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return <form onSubmit={/* ... */}>{/* ... */}</form>
}
```

### Validation Modes

TanStack Form supports different validation strategies through the `validators` option:

| Mode         | Description                          |
| ------------ | ------------------------------------ |
| `"onChange"` | Validation triggers on every change. |
| `"onBlur"`   | Validation triggers on blur.         |
| `"onSubmit"` | Validation triggers on submit.       |

```tsx showLineNumbers title="form.tsx" {6-9}
const form = useForm({
  defaultValues: {
    title: "",
    description: "",
  },
  validators: {
    onSubmit: formSchema,
    onChange: formSchema,
    onBlur: formSchema,
  },
})
```

## Displaying Errors

Display errors next to the field using `<FieldError />`. For styling and accessibility:

* Add the `data-invalid` prop to the `<Field />` component.
* Add the `aria-invalid` prop to the form control such as `<Input />`, `<SelectTrigger />`, `<Checkbox />`, etc.

```tsx showLineNumbers title="form.tsx" {4,18-20}
<form.Field
  name="email"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          type="email"
          aria-invalid={isInvalid}
        />
        {isInvalid && (
          <FieldError errors={toFieldErrors(field.state.meta.errors)} />
        )}
      </Field>
    )
  }}
/>
```

## Working with Different Field Types

### Input

* For input fields, use `field.state.value` and `field.handleChange` on the `<Input />` component.
* To show errors, add the `aria-invalid` prop to the `<Input />` component and the `data-invalid` prop to the `<Field />` component.

```tsx title="components/form-tanstack-input.tsx"
// import from your project: import Demo from '@/components/form-tanstack-input'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(10, 'Username must be at most 10 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores are allowed.'),
})

function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === 'string') {
        return { message: error }
      }
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message
        return { message: typeof message === 'string' ? message : undefined }
      }
      return undefined
    })
    .filter((error): error is { message: string | undefined } => Boolean(error))
}

export default function FormTanStackInput() {
  const form = useForm({
    defaultValues: {
      username: '',
    },
    onSubmit: async ({ value }) => {
      toast.success('Username saved', {
        description: (
          <pre className="mt-2 max-w-[480px] overflow-x-auto rounded-md border bg-muted p-4 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
      })
    },
    validators: {
      onSubmit: formSchema,
    },
  })

  return (
    <form
      className="w-full max-w-xl space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}>
      <FieldGroup>
        <form.Field
          name="username"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="form-tanstack-input-username">Username</FieldLabel>
                <Input
                  id="form-tanstack-input-username"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  autoComplete="username"
                  placeholder="gentleduck"
                />
                <FieldDescription>
                  This is your public display name. Must be between 3 and 10 characters. Must only contain letters,
                  numbers, and underscores.
                </FieldDescription>
                {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Textarea

* For textarea fields, use `field.state.value` and `field.handleChange` on the `<Textarea />` component.
* To show errors, add the `aria-invalid` prop to the `<Textarea />` component and the `data-invalid` prop to the `<Field />` component.

```tsx title="components/form-tanstack-textarea.tsx"
// import from your project: import Demo from '@/components/form-tanstack-textarea'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { Textarea } from '@gentleduck/registry-ui/textarea'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  about: z.string().min(20, 'About must be at least 20 characters.').max(180, 'About must be at most 180 characters.'),
})

function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === 'string') {
        return { message: error }
      }
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message
        return { message: typeof message === 'string' ? message : undefined }
      }
      return undefined
    })
    .filter((error): error is { message: string | undefined } => Boolean(error))
}

export default function FormTanStackTextarea() {
  const form = useForm({
    defaultValues: {
      about: '',
    },
    onSubmit: async ({ value }) => {
      toast.success('Profile summary saved', {
        description: (
          <pre className="mt-2 max-w-[560px] overflow-x-auto rounded-md border bg-muted p-4 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
      })
    },
    validators: {
      onSubmit: formSchema,
    },
  })

  return (
    <form
      className="w-full max-w-xl space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}>
      <FieldGroup>
        <form.Field
          name="about"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="form-tanstack-textarea-about">More about you</FieldLabel>
                <Textarea
                  id="form-tanstack-textarea-about"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  className="min-h-[120px]"
                  placeholder="I'm a software engineer..."
                />
                <FieldDescription>
                  Tell us more about yourself. This will be used to help us personalize your experience.
                </FieldDescription>
                {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Select

* For select components, use `field.state.value` and `field.handleChange` on the `<Select />` component.
* To show errors, add the `aria-invalid` prop to the `<SelectTrigger />` component and the `data-invalid` prop to the `<Field />` component.

```tsx title="components/form-tanstack-select.tsx"
// import from your project: import Demo from '@/components/form-tanstack-select'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  language: z.enum(['auto', 'en', 'es'], {
    error: 'Please select a language.',
  }),
})

type FormValues = z.infer<typeof formSchema>

function hasMessage(error: unknown): error is { message: unknown } {
  return typeof error === 'object' && error !== null && 'message' in error
}

function isLanguage(value: string): value is FormValues['language'] {
  return value === 'auto' || value === 'en' || value === 'es'
}

function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === 'string') {
        return { message: error }
      }
      if (hasMessage(error)) {
        const message = error.message
        return { message: typeof message === 'string' ? message : undefined }
      }
      return undefined
    })
    .filter((error): error is { message: string | undefined } => Boolean(error))
}

export default function FormTanStackSelect() {
  const defaultValues: FormValues = {
    language: 'auto',
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      toast.success('Language updated', {
        description: (
          <pre className="mt-2 max-w-[480px] overflow-x-auto rounded-md border bg-muted p-4 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
      })
    },
    validators: {
      onSubmit: formSchema,
    },
  })

  return (
    <form
      className="w-full max-w-xl space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}>
      <FieldGroup>
        <form.Field
          name="language"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field orientation="responsive" data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor="form-tanstack-select-language">Spoken Language</FieldLabel>
                  <FieldDescription>For best results, select the language you speak.</FieldDescription>
                  {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
                </FieldContent>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => {
                    if (isLanguage(nextValue)) {
                      field.handleChange(nextValue)
                    }
                  }}>
                  <SelectTrigger id="form-tanstack-select-language" aria-invalid={isInvalid} className="min-w-[120px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )
          }}
        />
      </FieldGroup>

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Checkbox

* For checkbox, use `field.state.value` and `field.handleChange` on the `<Checkbox />` component.
* To show errors, add the `aria-invalid` prop to the `<Checkbox />` component and the `data-invalid` prop to the `<Field />` component.
* For checkbox arrays, use `mode="array"` on the `<form.Field />` component and TanStack Form's array helpers.
* Remember to add `data-slot="checkbox-group"` to the `<FieldGroup />` component for proper styling and spacing.

```tsx title="components/form-tanstack-checkbox.tsx"
// import from your project: import Demo from '@/components/form-tanstack-checkbox'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@gentleduck/registry-ui/field'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'

const tasks = [
  { id: 'recents', label: 'Recents' },
  { id: 'home', label: 'Home' },
  { id: 'applications', label: 'Applications' },
] as const

const formSchema = z.object({
  tasks: z.array(z.string()).min(1, 'You have to select at least one item.'),
})

function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === 'string') {
        return { message: error }
      }
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message
        return { message: typeof message === 'string' ? message : undefined }
      }
      return undefined
    })
    .filter((error): error is { message: string | undefined } => Boolean(error))
}

export default function FormTanStackCheckbox() {
  const form = useForm({
    defaultValues: {
      tasks: ['recents'] as string[],
    },
    onSubmit: async ({ value }) => {
      toast.success('Sidebar preferences saved', {
        description: (
          <pre className="mt-2 max-w-[480px] overflow-x-auto rounded-md border bg-muted p-4 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
      })
    },
    validators: {
      onSubmit: formSchema,
    },
  })

  return (
    <form
      className="w-full max-w-xl space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}>
      <form.Field
        name="tasks"
        mode="array"
        // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <FieldSet>
              <FieldLegend variant="label">Tasks</FieldLegend>
              <FieldDescription>Get notified when tasks you've created have updates.</FieldDescription>
              <FieldGroup data-slot="checkbox-group">
                {tasks.map((task) => (
                  <Field orientation="horizontal" key={task.id} data-invalid={isInvalid}>
                    <Checkbox
                      id={`form-tanstack-checkbox-${task.id}`}
                      name={field.name}
                      aria-invalid={isInvalid}
                      checked={field.state.value.includes(task.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.pushValue(task.id)
                          return
                        }

                        const index = field.state.value.indexOf(task.id)
                        if (index > -1) {
                          field.removeValue(index)
                        }
                      }}
                    />
                    <FieldLabel htmlFor={`form-tanstack-checkbox-${task.id}`} className="font-normal">
                      {task.label}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
              {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
            </FieldSet>
          )
        }}
      />

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Radio Group

* For radio groups, use `field.state.value` and `field.handleChange` on the `<RadioGroup />` component.
* To show errors, add the `aria-invalid` prop to the `<RadioGroupItem />` component and the `data-invalid` prop to the `<Field />` component.

```tsx title="components/form-tanstack-radiogroup.tsx"
// import from your project: import Demo from '@/components/form-tanstack-radiogroup'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@gentleduck/registry-ui/field'
import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'

const plans = [
  { description: 'Best for trying things out.', id: 'free', title: 'Free' },
  { description: 'Great for growing teams.', id: 'pro', title: 'Pro' },
  { description: 'Advanced governance and controls.', id: 'enterprise', title: 'Enterprise' },
] as const

const formSchema = z.object({
  plan: z.enum(['free', 'pro', 'enterprise'], {
    error: 'You need to select a plan.',
  }),
})

type FormValues = z.infer<typeof formSchema>

function hasMessage(error: unknown): error is { message: unknown } {
  return typeof error === 'object' && error !== null && 'message' in error
}

function isPlan(value: string): value is FormValues['plan'] {
  return value === 'free' || value === 'pro' || value === 'enterprise'
}

function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === 'string') {
        return { message: error }
      }
      if (hasMessage(error)) {
        const message = error.message
        return { message: typeof message === 'string' ? message : undefined }
      }
      return undefined
    })
    .filter((error): error is { message: string | undefined } => Boolean(error))
}

export default function FormTanStackRadioGroup() {
  const defaultValues: FormValues = {
    plan: 'free',
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      toast.success('Plan updated', {
        description: (
          <pre className="mt-2 max-w-[480px] overflow-x-auto rounded-md border bg-muted p-4 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
      })
    },
    validators: {
      onSubmit: formSchema,
    },
  })

  return (
    <form
      className="w-full max-w-xl space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}>
      <FieldGroup>
        <form.Field
          name="plan"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <FieldSet>
                <FieldLegend>Plan</FieldLegend>
                <FieldDescription>You can upgrade or downgrade your plan at any time.</FieldDescription>
                <RadioGroup
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => {
                    if (nextValue !== null && isPlan(nextValue)) {
                      field.handleChange(nextValue)
                    }
                  }}>
                  {plans.map((plan) => (
                    <FieldLabel key={plan.id} htmlFor={`form-tanstack-radiogroup-${plan.id}`}>
                      <Field orientation="horizontal" data-invalid={isInvalid}>
                        <FieldContent>
                          <FieldTitle>{plan.title}</FieldTitle>
                          <FieldDescription>{plan.description}</FieldDescription>
                        </FieldContent>
                        <RadioGroupItem
                          value={plan.id}
                          id={`form-tanstack-radiogroup-${plan.id}`}
                          aria-invalid={isInvalid}
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
                {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
              </FieldSet>
            )
          }}
        />
      </FieldGroup>

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Switch

* For switches, use `field.state.value` and `field.handleChange` on the `<Switch />` component.
* To show errors, add the `aria-invalid` prop to the `<Switch />` component and the `data-invalid` prop to the `<Field />` component.

```tsx title="components/form-tanstack-switch.tsx"
// import from your project: import Demo from '@/components/form-tanstack-switch'
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
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  twoFactor: z.boolean(),
})

function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === 'string') {
        return { message: error }
      }
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message
        return { message: typeof message === 'string' ? message : undefined }
      }
      return undefined
    })
    .filter((error): error is { message: string | undefined } => Boolean(error))
}

export default function FormTanStackSwitch() {
  const form = useForm({
    defaultValues: {
      twoFactor: true,
    },
    onSubmit: async ({ value }) => {
      toast.success('Security settings updated', {
        description: (
          <pre className="mt-2 max-w-[420px] overflow-x-auto rounded-md border bg-muted p-4 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
      })
    },
    validators: {
      onSubmit: formSchema,
    },
  })

  return (
    <form
      className="w-full max-w-xl space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}>
      <FieldGroup>
        <form.Field
          name="twoFactor"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field orientation="horizontal" data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor="form-tanstack-switch-twoFactor">Multi-factor authentication</FieldLabel>
                  <FieldDescription>Enable multi-factor authentication to secure your account.</FieldDescription>
                  {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
                </FieldContent>
                <Switch
                  id="form-tanstack-switch-twoFactor"
                  name={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                  aria-invalid={isInvalid}
                />
              </Field>
            )
          }}
        />
      </FieldGroup>

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Complex Forms

Here is an example of a more complex form with multiple fields and validation.

```tsx title="components/form-tanstack-complex.tsx"
// import from your project: import Demo from '@/components/form-tanstack-complex'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { Switch } from '@gentleduck/registry-ui/switch'
import { Textarea } from '@gentleduck/registry-ui/textarea'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'

const plans = [
  { description: 'Good for trying the platform.', id: 'free', title: 'Free' },
  { description: 'For fast-moving teams and priority support.', id: 'pro', title: 'Pro' },
  { description: 'Advanced controls for larger organizations.', id: 'enterprise', title: 'Enterprise' },
] as const

const formSchema = z.object({
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  language: z.enum(['auto', 'en', 'es'], {
    error: 'Please select a language.',
  }),
  plan: z.enum(['free', 'pro', 'enterprise'], {
    error: 'Select a plan.',
  }),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  twoFactor: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

function hasMessage(error: unknown): error is { message: unknown } {
  return typeof error === 'object' && error !== null && 'message' in error
}

function isLanguage(value: string): value is FormValues['language'] {
  return value === 'auto' || value === 'en' || value === 'es'
}

function isPlan(value: string): value is FormValues['plan'] {
  return value === 'free' || value === 'pro' || value === 'enterprise'
}

function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === 'string') {
        return { message: error }
      }
      if (hasMessage(error)) {
        const message = error.message
        return { message: typeof message === 'string' ? message : undefined }
      }
      return undefined
    })
    .filter((error): error is { message: string | undefined } => Boolean(error))
}

export default function FormTanStackComplex() {
  const defaultValues: FormValues = {
    description: '',
    language: 'auto',
    plan: 'free',
    title: '',
    twoFactor: true,
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      toast.success('Complex form submitted', {
        description: (
          <pre className="mt-2 max-w-[640px] overflow-x-auto rounded-md border bg-muted p-4 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
      })
    },
    validators: {
      onSubmit: formSchema,
    },
  })

  return (
    <form
      className="w-full max-w-2xl space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}>
      <FieldGroup>
        <form.Field
          name="title"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Search input clears itself"
                />
                <FieldDescription>Provide a concise title for your issue.</FieldDescription>
                {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="description"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  className="min-h-[120px]"
                  placeholder="Add reproduction steps and expected behavior."
                />
                <FieldDescription>Include steps, expected output, and actual output.</FieldDescription>
                {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="language"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field orientation="responsive" data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor="form-tanstack-complex-language">Language</FieldLabel>
                  <FieldDescription>Pick your preferred language for notifications.</FieldDescription>
                  {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
                </FieldContent>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => {
                    if (isLanguage(nextValue)) {
                      field.handleChange(nextValue)
                    }
                  }}>
                  <SelectTrigger id="form-tanstack-complex-language" aria-invalid={isInvalid} className="min-w-[180px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )
          }}
        />

        <form.Field
          name="plan"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <FieldSet>
                <FieldLegend>Support plan</FieldLegend>
                <FieldDescription>Select the support response tier for this project.</FieldDescription>
                <RadioGroup
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => {
                    if (nextValue !== null && isPlan(nextValue)) {
                      field.handleChange(nextValue)
                    }
                  }}>
                  {plans.map((plan) => (
                    <FieldLabel htmlFor={`form-tanstack-complex-plan-${plan.id}`} key={plan.id}>
                      <Field orientation="horizontal" data-invalid={isInvalid}>
                        <FieldContent>
                          <FieldTitle>{plan.title}</FieldTitle>
                          <FieldDescription>{plan.description}</FieldDescription>
                        </FieldContent>
                        <RadioGroupItem
                          id={`form-tanstack-complex-plan-${plan.id}`}
                          value={plan.id}
                          aria-invalid={isInvalid}
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
                {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
              </FieldSet>
            )
          }}
        />

        <form.Field
          name="twoFactor"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form API requires children prop
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field orientation="horizontal" data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor="form-tanstack-complex-two-factor">Multi-factor authentication</FieldLabel>
                  <FieldDescription>Require MFA for all users with access to this project.</FieldDescription>
                  {isInvalid && <FieldError errors={toFieldErrors(field.state.meta.errors)} />}
                </FieldContent>
                <Switch
                  id="form-tanstack-complex-two-factor"
                  name={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                  aria-invalid={isInvalid}
                />
              </Field>
            )
          }}
        />
      </FieldGroup>

      <div className="flex items-center gap-2">
        <Button type="submit">Submit</Button>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
      </div>
    </form>
  )
}
```

## Resetting the Form

Use `form.reset()` to reset the form to its default values.

```tsx showLineNumbers
<Button type="button" variant="outline" onClick={() => form.reset()}>
  Reset
</Button>
```

## Array Fields

TanStack Form provides powerful array field management with `mode="array"`. This allows you to dynamically add, remove, and update array items with full validation support.

```tsx title="components/form-tanstack-array.tsx"
// import from your project: import Demo from '@/components/form-tanstack-array'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@gentleduck/registry-ui/field'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { useForm } from '@tanstack/react-form'
import { XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  emails: z
    .array(
      z.object({
        address: z.string().email('Enter a valid email address.'),
      }),
    )
    .min(1, 'Add at least one email address.')
    .max(5, 'You can add up to 5 email addresses.'),
})

function toFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === 'string') {
        return { message: error }
      }
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message
        return { message: typeof message === 'string' ? message : undefined }
      }
      return undefined
    })
    .filter((error): error is { message: string | undefined } => Boolean(error))
}

export default function FormTanStackArray() {
  const form = useForm({
    defaultValues: {
      emails: [{ address: '' }],
    },
    onSubmit: async ({ value }) => {
      toast.success('Email list saved', {
        description: (
          <pre className="mt-2 max-w-[560px] overflow-x-auto rounded-md border bg-muted p-4 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
      })
    },
    validators: {
      onSubmit: formSchema,
    },
  })

  return (
    <form
      className="w-full max-w-2xl space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}>
      <form.Field
        name="emails"
        mode="array"
        // biome-ignore lint/correctness/noChildrenProp: TanStack Form API uses children prop for render callback
        children={(field) => (
          <FieldSet className="gap-4">
            <FieldLegend variant="label">Email Addresses</FieldLegend>
            <FieldDescription>Add up to 5 email addresses where we can contact you.</FieldDescription>

            <FieldGroup className="gap-4">
              {field.state.value.map((_, index) => (
                <form.Field
                  // Type-safe path strings are verbose in examples; keep this ergonomic.
                  name={`emails[${index}].address` as never}
                  // biome-ignore lint/suspicious/noArrayIndexKey: dynamic form array items have no stable ID
                  key={index}
                  // biome-ignore lint/correctness/noChildrenProp: TanStack Form API uses children prop for render callback
                  children={(subField) => {
                    const isSubFieldInvalid = subField.state.meta.isTouched && !subField.state.meta.isValid
                    return (
                      <Field orientation="horizontal" data-invalid={isSubFieldInvalid}>
                        <FieldContent>
                          <InputGroup>
                            <InputGroupInput
                              id={`form-tanstack-array-email-${index}`}
                              name={subField.name}
                              value={subField.state.value}
                              onBlur={subField.handleBlur}
                              onChange={(event) => subField.handleChange(event.target.value as never)}
                              aria-invalid={isSubFieldInvalid}
                              autoComplete="email"
                              placeholder="name@example.com"
                              type="email"
                            />
                            {field.state.value.length > 1 && (
                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => field.removeValue(index)}
                                  aria-label={`Remove email ${index + 1}`}>
                                  <XIcon aria-hidden="true" />
                                </InputGroupButton>
                              </InputGroupAddon>
                            )}
                          </InputGroup>
                          {isSubFieldInvalid && <FieldError errors={toFieldErrors(subField.state.meta.errors)} />}
                        </FieldContent>
                      </Field>
                    )
                  }}
                />
              ))}
            </FieldGroup>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue({ address: '' } as never)}
                disabled={field.state.value.length >= 5}>
                Add Email Address
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </FieldSet>
        )}
      />
    </form>
  )
}
```

### Array Field Structure

Use `mode="array"` on the parent field to enable array field management.

```tsx showLineNumbers title="form.tsx" {3,12-14}
<form.Field
  name="emails"
  mode="array"
  children={(field) => {
    return (
      <FieldSet>
        <FieldLegend variant="label">Email Addresses</FieldLegend>
        <FieldDescription>
          Add up to 5 email addresses where we can contact you.
        </FieldDescription>
        <FieldGroup>
          {field.state.value.map((_, index) => (
            // Nested field for each array item
          ))}
        </FieldGroup>
      </FieldSet>
    )
  }}
/>
```

### Adding Items

Use `field.pushValue(item)` to add items to an array field. You can disable the button when the array reaches its maximum length.

```tsx showLineNumbers title="form.tsx"
<Button
  type="button"
  variant="outline"
  size="sm"
  onClick={() => field.pushValue({ address: "" })}
  disabled={field.state.value.length >= 5}
>
  Add Email Address
</Button>
```

### Removing Items

Use `field.removeValue(index)` to remove items from an array field. You can conditionally show the remove button only when there's more than one item.

```tsx showLineNumbers title="form.tsx"
{field.state.value.length > 1 && (
  <InputGroupButton
    onClick={() => field.removeValue(index)}
    aria-label={`Remove email ${index + 1}`}
  >
    <XIcon />
  </InputGroupButton>
)}
```

### Array Validation

Validate array fields using Zod's array methods.

```tsx showLineNumbers title="form.tsx"
const formSchema = z.object({
  emails: z
    .array(
      z.object({
        address: z.string().email("Enter a valid email address."),
      })
    )
    .min(1, "Add at least one email address.")
    .max(5, "You can add up to 5 email addresses."),
})
```