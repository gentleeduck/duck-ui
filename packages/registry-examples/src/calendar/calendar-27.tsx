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
