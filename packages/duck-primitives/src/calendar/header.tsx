import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useCalendarContext } from './calendar'
import type { ICalendar } from './calendar.types'

const HEADER_NAME = 'CalendarHeader'

export const CalendarHeader = React.forwardRef<HTMLDivElement, ICalendar.IHeaderProps>(
  (props: ICalendar.IScoped<ICalendar.IHeaderProps>, forwardedRef) => {
    const { __scopeCalendar, formatMonth, children, ...headerProps } = props
    const context = useCalendarContext(HEADER_NAME, __scopeCalendar)
    const { adapter, locale } = context
    const { month } = context.state

    const headerDomProps = context.getHeaderProps()

    const title = formatMonth
      ? formatMonth(month, adapter)
      : adapter.format(month, { month: 'long', year: 'numeric' }, locale?.locale)

    return (
      <Primitive.div data-slot="calendar-header" {...headerDomProps} {...headerProps} ref={forwardedRef}>
        {children ?? title}
      </Primitive.div>
    )
  },
)

CalendarHeader.displayName = HEADER_NAME
