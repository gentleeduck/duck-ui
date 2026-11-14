'use client'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const FormSchema = z.object({
  dob: z.date({
    error: 'A date of birth is required.',
  }),
})

export default function Demo() {
  const form = useForm<z.infer<typeof FormSchema>>({
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
    <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="dob"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-date-picker-dob">Date of birth</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="form-rhf-date-picker-dob"
                    className={cn(
                      'w-60 px-2 text-start font-normal [&_svg]:w-4',
                      !field.value && 'text-muted-foreground',
                    )}
                    variant="outline"
                    aria-invalid={fieldState.invalid}>
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                    <CalendarIcon className="ms-auto opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="min-w-auto p-0">
                  <Calendar
                    showDropdowns={false}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    mode="single"
                    onSelect={field.onChange}
                    selected={field.value}
                  />
                </PopoverContent>
              </Popover>
              <FieldDescription>Your date of birth is used to calculate your age.</FieldDescription>
              {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit">Submit</Button>
    </form>
  )
}
