'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import * as React from 'react'
import type { CalendarEvent } from '../calendar-data'
import { CalendarEventChip } from './calendar-event-chip'
import { CalendarEventDetail } from './calendar-event-detail'

interface ICalendarOverflowProps {
  events: CalendarEvent[]
  hiddenCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (id: string) => void
}

function OverflowEventItem({
  event,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
}) {
  const [detailOpen, setDetailOpen] = React.useState(false)
  return (
    <CalendarEventDetail
      event={event}
      open={detailOpen}
      onOpenChange={setDetailOpen}
      onEdit={onEdit}
      onDelete={onDelete}>
      <div>
        <CalendarEventChip event={event} onSelect={() => setDetailOpen(true)} />
      </div>
    </CalendarEventDetail>
  )
}

export function CalendarOverflow({
  events,
  hiddenCount,
  open,
  onOpenChange,
  onEditEvent,
  onDeleteEvent,
}: ICalendarOverflowProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          tabIndex={0}
          className="w-full cursor-pointer rounded bg-muted/60 px-1.5 py-0.5 text-start font-medium text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={(e) => e.stopPropagation()}>
          +{hiddenCount} more
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start" sideOffset={4}>
        <div className="flex flex-col gap-1">
          <p className="mb-1 px-1 font-semibold text-muted-foreground text-xs">All events ({events.length})</p>
          {events.map((event) => (
            <OverflowEventItem key={event.id} event={event} onEdit={onEditEvent} onDelete={onDeleteEvent} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
