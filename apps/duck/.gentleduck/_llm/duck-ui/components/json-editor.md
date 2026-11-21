```tsx title="components/json-editor-1.tsx"
// import from your project: import Demo from '@/components/json-editor-1'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { JsonTextareaField } from '@gentleduck/registry-ui/json-editor'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

type JsonEditorValues = {
  settings: Record<string, unknown> | null
}

const DEFAULT_SETTINGS: Record<string, unknown> = {
  featureFlags: {
    betaSidebar: true,
    compactCards: false,
  },
  notifications: {
    email: true,
    push: true,
  },
  theme: 'system',
}

export default function Demo() {
  const form = useForm<JsonEditorValues>({
    defaultValues: {
      settings: DEFAULT_SETTINGS,
    },
  })

  function onSubmit(values: JsonEditorValues) {
    toast('JSON saved', {
      description: (
        <pre className="max-w-[560px] overflow-x-auto rounded-md border bg-muted p-3 text-xs">
          {JSON.stringify(values.settings, null, 2)}
        </pre>
      ),
    })
  }

  return (
    <FormProvider {...form}>
      <form className="w-full max-w-2xl space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <JsonTextareaField
          control={form.control}
          description="Edit structured app settings as valid JSON."
          label="Settings"
          name="settings"
          rows={14}
          sheetTitle="Edit settings JSON"
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => {
              form.reset({ settings: DEFAULT_SETTINGS })
            }}
            type="button"
            variant="outline">
            Reset
          </Button>
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </FormProvider>
  )
}
```

## Philosophy

JSON editing is common in advanced settings, integration payloads, and admin tooling. A plain textarea is easy to ship but hard to use safely. `JsonTextareaField` keeps JSON editing in your form flow, adds validation, formatting, and keyboard shortcuts, and supports compact or expanded editing modes without introducing a heavy code editor dependency.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add json-editor
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/primitives react-hook-form lucide-react
```

The `json-editor` component depends on the [`alert-dialog`](/duck-ui/components/alert-dialog), [`button`](/duck-ui/components/button), [`field`](/duck-ui/components/field), [`popover`](/duck-ui/components/popover), [`sheet`](/duck-ui/components/sheet), and [`textarea`](/duck-ui/components/textarea) components.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { JsonTextareaField } from '@/components/ui/json-editor'
```

```tsx
import { FormProvider, useForm } from 'react-hook-form'

type FormValues = {
  settings: Record<string, unknown> | null
}

const form = useForm<FormValues>({
  defaultValues: {
    settings: {
      theme: 'system',
      notifications: true,
    },
  },
})

<FormProvider {...form}>
  <form>
    <JsonTextareaField
      control={form.control}
      name="settings"
      label="Settings"
    />
  </form>
</FormProvider>
```

The field holds any JSON value, and an empty editor saves `null`. A string value shows quoted, so it saves again unchanged, unless it holds JSON text, which shows as that text.

## Examples

### Inline + sheet expansion

Default mode renders the editor inline and opens an expanded sheet editor with the `Full` action.

```tsx title="components/json-editor-1.tsx"
// import from your project: import Demo from '@/components/json-editor-1'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { JsonTextareaField } from '@gentleduck/registry-ui/json-editor'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

type JsonEditorValues = {
  settings: Record<string, unknown> | null
}

const DEFAULT_SETTINGS: Record<string, unknown> = {
  featureFlags: {
    betaSidebar: true,
    compactCards: false,
  },
  notifications: {
    email: true,
    push: true,
  },
  theme: 'system',
}

export default function Demo() {
  const form = useForm<JsonEditorValues>({
    defaultValues: {
      settings: DEFAULT_SETTINGS,
    },
  })

  function onSubmit(values: JsonEditorValues) {
    toast('JSON saved', {
      description: (
        <pre className="max-w-[560px] overflow-x-auto rounded-md border bg-muted p-3 text-xs">
          {JSON.stringify(values.settings, null, 2)}
        </pre>
      ),
    })
  }

  return (
    <FormProvider {...form}>
      <form className="w-full max-w-2xl space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <JsonTextareaField
          control={form.control}
          description="Edit structured app settings as valid JSON."
          label="Settings"
          name="settings"
          rows={14}
          sheetTitle="Edit settings JSON"
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => {
              form.reset({ settings: DEFAULT_SETTINGS })
            }}
            type="button"
            variant="outline">
            Reset
          </Button>
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </FormProvider>
  )
}
```

