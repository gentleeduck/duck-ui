'use client'

import { JsonTextareaField } from '@gentleduck/registry-ui/json-editor'
import { FormProvider, useForm } from 'react-hook-form'

type Values = { headers: Record<string, unknown> | null }

export default function Demo() {
  const form = useForm<Values>({ defaultValues: { headers: null } })

  return (
    <FormProvider {...form}>
      <form className="w-full max-w-xl">
        <JsonTextareaField
          actionsClassName="justify-start"
          control={form.control}
          description="Opens in a sheet from the left, with a taller line height."
          expandMode="sheet"
          label="Request headers"
          lineHeightPx={24}
          name="headers"
          placeholder={'{\n  "Accept": "application/json"\n}'}
          rows={6}
          sheetSide="left"
          sheetTitle="Edit request headers"
        />
      </form>
    </FormProvider>
  )
}
