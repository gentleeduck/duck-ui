```tsx title="components/radio-group-1.tsx"
// import from your project: import Demo from '@/components/radio-group-1'
'use client'

import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'

export default function Demo() {
  return (
    <RadioGroup
      className="[&>div]:felx flex flex-col space-y-1 [&>div]:items-center [&>div]:space-x-3 [&>div]:space-y-0"
      defaultValue="comfortable">
      <RadioGroupItem value="default">Default</RadioGroupItem>
      <RadioGroupItem value="comfortable">Comfortable</RadioGroupItem>
      <RadioGroupItem value="compact">Compact</RadioGroupItem>
    </RadioGroup>
  )
}
```

## Philosophy

Radio groups enforce single selection from a set  -  the constraint is the feature. Unlike checkboxes (multi-select) or selects (dropdown), radio groups make all options visible simultaneously. The primitive layer handles keyboard navigation (arrow keys plus Home/End/PageUp/PageDown navigation, auto-selecting on focus), form integration via hidden native radio inputs, and RTL direction support.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add radio-group
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/motion @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
```

```tsx
<RadioGroup defaultValue="option-one">
  <RadioGroupItem value="option-one">Option One</RadioGroupItem>
  <RadioGroupItem value="option-two">Option Two</RadioGroupItem>
</RadioGroup>
```

## Examples

### Form

```tsx title="components/radio-group-2.tsx"
// import from your project: import Demo from '@/components/radio-group-2'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const FormSchema = z.object({
  type: z.enum(['all', 'mentions', 'none'], {
    error: 'You need to select a notification type.',
  }),
})

const notificationTypes = [
  {
    description: 'Receive updates for every new message.',
    id: 'all',
    title: 'All new messages',
  },
  {
    description: 'Only direct mentions and private messages.',
    id: 'mentions',
    title: 'Direct messages and mentions',
  },
  {
    description: 'Disable all notification alerts.',
    id: 'none',
    title: 'Nothing',
  },
] as const

