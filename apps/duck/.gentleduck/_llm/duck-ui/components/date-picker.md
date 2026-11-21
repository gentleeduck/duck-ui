```tsx title="components/date-picker-1.tsx"
// import from your project: import Demo from '@/components/date-picker-1'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1" htmlFor="date">
        Date of birth
      </Label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button className="w-48 justify-between font-normal" id="date" variant="outline">
            {date ? date.toLocaleDateString() : 'Select date'}
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-auto p-0">
          <Calendar
            showDropdowns={false}
            mode="single"
            onSelect={(date) => {
              setDate(date ?? undefined)
              requestAnimationFrame(() => setOpen(false))
            }}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

## Philosophy

Date picking is a composition problem, not a component problem. A date picker is just a Calendar inside a Popover triggered by a Button  -  three components you already have. We document it as a pattern rather than shipping a dedicated component because the "right" date picker varies wildly by use case (single date, range, date-time, with presets).

## How It's Built

## Installation

The Date Picker is built using a composition of the `<Popover />` and the `<Calendar />` components.

See installation instructions for the [Popover](/duck-ui/components/popover#installation) and the [Calendar](/duck-ui/components/calendar#installation) components.

## Usage

```tsx showLineNumbers title="components/example-date-picker.tsx"
"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerDemo() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1" htmlFor="date">
        Date of birth
      </Label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button className="w-48 justify-between font-normal" id="date" variant="outline">
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            onSelect={(date) => {
              setDate(date)
              setOpen(false)
            }}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

See the [@gentleduck/calendar](/duck-calendar) documentation for more information on the headless calendar engine.

## Examples

### Date of Birth Picker

```tsx title="components/date-picker-2.tsx"
// import from your project: import Demo from '@/components/date-picker-2'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { ChevronDownIcon, XIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1" htmlFor="date-preselected">
        Event date
      </Label>
      <div className="flex items-center gap-2">
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button className="w-48 justify-between font-normal" id="date-preselected" variant="outline">
              {date ? date.toLocaleDateString() : 'Select date'}
              <ChevronDownIcon aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-auto p-0">
            <Calendar
              showDropdowns={false}
              mode="single"
              onSelect={(date) => {
                setDate(date ?? undefined)
                requestAnimationFrame(() => setOpen(false))
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
        {date && (
          <Button variant="ghost" size="icon" aria-label="Clear date" onClick={() => setDate(undefined)}>
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
```

### Picker with Input

```tsx title="components/date-picker-3.tsx"
// import from your project: import Demo from '@/components/date-picker-3'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !Number.isNaN(date.getTime())
}

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(new Date('2025-06-01'))
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [value, setValue] = React.useState(formatDate(date))

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1" htmlFor="date">
        Subscription Date
      </Label>
      <div className="relative flex gap-2">
        <Input
          className="bg-background pe-10"
          id="date"
          onChange={(e) => {
            const date = new Date(e.currentTarget.value)
            setValue(e.currentTarget.value)
            if (isValidDate(date)) {
              setDate(date)
              setMonth(date)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
          placeholder="June 01, 2025"
          value={value}
        />
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              className="absolute end-1 top-1/2 h-fit w-2 -translate-y-1/2 p-1 px-1.5 [&_svg]:w-4"
              id="date-picker"
              variant="ghost">
              <CalendarIcon />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" side="top" sideOffset={10}>
            <Calendar
              showDropdowns={false}
              mode="single"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date ?? undefined)
                setValue(formatDate(date ?? undefined))
                requestAnimationFrame(() => setOpen(false))
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
```

### Date and Time Picker

```tsx title="components/date-picker-4.tsx"
// import from your project: import Demo from '@/components/date-picker-4'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label className="px-1" htmlFor="date-picker">
          Date
        </Label>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button className="w-34 justify-between font-normal" id="date-picker" variant="outline">
              {date ? date.toLocaleDateString() : 'Select date'}
              <ChevronDownIcon aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-0">
            <Calendar
              showDropdowns={false}
              mode="single"
              onSelect={(date) => {
                setDate(date ?? undefined)
                requestAnimationFrame(() => setOpen(false))
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex w-34 flex-col gap-3">
        <Label className="px-1" htmlFor="time-picker">
          Time
        </Label>
        <Input
          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          defaultValue="10:30:00"
          id="time-picker"
          step="1"
          type="time"
        />
      </div>
    </div>
  )
}
```

### Natural Language Picker

This component uses the `chrono-node` library to parse natural language dates.

```tsx title="components/date-picker-5.tsx"
// import from your project: import Demo from '@/components/date-picker-5'
'use client'

import { parseDate } from '@gentleduck/libs/parse-date'
import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('In 2 days')
  const [date, setDate] = React.useState<Date | undefined>(parseDate(value) || undefined)
  const [month, setMonth] = React.useState<Date | undefined>(date)

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1" htmlFor="date">
        Schedule Date
      </Label>
      <div className="relative flex gap-2">
        <Input
          className="bg-background pe-10"
          id="date"
          onChange={(e) => {
            setValue(e.currentTarget.value)
            const date = parseDate(e.currentTarget.value)
            if (date) {
              setDate(date)
              setMonth(date)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
          placeholder="Tomorrow or next week"
          value={value}
        />
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              className="absolute end-1 top-1/2 h-fit w-2 -translate-y-1/2 p-1 px-1.5 [&_svg]:w-4"
              id="date-picker"
              variant="default">
              <CalendarIcon />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-auto p-0">
            <Calendar
              showDropdowns={false}
              mode="single"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date ?? undefined)
                setValue(formatDate(date ?? undefined))
                requestAnimationFrame(() => setOpen(false))
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="px-1 text-muted-foreground text-sm">
        Your post will be published on <span className="font-medium">{formatDate(date)}</span>.
      </div>
    </div>
  )
}
```