### Popover mode

Use `mode="popover"` to keep layout compact and open the editor only when needed.

```tsx title="components/json-editor-2.tsx"
// import from your project: import Demo from '@/components/json-editor-2'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { JsonTextareaField } from '@gentleduck/registry-ui/json-editor'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

type JsonEditorPopoverValues = {
  filters: Record<string, unknown> | null
}

export default function Demo() {
  const form = useForm<JsonEditorPopoverValues>({
    defaultValues: {
      filters: {
        includeArchived: false,
        limit: 25,
        sortBy: 'createdAt',
      },
    },
  })

  function onSubmit(values: JsonEditorPopoverValues) {
    toast('Filters applied', {
      description: (
        <pre className="max-w-[420px] overflow-x-auto rounded-md border bg-muted p-3 text-xs">
          {JSON.stringify(values.filters, null, 2)}
        </pre>
      ),
    })
  }

  return (
    <FormProvider {...form}>
      <form className="w-full max-w-xl space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <JsonTextareaField
          control={form.control}
          description="Click the field to open a compact editor in a popover."
          expandMode="none"
          label="Query Filters"
          mode="popover"
          name="filters"
          rows={10}
        />

        <Button type="submit">Apply filters</Button>
      </form>
    </FormProvider>
  )
}
```

### Custom full-editor callback

Set `expandMode="callback"` to hand off full-screen editing to your own flow.

```tsx title="components/json-editor-3.tsx"
// import from your project: import Demo from '@/components/json-editor-3'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { JsonTextareaField } from '@gentleduck/registry-ui/json-editor'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

type JsonEditorCallbackValues = {
  payload: Record<string, unknown> | null
}

export default function Demo() {
  const form = useForm<JsonEditorCallbackValues>({
    defaultValues: {
      payload: {
        amount: 1200,
        currency: 'USD',
        metadata: {
          customerId: 'cus_1234',
          source: 'dashboard',
        },
      },
    },
  })

  function onSubmit(values: JsonEditorCallbackValues) {
    toast('Payload submitted', {
      description: (
        <pre className="max-w-[520px] overflow-x-auto rounded-md border bg-muted p-3 text-xs">
          {JSON.stringify(values.payload, null, 2)}
        </pre>
      ),
    })
  }

  return (
    <FormProvider {...form}>
      <form className="w-full max-w-2xl space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <JsonTextareaField
          allowArray={false}
          control={form.control}
          description="Full opens your own external editor flow through a callback."
          expandMode="callback"
          label="Payment Payload"
          name="payload"
          onExpandEditor={({ name, rawText }) => {
            console.log(`[onExpandEditor] field "${name}"`, rawText)
          }}
          rows={12}
        />

        <Button type="submit">Submit payload</Button>
      </form>
    </FormProvider>
  )
}
```

### Objects only

Set `allowArray={false}` to take only a JSON object, or nothing. A draft that is not JSON, or is not an object here, is refused under the editor, which is marked invalid until the draft changes. The form's own error for the field shows in the same place, so a rule of your own, such as a required key, reads like the editor's. No `Toaster` is needed.

```tsx title="components/json-editor-6.tsx"
// import from your project: import Demo from '@/components/json-editor-6'
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
```

### Read only

Set `isEditable={false}` to show a value that cannot be saved. This one also leaves out the line numbers and the `Full` action.

```tsx title="components/json-editor-7.tsx"
// import from your project: import Demo from '@/components/json-editor-7'
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
```

### Sheet on the left

```tsx title="components/json-editor-8.tsx"
// import from your project: import Demo from '@/components/json-editor-8'
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
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the editor follows: labels, buttons, and the expand sheet, popover, and dialog mirror, while the JSON code and its line-number gutter stay LTR. Pass `lang` for locale-aware line numbers and `text` to translate labels and messages.

```tsx title="components/json-editor-4.tsx"
// import from your project: import Demo from '@/components/json-editor-4'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import type { JsonEditorText } from '@gentleduck/registry-ui/json-editor'
import { JsonTextareaField } from '@gentleduck/registry-ui/json-editor'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

