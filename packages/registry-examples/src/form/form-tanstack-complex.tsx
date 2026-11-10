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
