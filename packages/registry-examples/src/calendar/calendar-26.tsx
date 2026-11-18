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
