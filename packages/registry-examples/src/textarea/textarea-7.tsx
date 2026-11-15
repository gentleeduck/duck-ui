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
