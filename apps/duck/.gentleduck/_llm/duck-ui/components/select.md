```tsx title="components/select-1.tsx"
// import from your project: import Demo from '@/components/select-1'
'use client'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
```

## Philosophy

Native selects are accessible but difficult to style consistently. This select builds on `@gentleduck/primitives/select` which provides full keyboard navigation, ARIA semantics, scroll management, and typeahead search. The wrapper adds design-system styling while the primitive handles all interaction logic.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add select
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs lucide-react
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
```

```tsx
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>
```

## Examples

### Scrollable

```tsx title="components/select-2.tsx"
// import from your project: import Demo from '@/components/select-2'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent className="h-[400px]">
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
          <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
          <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
          <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
          <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
          <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Europe & Africa</SelectLabel>
          <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
          <SelectItem value="cet">Central European Time (CET)</SelectItem>
          <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
          <SelectItem value="west">Western European Summer Time (WEST)</SelectItem>
          <SelectItem value="cat">Central Africa Time (CAT)</SelectItem>
          <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="msk">Moscow Time (MSK)</SelectItem>
          <SelectItem value="ist">India Standard Time (IST)</SelectItem>
          <SelectItem value="cst_china">China Standard Time (CST)</SelectItem>
          <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
          <SelectItem value="kst">Korea Standard Time (KST)</SelectItem>
          <SelectItem value="ist_indonesia">Indonesia Central Standard Time (WITA)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Australia & Pacific</SelectLabel>
          <SelectItem value="awst">Australian Western Standard Time (AWST)</SelectItem>
          <SelectItem value="acst">Australian Central Standard Time (ACST)</SelectItem>
          <SelectItem value="aest">Australian Eastern Standard Time (AEST)</SelectItem>
          <SelectItem value="nzst">New Zealand Standard Time (NZST)</SelectItem>
          <SelectItem value="fjt">Fiji Time (FJT)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>South America</SelectLabel>
          <SelectItem value="art">Argentina Time (ART)</SelectItem>
          <SelectItem value="bot">Bolivia Time (BOT)</SelectItem>
          <SelectItem value="brt">Brasilia Time (BRT)</SelectItem>
          <SelectItem value="clt">Chile Standard Time (CLT)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
```

### Groups, separators and disabled items

A `SelectLabel` names its group for screen readers, and a `SelectSeparator` between groups is hidden from them. A disabled item stays in the list, and the arrow keys and typeahead pass over it.

```tsx title="components/select-7.tsx"
// import from your project: import Demo from '@/components/select-7'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select>
      <SelectTrigger aria-label="Food" className="w-[220px]">
        <SelectValue placeholder="Pick a food" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem disabled value="carrot">
            Carrot (out of season)
          </SelectItem>
          <SelectItem value="leek">Leek</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Meat</SelectLabel>
          <SelectItem value="chicken">Chicken</SelectItem>
          <SelectItem value="lamb">Lamb</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
```

### Item-aligned

With `position="item-aligned"` the list opens over the trigger with the chosen item lined up on it, the way a native select does on macOS. `side`, `align` and the offsets apply only to the default `popper` position.

```tsx title="components/select-8.tsx"
// import from your project: import Demo from '@/components/select-8'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select defaultValue="m">
      <SelectTrigger aria-label="T-shirt size" className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="item-aligned">
        <SelectItem value="xs">Extra small</SelectItem>
        <SelectItem value="s">Small</SelectItem>
        <SelectItem value="m">Medium</SelectItem>
        <SelectItem value="l">Large</SelectItem>
        <SelectItem value="xl">Extra large</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

### Controlled

Hold the value in state with `value` and `onValueChange`. Setting it to an empty string clears the pick and brings the placeholder back. An item can hold more than text, and the trigger shows what the picked item holds, icon included.