export default function Demo() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.info(
      <div>
        <h4 className="font-medium text-md">You submitted the following values:</h4>
        <pre className="mt-2 w-[300px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>,
    )
  }

  return (
    <form className="w-full max-w-lg space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="type"
          render={({ field, fieldState }) => (
            <FieldSet>
              <FieldLegend>Notify me about...</FieldLegend>
              <FieldDescription>Choose which message types should trigger notifications.</FieldDescription>
              <RadioGroup name={field.name} value={field.value} onValueChange={field.onChange}>
                {notificationTypes.map((option) => (
                  <FieldLabel htmlFor={`form-rhf-radio-${option.id}`} key={option.id}>
                    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                      <FieldContent>
                        <FieldTitle>{option.title}</FieldTitle>
                        <FieldDescription>{option.description}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem
                        id={`form-rhf-radio-${option.id}`}
                        value={option.id}
                        aria-invalid={fieldState.invalid}
                      />
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
              {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )}
        />
      </FieldGroup>
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Horizontal, with a disabled option

`orientation="horizontal"` lays the items in a row and keeps the arrow keys to Left and Right. A disabled item is skipped by the arrow keys, and its label dims with it.

```tsx title="components/radio-group-5.tsx"
// import from your project: import Demo from '@/components/radio-group-5'
'use client'

import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'

export default function Demo() {
  return (
    <RadioGroup aria-label="Delivery" className="flex-row gap-6" defaultValue="standard" orientation="horizontal">
      <RadioGroupItem value="standard">Standard</RadioGroupItem>
      <RadioGroupItem value="express">Express</RadioGroupItem>
      <RadioGroupItem disabled value="same-day">
        Same day
      </RadioGroupItem>
    </RadioGroup>
  )
}
```

### Custom indicators

`indicator` draws an icon on an item while it is not selected, and `checkedIndicator` replaces the dot once it is.

```tsx title="components/radio-group-6.tsx"
// import from your project: import Demo from '@/components/radio-group-6'
'use client'

import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'
import { Check, X } from 'lucide-react'

export default function Demo() {
  return (
    <RadioGroup aria-label="Attending" defaultValue="yes">
      <RadioGroupItem checkedIndicator={<Check />} indicator={<X />} value="yes">
        Yes, I will be there
      </RadioGroupItem>
      <RadioGroupItem checkedIndicator={<Check />} indicator={<X />} value="no">
        No, I cannot make it
      </RadioGroupItem>
    </RadioGroup>
  )
}
```

### Read-only until edited

`readOnly` keeps the selection fixed while the items stay focusable and readable, which suits a setting shown before it is edited. Here `value` and `onValueChange` hold the plan outside the group.

```tsx title="components/radio-group-7.tsx"
// import from your project: import Demo from '@/components/radio-group-7'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'
import * as React from 'react'

const PLANS: Record<string, string> = { hobby: 'Hobby', pro: 'Pro', team: 'Team' }

export default function Demo() {
  const [plan, setPlan] = React.useState('pro')
  const [editing, setEditing] = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        aria-label="Plan"
        onValueChange={(next) => next !== null && setPlan(next)}
        readOnly={!editing}
        value={plan}>
        {Object.entries(PLANS).map(([value, name]) => (
          <RadioGroupItem key={value} value={value}>
            {name}
          </RadioGroupItem>
        ))}
      </RadioGroup>
      <div className="flex items-center gap-3">
        <Button onClick={() => setEditing(!editing)} size="sm" variant="outline">
          {editing ? 'Done' : 'Change plan'}
        </Button>
        <span className="text-muted-foreground text-sm">Billed on the {PLANS[plan]} plan</span>
      </div>
    </div>
  )
}
```

### Required, without looping

```tsx title="components/radio-group-8.tsx"
// import from your project: import Demo from '@/components/radio-group-8'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Label } from '@gentleduck/registry-ui/label'
import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'
import * as React from 'react'

const PLANS = [
  { label: 'Hobby, free', text: 'Hobby', value: 'hobby' },
  { label: 'Pro, 20 a month', text: 'Pro', value: 'pro' },
  { label: 'Team, 50 a month', text: 'Team', value: 'team' },
]

export default function Demo() {
  const [sent, setSent] = React.useState('')

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get('plan')))
      }}>
      <RadioGroup loop={false} name="plan" required>
        {PLANS.map((plan) => (
          <div className="flex items-center gap-2" key={plan.value}>
            <RadioGroupItem id={`radio-8-${plan.value}`} textValue={plan.text} value={plan.value} />
            <Label htmlFor={`radio-8-${plan.value}`}>{plan.label}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button className="self-start" type="submit">
        Continue
      </Button>
      <p className="text-muted-foreground text-sm">
        {sent
          ? `Submitted plan=${sent}`
          : 'required refuses an empty pick. Typing P jumps to Pro through its textValue.'}
      </p>
    </form>
  )
}
```

## Component Composition

## Keyboard Navigation

| Key | Description |
| --- | --- |
| `ArrowDown` | Move focus to next item and select it |
| `ArrowRight` | Move focus to next item and select it |
| `ArrowUp` | Move focus to previous item and select it |
| `ArrowLeft` | Move focus to previous item and select it |
| `Home` | Move focus to first item and select it |
| `End` | Move focus to last item and select it |
| `PageUp` | Move focus to first item and select it |
| `PageDown` | Move focus to last item and select it |
| `a-z` | Jump to next item matching typed characters and select it |
| `g` `g` | Jump to first item and select it |
| `G` | Jump to last item and select it |
| `Tab` | Move focus into/out of the radio group |
| `Space` | Select the focused item (if not already selected) |
| `Enter` | Nothing, as on a native radio |

In a `readOnly` group these keys move focus without selecting.

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `RadioGroup` follows it, including flipped Left/Right arrow keys. No `dir` prop needed.

```tsx title="components/radio-group-3.tsx"
// import from your project: import Demo from '@/components/radio-group-3'
'use client'

import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <RadioGroup defaultValue="comfortable">
        <RadioGroupItem value="default">افتراضي</RadioGroupItem>
        <RadioGroupItem value="comfortable">مريح</RadioGroupItem>
        <RadioGroupItem value="compact">مضغوط</RadioGroupItem>
      </RadioGroup>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionRadioGroup` and `MotionRadioGroupItem` for staggered entrance animations powered by [motion](https://motion.dev). Each item uses a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition, staggered by 50ms.

```tsx title="components/radio-group-4.tsx"
// import from your project: import Demo from '@/components/radio-group-4'
'use client'

import { MotionRadioGroup, MotionRadioGroupItem } from '@gentleduck/registry-ui/radio-group'

export default function Demo() {
  return (
    <MotionRadioGroup
      className="[&>div]:felx flex flex-col space-y-1 [&>div]:items-center [&>div]:space-x-3 [&>div]:space-y-0"
      defaultValue="comfortable">
      <MotionRadioGroupItem value="default">Default</MotionRadioGroupItem>
      <MotionRadioGroupItem value="comfortable">Comfortable</MotionRadioGroupItem>
      <MotionRadioGroupItem value="compact">Compact</MotionRadioGroupItem>
    </MotionRadioGroup>
  )
}
```

}>
  Requires the `motion` package. Use `MotionRadioGroup` + `MotionRadioGroupItem` instead of `RadioGroup` + `RadioGroupItem`. Same props. The regular components are perfectly fine - this is an optional enhancement.

## API Reference

### RadioGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| null` | - | Controlled value of the selected radio item. `null` or `''` selects nothing |
| `defaultValue` | `string` | - | Initial selected value when uncontrolled |
| `onValueChange` | `(value: string) => void` | - | Callback fired when selection changes |
| `disabled` | `boolean` | `false` | Whether the entire group is disabled |
| `readOnly` | `boolean` | `false` | Keeps the selection fixed while the items stay focusable |
| `required` | `boolean` | `false` | Whether the form refuses to submit with nothing selected |
| `name` | `string` | - | The name used when submitting an HTML form |
| `form` | `string` | - | Id of a form outside the group that it submits with |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `orientation` | `'horizontal' \| 'vertical'` | - | The orientation of the group for arrow key navigation |
| `loop` | `boolean` | `true` | Whether keyboard navigation should loop |
| `className` | `string` | - | Additional CSS classes |

### RadioGroupItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | (required) | Unique value for the radio item |
| `disabled` | `boolean` | `false` | Whether this item is disabled. Its label dims with it, as it does when the whole group is disabled |
| `id` | `string` | generated | Id of the radio control, which the label points at |
| `indicator` | `React.ReactElement` | - | Icon shown while the item is not selected, in the muted foreground colour. Without `checkedIndicator` the item draws its own dot once selected |
| `checkedIndicator` | `React.ReactElement` | - | Icon shown while the item is selected, in place of the dot |
| `textValue` | `string` | - | Optional text used for keyboard typeahead matching (`a-z`). In the registry component, plain string/number children are inferred automatically. |
| `children` | `React.ReactNode` | - | Label content. When provided, a clickable label is rendered next to the control and selects the item on click. |
| `className` | `string` | - | Additional CSS classes for the radio button control |

### MotionRadioGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `RadioGroupProps` | - | All props from `RadioGroup` are supported |

Wraps `RadioGroup` and auto-injects stagger `index` into `MotionRadioGroupItem` children. Requires the `motion` package.

### MotionRadioGroupItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | `0` | Stagger delay index (50ms per index) for entrance animation |
| `...props` | `RadioGroupItemProps` | - | All props from `RadioGroupItem` are supported |

Wraps `RadioGroupItem` with a staggered `scaleIn` entrance animation (fade, scale, and blur) and a bounce (scale + rotate) on the radio circle when clicked. Requires the `motion` package.

## See also

* [Checkbox](/duck-ui/components/checkbox)  -  Multi-selection toggle control
* [Switch](/duck-ui/components/switch)  -  Toggle between on and off states
* [Select](/duck-ui/components/select)  -  Dropdown selection from a list
* [Radio Group Primitive API](/duck-primitives/api/radio-group)  -  Headless primitive reference (`Root`, `Item`, `Indicator`, `ItemProvider`, `ItemTrigger`, `ItemBubbleInput`)