type JsonEditorValues = {
  settings: Record<string, unknown> | null
}

const DEFAULT_SETTINGS: Record<string, unknown> = {
  featureFlags: {
    betaSidebar: true,
    compactCards: false,
  },
  notifications: {
    email: true,
    push: true,
  },
  theme: 'system',
}

const AR_TEXT: JsonEditorText = {
  format: 'تنسيق',
  cancel: 'إلغاء',
  save: 'حفظ',
  full: 'كامل',
  close: 'إغلاق',
  keepEditing: 'متابعة التحرير',
  discard: 'تجاهل',
  discardTitle: 'تجاهل التغييرات؟',
  discardDescription: 'لديك تغييرات غير محفوظة. إذا أغلقت الآن، ستفقدها.',
  statusHint: 'Ctrl/Cmd + Enter: حفظ، Esc: إلغاء',
  sheetStatusHint: 'Ctrl/Cmd + Enter: حفظ، Esc: إغلاق',
  unsavedChanges: 'تغييرات غير محفوظة',
  saved: 'تم الحفظ',
  nullPreview: 'فارغ',
}

export default function Demo() {
  const form = useForm<JsonEditorValues>({
    defaultValues: {
      settings: DEFAULT_SETTINGS,
    },
  })

  function onSubmit(values: JsonEditorValues) {
    toast('تم حفظ الإعدادات', {
      description: (
        <pre className="max-w-[560px] overflow-x-auto rounded-md border bg-muted p-3 text-xs" dir="ltr">
          {JSON.stringify(values.settings, null, 2)}
        </pre>
      ),
    })
  }

  return (
    <DirectionProvider dir="rtl">
      <FormProvider {...form}>
        <form className="w-full max-w-2xl space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <JsonTextareaField
            control={form.control}
            description={'قم بتعديل إعدادات التطبيق بصيغة JSON صالحة.'}
            label={'الإعدادات'}
            lang="ar"
            name="settings"
            rows={14}
            sheetTitle={'تعديل إعدادات JSON'}
            text={AR_TEXT}
          />

          <div className="flex items-center justify-end gap-2">
            <Button type="submit">{'حفظ الإعدادات'}</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset({ settings: DEFAULT_SETTINGS })
              }}>
              {'إعادة تعيين'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionJsonTextareaField` for a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition, powered by [motion](https://motion.dev).

```tsx title="components/json-editor-5.tsx"
// import from your project: import Demo from '@/components/json-editor-5'
'use client'

import { MotionButton } from '@gentleduck/registry-ui/button'
import { MotionJsonTextareaField } from '@gentleduck/registry-ui/json-editor'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

type JsonEditorValues = {
  settings: Record<string, unknown> | null
}

const DEFAULT_SETTINGS: Record<string, unknown> = {
  featureFlags: {
    betaSidebar: true,
    compactCards: false,
  },
  notifications: {
    email: true,
    push: true,
  },
  theme: 'system',
}

export default function Demo() {
  const form = useForm<JsonEditorValues>({
    defaultValues: {
      settings: DEFAULT_SETTINGS,
    },
  })

  function onSubmit(values: JsonEditorValues) {
    toast('JSON saved', {
      description: (
        <pre className="max-w-[560px] overflow-x-auto rounded-md border bg-muted p-3 text-xs">
          {JSON.stringify(values.settings, null, 2)}
        </pre>
      ),
    })
  }

  return (
    <FormProvider {...form}>
      <form className="w-full max-w-2xl space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <MotionJsonTextareaField
          control={form.control}
          description="Edit structured app settings as valid JSON."
          label="Settings"
          name="settings"
          rows={14}
          sheetTitle="Edit settings JSON"
        />

        <div className="flex items-center justify-end gap-2">
          <MotionButton
            onClick={() => {
              form.reset({ settings: DEFAULT_SETTINGS })
            }}
            type="button"
            variant="outline">
            Reset
          </MotionButton>
          <MotionButton type="submit">Save settings</MotionButton>
        </div>
      </form>
    </FormProvider>
  )
}
```

}>
  Requires the `motion` package. Use `MotionJsonTextareaField` instead of `JsonTextareaField`. Same props, animated entrance.

## API Reference

### JsonTextareaField

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `control` | `Control<TFieldValues>` | `-` | React Hook Form control object from `useForm` |
| `name` | `FieldPath<TFieldValues>` | `-` | Field path in your form values |
| `label` | `string` | `-` | Visible label rendered above the editor. It names the editor, and the popover trigger beside its preview. |
| `description` | `string` | `-` | Helper text rendered under the label |
| `className` | `string` | `-` | Additional CSS classes for the field root |
| `actionsClassName` | `string` | `-` | Additional CSS classes for the action buttons row |
| `isEditable` | `boolean` | `true` | Disables editing and save actions when set to `false` |
| `allowArray` | `boolean` | `true` | When `false`, only a JSON object or an empty editor is saved, and anything else is refused with `text.notAnObject` |
| `mode` | `'inline' \| 'popover'` | `'inline'` | Presentation mode for the editor |
| `rows` | `number` | `12` | Number of rows for the inline textarea |
| `placeholder` | `string` | `'{\n  "theme": "dark"\n}'` | Placeholder content shown when empty |
| `lineNumbers` | `boolean` | `true` | Shows or hides the line-number gutter |
| `lineHeightPx` | `number` | `20` | Line-height used by textarea and line-number gutter |
| `dir` | `'ltr' \| 'rtl'` | - | Direction override. Defaults to the nearest `DirectionProvider`, then `<html dir>`. Mirrors the editor chrome; the JSON code and gutter stay LTR. |
| `lang` | `string` | - | BCP 47 locale tag (e.g. `'ar'`, `'fa'`). Controls the numeral system used for line numbers. |
| `expandMode` | `'none' \| 'callback' \| 'sheet'` | `'sheet'` | Full-editor behavior for the `Full` action |
| `sheetSide` | `'left' \| 'right'` | `'right'` | Side used when `expandMode="sheet"`. Mirrors in RTL. |
| `sheetTitle` | `string` | `'Edit JSON'` | Title displayed in the sheet header |
| `text` | `JsonEditorText` | See below | Object of translatable UI strings for i18n support |
| `onExpandEditor` | `(payload: JsonEditorExpandPayload<TFieldValues>) => void` | `-` | Callback invoked when `expandMode="callback"` and `Full` is pressed |

### JsonEditorText

All fields are optional. Omitted keys fall back to their English defaults.

```tsx
type JsonEditorText = {
  format?: string        // "Format"
  cancel?: string        // "Cancel"
  save?: string          // "Save"
  full?: string          // "Full"
  close?: string         // "Close"
  keepEditing?: string   // "Keep editing"
  discard?: string       // "Discard"
  discardTitle?: string  // "Discard changes?"
  discardDescription?: string // "You have unsaved changes..."
  statusHint?: string    // "Ctrl/Cmd + Enter: Save, Esc: Cancel"
  sheetStatusHint?: string // "Ctrl/Cmd + Enter: Save, Esc: Close"
  unsavedChanges?: string // "Unsaved changes"
  saved?: string         // "Saved"
  nullPreview?: string   // "NULL"
  invalidJson?: string   // "Enter valid JSON." Opens the refusal, before the parser's message.
  notAnObject?: string   // "Enter a JSON object."
}
```

### JsonEditorExpandPayload

```tsx
type JsonEditorExpandPayload<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>
  rawText: string
  value: unknown
}
```

### MotionJsonTextareaField

Same props as `JsonTextareaField`. Adds a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition via motion. Requires the `motion` package.

### Keyboard shortcuts

* `Ctrl/Cmd + Enter` saves the current editor buffer.
* `Esc` cancels inline edits or closes the expanded sheet, asking first when the sheet has unsaved changes.

## See also

* [React Hook Form](/duck-ui/components/react-hook-form)  -  Form context components used by `JsonTextareaField`
* [Textarea](/duck-ui/components/textarea)  -  Basic plain-text multiline input
* [Field](/duck-ui/components/field)  -  Layout primitive for label + description + error composition