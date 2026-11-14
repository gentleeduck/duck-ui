'use client'

import { cn } from '@gentleduck/libs/cn'
import { StarIcon } from 'lucide-react'
import { CATEGORY_COLORS, type CalendarEvent } from '../calendar-data'

interface ICalendarEventChipProps {
  event: CalendarEvent
  onSelect: (event: CalendarEvent) => void
}

export function CalendarEventChip({ event, onSelect }: ICalendarEventChipProps) {
  const colors = CATEGORY_COLORS[event.category]
  return (
    <button
      type="button"
      tabIndex={0}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-start text-[11px] leading-tight',
        'cursor-pointer transition-all hover:shadow-sm',
        colors.bg,
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(event)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          onSelect(event)
        }
      }}>
      {event.starred ? (
        <StarIcon className={cn('size-2.5 shrink-0 fill-current', colors.text)} />
      ) : (
        <span className={cn('size-1.5 shrink-0 rounded-full', colors.dot)} />
      )}
      <span className={cn('truncate font-medium', colors.text)}>{event.title}</span>
      <span className="ms-auto shrink-0 text-muted-foreground/70 tabular-nums">{event.time}</span>
    </button>
  )
}
