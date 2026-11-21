```tsx title="components/combobox-1.tsx"
// import from your project: import Demo from '@/components/combobox-1'
'use client'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@gentleduck/registry-ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

const frameworks = [
  {
    label: 'Next.js',
    value: 'next.js',
  },
  {
    label: 'SvelteKit',
    value: 'sveltekit',
  },
  {
    label: 'Nuxt.js',
    value: 'nuxt.js',
  },
  {
    label: 'Remix',
    value: 'remix',
  },
  {
    label: 'Astro',
    value: 'astro',
  },
]

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button aria-expanded={open} className="w-[230px] justify-between" role="combobox" variant="outline">
          {value ? frameworks.find((framework) => framework.value === value)?.label : 'Select framework...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[230px] min-w-auto p-0">
        <Command>
          <CommandInput className="h-9" placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                  value={framework.value}>
                  {framework.label}
                  <Check className={cn('ms-auto', value === framework.value ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

## Philosophy

Comboboxes solve the "too many options" problem  -  they combine a text input with a filterable dropdown. Compose `Popover` and `Command` by hand for full control, or use `Combobox`, which composes them for you: it keeps the value, shows the picked items' labels in the trigger, and picks one item or many.

## How It's Built

## Installation

The Combobox is built using a composition of the `<Popover />` and the `<Command />` components.

See installation instructions for the [Popover](/duck-ui/components/popover#installation) and the [Command](/duck-ui/components/command#installation) components.

## Usage

```tsx showLineNumbers
// components/example-combobox.tsx
"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

export function ExampleCombobox() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select framework..."}
          <ChevronsUpDownIcon className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "me-2 h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

The `Combobox` component (`@/components/ui/combobox`) does this composition for you. It takes item `value`s for `value`, `defaultValue` and `onValueChange`, and shows each item's `label`.

## Examples

### Combobox

```tsx title="components/combobox-2.tsx"
// import from your project: import Demo from '@/components/combobox-2'
'use client'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@gentleduck/registry-ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

const frameworks = [
  {
    label: 'Next.js',
    value: 'next.js',
  },
  {
    label: 'SvelteKit',
    value: 'sveltekit',
  },
  {
    label: 'Nuxt.js',
    value: 'nuxt.js',
  },
  {
    label: 'Remix',
    value: 'remix',
  },
  {
    label: 'Astro',
    value: 'astro',
  },
]
export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button aria-expanded={open} className="w-[230px] justify-between" role="combobox" variant="outline">
          {value ? frameworks.find((framework) => framework.value === value)?.label : 'Select framework...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[230px] min-w-auto p-0">
        <Command>
          <CommandInput className="h-9" placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                  value={framework.value}>
                  {framework.label}
                  <Check className={cn('ms-auto', value === framework.value ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

### Popover

```tsx title="components/combobox-3.tsx"
// import from your project: import Demo from '@/components/combobox-3'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@gentleduck/registry-ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import * as React from 'react'

