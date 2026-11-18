'use client'

import { JsonTextareaField } from '@gentleduck/registry-ui/json-editor'
import { FormProvider, useForm } from 'react-hook-form'

type JsonEditorAuditValues = {
  event: Record<string, unknown> | null
}

export default function Demo() {
  const form = useForm<JsonEditorAuditValues>({
    defaultValues: {
      event: {
        action: 'member.invited',
        actor: 'duck@gentleduck.org',
        at: '2026-11-12T09:30:00Z',
      },
    },
  })

  return (
    <FormProvider {...form}>
      <form className="w-full max-w-2xl">
        <JsonTextareaField
          control={form.control}
          description="Recorded events cannot be changed."
          expandMode="none"
          isEditable={false}
          label="Audit event"
          lineNumbers={false}
          name="event"
          rows={6}
        />
      </form>
    </FormProvider>
  )
}
