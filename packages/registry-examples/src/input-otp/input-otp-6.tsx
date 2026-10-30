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
