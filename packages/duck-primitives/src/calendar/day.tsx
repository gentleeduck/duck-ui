import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { Primitive } from '../primitive-elements'
import { useCalendarContext } from './calendar'
import type { ICalendar } from './calendar.types'

const DAY_NAME = 'CalendarDay'

export const CalendarDay = React.forwardRef<HTMLButtonElement, ICalendar.IDayProps>(
  (props: ICalendar.IScoped<ICalendar.IDayProps>, forwardedRef) => {
    const { __scopeCalendar, day, children, ...buttonProps } = props
    const context = useCalendarContext(DAY_NAME, __scopeCalendar)
    const dayDomProps = context.getDayProps(day)

    return (
      <Primitive.button
        type="button"
        data-slot="calendar-day"
        {...dayDomProps}
        {...buttonProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(props.onClick, dayDomProps.onClick)}
        onMouseEnter={composeEventHandlers(props.onMouseEnter, dayDomProps.onMouseEnter)}
        onKeyDown={composeEventHandlers(props.onKeyDown, dayDomProps.onKeyDown)}>
        {children ?? day.date.getDate()}
      </Primitive.button>
    )
  },
)

CalendarDay.displayName = DAY_NAME
