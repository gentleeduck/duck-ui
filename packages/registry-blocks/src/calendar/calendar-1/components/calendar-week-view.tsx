'use client'

import { cn } from '@gentleduck/libs/cn'
import * as React from 'react'
import { CATEGORY_COLORS, type CalendarEvent } from '../calendar-data'
import { formatDateString, getDaysForWeek, getEventsForDay, isToday, isWeekend } from '../calendar-utils'
import { CalendarEventDetail } from './calendar-event-detail'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 52

import { formatHour } from '../calendar-1.libs'

function WeekEventBlock({
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
          'absolute inset-x-0.5 z-10 rounded-md px-1.5 py-0.5 text-start text-[10px] leading-tight shadow-sm transition-shadow hover:shadow-md',
          colors.bg,
          colors.text,
        )}
        style={{ top, minHeight: HOUR_HEIGHT * 0.55 }}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}>
        <p className="truncate font-semibold">{event.title}</p>
        <p className="opacity-60">{event.time}</p>
      </button>
    </CalendarEventDetail>
  )
}

interface ICalendarWeekViewProps {
  viewedDate: Date
  events: CalendarEvent[]
  onDayClick: (dateStr: string) => void
  onSelectEvent: (event: CalendarEvent) => void
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (id: string) => void
}

export function CalendarWeekView({
  viewedDate,
  events,
  onDayClick,
  onSelectEvent: _onSelectEvent,
  onEditEvent,
  onDeleteEvent,
}: ICalendarWeekViewProps) {
  const days = getDaysForWeek(viewedDate)

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="grid border-b bg-muted/50" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
        <div />
        {days.map((d, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: days order is stable within a week
          <div key={i} className={cn('border-s px-2 py-2 text-center', isWeekend(d) && 'bg-muted/30')}>
            <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
              {WEEKDAYS[i]}
            </span>
            <span
              className={cn(
                'ms-1.5 inline-flex size-6 items-center justify-center rounded-full font-medium text-xs',
                isToday(d) && 'bg-primary font-bold text-primary-foreground',
              )}>
              {d.getDate()}
            </span>
          </div>
        ))}
      </div>
      {/* Body */}
      <div className="max-h-[700px] overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
          {/* Hour labels */}
          <div>
            {HOURS.map((hour) => (
              <div key={hour} className="relative border-border/50 border-b" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute end-2 -top-2.5 text-[10px] text-muted-foreground">
                  {hour > 0 ? formatHour(hour) : ''}
                </span>
              </div>
            ))}
          </div>
          {/* Day columns */}
          {days.map((d) => {
            const dayEvents = getEventsForDay(events, d)
            const dateStr = formatDateString(d)
            return (
              // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA grid pattern requires div with role="gridcell"
              <div
                key={d.getTime()}
                className={cn('relative border-s', isWeekend(d) && 'bg-muted/10')}
                onClick={() => onDayClick(dateStr)}
                role="gridcell"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onDayClick(dateStr)
                  }
                }}>
                {HOURS.map((hour) => (
                  <div key={hour} className="border-border/50 border-b" style={{ height: HOUR_HEIGHT }} />
                ))}
                {dayEvents.map((evt) => (
                  <WeekEventBlock key={evt.id} event={evt} onEdit={onEditEvent} onDelete={onDeleteEvent} />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
