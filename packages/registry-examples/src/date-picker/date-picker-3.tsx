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