```tsx title="components/select-9.tsx"
// import from your project: import Demo from '@/components/select-9'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { Monitor, Moon, Sun } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [theme, setTheme] = React.useState('')

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={setTheme} value={theme}>
        <SelectTrigger aria-label="Theme" className="w-[180px]">
          <SelectValue placeholder="Follow the system" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <span className="flex items-center gap-2">
              <Sun aria-hidden="true" className="size-4" />
              Light
            </span>
          </SelectItem>
          <SelectItem value="dark">
            <span className="flex items-center gap-2">
              <Moon aria-hidden="true" className="size-4" />
              Dark
            </span>
          </SelectItem>
          <SelectItem value="contrast">
            <span className="flex items-center gap-2">
              <Monitor aria-hidden="true" className="size-4" />
              High contrast
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
      <Button disabled={theme === ''} onClick={() => setTheme('')} size="sm" variant="outline">
        Clear
      </Button>
    </div>
  )
}
```

### Disabled

`disabled` on the root keeps the select closed and out of the tab order, and still shows its value.

```tsx title="components/select-10.tsx"
// import from your project: import Demo from '@/components/select-10'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select defaultValue="eu-west" disabled>
      <SelectTrigger aria-label="Region" className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="eu-west">Europe (Ireland)</SelectItem>
        <SelectItem value="us-east">US East (Virginia)</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

### Form

```tsx title="components/select-3.tsx"
// import from your project: import Demo from '@/components/select-3'
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
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const FormSchema = z.object({
  email: z.email({
    error: 'Please select an email to display.',
  }),
})

