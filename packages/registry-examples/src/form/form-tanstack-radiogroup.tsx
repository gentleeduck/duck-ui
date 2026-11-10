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
