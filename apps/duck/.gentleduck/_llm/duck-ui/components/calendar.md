```tsx title="components/calendar-1.tsx"
// import from your project: import Demo from '@/components/calendar-1'
'use client'

import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return <Calendar className="rounded-md border shadow-sm" mode="single" onSelect={setDate} selected={date} />
}
```

## Philosophy

Calendars are complex accessibility challenges disguised as simple grids. We own the calendar stack from the headless engine ([`@gentleduck/calendar`](/duck-calendar)) to this styled component. The adapter pattern lets you swap date libraries, the hook layer handles state management, and this component applies Tailwind styling via `data-*` attribute selectors.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add calendar
```

Install the following dependencies:

```bash
npm install @gentleduck/calendar @gentleduck/libs
```

Add the `Button` component to your project.

The `Calendar` uses the [`Button`](/duck-ui/components/button) variant styles for navigation. Month/year dropdowns are a self-contained virtualized list built into the component, not the shared [`Select`](/duck-ui/components/select) component.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import { Calendar } from "@/components/ui/calendar"
```

```tsx showLineNumbers
const [date, setDate] = React.useState<Date | undefined>(new Date())

return (
  <Calendar
    mode="single"
    selected={date}
    onSelect={setDate}
    className="rounded-lg border"
  />
)
```

See the [@gentleduck/calendar package docs](/duck-calendar) for more information on the headless engine, date adapters, and advanced features.

## Examples

### Date Picker (Popover)

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

### Date Picker (Input)

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

### Date Input (Natural Language)

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

### Multi-Month Range Picker

```tsx title="components/calendar-2.tsx"
// import from your project: import Demo from '@/components/calendar-2'
'use client'

import type { Selection } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const today = new Date()
  const initialFrom = new Date(today.getFullYear(), 0, 12)
  const initialTo = new Date(today.getFullYear(), 1, 11)

  const [dateRange, setDateRange] = React.useState<Selection.DateRange<Date> | null>({
    from: initialFrom,
    to: initialTo,
  })

  return (
    <Calendar
      className="rounded-md border shadow-sm"
      mode="range"
      defaultMonth={dateRange?.from}
      numberOfMonths={2}
      selected={dateRange}
      onSelect={setDateRange}
      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
      showDropdowns={false}
    />
  )
}
```

### Range Calendar

```tsx title="components/calendar-3.tsx"
// import from your project: import Demo from '@/components/calendar-3'
'use client'

import type { Selection } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [date, setDate] = React.useState<Selection.DateRange<Date> | null>(null)

  return <Calendar className="rounded-md border shadow-sm" mode="range" selected={date} onSelect={setDate} />
}
```

### Date Constraints

```tsx title="components/calendar-4.tsx"
// import from your project: import Demo from '@/components/calendar-4'
'use client'

import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())

  return (
    <Calendar
      className="rounded-md border shadow-sm"
      mode="single"
      selected={date}
      onSelect={setDate}
      fromDate={today}
      toDate={maxDate}
    />
  )
}
```

### Multi-Select

```tsx title="components/calendar-10.tsx"
// import from your project: import Demo from '@/components/calendar-10'
'use client'

import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [dates, setDates] = React.useState<Date[]>([])

  return (
    <div className="space-y-4">
      <Calendar className="rounded-md border shadow-sm" mode="multi" selected={dates} onSelect={setDates} />
      <p className="text-muted-foreground text-sm">
        {dates.length} date{dates.length !== 1 ? 's' : ''} selected
      </p>
    </div>
  )
}
```

### Event Calendar

```tsx title="components/calendar-11.tsx"
// import from your project: import Demo from '@/components/calendar-11'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

const adapter = new NativeAdapter()

const EVENTS: Record<string, { title: string; color: string }[]> = {
  '2026-2-15': [
    { title: 'Team standup', color: '#3b82f6' },
    { title: 'Design review', color: '#8b5cf6' },
  ],
  '2026-2-18': [
    { title: 'Sprint planning', color: '#f59e0b' },
    { title: '1:1 with manager', color: '#10b981' },
  ],
  '2026-2-20': [{ title: 'Product launch', color: '#ef4444' }],
  '2026-2-25': [
    { title: 'Team retrospective', color: '#3b82f6' },
    { title: 'All-hands meeting', color: '#8b5cf6' },
    { title: 'Stakeholder demo', color: '#f59e0b' },
  ],
}

function getKey(d: Date) {
  return `${adapter.getYear(d)}-${adapter.getMonth(d)}-${adapter.getDate(d)}`
}

function getEvents(d: Date) {
  return EVENTS[getKey(d)] ?? []
}

export default function Demo() {
  const [selected, setSelected] = React.useState<Date | null>(new Date())
  const selectedEvents = selected ? getEvents(selected) : []

  return (
    <div className="flex gap-6">
      <Calendar
        className="rounded-md border shadow-sm"
        mode="single"
        selected={selected}
        onSelect={setSelected}
        fixedWeeks
        showDropdowns
        renderDay={(day, children) => {
          const events = getEvents(day.date)
          if (events.length === 0) return children
          return (
            <span className="flex flex-col items-center gap-0.5">
              {children}
              <span className="flex gap-0.5">
                {events.slice(0, 3).map((e) => (
                  <span key={e.title} className="size-1 rounded-full" style={{ backgroundColor: e.color }} />
                ))}
              </span>
            </span>
          )
        }}
      />
      <div className="min-w-[200px] space-y-2">
        <h3 className="font-semibold text-sm">
          {selected?.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </h3>
        {selectedEvents.length > 0 ? (
          <ul className="space-y-1">
            {selectedEvents.map((event) => (
              <li key={event.title} className="flex items-center gap-2 text-sm">
                <span className="size-2 rounded-full" style={{ backgroundColor: event.color }} />
                {event.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No events</p>
        )}
      </div>
    </div>
  )
}
```

