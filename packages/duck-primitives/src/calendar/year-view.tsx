import { buildDecadeView, goToYear } from '@gentleduck/calendar'
import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useCalendarContext } from './calendar'
import type { ICalendar } from './calendar.types'
import { ViewGrid } from './view-grid'

const YEAR_VIEW_NAME = 'CalendarYearView'

export const CalendarYearView = React.forwardRef<HTMLDivElement, ICalendar.IYearViewProps>(
  (props: ICalendar.IScoped<ICalendar.IYearViewProps>, forwardedRef) => {
    const { __scopeCalendar, columns = 3, children, ...viewProps } = props
    const context = useCalendarContext(YEAR_VIEW_NAME, __scopeCalendar)
    const { adapter, locale, actions } = context
    const { month } = context.state

    const years = React.useMemo(() => buildDecadeView(adapter, month), [adapter, month])
    const cells = years.map((entry) => ({
      label: String(entry.year),
      isCurrent: entry.isCurrent,
      data: { 'data-year': entry.year },
      onPick: () => {
        actions.setMonth(goToYear(adapter, month, entry.year))
        actions.setViewMode('months')
      },
    }))

    if (children !== undefined) {
      return (
        <Primitive.div data-slot="calendar-year-view" {...viewProps} ref={forwardedRef}>
          {children}
        </Primitive.div>
      )
    }

    const shown = adapter.getYear(month)
    return (
      <ViewGrid
        data-slot="calendar-year-view"
        aria-label={`${years[0]?.year} - ${years[years.length - 1]?.year}`}
        cells={cells}
        columns={columns}
        selected={years.findIndex((entry) => entry.year === shown)}
        rtl={locale?.direction === 'rtl'}
        cellSlot="calendar-year"
        onPage={(step) => actions.setMonth(adapter.addYears(month, step * 10))}
        {...viewProps}
        ref={forwardedRef}
      />
    )
  },
)

CalendarYearView.displayName = YEAR_VIEW_NAME
