'use client'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { zodResolver } from '@hookform/resolvers/zod'
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
    <form className="w-full max-w-sm space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="dob"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-calendar-dob">Date of birth</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="form-rhf-calendar-dob"
                    className={cn('w-[240px] px-3 text-start font-normal', !field.value && 'text-muted-foreground')}
                    variant="outline"
                    aria-invalid={fieldState.invalid}>
                    <div className="flex w-full items-center justify-between">
                      {field.value ? (
                        field.value.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
