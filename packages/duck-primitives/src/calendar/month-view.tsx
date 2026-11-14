import { buildCalendarYear, goToMonth } from '@gentleduck/calendar'
import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useCalendarContext } from './calendar'
import type { ICalendar } from './calendar.types'
import { ViewGrid } from './view-grid'

const MONTH_VIEW_NAME = 'CalendarMonthView'

export const CalendarMonthView = React.forwardRef<HTMLDivElement, ICalendar.IMonthViewProps>(
  (props: ICalendar.IScoped<ICalendar.IMonthViewProps>, forwardedRef) => {
    const { __scopeCalendar, columns = 3, children, ...viewProps } = props
    const context = useCalendarContext(MONTH_VIEW_NAME, __scopeCalendar)
    const { adapter, locale, actions } = context
    const { month } = context.state

    const cells = buildCalendarYear(adapter, month, locale?.locale).map((entry) => ({
      label: entry.label,
      isCurrent: entry.isCurrent,
      data: { 'data-month': entry.month },
      onPick: () => {
        actions.setMonth(goToMonth(adapter, month, entry.month))
        actions.setViewMode('days')
      },
    }))

    if (children !== undefined) {
      return (
        <Primitive.div data-slot="calendar-month-view" {...viewProps} ref={forwardedRef}>
          {children}
        </Primitive.div>
      )
    }

    return (
      <ViewGrid
        data-slot="calendar-month-view"
        aria-label={String(adapter.getYear(month))}
        cells={cells}
        columns={columns}
        selected={adapter.getMonth(month)}
        rtl={locale?.direction === 'rtl'}
        cellSlot="calendar-month"
        onPage={(step) => actions.setMonth(adapter.addYears(month, step))}
        {...viewProps}
        ref={forwardedRef}
      />
    )
  },
)

CalendarMonthView.displayName = MONTH_VIEW_NAME
