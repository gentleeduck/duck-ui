'use client'

import { cn } from '@gentleduck/libs/cn'
import * as React from 'react'
import { CATEGORY_COLORS, type CalendarEvent } from '../calendar-data'
import { getEventsForDay } from '../calendar-utils'
import { CalendarEventDetail } from './calendar-event-detail'

interface ICalendarDayViewProps {
  viewedDate: Date
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (id: string) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 60

import { formatHour } from '../calendar-1.libs'

function EventBlock({
  event,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent
  onEdit: (e: CalendarEvent) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const colors = CATEGORY_COLORS[event.category]
  const top = (event.timeValue / 60) * HOUR_HEIGHT

  return (
    <CalendarEventDetail event={event} open={open} onOpenChange={setOpen} onEdit={onEdit} onDelete={onDelete}>
      <button
        type="button"
        className={cn(
          'absolute start-1 end-4 z-10 rounded-lg px-3 py-1.5 text-start text-xs shadow-sm transition-shadow hover:shadow-md',
          colors.bg,
          colors.text,
        )}
        style={{ top, minHeight: HOUR_HEIGHT * 0.7 }}
        onClick={() => setOpen(true)}>
        <p className="truncate font-semibold">{event.title}</p>
        <p className="text-[10px] opacity-60">{event.time}</p>
      </button>
    </CalendarEventDetail>
  )
}

export function CalendarDayView({
  viewedDate,
  events,
  onSelectEvent: _onSelectEvent,
  onEditEvent,
  onDeleteEvent,
}: ICalendarDayViewProps) {
  const dayEvents = getEventsForDay(events, viewedDate)

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted/50 px-4 py-2.5 text-center font-semibold text-sm">
        {viewedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
      <div className="max-h-[700px] overflow-y-auto">
        <div className="relative flex">
          {/* Hour labels */}
          <div className="w-16 shrink-0">
            {HOURS.map((hour) => (
              <div key={hour} className="relative border-border/50 border-b" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute end-2 -top-3 text-[11px] text-muted-foreground">
                  {hour > 0 ? formatHour(hour) : ''}
                </span>
              </div>
            ))}
          </div>
          {/* Timeline */}
          <div className="relative flex-1 border-s">
            {HOURS.map((hour) => (
              <div key={hour} className="border-border/50 border-b" style={{ height: HOUR_HEIGHT }} />
            ))}
            {dayEvents.map((evt) => (
              <EventBlock key={evt.id} event={evt} onEdit={onEditEvent} onDelete={onDeleteEvent} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