type Status = {
  value: string
  label: string
}
const statuses: Status[] = [
  {
    label: 'Backlog',
    value: 'backlog',
  },
  {
    label: 'Todo',
    value: 'todo',
  },
  {
    label: 'In Progress',
    value: 'in progress',
  },
  {
    label: 'Done',
    value: 'done',
  },
  {
    label: 'Canceled',
    value: 'canceled',
  },
]
export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(null)
  return (
    <div className="flex items-center space-x-4">
      <p className="text-muted-foreground text-sm">Status</p>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button className="w-[150px] justify-start" variant="outline">
            {selectedStatus ? selectedStatus.label : '+ Set status'}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="w-[210px] min-w-auto p-0">
          <Command>
            <CommandInput placeholder="Change status..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status.value}
                    onSelect={(value) => {
                      setSelectedStatus(statuses.find((priority) => priority.value === value) || null)
                      setOpen(false)
                    }}
                    value={status.value}>
                    {status.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

### Dropdown menu

```tsx title="components/combobox-4.tsx"
// import from your project: import Demo from '@/components/combobox-4'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@gentleduck/registry-ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'

const labels = ['feature', 'bug', 'enhancement', 'documentation', 'design', 'question', 'maintenance']
export default function Demo() {
  const [label, setLabel] = React.useState('feature')
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex w-full flex-col items-start justify-between rounded-md border px-4 py-3 sm:flex-row sm:items-center">
      <p className="font-medium text-sm leading-none">
        <span className="me-2 rounded-lg bg-primary px-2 py-1 text-primary-foreground text-xs">{label}</span>
        <span className="text-muted-foreground">Create a new project</span>
      </p>
      <DropdownMenu onOpenChange={setOpen} open={open}>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost">
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>Assign to...</DropdownMenuItem>
            <DropdownMenuItem>Set due date...</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Apply label</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-0">
                <Command>
                  <CommandInput autoFocus={true} className="h-9" placeholder="Filter label..." />
                  <CommandList>
                    <CommandEmpty>No label found.</CommandEmpty>
                    <CommandGroup>
                      {labels.map((label) => (
                        <CommandItem
                          key={label}
                          onSelect={(value) => {
                            setLabel(value)
                            setOpen(false)
                          }}
                          value={label}>
                          {label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Delete
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```

### Responsive

You can create a responsive combobox by using the `<Popover />` on desktop and the `<Drawer />` components on mobile.

```tsx title="components/combobox-5.tsx"
// import from your project: import Demo from '@/components/combobox-5'
'use client'

import { useMediaQuery } from '@gentleduck/hooks/use-media-query'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@gentleduck/registry-ui/command'
import { Drawer, DrawerContent, DrawerTrigger } from '@gentleduck/registry-ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import * as React from 'react'

type Status = {
  value: string
  label: string
}

const statuses: Status[] = [
  {
    label: 'Backlog',
    value: 'backlog',
  },
  {
    label: 'Todo',
    value: 'todo',
  },
  {
    label: 'In Progress',
    value: 'in progress',
  },
  {
    label: 'Done',
    value: 'done',
  },
  {
    label: 'Canceled',
    value: 'canceled',
  },
]

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(null)

  if (isDesktop) {
    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button className="w-[200px] justify-start" variant="outline">
            {selectedStatus ? selectedStatus.label : '+ Set status'}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-[200px] min-w-auto p-0">
          <StatusList setOpen={setOpen} setSelectedStatus={setSelectedStatus} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button className="w-[200px] justify-start" variant="outline">
          {selectedStatus ? selectedStatus.label : '+ Set status'}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <StatusList setOpen={setOpen} setSelectedStatus={setSelectedStatus} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function StatusList({
  setOpen,
  setSelectedStatus,
}: {
  setOpen: (open: boolean) => void
  setSelectedStatus: (status: Status | null) => void
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter status..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {statuses.map((status) => (
            <CommandItem
              key={status.value}
              onSelect={(value) => {
                setSelectedStatus(statuses.find((priority) => priority.value === value) || null)
                setOpen(false)
              }}
              value={status.value}>
              {status.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
```

### Form

```tsx title="components/combobox-6.tsx"
// import from your project: import Demo from '@/components/combobox-6'
'use client'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@gentleduck/registry-ui/command'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const languages = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese', value: 'zh' },
] as const

const FormSchema = z.object({
  language: z.string({
    error: 'Please select a language.',
  }),
})

export default function Demo() {
  const [open, setOpen] = useState(false)
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
    <form className="w-full space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="language"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-combobox-language">Language</FieldLabel>
              <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger asChild>
                  <Button
                    className={cn('w-[400px] justify-between', !field.value && 'text-muted-foreground')}
                    id="form-rhf-combobox-language"
                    role="combobox"
                    aria-expanded={open}
                    aria-invalid={fieldState.invalid}
                    variant="outline">
                    {field.value
                      ? languages.find((language) => language.value === field.value)?.label
                      : 'Select language'}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] min-w-auto p-0 [&>div]:max-w-full">
                  <Command>
                    <CommandInput className="h-9" placeholder="Search framework..." />
                    <CommandList>
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        {languages.map((language) => (
                          <CommandItem
                            key={language.value}
                            onSelect={() => {
                              field.onChange(language.value)
                              setOpen(false)
                            }}
                            value={language.label}>
                            {language.label}
                            <Check
                              className={cn('ms-auto', language.value === field.value ? 'opacity-100' : 'opacity-0')}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FieldDescription>This is the language that will be used in the dashboard.</FieldDescription>
              {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Combobox component

`Combobox` takes the `items` and a function that renders a `ComboboxItem` for each. It keeps the value itself, or takes `value` and `onValueChange`, and shows the picked item's label in the trigger. A pick closes the popover, and picking the picked item again clears the value to an empty string.

```tsx title="components/combobox-9.tsx"
// import from your project: import Demo from '@/components/combobox-9'
'use client'

import { Combobox, ComboboxItem } from '@gentleduck/registry-ui/combobox'
import * as React from 'react'

const frameworks = [
  { label: 'Next.js', value: 'next.js' },
  { label: 'SvelteKit', value: 'sveltekit' },
  { label: 'Nuxt.js', value: 'nuxt.js' },
  { label: 'Remix', value: 'remix' },
  { label: 'Astro', value: 'astro' },
]

export default function Demo() {
  const [framework, setFramework] = React.useState('')

  return (
    <div className="flex flex-col items-center gap-3">
      <Combobox
        commandEmpty="No framework found."
        commandInput={{ placeholder: 'Search framework...' }}
        commandTriggerPlaceholder="Select framework..."
        items={frameworks}
        onValueChange={setFramework}
        popoverTrigger={{ className: 'w-57.5 justify-start', variant: 'outline' }}
        value={framework}>
        {(items) => items.map((item) => <ComboboxItem item={item} key={item.value} />)}
      </Combobox>
      <p className="text-muted-foreground text-sm">{framework ? `Value: ${framework}` : 'Nothing picked.'}</p>
    </div>
  )
}
```

### Multiple

`type="multiple"` picks any number of items and keeps the popover open while it does. The trigger shows each pick as a badge after the trigger's own `children`, and folds them into a count past two. `ComboboxGroup` puts a heading over the items.

```tsx title="components/combobox-10.tsx"
// import from your project: import Demo from '@/components/combobox-10'
'use client'

import { Combobox, ComboboxGroup, ComboboxItem } from '@gentleduck/registry-ui/combobox'
import { PlusCircle } from 'lucide-react'

const statuses = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Todo', value: 'todo' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Done', value: 'done' },
  { label: 'Canceled', value: 'canceled' },
]

