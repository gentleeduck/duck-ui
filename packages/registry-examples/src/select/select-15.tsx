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
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const FormSchema = z.object({
  languages: z
    .array(z.string())
    .min(1, { error: 'Pick at least one language.' })
    .max(3, { error: 'Pick three languages at most.' }),
})

export default function Demo() {
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: { languages: [] },
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.info(
      <div>
        <h4 className="font-medium text-lg">You submitted the following values:</h4>
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
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
          name="languages"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-select-languages">Languages</FieldLabel>
                <FieldDescription>The languages you can review code in, up to three.</FieldDescription>
                {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select multiple name={field.name} onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  aria-invalid={fieldState.invalid}
                  className="min-w-[260px]"
                  id="form-rhf-select-languages">
                  <SelectValue placeholder="Pick languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="kotlin">Kotlin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit">Submit</Button>
    </form>
  )
}
