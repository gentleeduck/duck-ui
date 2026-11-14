'use client'

import { cn } from '@gentleduck/libs/cn'
import type { CalendarEvent } from '../calendar-data'
import { getEventsForDay, getWeeksForMonth, isSameMonth, isToday } from '../calendar-utils'

interface ICalendarYearViewProps {
  viewedDate: Date
  events: CalendarEvent[]
  onMonthClick: (month: number) => void
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function CalendarYearView({ viewedDate, events, onMonthClick }: ICalendarYearViewProps) {
  const year = viewedDate.getFullYear()

  return (
    <div className="grid grid-cols-3 gap-6 sm:grid-cols-4">
      {Array.from({ length: 12 }, (_, month) => {
        const monthDate = new Date(year, month, 1)
        const weeks = getWeeksForMonth(year, month)

        return (
          <button
            key={MONTH_NAMES[month]}
            type="button"
            onClick={() => onMonthClick(month)}
            className="flex flex-col gap-1 rounded-lg border p-3 text-start transition-colors hover:bg-accent/50">
            <span className="mb-1 font-semibold text-sm">{MONTH_NAMES[month]}</span>
            <div className="grid grid-cols-7 gap-px text-center text-[10px]">
              {WEEKDAY_LETTERS.map((l) => (
                <span key={l} className="font-medium text-muted-foreground">
                  {l}
                </span>
              ))}
              {weeks.slice(0, 6).flatMap((week) =>
                week.map((d) => {
                  const inMonth = isSameMonth(d, monthDate)
                  const today = isToday(d)
                  const hasEvents = getEventsForDay(events, d).length > 0
                  return (
                    <span
                      key={d.getTime()}
                      className={cn(
                        'flex size-5 items-center justify-center rounded-full',
                        !inMonth && 'opacity-0',
                        today && 'bg-primary font-bold text-primary-foreground',
                        hasEvents && !today && 'font-bold text-primary',
                      )}>
                      {inMonth ? d.getDate() : ''}
                    </span>
                  )
                }),
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