export default function Demo() {
  const form = useForm<z.infer<typeof FormSchema>>({
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
          name="email"
          render={({ field, fieldState }) => (
            <Field orientation="responsive" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-select-email">Email</FieldLabel>
                <FieldDescription>
                  You can manage email addresses in your <Link href="/examples/forms">email settings</Link>.
                </FieldDescription>
                {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="form-rhf-select-email" aria-invalid={fieldState.invalid} className="min-w-[260px]">
                  <SelectValue placeholder="Select a verified email to display" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m@example.com">m@example.com</SelectItem>
                  <SelectItem value="m@google.com">m@google.com</SelectItem>
                  <SelectItem value="m@support.com">m@support.com</SelectItem>
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
```

Inside a `<form>`, the select submits under `name`, a form reset restores the value it started with, and a pick fires the form's `change` event. A value set through `value` does not fire it.

### Active Trigger on Open

Style the trigger to appear active while the select dropdown is open using `data-[state=open]`:

```tsx title="components/select-5.tsx"
// import from your project: import Demo from '@/components/select-5'
'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select>
      <SelectTrigger className="w-48 data-[state=open]:border-ring data-[state=open]:ring-2 data-[state=open]:ring-ring">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
        <SelectItem value="mango">Mango</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

### Controlled open state in a form

```tsx title="components/select-21.tsx"
// import from your project: import Demo from '@/components/select-21'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [sent, setSent] = React.useState('')

  return (
    <form
      className="flex flex-col items-start gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get('country')))
      }}>
      <div className="flex gap-2">
        <Select autoComplete="country" name="country" onOpenChange={setOpen} open={open} required>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EG">Egypt</SelectItem>
            <SelectItem value="DE">Germany</SelectItem>
            <SelectItem value="JP">Japan</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)} type="button" variant="outline">
          Open it
        </Button>
      </div>
      <Button type="submit">Save</Button>
      <p className="text-muted-foreground text-sm">
        {sent
          ? `Submitted country=${sent}`
          : 'The open state is controlled, required refuses no pick, and autoComplete hints autofill.'}
      </p>
    </form>
  )
}
```

### Popper placement and scroll buttons

```tsx title="components/select-22.tsx"
// import from your project: import Demo from '@/components/select-22'
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

const ZONES = Array.from({ length: 24 }, (_, hour) => `UTC${hour - 11 >= 0 ? '+' : ''}${hour - 11}`)

export default function Demo() {
  return (
    <Select defaultValue="UTC+0">
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align="end"
        alignOffset={-4}
        avoidCollisions
        className="max-h-64"
        collisionPadding={16}
        position="popper"
        side="top"
        sideOffset={8}>
        <SelectScrollUpButton />
        {ZONES.map((zone) => (
          <SelectItem key={zone} textValue={zone.replace('UTC', 'utc ')} value={zone}>
            {zone}
          </SelectItem>
        ))}
        <SelectScrollDownButton />
      </SelectContent>
    </Select>
  )
}
```

## Multiple

Pass `multiple` and the select holds a list of values. `value`, `defaultValue` and `onValueChange` take and give `string[]`, in the order the values were picked. A click, Enter or Space toggles the item and leaves the list open, so several can be picked in one go, and Escape or a press outside closes it. The trigger shows the picked labels joined by ", ", or the placeholder while none is picked.

```tsx title="components/select-11.tsx"
// import from your project: import Demo from '@/components/select-11'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select multiple>
      <SelectTrigger aria-label="Fruits" className="w-[260px]">
        <SelectValue placeholder="Pick some fruits" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
```

The listbox carries `aria-multiselectable`, and every option says whether it is picked with `aria-selected`. Typing a letter on the closed trigger picks nothing, since the pick would be made out of sight; the arrow keys, Enter and Space open the list as before.

With `position="item-aligned"`, the list opens with the first pick lined up over the trigger, and that pick takes focus.

### Controlled

Hold the list in state. An empty array clears every pick and brings the placeholder back. Children given to `SelectValue` take the place of the joined labels; here they show a count.

```tsx title="components/select-12.tsx"
// import from your project: import Demo from '@/components/select-12'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import * as React from 'react'

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'grapes', label: 'Grapes' },
  { value: 'pineapple', label: 'Pineapple' },
]

export default function Demo() {
  const [picked, setPicked] = React.useState<string[]>(['apple', 'grapes'])

  return (
    <div className="flex items-center gap-2">
      <Select multiple onValueChange={setPicked} value={picked}>
        <SelectTrigger aria-label="Fruits" className="w-[180px]">
          <SelectValue placeholder="No fruit picked">
            {picked.length === 1 ? '1 fruit' : `${picked.length} fruits`}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {fruits.map((fruit) => (
            <SelectItem key={fruit.value} value={fruit.value}>
              {fruit.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        disabled={picked.length === fruits.length}
        onClick={() => setPicked(fruits.map((fruit) => fruit.value))}
        size="sm"
        variant="outline">
        All
      </Button>
      <Button disabled={picked.length === 0} onClick={() => setPicked([])} size="sm" variant="outline">
        Clear
      </Button>
    </div>
  )
}
```

### Badges in the trigger

Give `SelectValue` a function and it is called with the picked values in the order they were picked, so the trigger can draw anything. It is not called while nothing is picked, and the placeholder shows instead. Keep buttons out of what it draws: the trigger is a button itself, and a press anywhere on it opens the list.

```tsx title="components/select-13.tsx"
// import from your project: import Demo from '@/components/select-13'
'use client'

import { Badge } from '@gentleduck/registry-ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'svelte-kit', label: 'SvelteKit' },
  { value: 'solid-start', label: 'SolidStart' },
]

const labelOf = (value: string) => frameworks.find((framework) => framework.value === value)?.label

export default function Demo() {
  return (
    <Select defaultValue={['next', 'astro', 'svelte-kit']} multiple>
      <SelectTrigger aria-label="Frameworks" className="w-[300px]">
        <SelectValue placeholder="Pick frameworks">
          {(picked) => (
            <span className="flex gap-1">
              {picked.slice(0, 2).map((value) => (
                <Badge key={value} size="sm" variant="secondary">
                  {labelOf(value)}
                </Badge>
              ))}
              {picked.length > 2 ? (
                <Badge size="sm" variant="outline">
                  +{picked.length - 2} more
                </Badge>
              ) : null}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {frameworks.map((framework) => (
          <SelectItem key={framework.value} value={framework.value}>
            {framework.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Groups, separators and disabled items

Groups, labels and separators work as they do in a single select, and a disabled item cannot be picked.

```tsx title="components/select-14.tsx"
// import from your project: import Demo from '@/components/select-14'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select defaultValue={['mozzarella', 'basil']} multiple>
      <SelectTrigger aria-label="Toppings" className="w-[280px]">
        <SelectValue placeholder="Pick your toppings" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Cheese</SelectLabel>
          <SelectItem value="mozzarella">Mozzarella</SelectItem>
          <SelectItem value="parmesan">Parmesan</SelectItem>
          <SelectItem value="gorgonzola">Gorgonzola</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Meat</SelectLabel>
          <SelectItem value="pepperoni">Pepperoni</SelectItem>
          <SelectItem value="ham">Ham</SelectItem>
          <SelectItem disabled value="nduja">
            Nduja (sold out)
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Greens</SelectLabel>
          <SelectItem value="basil">Basil</SelectItem>
          <SelectItem value="rocket">Rocket</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
```

### Form

Inside a `<form>`, the select submits `name` once per picked value, so `FormData.getAll(name)` reads them all. `required` refuses a submit with nothing picked, and a form reset restores the values it started with. With react-hook-form, pass `field.value` and `field.onChange` as they are, and let the schema check the length of the array.

```tsx title="components/select-15.tsx"
// import from your project: import Demo from '@/components/select-15'
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
```

### A limit on picks

There is no `max` prop. Disable the items not yet picked once the limit is reached; the picked ones stay enabled, so one can be taken out to make room.

```tsx title="components/select-16.tsx"
// import from your project: import Demo from '@/components/select-16'
'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import * as React from 'react'

const LIMIT = 3

const toppings = [
  { value: 'mushroom', label: 'Mushroom' },
  { value: 'olive', label: 'Olive' },
  { value: 'onion', label: 'Onion' },
  { value: 'pepper', label: 'Pepper' },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'sweetcorn', label: 'Sweetcorn' },
]

export default function Demo() {
  const [picked, setPicked] = React.useState<string[]>([])
  const full = picked.length >= LIMIT

  return (
    <div className="flex flex-col gap-2">
      <Select multiple onValueChange={setPicked} value={picked}>
        <SelectTrigger aria-label="Toppings" className="w-[280px]">
          <SelectValue placeholder={`Pick up to ${LIMIT} toppings`} />
        </SelectTrigger>
        <SelectContent>
          {toppings.map((topping) => (
            <SelectItem disabled={full && !picked.includes(topping.value)} key={topping.value} value={topping.value}>
              {topping.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-sm">
        {picked.length} of {LIMIT} picked
      </p>
    </div>
  )
}
```

### Items as data

With `items`, a closed select renders none of its items, and the trigger reads the picked labels from the list, in the server's HTML too. The items themselves can still draw more than their label.

```tsx title="components/select-17.tsx"
// import from your project: import Demo from '@/components/select-17'
'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { Bike, Bus, Car, Plane, Ship, TrainFront } from 'lucide-react'

const transport = [
  { value: 'bike', label: 'Bike', icon: Bike },
  { value: 'bus', label: 'Bus', icon: Bus },
  { value: 'car', label: 'Car', icon: Car },
  { value: 'train', label: 'Train', icon: TrainFront },
  { value: 'ferry', label: 'Ferry', icon: Ship },
  { value: 'plane', label: 'Plane', icon: Plane, disabled: true },
]

export default function Demo() {
  return (
    <Select defaultValue={['bike', 'train']} items={transport} multiple>
      <SelectTrigger aria-label="Ways to travel" className="w-[260px]">
        <SelectValue placeholder="Pick ways to travel" />
      </SelectTrigger>
      <SelectContent>
        {transport.map(({ icon: Icon, ...item }) => (
          <SelectItem disabled={item.disabled} key={item.value} value={item.value}>
            <span className="flex items-center gap-2">
              <Icon aria-hidden="true" className="size-4" />
              {item.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Long lists

A list taller than its box scrolls, with a scroll button at each end, and typing a letter while it is open moves focus to the next item starting with it.

```tsx title="components/select-18.tsx"
// import from your project: import Demo from '@/components/select-18'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

const countries = [
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'Denmark',
  'Egypt',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'India',
  'Indonesia',
  'Ireland',
  'Italy',
  'Japan',
  'Jordan',
  'Kenya',
  'Mexico',
  'Morocco',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'Norway',
  'Peru',
  'Poland',
  'Portugal',
  'Saudi Arabia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sweden',
  'Switzerland',
  'Tunisia',
  'Turkey',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
]

export default function Demo() {
  return (
    <Select defaultValue={['Egypt', 'Japan']} multiple>
      <SelectTrigger aria-label="Countries" className="w-[280px]">
        <SelectValue placeholder="Pick the countries you ship to" />
      </SelectTrigger>
      <SelectContent className="h-[320px]">
        {countries.map((country) => (
          <SelectItem key={country} value={country}>
            {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Right-to-left

The trigger and the list mirror under `DirectionProvider`. The labels are joined with ", " whatever the language, so this one gives `SelectValue` a function that joins them with the Arabic comma.

```tsx title="components/select-19.tsx"
// import from your project: import Demo from '@/components/select-19'
'use client'

import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

const fruits = [
  { value: 'apple', label: 'تفاح' },
  { value: 'banana', label: 'موز' },
  { value: 'blueberry', label: 'توت أزرق' },
  { value: 'grapes', label: 'عنب' },
  { value: 'pineapple', label: 'أناناس' },
]

const labelOf = (value: string) => fruits.find((fruit) => fruit.value === value)?.label

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Select defaultValue={['grapes', 'apple']} multiple>
        <SelectTrigger aria-label="الفواكه" className="w-[240px]">
          <SelectValue placeholder="اختر بعض الفواكه">{(picked) => picked.map(labelOf).join('، ')}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>الفواكه</SelectLabel>
            {fruits.map((fruit) => (
              <SelectItem key={fruit.value} value={fruit.value}>
                {fruit.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </DirectionProvider>
  )
}
```

### Motion

`MotionSelect` takes `multiple` as `Select` does. The list animates as it opens and closes, and holds still while picks are made.

```tsx title="components/select-20.tsx"
// import from your project: import Demo from '@/components/select-20'
'use client'

import {
  MotionSelect,
  MotionSelectContent,
  MotionSelectTrigger,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <MotionSelect defaultValue={['blueberry']} multiple>
      <MotionSelectTrigger aria-label="Fruits" className="w-[240px]">
        <SelectValue placeholder="Pick some fruits" />
      </MotionSelectTrigger>
      <MotionSelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </MotionSelectContent>
    </MotionSelect>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the select follows. The portaled listbox gets the resolved `dir`, so text, the check indicator, and alignment mirror without any extra props.

```tsx title="components/select-4.tsx"
// import from your project: import Demo from '@/components/select-4'
'use client'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="اختر فاكهة" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>الفواكه</SelectLabel>
            <SelectItem value="apple">تفاح</SelectItem>
            <SelectItem value="banana">موز</SelectItem>
            <SelectItem value="blueberry">توت أزرق</SelectItem>
            <SelectItem value="grapes">عنب</SelectItem>
            <SelectItem value="pineapple">أناناس</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionSelect` and `MotionSelectContent` for smooth enter/exit animations powered by [motion](https://motion.dev). The dropdown enters and exits with a `scaleIn` preset (fade, scale, and blur) and a bouncy spring transition. `MotionSelectTrigger` adds tap feedback (scale 0.97) to the trigger button.

```tsx title="components/select-6.tsx"
// import from your project: import Demo from '@/components/select-6'
'use client'
import {
  MotionSelect,
  MotionSelectContent,
  MotionSelectTrigger,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <MotionSelect>
      <MotionSelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </MotionSelectTrigger>
      <MotionSelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </MotionSelectContent>
    </MotionSelect>
  )
}
```

}>
  Requires the `motion` package. Use `MotionSelect` instead of `Select` and `MotionSelectContent` instead of `SelectContent`. Optionally use `MotionSelectTrigger` instead of `SelectTrigger` for tap feedback. All other sub-components stay the same.

## API Reference

### Select

The root component that manages open/closed state, value state, and provides context.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `multiple` | `boolean` | `false` | Holds a list of values. A pick toggles its item and leaves the list open, and the form gets `name` once per value. |
| `value` | `string \| string[]` | - | Controlled selected value, a list in pick order with `multiple` |
| `defaultValue` | `string \| string[]` | - | Initial value (uncontrolled), a list with `multiple` |
| `onValueChange` | `(value: string) => void` | - | Callback fired when the selected value changes. With `multiple` it is given `string[]`. |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | - | Callback fired when dropdown open state changes |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `name` | `string` | - | Name attribute for native form submission |
| `disabled` | `boolean` | - | Disables the entire select |
| `required` | `boolean` | - | Marks the select as required for form validation. With `multiple`, one pick satisfies it. |
| `form` | `string` | - | Associates the select with a form element by ID |
| `items` | `{ value: string; label: string; disabled?: boolean }[]` | - | The items, as data. A closed select then renders none of its items: the trigger's label, the native `<select>` options and typing on the closed trigger come from this list, and the label is in the server's HTML. Children given to the value still win over the label. |
| `autoComplete` | `string` | - | Hint for browser autofill |

### SelectTrigger

Button that toggles the dropdown. Renders a styled `<button>` with a chevron icon.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |
| `disabled` | `boolean` | - | Disables the trigger |

Sets `role="combobox"`, `aria-expanded`, `aria-autocomplete="none"`, and `data-state` automatically, and `aria-controls` while the select is open.

### SelectValue

Renders the selected value text, or a placeholder when nothing is selected. With `multiple`, it renders the picked labels joined by ", ".

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placeholder` | `React.ReactNode` | `''` | Text shown when no value is selected |
| `children` | `React.ReactNode \| ((value: string[]) => React.ReactNode)` | - | Shown in place of the label. A function is given the picked values in pick order, a single select's one value as a list, and is not called while nothing is picked. |
| `className` | `string` | - | Additional CSS class names |

### SelectContent

The dropdown content area. Handles positioning, focus management, keyboard navigation, and dismiss behavior.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `'item-aligned' \| 'popper'` | `'popper'` | Positioning strategy. `item-aligned` aligns selected item with trigger. `popper` uses floating positioning. |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Preferred side (popper position only) |
| `sideOffset` | `number` | `0` | Offset from trigger on the main axis |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Alignment on the cross axis |
| `alignOffset` | `number` | `0` | Offset on the cross axis |
| `avoidCollisions` | `boolean` | `true` | Whether to flip to avoid viewport overflow |
| `collisionPadding` | `number` | `10` | Padding from viewport edges |
| `className` | `string` | - | Additional CSS class names |

Exposes `data-state="open"` / `data-state="closed"` and `data-side` for CSS animation.

One highlight slides behind the items to each one that takes focus, from the pointer or the keyboard, so a fast swipe passes over every item in between. It appears in place on the first item focus reaches, fades out once focus leaves the items, and moves without sliding under `prefers-reduced-motion`. It is `aria-hidden`, and the items keep their focus and `data-highlighted` as before.

### SelectGroup

Groups related items together. Renders a `<div>` with `role="group"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |

### SelectLabel

Label for a `SelectGroup`. Renders a `<div>` linked to its group via `aria-labelledby`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |

### SelectItem

An individual selectable item. Renders a `<div>` with `role="option"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | (required) | The value representing this item. An empty string clears the selection and shows the placeholder. |
| `disabled` | `boolean` | `false` | Whether the item is disabled |
| `textValue` | `string` | - | Optional text override for typeahead search |
| `className` | `string` | - | Additional CSS class names |

Exposes `data-state="checked"` / `data-state="unchecked"`, `data-highlighted`, and `data-disabled`. Its focused background is the content's sliding highlight, so outside `SelectContent` an item shows only its focused text colour.

### SelectSeparator

Visual separator between items. Renders a styled `<div>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |

### SelectScrollUpButton / SelectScrollDownButton

Scroll navigation buttons that appear when content overflows the viewport.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names |

### MotionSelect

Same props as `Select`. Wraps the root with motion state management for enter/exit animations. Required when using `MotionSelectContent`.

### MotionSelectContent

Same props as `SelectContent`, with the same sliding highlight. Adds a `scaleIn` enter/exit animation (fade, scale, and blur) with a `springBouncy` transition, mounted and unmounted via `useMotionRoot`/`useMotionMount` for exit-animation support. Must be used with `MotionSelect` root. Requires the `motion` package.

### MotionSelectTrigger

Same props as `SelectTrigger`. Wraps the trigger with `whileTap` press feedback (scale 0.97). Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ISelectTriggerProps` | - | All props from `SelectTrigger` are supported |