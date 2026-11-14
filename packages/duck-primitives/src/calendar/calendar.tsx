import type { Selection, UseCalendar } from '@gentleduck/calendar'
import { useCalendar } from '@gentleduck/calendar'
import * as React from 'react'
import { useDirection } from '../direction'
import { createContextScope } from '../libs/create-context'
import { Primitive } from '../primitive-elements'
import type { ICalendar } from './calendar.types'

const CALENDAR_NAME = 'Calendar'

export const [createCalendarContext, createCalendarScope] = createContextScope(CALENDAR_NAME)

export const [CalendarProvider, useCalendarContext] = createCalendarContext<ICalendar.IContext>(CALENDAR_NAME)

const Calendar = React.forwardRef<HTMLDivElement, ICalendar.IRootProps>(
  (props: ICalendar.IScoped<ICalendar.IRootProps>, forwardedRef) => {
    const {
      __scopeCalendar,
      adapter,
      mode,
      locale,
      month,
      defaultMonth,
      selected,
      defaultSelected,
      onSelect,
      onMonthChange,
      onDismiss,
      numberOfMonths,
      showOutsideDays,
      fixedWeeks,
      disabled,
      fromDate,
      toDate,
      unavailable,
      readOnly,
      invalid,
      pageBehavior,
      showWeekNumber = false,
      children,
      ...divProps
    } = props

    const direction = useDirection(locale?.direction)
    const config: UseCalendar.IUseCalendarConfig<Date, Selection.SelectionMode> = {
      adapter,
      mode,
      locale: { ...locale, direction },
      month,
      defaultMonth,
      selected,
      defaultSelected,
      onSelect,
      onMonthChange,
      onDismiss,
      numberOfMonths,
      showOutsideDays,
      fixedWeeks,
      disabled,
      fromDate,
      toDate,
      unavailable,
      readOnly,
      invalid,
      pageBehavior,
    }

    const calendar = useCalendar(config)

    return (
      <CalendarProvider
        scope={__scopeCalendar}
        {...calendar}
        adapter={adapter}
        locale={config.locale}
        showWeekNumber={showWeekNumber}>
        <Primitive.div
          role="application"
          aria-label="Calendar"
          data-slot="calendar"
          data-view={calendar.state.viewMode}
          dir={direction}
          {...divProps}
          ref={forwardedRef}>
          {children}
          <calendar.announcer.AnnouncerPortal />
        </Primitive.div>
      </CalendarProvider>
    )
  },
)

Calendar.displayName = CALENDAR_NAME

export { Calendar }