### Custom Cell Size

```tsx title="components/calendar-14.tsx"
// import from your project: import Demo from '@/components/calendar-14'
'use client'

import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return (
    <Calendar
      className="rounded-md border shadow-sm [--gentleduck-calendar-cell:--spacing(12)]"
      mode="single"
      selected={date}
      onSelect={setDate}
      fixedWeeks
      showDropdowns={false}
    />
  )
}
```

### Click to View Events (Popover)

```tsx title="components/calendar-15.tsx"
// import from your project: import Demo from '@/components/calendar-15'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

const adapter = new NativeAdapter()

const EVENTS: Record<string, { title: string; time: string; color: string }[]> = {
  '2026-3-5': [
    { title: 'Team standup', time: '9:00 AM', color: '#3b82f6' },
    { title: 'Design review', time: '2:00 PM', color: '#a855f7' },
  ],
  '2026-3-12': [{ title: 'Sprint planning', time: '10:00 AM', color: '#f59e0b' }],
  '2026-3-18': [
    { title: '1:1 with manager', time: '11:00 AM', color: '#22c55e' },
    { title: 'Product demo', time: '3:00 PM', color: '#ef4444' },
    { title: 'Team dinner', time: '7:00 PM', color: '#ec4899' },
  ],
  '2026-3-25': [{ title: 'Release day', time: '9:00 AM', color: '#f97316' }],
}

function getKey(d: Date) {
  return `${adapter.getYear(d)}-${adapter.getMonth(d) + 1}-${adapter.getDate(d)}`
}

function getEvents(d: Date) {
  return EVENTS[getKey(d)] ?? []
}

export default function Demo() {
  const [selected, setSelected] = React.useState<Date | null>(null)
  const [popoverDate, setPopoverDate] = React.useState<Date | null>(null)
  const calendarRef = React.useRef<HTMLDivElement>(null)
  const [popoverPos, setPopoverPos] = React.useState<{ top: number; left: number } | null>(null)
  const popoverEvents = popoverDate ? getEvents(popoverDate) : []

  const openPopover = React.useCallback((date: Date) => {
    if (!calendarRef.current) return
    const calendarRect = calendarRef.current.getBoundingClientRect()
    const cellButton = calendarRef.current.querySelector(
      `button[data-day="${date.toLocaleDateString()}"]`,
    ) as HTMLElement | null
    if (!cellButton) return
    const cellRect = cellButton.getBoundingClientRect()
    setPopoverPos({
      top: cellRect.bottom - calendarRect.top + 4,
      left: cellRect.left - calendarRect.left + cellRect.width / 2,
    })
    setPopoverDate(date)
  }, [])

  React.useEffect(() => {
    if (!popoverDate) return
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (target.closest('[data-slot="event-popover"]')) return
      if (target.closest('[data-slot="calendar"]')) return
      setPopoverDate(null)
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setPopoverDate(null)
    }
    document.addEventListener('pointerdown', handleClick, true)
    document.addEventListener('keydown', handleEscape, true)
    return () => {
      document.removeEventListener('pointerdown', handleClick, true)
      document.removeEventListener('keydown', handleEscape, true)
    }
  }, [popoverDate])

  return (
    <div className="relative">
      <Calendar
        ref={calendarRef}
        className="rounded-md border shadow-sm"
        mode="single"
        defaultMonth={new Date(2026, 2, 1)}
        selected={selected}
        showDropdowns={false}
        onSelect={(date) => {
          setSelected(date as Date | null)
          if (date && getEvents(date as Date).length > 0) {
            openPopover(date as Date)
          } else {
            setPopoverDate(null)
          }
        }}
        renderDay={(day, children) => {
          const events = getEvents(day.date)
          if (events.length === 0) return children
          return (
            <span className="flex flex-col items-center gap-0.5">
              {children}
              <span className="flex gap-0.5">
                {events.slice(0, 3).map((event) => (
                  <span key={event.title} className="size-1 rounded-full" style={{ backgroundColor: event.color }} />
                ))}
              </span>
            </span>
          )
        }}
      />
      <div
        data-slot="event-popover"
        data-state={popoverDate ? 'open' : 'closed'}
        className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 absolute z-50 w-auto -translate-x-1/2 rounded-md border bg-popover p-3 text-popover-foreground shadow-md transition-all transition-discrete duration-150 ease-(--gentleduck-motion-ease) data-[state=closed]:hidden data-[state=closed]:animate-out data-[state=open]:animate-in"
        style={popoverPos ? { top: popoverPos.top, left: popoverPos.left } : undefined}>
        {popoverDate && (
          <>
            <p className="mb-2 whitespace-nowrap font-medium text-sm">
              {popoverDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="space-y-1.5">
              {popoverEvents.map((event) => (
                <div key={event.title} className="flex items-center gap-2 whitespace-nowrap text-sm">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: event.color }} />
                  <span className="font-medium">{event.title}</span>
                  <span className="text-muted-foreground">{event.time}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

### Booked Dates (Strikethrough)

```tsx title="components/calendar-16.tsx"
// import from your project: import Demo from '@/components/calendar-16'
'use client'

