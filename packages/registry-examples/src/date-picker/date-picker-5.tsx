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