### Date of Birth Picker (with dropdowns)

```tsx title="components/calendar-5.tsx"
// import from your project: import Demo from '@/components/calendar-5'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1" htmlFor="date">
        Date of birth
      </Label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button className="w-48 justify-between font-normal" id="date" variant="outline">
            {date ? date.toLocaleDateString() : 'Select date'}
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" className="w-auto p-0">
          <Calendar
            mode="single"
            yearRange={{ from: 1920, to: new Date().getFullYear() }}
            onSelect={(date) => {
              setDate(date)
              requestAnimationFrame(() => setOpen(false))
            }}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

### Date and Time Picker

```tsx title="components/calendar-6.tsx"
// import from your project: import Demo from '@/components/calendar-6'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | null>(null)

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label className="px-1" htmlFor="date-picker">
          Date
        </Label>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button className="w-34 justify-between font-normal" id="date-picker" variant="outline">
              {date ? date.toLocaleDateString() : 'Select date'}
              <ChevronDownIcon aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-0">
            <Calendar
              showDropdowns={false}
              mode="single"
              onSelect={(date) => {
                setDate(date)
                requestAnimationFrame(() => setOpen(false))
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label className="px-1" htmlFor="time-picker">
          Time
        </Label>
        <Input
          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          defaultValue="10:30:00"
          id="time-picker"
          step="1"
          type="time"
        />
      </div>
    </div>
  )
}
```

### Natural Language Picker

```tsx title="components/calendar-7.tsx"
// import from your project: import Demo from '@/components/calendar-7'
'use client'

import { parseDate } from '@gentleduck/libs/parse-date'
import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('In 2 days')
  const [date, setDate] = React.useState<Date | null>(parseDate(value) || null)
  const [month, setMonth] = React.useState<Date | undefined>(date ?? undefined)

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1" htmlFor="date">
        Schedule Date
      </Label>
      <div className="relative flex gap-2">
        <Input
          className="bg-background pe-10"
          id="date"
          onChange={(e) => {
            setValue(e.currentTarget.value)
            const date = parseDate(e.currentTarget.value)
            if (date) {
              setDate(date)
              setMonth(date)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
          placeholder="Tomorrow or next week"
          value={value}
        />
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              variant="nothing"
              className="absolute end-1 top-1/2 h-fit -translate-y-1/2 p-1 px-1.5 [&_svg]:w-4"
              id="date-picker">
              <CalendarIcon />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-auto p-0">
            <Calendar
              showDropdowns={false}
              mode="single"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date)
                setValue(formatDate(date ?? undefined))
                requestAnimationFrame(() => setOpen(false))
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="px-1 text-muted-foreground text-sm">
        Your post will be published on <span className="font-medium">{formatDate(date ?? undefined)}</span>.
      </div>
    </div>
  )
}
```

### Form Integration

```tsx title="components/calendar-8.tsx"
// import from your project: import Demo from '@/components/calendar-8'
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
```

```tsx title="components/date-picker-6.tsx"
// import from your project: import Demo from '@/components/date-picker-6'
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
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`). The Calendar and Popover inside follow it, including the portaled popover content.

```tsx title="components/date-picker-7.tsx"
// import from your project: import Demo from '@/components/date-picker-7'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <DirectionProvider dir="rtl">
      <div className="flex flex-col gap-3">
        <Label className="px-1" htmlFor="date">
          تاريخ الميلاد
        </Label>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button className="w-48 justify-between font-normal" id="date" variant="outline">
              {date ? date.toLocaleDateString('ar-SA-u-nu-arab') : 'اختر التاريخ'}
              <ChevronDownIcon aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-0">
            <Calendar
              locale="ar-SA"
              mode="single"
              onSelect={(d) => {
                if (d instanceof Date) setDate(d)
                requestAnimationFrame(() => setOpen(false))
              }}
              selected={date}
              showDropdowns={false}
            />
          </PopoverContent>
        </Popover>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionPopover`, `MotionPopoverContent`, and `MotionCalendar` for animated date picking. The popover enters/exits with spring animation and the calendar has directional month transitions with staggered day cells.

```tsx title="components/date-picker-8.tsx"
// import from your project: import Demo from '@/components/date-picker-8'
'use client'

import { MotionButton } from '@gentleduck/registry-ui/button'
import { MotionCalendar } from '@gentleduck/registry-ui/calendar'
import { Label } from '@gentleduck/registry-ui/label'
import { MotionPopover, MotionPopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1" htmlFor="motion-date">
        Pick a date
      </Label>
      <MotionPopover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <MotionButton className="w-48 justify-between font-normal" id="motion-date" variant="outline">
            {date ? date.toLocaleDateString() : 'Select date'}
            <ChevronDownIcon aria-hidden="true" />
          </MotionButton>
        </PopoverTrigger>
        <MotionPopoverContent side="top" align="start" className="w-auto p-0">
          <MotionCalendar
            mode="single"
            onSelect={(d) => {
              setDate(d ?? undefined)
              requestAnimationFrame(() => setOpen(false))
            }}
            selected={date}
          />
        </MotionPopoverContent>
      </MotionPopover>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionPopover` instead of `Popover`, `MotionPopoverContent` instead of `PopoverContent`, and `MotionCalendar` instead of `Calendar`.