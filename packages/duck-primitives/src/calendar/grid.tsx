import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useCalendarContext } from './calendar'
import type { ICalendar } from './calendar.types'
import { CalendarDay } from './day'
import { CalendarWeekdays } from './weekdays'

const GRID_NAME = 'CalendarGrid'

export const CalendarGrid = React.forwardRef<HTMLDivElement, ICalendar.IGridProps>(
  (props: ICalendar.IScoped<ICalendar.IGridProps>, forwardedRef) => {
    const { __scopeCalendar, month = 0, children, ...gridProps } = props
    const context = useCalendarContext(GRID_NAME, __scopeCalendar)
    const gridDomProps = context.getGridProps()

    return (
      <Primitive.div data-slot="calendar-grid" {...gridDomProps} {...gridProps} ref={forwardedRef}>
        {children !== undefined && typeof children !== 'function' ? (
          children
        ) : (
          <>
            <CalendarWeekdays __scopeCalendar={__scopeCalendar} />
            {context.state.months[month]?.weeks.map((week) => (
              // biome-ignore lint/a11y/useSemanticElements: role="row" on div per WAI-ARIA grid pattern
              // biome-ignore lint/a11y/useFocusableInteractive: rows are not interactive, their days are
              <div key={week.weekNumber} role="row" data-slot="calendar-week">
                {context.showWeekNumber && (
                  // biome-ignore lint/a11y/useSemanticElements: rowheader on span, as the rows are divs
                  // biome-ignore lint/a11y/useFocusableInteractive: a week number is read, never focused
                  <span role="rowheader" data-slot="calendar-week-number" aria-label={`Week ${week.weekNumber}`}>
                    {week.weekNumber}
                  </span>
                )}
                {week.days.map((day) => (
                  <React.Fragment key={day.date.getTime()}>
                    {children ? children(day) : <CalendarDay __scopeCalendar={__scopeCalendar} day={day} />}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </>
        )}
      </Primitive.div>
    )
  },
)

CalendarGrid.displayName = GRID_NAME