import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

const BOOKED_DAYS = [3, 4, 10, 11, 17, 24, 25]

function thisMonthsDates() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  return {
    today: new Date(year, month, now.getDate()),
    thisMonth: new Date(year, month, 1),
    booked: BOOKED_DAYS.map((day) => new Date(year, month, day)),
  }
}

export default function Demo() {
  const [{ today, thisMonth, booked }] = React.useState(thisMonthsDates)
  const [date, setDate] = React.useState<Date | null>(null)

  return (
    <Calendar
      className="rounded-md border shadow-sm"
      mode="single"
      defaultMonth={thisMonth}
      selected={date}
      onSelect={setDate}
      unavailable={booked}
      fromDate={today}
      showDropdowns={false}
      renderFooter={() => (
        <div className="flex items-center gap-4 px-0 pt-2 text-muted-foreground text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            Available
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/30" />
            <span className="line-through">Booked</span>
          </div>
        </div>
      )}
    />
  )
}
```

### Booking Calendar

```tsx title="components/calendar-12.tsx"
// import from your project: import Demo from '@/components/calendar-12'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

const adapter = new NativeAdapter()

const BOOKED_DATES = [
  new Date(2026, 2, 19),
  new Date(2026, 2, 20),
  new Date(2026, 2, 21),
  new Date(2026, 2, 26),
  new Date(2026, 2, 27),
]

function isBooked(date: Date): boolean {
  return BOOKED_DATES.some((d) => adapter.isSameDay(d, date))
}

export default function Demo() {
  const [selected, setSelected] = React.useState<Date | null>(null)
  const today = new Date()

  return (
    <div className="space-y-4">
      <Calendar
        className="rounded-md border shadow-sm"
        mode="single"
        selected={selected}
        onSelect={setSelected}
        disabled={isBooked}
        fromDate={today}
        fixedWeeks
      />
      {selected ? (
        <div className="rounded-md border bg-muted/50 p-3 text-sm">
          <p className="font-medium">Booking confirmed</p>
          <p className="text-muted-foreground">
            {selected.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Select an available date to book</p>
      )}
    </div>
  )
}
```

### Multi-Range Selection

```tsx title="components/calendar-13.tsx"
// import from your project: import Demo from '@/components/calendar-13'
'use client'

import type { Selection } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [ranges, setRanges] = React.useState<Selection.DateRange<Date>[]>([])

  return (
    <div className="space-y-4">
      <Calendar
        className="rounded-md border shadow-sm"
        mode="multi-range"
        selected={ranges}
        onSelect={setRanges}
        showDropdowns={false}
      />
      <div className="space-y-1 px-1">
        <p className="font-medium text-sm">
          {ranges.filter((r) => r.to !== null).length} range
          {ranges.filter((r) => r.to !== null).length !== 1 ? 's' : ''} selected
        </p>
        {ranges
          .filter((r) => r.to !== null)
          .map((r, i) => (
            <div key={r.from.getTime()} className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>
                {r.from.toLocaleDateString()} - {r.to?.toLocaleDateString()}
              </span>
              <button
                type="button"
                className="text-destructive text-xs hover:underline"
                onClick={() => setRanges((prev) => prev.filter((_, j) => j !== i))}>
                remove
              </button>
            </div>
          ))}
      </div>
    </div>
  )
}
```

### Multi-Range with Shift+Click

```tsx title="components/calendar-24.tsx"
// import from your project: import Demo from '@/components/calendar-24'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { XIcon } from 'lucide-react'
import * as React from 'react'

