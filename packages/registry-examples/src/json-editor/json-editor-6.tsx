'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { JsonTextareaField } from '@gentleduck/registry-ui/json-editor'
import { FormProvider, useForm } from 'react-hook-form'

type JsonEditorWebhookValues = {
  webhook: Record<string, unknown> | null
}

export default function Demo() {
  const form = useForm<JsonEditorWebhookValues>({
    defaultValues: {
      webhook: {
        events: ['order.paid', 'order.refunded'],
      },
    },
  })

  function onSubmit(values: JsonEditorWebhookValues) {
    if (typeof values.webhook?.url !== 'string') {
      form.setError('webhook', { message: 'Add a "url" for the webhook to call.' })
      return
    }
    form.clearErrors('webhook')
  }

  return (
    <FormProvider {...form}>
      <form className="w-full max-w-2xl space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <JsonTextareaField
          allowArray={false}
          control={form.control}
          description="A JSON object. An array or a single value is refused."
          label="Webhook"
          name="webhook"
          rows={8}
        />

        <div className="flex items-center justify-end">
          <Button type="submit">Save webhook</Button>
        </div>
      </form>
    </FormProvider>
  )
}
