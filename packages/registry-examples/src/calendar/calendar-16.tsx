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
