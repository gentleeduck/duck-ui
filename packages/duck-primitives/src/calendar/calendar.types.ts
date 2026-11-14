import type { Adapter, Calendar as CalendarTypes, Grid, Selection, UseCalendar } from '@gentleduck/calendar'
import type * as React from 'react'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'

export namespace ICalendar {
  export type IScoped<TProps> = TProps & { __scopeCalendar?: Scope }

  export type IContext = UseCalendar.IUseCalendarReturn<Date, Selection.SelectionMode> & {
    adapter: Adapter.IDateAdapter<Date>
    locale?: CalendarTypes.ICalendarLocaleConfig | undefined
    showWeekNumber: boolean
  }

  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>
  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>

  type ConflictingProps = 'onSelect' | 'disabled' | 'children'

  export interface IRootProps
    extends Omit<PrimitiveDivProps, ConflictingProps>,
      UseCalendar.IUseCalendarConfig<Date, Selection.SelectionMode> {
    /** Draws each week's ISO week number at the start of its row. */
    showWeekNumber?: boolean | undefined
    children?: React.ReactNode
  }

  export interface IDayProps extends PrimitiveButtonProps {
    __scopeCalendar?: Scope
    day: Grid.ICalendarDay<Date>
  }

  export interface IGridProps extends Omit<PrimitiveDivProps, 'children'> {
    /** Which of the shown months the grid draws, counting from 0. */
    month?: number | undefined
    /** Content in place of the days, or a function drawing each day. Without either, the grid draws its weekdays and a `Calendar.Day` per day. */
    children?: React.ReactNode | ((day: Grid.ICalendarDay<Date>) => React.ReactNode)
  }

  export interface IHeaderProps extends PrimitiveDivProps {
    formatMonth?: (month: Date, adapter: Adapter.IDateAdapter<Date>) => string
  }

  export interface IMonthViewProps extends PrimitiveDivProps {
    /** Months to a row, 3 by default. The arrow keys move along and between the rows. */
    columns?: number | undefined
  }

  export interface INavProps extends PrimitiveDivProps {}

  export interface IPrevButtonProps extends PrimitiveButtonProps {
    __scopeCalendar?: Scope
  }

  export interface INextButtonProps extends PrimitiveButtonProps {
    __scopeCalendar?: Scope
  }

  export interface IViewTriggerProps extends PrimitiveButtonProps {
    __scopeCalendar?: Scope
    /** The view a click opens. The trigger reads `data-state="active"` while it shows. */
    view: CalendarTypes.ViewMode
  }

  export interface IWeekdaysProps extends PrimitiveDivProps {
    __scopeCalendar?: Scope
    renderWeekday?: ((weekday: string, index: number) => React.ReactNode) | undefined
  }

  export interface IYearViewProps extends PrimitiveDivProps {
    /** Years to a row, 3 by default. The arrow keys move along and between the rows. */
    columns?: number | undefined
  }

  export interface IViewCell {
    label: string
    isCurrent: boolean
    data: Record<`data-${string}`, number>
    onPick: () => void
  }

  export interface IViewGridProps extends PrimitiveDivProps {
    cells: IViewCell[]
    columns: number
    selected: number
    rtl: boolean
    cellSlot: string
    onPage: (step: -1 | 1) => void
  }
}