export default function Demo() {
  return (
    <Combobox
      commandInput={{ placeholder: 'Status' }}
      commandTriggerPlaceholder=""
      defaultValue={['todo', 'in-progress']}
      items={statuses}
      popoverContent={{ className: 'w-50' }}
      popoverTrigger={{
        children: (
          <>
            <PlusCircle aria-hidden="true" />
            Status
          </>
        ),
        size: 'sm',
      }}
      type="multiple">
      {(items) => (
        <ComboboxGroup heading="Status">
          {items.map((item) => (
            <ComboboxItem item={item} key={item.value} />
          ))}
        </ComboboxGroup>
      )}
    </Combobox>
  )
}
```

### No search, a controlled popover

```tsx title="components/combobox-11.tsx"
// import from your project: import Demo from '@/components/combobox-11'
'use client'

import { Combobox, ComboboxItem } from '@gentleduck/registry-ui/combobox'
import * as React from 'react'

const sizes = [
  { label: 'Small', value: 's' },
  { label: 'Medium', value: 'm' },
  { label: 'Large', value: 'l' },
]

export default function Demo() {
  const [value, setValue] = React.useState('m')
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col items-center gap-3">
      <Combobox
        command={{ loop: true }}
        commandTriggerPlaceholder="Pick a size"
        items={sizes}
        onValueChange={setValue}
        popover={{ onOpenChange: setOpen, open }}
        showSelected={false}
        value={value}
        withSearch={false}>
        {(items) => items.map((item) => <ComboboxItem item={item} key={item.value} />)}
      </Combobox>
      <p className="text-muted-foreground text-sm">
        No search box for three items, the trigger keeps its placeholder, and the popover is {open ? 'open' : 'closed'}.
        Picked: {value || 'nothing'}.
      </p>
    </div>
  )
}
```

### An item checked of its own

```tsx title="components/combobox-12.tsx"
// import from your project: import Demo from '@/components/combobox-12'
'use client'

