'use client'

import { cn } from '@gentleduck/libs/cn'
import * as React from 'react'
import type { CalendarEvent } from '../calendar-data'
import { formatDateString, isSameMonth, isToday, isWeekend } from '../calendar-utils'
import { CalendarEventChip } from './calendar-event-chip'
import { CalendarEventDetail } from './calendar-event-detail'
import { CalendarOverflow } from './calendar-overflow'

interface ICalendarDayCellProps {
  date: Date
  viewedMonth: Date
  events: CalendarEvent[]
  overflowDay: string | null
  onOverflowChange: (day: string | null) => void
  onDayClick: (dateStr: string) => void
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (id: string) => void
}

function EventChipWithPopover({
  event,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <CalendarEventDetail event={event} open={open} onOpenChange={setOpen} onEdit={onEdit} onDelete={onDelete}>
      <div>
        <CalendarEventChip event={event} onSelect={() => setOpen(true)} />
      </div>
    </CalendarEventDetail>
  )
}

export function CalendarDayCell({
  date,
  viewedMonth,
  events,
  overflowDay,
  onOverflowChange,
  onDayClick,
  onEditEvent,
  onDeleteEvent,
}: ICalendarDayCellProps) {
  const inMonth = isSameMonth(date, viewedMonth)
  const today = isToday(date)
  const wkend = isWeekend(date)
  const dateStr = formatDateString(date)

  const hasOverflow = events.length > 3
  const visible = hasOverflow ? events.slice(0, 2) : events.slice(0, 3)
  const hiddenCount = events.length - visible.length

  return (
    // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA grid pattern requires div with role="gridcell"
    <div
      role="gridcell"
      tabIndex={inMonth ? 0 : -1}
      className={cn(
        'flex min-h-28 flex-col overflow-hidden border-border border-e p-1.5 transition-colors last:border-e-0',
        today && 'bg-primary/10 ring-1 ring-primary/30 ring-inset',
        wkend && !today && 'bg-muted/20',
        !inMonth && 'opacity-40',
        inMonth && !today && 'cursor-pointer hover:bg-accent/30',
        inMonth && today && 'cursor-pointer hover:bg-primary/15',
      )}
      onClick={() => {
        if (inMonth) onDayClick(dateStr)
      }}
      onKeyDown={(e) => {
        if (inMonth && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onDayClick(dateStr)
        }
      }}>
      <div className="mb-1 flex shrink-0 justify-start">
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full font-medium text-xs',
            today && 'bg-primary font-bold text-primary-foreground shadow-sm',
            !today && inMonth && 'text-foreground',
            !today && !inMonth && 'text-muted-foreground',
          )}>
          {date.getDate()}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
        {visible.map((evt) => (
          <EventChipWithPopover key={evt.id} event={evt} onEdit={onEditEvent} onDelete={onDeleteEvent} />
        ))}
        {hiddenCount > 0 && (
          <CalendarOverflow
            events={events}
            hiddenCount={hiddenCount}
            open={overflowDay === dateStr}
            onOpenChange={(o) => onOverflowChange(o ? dateStr : null)}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
          />
        )}
      </div>
    </div>
  )
}