const adapter = new NativeAdapter()

function daysBetween(a: Date, b: Date): Date[] {
  const start = adapter.isBefore(a, b) ? a : b
  const end = adapter.isBefore(a, b) ? b : a
  const days: Date[] = []
  for (let d = adapter.fromDate(start); !adapter.isAfter(d, end); d = adapter.addDays(d, 1)) {
    days.push(d)
  }
  return days
}

function hasDate(dates: Date[], target: Date) {
  return dates.some((d) => adapter.isSameDay(d, target))
}

function getPosition(dates: Date[], target: Date) {
  if (!hasDate(dates, target)) return 'none' as const
  const hasPrev = hasDate(dates, adapter.addDays(target, -1))
  const hasNext = hasDate(dates, adapter.addDays(target, 1))
  if (hasPrev && hasNext) return 'middle' as const
  if (hasPrev) return 'end' as const
  if (hasNext) return 'start' as const
  return 'single' as const
}

const MS_PER_DAY = 86_400_000

function getRanges(dates: Date[]): { from: Date; to: Date }[] {
  if (dates.length === 0) return []
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
  const ranges: { from: Date; to: Date }[] = []
  const first = sorted[0]
  if (!first) return []
  let from = first
  let to = first
  for (let i = 1; i < sorted.length; i++) {
    const d = sorted[i]
    if (!d) continue
    if (d.getTime() - to.getTime() <= MS_PER_DAY) {
      to = d
    } else {
      ranges.push({ from, to })
      from = d
      to = d
    }
  }
  ranges.push({ from, to })
  return ranges
}

function findOwnerRange(ranges: { from: Date; to: Date }[], date: Date) {
  return ranges.find((r) => !adapter.isBefore(date, r.from) && !adapter.isAfter(date, r.to))
}