import { Combobox, ComboboxItem } from '@gentleduck/registry-ui/combobox'

const toppings = [
  { label: 'Cheese', value: 'cheese' },
  { label: 'Mushroom', value: 'mushroom' },
  { label: 'Olive', value: 'olive' },
]

export default function Demo() {
  return (
    <Combobox commandTriggerPlaceholder="Toppings" defaultValue={['mushroom']} items={toppings} type="multiple">
      {(items) =>
        items.map((item) => (
          <ComboboxItem checked={item.value === 'cheese' ? true : undefined} item={item} key={item.value} />
        ))
      }
    </Combobox>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the combobox follows. The popover content and the command list inside it get the resolved `dir` without any extra props.

```tsx title="components/combobox-7.tsx"
// import from your project: import Demo from '@/components/combobox-7'
'use client'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@gentleduck/registry-ui/command'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

const options = [
  { label: 'صفحة هبوط', value: 'landing' },
  { label: 'لوحة تحكم', value: 'dashboard' },
  { label: 'متجر إلكتروني', value: 'ecommerce' },
  { label: 'مدونة', value: 'blog' },
  { label: 'معرض أعمال', value: 'portfolio' },
  { label: 'نظام حجوزات', value: 'booking' },
]

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')

  const selectedLabel = value ? options.find((option) => option.value === value)?.label : undefined

  return (
    <DirectionProvider dir="rtl">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button aria-expanded={open} className="w-57.5 justify-between" role="combobox" variant="outline">
            {selectedLabel ?? 'اختر نوع المشروع...'}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-57.5 min-w-auto p-0">
          <Command>
            <CommandInput className="h-9" placeholder="ابحث عن نوع المشروع..." />
            <CommandList>
              <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? '' : currentValue)
                      setOpen(false)
                    }}
                    value={option.value}>
                    {option.label}
                    <Check className={cn('ms-auto', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionCombobox` and `MotionComboboxItem` for motion-powered popover and checkbox animations. The trigger uses `MotionButton`, the dropdown uses `MotionPopoverContent`, and each item's checkbox bounces on toggle. Pass each `MotionComboboxItem` its `index` to stagger their entrance.

```tsx title="components/combobox-8.tsx"
// import from your project: import Demo from '@/components/combobox-8'
'use client'

import { MotionCombobox, MotionComboboxItem } from '@gentleduck/registry-ui/combobox'

const frameworks = [
  { label: 'Next.js', value: 'next.js' },
  { label: 'SvelteKit', value: 'sveltekit' },
  { label: 'Nuxt.js', value: 'nuxt.js' },
  { label: 'Remix', value: 'remix' },
  { label: 'Astro', value: 'astro' },
]

export default function Demo() {
  return (
    <MotionCombobox
      commandEmpty="No framework found."
      commandInput={{ placeholder: 'Search framework...' }}
      commandTriggerPlaceholder="Select frameworks..."
      items={frameworks}
      popoverTrigger={{ className: 'min-w-57.5 justify-start', variant: 'outline' }}
      type="multiple">
      {(items) => items.map((item, index) => <MotionComboboxItem index={index} item={item} key={item.value} />)}
    </MotionCombobox>
  )
}
```

}>
  Requires the `motion` package. Use `MotionCombobox` instead of `Combobox` and `MotionComboboxItem` instead of `ComboboxItem`. All other sub-components stay the same.

## API Reference

### Combobox

A combobox built on `Popover` and `Command`, picking one item or many.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `readonly { label: string; value: string }[]` | - | (required) The options. |
| `children` | `(items) => React.ReactNode` | - | (required) Render function that receives the `items` and returns the list content, such as `ComboboxItem` elements. |
| `type` | `'single' \| 'multiple'` | `'single'` | `single` picks one item and closes, and picking it again clears the value to `''`. `multiple` picks any number and stays open. |
| `value` | `string` (single) or `string[]` (multiple) | - | Controlled value, `''` when a single combobox has nothing picked. |
| `defaultValue` | `string` (single) or `string[]` (multiple) | - | Value to start from when uncontrolled. |
| `onValueChange` | `(value: string) => void` (single) or `(value: string[]) => void` (multiple) | - | Called with the new value on each pick. |
| `withSearch` | `boolean` | `true` | Whether to show the search input inside the command list. |
| `showSelected` | `boolean` | `true` | Whether to show the picked items' labels in the trigger. In multiple mode, more than 2 are collapsed into a "+N Selected" badge. |
| `commandTriggerPlaceholder` | `string` | `'Select item...'` | Placeholder text shown in the trigger button when no value is selected. |
| `commandEmpty` | `string` | `'Nothing found.'` | Text shown inside the command list when no results match the search query. |
| `popover` | `React.ComponentPropsWithoutRef<typeof Popover>` | - | Props spread onto the root `Popover`. Its `open`, `defaultOpen` and `onOpenChange` control the popover, which a single pick closes. |
| `popoverTrigger` | `React.ComponentPropsWithoutRef<typeof Button>` | - | Props spread onto the trigger `Button`. The `variant` defaults to `'dashed'` when not provided. |
| `popoverContent` | `React.ComponentPropsWithoutRef<typeof PopoverContent>` | - | Props spread onto `PopoverContent`. `className` is merged with the default `'w-(--gentleduck-popover-trigger-width) p-0'`. |
| `command` | `React.ComponentPropsWithoutRef<typeof Command>` | - | Props spread onto the inner `Command` component. |
| `commandInput` | `React.ComponentPropsWithoutRef<typeof CommandInput>` | - | Props spread onto `CommandInput` when `withSearch` is `true`. `className` is merged with the default. |

### ComboboxItem

A single selectable item inside the combobox list. Renders a `CommandItem` with a `Checkbox` indicator.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `item` | `{ label: string; value: string }` | - | (required) The item object. Its `label` is displayed as text and `value` is used for selection. |
| `onSelect` | `(value: string) => void` | - | Called with the item's `value` when it is picked, after the combobox updates its value. |
| `checked` | `boolean` | - | Whether the checkbox shows as checked. Inside a `Combobox` it follows the combobox's value unless given. |
| `...props` | `Omit<React.ComponentPropsWithoutRef<typeof CommandItem>, 'onSelect'>` | - | Additional props inherited from `CommandItem` (excluding `onSelect`). |

### ComboboxGroup

A convenience wrapper around `CommandGroup` for grouping combobox items.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | (required) `ComboboxItem` elements or other content to render inside the group. |
| `...props` | `React.ComponentPropsWithoutRef<typeof CommandGroup>` | - | Additional props inherited from `CommandGroup`. |

### MotionCombobox

Uses `MotionButton` for the trigger and `MotionPopoverContent` for the dropdown with spring enter/exit animations. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ComboboxProps` | - | All props from `Combobox` are supported |

### MotionComboboxItem

Uses `MotionCheckbox` with bounce animation on toggle. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | - | Stagger delay index for entrance animation |
| `...props` | `ComboboxItemProps` | - | All props from `ComboboxItem` are supported |