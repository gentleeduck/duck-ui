import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useCalendarContext } from './calendar'
import type { ICalendar } from './calendar.types'

const WEEKDAYS_NAME = 'CalendarWeekdays'

export const CalendarWeekdays = React.forwardRef<HTMLDivElement, ICalendar.IWeekdaysProps>(
  (props: ICalendar.IScoped<ICalendar.IWeekdaysProps>, forwardedRef) => {
    const { __scopeCalendar, renderWeekday, children, ...weekdayProps } = props
    const context = useCalendarContext(WEEKDAYS_NAME, __scopeCalendar)
    const { weekdays } = context.state

    return (
      <Primitive.div role="row" data-slot="calendar-weekdays" {...weekdayProps} ref={forwardedRef}>
        {children ?? (
          <>
            {context.showWeekNumber && <span aria-hidden="true" data-slot="calendar-week-number-header" />}
            {weekdays.map((day, i) => (
              <WeekdayCell key={day} day={day} index={i} renderWeekday={renderWeekday} />
            ))}
          </>
        )}
      </Primitive.div>
    )
  },
)

CalendarWeekdays.displayName = WEEKDAYS_NAME

function WeekdayCell({
  day,
  index,
  renderWeekday,
}: {
  day: string
  index: number
  renderWeekday?: ((weekday: string, index: number) => React.ReactNode) | undefined
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: columnheader role on abbr is intentional per WAI-ARIA grid pattern
    <abbr role="columnheader" data-slot="calendar-weekday" title={day}>
      {renderWeekday ? renderWeekday(day, index) : day}
    </abbr>
  )
}