export default function Demo() {
  const [dates, setDates] = React.useState<Date[]>([])
  const [anchor, setAnchor] = React.useState<Date | null>(null)
  const shiftRef = React.useRef(false)

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      shiftRef.current = e.shiftKey
    }
    document.addEventListener('keydown', handler)
    document.addEventListener('keyup', handler)
    return () => {
      document.removeEventListener('keydown', handler)
      document.removeEventListener('keyup', handler)
    }
  }, [])

  const ranges = getRanges(dates)

  const removeDate = (target: Date) => setDates((prev) => prev.filter((d) => !adapter.isSameDay(d, target)))

  const removeRange = (r: { from: Date; to: Date }) => {
    const days = daysBetween(r.from, r.to)
    setDates((prev) => prev.filter((d) => !days.some((rd) => adapter.isSameDay(rd, d))))
  }

  const handleClick = (date: Date) => {
    const selected = hasDate(dates, date)
    const pos = getPosition(dates, date)
    const isShift = shiftRef.current

    if (isShift && selected && pos === 'middle') {
      const owner = findOwnerRange(ranges, date)
      if (owner) {
        const len = daysBetween(owner.from, owner.to).length
        if (len > 3) {
          removeDate(date)
          setAnchor(null)
        }
      }
      return
    }

    if (anchor && adapter.isSameDay(date, anchor)) {
      removeDate(date)
      setAnchor(null)
      return
    }

    if (selected && !isShift) {
      setAnchor(null)

      if (pos === 'start' || pos === 'end') {
        const owner = findOwnerRange(ranges, date)
        if (owner) removeRange(owner)
        return
      }

      if (pos === 'single') {
        removeDate(date)
        return
      }

      // trim middle: keep from..clicked, drop the rest
      if (pos === 'middle') {
        const owner = findOwnerRange(ranges, date)
        if (owner) {
          const toRemove = daysBetween(adapter.addDays(date, 1), owner.to)
          setDates((prev) => prev.filter((d) => !toRemove.some((rd) => adapter.isSameDay(rd, d))))
        }
        return
      }
    }

    if (anchor) {
      const range = daysBetween(anchor, date)
      setDates((prev) => {
        const merged = [...prev]
        for (const d of range) {
          if (!hasDate(merged, d)) merged.push(d)
        }
        return merged
      })
      setAnchor(null)
      return
    }

    setDates((prev) => [...prev, date])
    setAnchor(date)
  }

  return (
    <div className="flex rounded-md border shadow-sm">
      <Calendar
        className="shrink-0"
        mode="single"
        selected={null}
        showDropdowns={false}
        onSelect={(clicked) => {
          if (!clicked) return
          handleClick(clicked as Date)
        }}
        renderDay={(day, children) => {
          const pos = getPosition(dates, day.date)
          const isAnchorDay = anchor !== null && adapter.isSameDay(day.date, anchor)

          if (pos === 'none') return children

          const styles = {
            single: 'rounded-md bg-primary text-primary-foreground',
            start: 'rounded-s-md bg-primary text-primary-foreground',
            end: 'rounded-e-md bg-primary text-primary-foreground',
            middle: 'bg-accent text-accent-foreground',
          }

          return (
            <span
              className={[
                'flex size-full items-center justify-center',
                styles[pos],
                isAnchorDay && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
              ]
                .filter(Boolean)
                .join(' ')}>
              {children}
            </span>
          )
        }}
      />
      <div className="flex max-h-[340px] min-w-[180px] flex-col gap-2 border-s p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            {dates.length > 0 ? `${dates.length} day${dates.length !== 1 ? 's' : ''}` : 'No selection'}
          </h3>
          {dates.length > 0 && (
            <button
              type="button"
              className="text-muted-foreground text-xs hover:text-foreground"
              onClick={() => {
                setDates([])
                setAnchor(null)
              }}>
              Clear
            </button>
          )}
        </div>

        {ranges.length > 0 && (
          <div className="max-h-[182px] space-y-1.5 overflow-y-auto">
            {ranges.map((r) => {
              const days = daysBetween(r.from, r.to)
              const label = adapter.isSameDay(r.from, r.to)
                ? adapter.format(r.from, { month: 'short', day: 'numeric' })
                : `${adapter.format(r.from, { month: 'short', day: 'numeric' })} - ${adapter.format(r.to, { month: 'short', day: 'numeric' })}`
              return (
                <div
                  key={r.from.getTime()}
                  className="flex items-center justify-between rounded-md border bg-muted/50 px-2.5 py-1.5">
                  <div>
                    <p className="font-medium text-xs">{label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {days.length} day{days.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => removeRange(r)}>
                    <XIcon className="size-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-auto text-[11px] text-muted-foreground leading-tight">
          Click to start, click again to complete. Click start/end to remove range. Click middle to trim.{' '}
          <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">⇧</kbd> click to split.
        </p>
      </div>
    </div>
  )
}
```

### Presets

```tsx title="components/calendar-17.tsx"
// import from your project: import Demo from '@/components/calendar-17'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

const adapter = new NativeAdapter()

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
]

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())
  const [month, setMonth] = React.useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  return (
    <div className="w-fit rounded-md border shadow-sm">
      <Calendar
        className="mx-auto p-3"
        mode="single"
        selected={date}
        onSelect={setDate}
        month={month}
        onMonthChange={setMonth}
        fixedWeeks
        showDropdowns={false}
      />
      <div className="grid grid-cols-3 gap-1.5 border-t p-3">
        {PRESETS.map((preset) => (
          <Button
            key={preset.days}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              const target = adapter.addDays(adapter.today(), preset.days)
              setDate(target)
              setMonth(new Date(target.getFullYear(), target.getMonth(), 1))
            }}>
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

### Week Layout

`weekStartDay` sets the first column, `showWeekNumber` puts each week's ISO number at the start of its row, and `renderWeekday` draws the column headings. `fixedWeeks` keeps six rows in every month so the calendar does not change height as it pages, and `showOutsideDays={false}` leaves the days of the months either side blank.

```tsx title="components/calendar-26.tsx"
// import from your project: import Demo from '@/components/calendar-26'
'use client'

import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return (
    <Calendar
      className="rounded-md border shadow-sm"
      mode="single"
      selected={date}
      onSelect={setDate}
      weekStartDay={1}
      showWeekNumber
      fixedWeeks
      showOutsideDays={false}
      showDropdowns={false}
      renderWeekday={(day, index) => <span className={index >= 5 ? 'text-destructive' : undefined}>{day}</span>}
    />
  )
}
```

### Custom Header

`renderHeader` replaces the header and is handed the title, the paging handlers and whether each way is disabled.

```tsx title="components/calendar-27.tsx"
// import from your project: import Demo from '@/components/calendar-27'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return (
    <Calendar
      className="rounded-md border shadow-sm"
      mode="single"
      selected={date}
      onSelect={setDate}
      renderHeader={({ title, goToPrevMonth, goToNextMonth, isPrevDisabled, isNextDisabled }) => (
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">{title}</span>
          <div className="flex gap-1">
            <Button
              aria-label="Previous month"
              disabled={isPrevDisabled}
              onClick={goToPrevMonth}
              size="icon"
              variant="outline"
              className="size-7">
              <ChevronLeftIcon className="rtl:rotate-180" />
            </Button>
            <Button
              aria-label="Next month"
              disabled={isNextDisabled}
              onClick={goToNextMonth}
              size="icon"
              variant="outline"
              className="size-7">
              <ChevronRightIcon className="rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}
    />
  )
}
```

### Paging Every Month Shown

With `numberOfMonths`, the buttons and PageUp/PageDown move one month at a time. `pageBehavior="visible"` moves by every month shown. `buttonVariant` sets the variant of the paging buttons.

```tsx title="components/calendar-28.tsx"
// import from your project: import Demo from '@/components/calendar-28'
'use client'

import type { Selection } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [range, setRange] = React.useState<Selection.DateRange<Date> | null>(null)

  return (
    <Calendar
      className="rounded-md border shadow-sm"
      mode="range"
      numberOfMonths={2}
      pageBehavior="visible"
      buttonVariant="outline"
      selected={range}
      onSelect={setRange}
    />
  )
}
```

### Closing on Escape

`onDismiss` is called on Escape, for a calendar shown in place rather than in a popover, which closes on Escape by itself.

```tsx title="components/calendar-29.tsx"
// import from your project: import Demo from '@/components/calendar-29'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [date, setDate] = React.useState(new Date())
  const [editing, setEditing] = React.useState(false)

  return (
    <div className="flex flex-col items-start gap-3">
      <Button aria-expanded={editing} onClick={() => setEditing((open) => !open)} variant="outline">
        Due {date.toLocaleDateString()}
      </Button>
      {editing && (
        <Calendar
          className="rounded-md border shadow-sm"
          mode="single"
          defaultMonth={date}
          selected={date}
          onSelect={(picked) => {
            if (picked) setDate(picked)
            setEditing(false)
          }}
          onDismiss={() => setEditing(false)}
          showDropdowns={false}
        />
      )}
    </div>
  )
}
```

### Read-Only

`readOnly` keeps the selection and the keyboard moving, but refuses a pick.

```tsx title="components/calendar-30.tsx"
// import from your project: import Demo from '@/components/calendar-30'
'use client'

import type { Selection } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const today = new Date()
  const [stay, setStay] = React.useState<Selection.DateRange<Date> | null>({
    from: new Date(today.getFullYear(), today.getMonth(), 8),
    to: new Date(today.getFullYear(), today.getMonth(), 12),
  })
  const [locked, setLocked] = React.useState(true)

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-2">
        <Switch id="stay-locked" checked={locked} onCheckedChange={setLocked} />
        <Label htmlFor="stay-locked">Booking confirmed</Label>
      </div>
      <Calendar
        className="rounded-md border shadow-sm"
        mode="range"
        selected={stay}
        onSelect={setStay}
        readOnly={locked}
        showDropdowns={false}
      />
    </div>
  )
}
```

### Persian (Jalali) Calendar

```tsx title="components/calendar-18.tsx"
// import from your project: import Demo from '@/components/calendar-18'
'use client'

import { PersianAdapter } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import * as React from 'react'

const adapter = new PersianAdapter()

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return (
    <DirectionProvider dir="rtl">
      <Calendar
        adapter={adapter}
        className="rounded-md border shadow-sm"
        locale="fa-IR"
        mode="single"
        onSelect={setDate}
        selected={date}
        showDropdowns
        yearRange={{ from: 1380, to: 1430 }}
      />
    </DirectionProvider>
  )
}
```

### Islamic (Hijri) Calendar

```tsx title="components/calendar-19.tsx"
// import from your project: import Demo from '@/components/calendar-19'
'use client'

import { IslamicAdapter } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import * as React from 'react'

const adapter = new IslamicAdapter()

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return (
    <DirectionProvider dir="rtl">
      <Calendar
        adapter={adapter}
        className="rounded-md border shadow-sm"
        locale="ar-SA"
        mode="single"
        onSelect={setDate}
        selected={date}
        showDropdowns
        yearRange={{ from: 1400, to: 1500 }}
      />
    </DirectionProvider>
  )
}
```

### Hebrew Calendar

```tsx title="components/calendar-20.tsx"
// import from your project: import Demo from '@/components/calendar-20'
'use client'

import { HebrewAdapter } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import * as React from 'react'

const adapter = new HebrewAdapter()

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return (
    <DirectionProvider dir="rtl">
      <Calendar
        adapter={adapter}
        className="rounded-md border shadow-sm"
        locale="he-IL"
        mode="single"
        onSelect={setDate}
        selected={date}
        showDropdowns
        yearRange={{ from: 5750, to: 5810 }}
      />
    </DirectionProvider>
  )
}
```

### Hebrew Calendar (English)

```tsx title="components/calendar-21.tsx"
// import from your project: import Demo from '@/components/calendar-21'
'use client'

import { HebrewAdapter } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

const adapter = new HebrewAdapter('en-US')

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return (
    <Calendar
      adapter={adapter}
      className="rounded-md border shadow-sm"
      locale="en-US"
      mode="single"
      onSelect={setDate}
      selected={date}
      showDropdowns
      yearRange={{ from: 5750, to: 5810 }}
    />
  )
}
```

### Islamic Calendar (English)

```tsx title="components/calendar-22.tsx"
// import from your project: import Demo from '@/components/calendar-22'
'use client'

import { IslamicAdapter } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

const adapter = new IslamicAdapter('en-US')

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return (
    <Calendar
      adapter={adapter}
      className="rounded-md border shadow-sm"
      locale="en-US"
      mode="single"
      onSelect={setDate}
      selected={date}
      showDropdowns
      yearRange={{ from: 1400, to: 1500 }}
    />
  )
}
```

### Persian Calendar (English)

```tsx title="components/calendar-23.tsx"
// import from your project: import Demo from '@/components/calendar-23'
'use client'

import { PersianAdapter } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

const adapter = new PersianAdapter('en-US')

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return (
    <Calendar
      adapter={adapter}
      className="rounded-md border shadow-sm"
      locale="en-US"
      mode="single"
      onSelect={setDate}
      selected={date}
      showDropdowns
      yearRange={{ from: 1380, to: 1430 }}
    />
  )
}
```

## Notes

### Blocks

We have built a collection of 30+ calendar blocks that you can use to build your own calendar components.

See all calendar blocks in the [Blocks Library](/blocks/calendar) page.

### Migrated from react-day-picker

} tone="warning" title="Migrated from react-day-picker">
  We have replaced `react-day-picker` with our own headless calendar engine  -  [`@gentleduck/calendar`](/duck-calendar). The result is **about half the bundle** (9.7 KB vs 20.0 KB gzipped), zero external dependencies, full keyboard navigation, and complete ARIA compliance. See the [performance benchmarks](/duck-calendar#performance) for detailed comparisons.

### Date Picker

You can use the `<Calendar>` component to build a date picker. See the [Date Picker](/duck-ui/components/date-picker) page for more information.

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the calendar follows: the grid runs right-to-left, the month chevrons swap, and ArrowLeft/ArrowRight move in the direction you see. Pass `locale` for localized month names and numerals.

```tsx title="components/calendar-9.tsx"
// import from your project: import Demo from '@/components/calendar-9'
'use client'

import { Calendar } from '@gentleduck/registry-ui/calendar'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import * as React from 'react'

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return (
    <DirectionProvider dir="rtl">
      <Calendar
        className="rounded-md border shadow-sm"
        locale="ar-SA"
        mode="single"
        onSelect={setDate}
        selected={date}
      />
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionCalendar` for a mount entrance plus smooth month navigation transitions and staggered day cell entry powered by [motion](https://motion.dev). The whole calendar uses a `scaleIn` entrance (fade, scale, and blur) on mount, the grid slides directionally when navigating months, and day cells fade in with a stagger effect.

```tsx title="components/calendar-25.tsx"
// import from your project: import Demo from '@/components/calendar-25'
'use client'

import { MotionCalendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [date, setDate] = React.useState<Date | null>(new Date())

  return <MotionCalendar className="rounded-md border shadow-sm" mode="single" onSelect={setDate} selected={date} />
}
```

}>
  Requires the `motion` package. Use `MotionCalendar` instead of `Calendar`. All props stay the same.

## API Reference

### Calendar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `adapter` | `Adapter.IDateAdapter<Date>` | `NativeAdapter` | Date adapter for alternative calendar systems (Islamic, Persian, Hebrew) |
| `mode` | `'single' \| 'range' \| 'multi' \| 'multi-range'` | `'single'` | Selection mode |
| `selected` | `Date \| DateRange<Date> \| Date[] \| null` | - | Controlled selection value |
| `onSelect` | `(value) => void` | - | Called when the selection changes |
| `disabled` | `Date[] \| ((date: Date) => boolean)` | - | Dates that cannot be selected |
| `defaultMonth` | `Date` | - | Default month to display (uncontrolled) |
| `month` | `Date` | - | Controlled displayed month |
| `onMonthChange` | `(month: Date) => void` | - | Called when the displayed month changes |
| `showOutsideDays` | `boolean` | `true` | Show days from adjacent months |
| `fixedWeeks` | `boolean` | `false` | Always show 6 weeks |
| `numberOfMonths` | `number` | `1` | How many months to show side by side |
| `showDropdowns` | `boolean` | `true` | Show month/year dropdown selectors |
| `yearRange` | `{ from: number; to: number }` | `{ from: now-100, to: now+10 }` | Range of years in the year dropdown |
| `locale` | `string` | - | BCP 47 locale tag (e.g. `'ar-SA'`, `'ja-JP'`) |
| `dir` | `'ltr' \| 'rtl'` | - | Direction override. Defaults to the nearest `DirectionProvider`, then `<html dir>`. |
| `fromDate` | `Date` | - | Earliest selectable date |
| `toDate` | `Date` | - | Latest selectable date |
| `unavailable` | `Date[] \| ((date: Date) => boolean)` | - | Dates that stay focusable but cannot be picked, such as booked days, drawn struck through. A range cannot span one |
| `readOnly` | `boolean` | `false` | Keeps the selection as it is, while the keys still move focus |
| `invalid` | `boolean` | `false` | Marks the selection invalid and draws it in the destructive colour. A selection holding a day that cannot be picked is invalid without it |
| `weekStartDay` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | locale's first day | First day of the week, 0 for Sunday. Sunday with no `locale` |
| `showWeekNumber` | `boolean` | `false` | Starts each week with its ISO week number |
| `pageBehavior` | `'single' \| 'visible'` | `'single'` | With several months shown, whether the nav buttons and <Kbd>PageUp</Kbd>/<Kbd>PageDown</Kbd> move one month or the whole view |
| `buttonVariant` | `string` | `'ghost'` | Variant style for navigation buttons |
| `onDismiss` | `() => void` | - | Called when the user presses Escape |
| `className` | `string` | - | Additional CSS classes for the root container |
| `renderDay` | `(day: Grid.ICalendarDay<Date>, children: ReactNode) => ReactNode` | - | Custom render function for day cell content |
| `renderHeader` | `(context: CalendarHeaderContext) => ReactNode` | - | Custom render function for the navigation header |
| `renderWeekday` | `(day: string, index: number) => ReactNode` | - | Custom render function for weekday column labels |
| `renderFooter` | `(months: Grid.ICalendarMonth<Date>[]) => ReactNode` | - | Render content below the calendar grid |

### Render Props

The Calendar component exposes render props that let you customize every visual part without forking the component.

#### renderDay

Customize the content inside each day cell. Receives the `Grid.ICalendarDay` object and the default children (the date number).

```tsx showLineNumbers
<Calendar
  renderDay={(day, children) => (
    <>
      {children}
      {hasEvents(day.date) && (
        <span className="size-1 rounded-full bg-primary" />
      )}
    </>
  )}
/>
```

The `day` object exposes: `date`, `isToday`, `isSelected`, `isDisabled`, `isOutside`, `isHidden`, `isWeekend`, `isRangeStart`, `isRangeEnd`, `isRangeMiddle`.

#### renderHeader

Replace the entire navigation header. Receives a context object with navigation controls.

```tsx showLineNumbers
<Calendar
  renderHeader={({ month, title, direction, goToPrevMonth, goToNextMonth, isPrevDisabled, isNextDisabled }) => (
    <div className="flex items-center justify-between px-2">
      <button onClick={goToPrevMonth} disabled={isPrevDisabled}><-</button>
      <span className="font-semibold">{title}</span>
      <button onClick={goToNextMonth} disabled={isNextDisabled}>-></button>
    </div>
  )}
/>
```

#### renderWeekday

Customize individual weekday column headers. Receives the abbreviation and column index.

```tsx showLineNumbers
<Calendar
  renderWeekday={(day, index) => (
    <span className={index === 0 || index === 6 ? "text-red-400" : ""}>
      {day}
    </span>
  )}
/>
```

#### renderFooter

Add content below the calendar grid. Receives the current months array for context.

```tsx showLineNumbers
<Calendar
  renderFooter={() => (
    <div className="mt-2 text-xs text-muted-foreground">
      Pick a date to continue
    </div>
  )}
/>
```

### Data Attributes

The calendar uses `data-*` attributes on day cells for styling. Target these in your CSS:

| Attribute | When Present |
| --- | --- |
| `data-selected="true"` | Day is selected |
| `data-selected-single="true"` | Day is selected (single mode, not part of range) |
| `data-today="true"` | Day is today |
| `data-unavailable="true"` | Day is `unavailable` |
| `data-invalid="true"` | Day is selected while the selection is invalid |
| `data-focused="true"` | Day has keyboard focus |
| `data-range-start="true"` | Day is the start of a range |
| `data-range-end="true"` | Day is the end of a range |
| `data-range-middle="true"` | Day is between range start and end |
| `data-day` | Formatted date string for the day (always present) |

### MotionCalendar

Adds a `scaleIn` entrance (fade, scale, and blur) with a `springBouncy` transition on mount, directional slide transitions on month navigation (with blur), and staggered day cell entry animation. Uses `LazyMotion` for a lightweight bundle (~5KB). Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `CalendarProps` | - | All props from `Calendar` are supported |

### CSS Variables

| Variable | Default | Description |
| --- | --- | --- |
| `--gentleduck-calendar-cell` | `--spacing(8)` (32px) | Size of day cells and nav buttons |