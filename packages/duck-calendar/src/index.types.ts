import type { Adapter } from './adapter'
import type { Selection } from './selection'

export namespace Calendar {
  /** Which view the calendar is showing. */
  export type ViewMode = 'days' | 'months' | 'years'

  /** Locale and direction settings for the calendar. */
  export interface ICalendarLocaleConfig {
    /** BCP 47 language tag, e.g. `'en-US'`, `'ar-SA'`, `'fa-IR'`. */
    locale?: string | undefined
    /** Which day starts the week, 0 for Sunday. Defaults to the locale's first day, or Sunday with no locale. */
    weekStartDay?: Adapter.WeekStartDay | undefined
    /** Text direction. */
    direction?: 'ltr' | 'rtl' | undefined
  }

  /**
   * Full configuration for a calendar instance.
   * Generic over `TDate` (from the adapter) and `M` (selection mode).
   */
  export interface ICalendarConfig<TDate, M extends Selection.SelectionMode = 'single'> {
    /** The date adapter to use (e.g. `new NativeAdapter()`). */
    adapter: Adapter.IDateAdapter<TDate>
    /** Selection mode. */
    mode: M
    /** Locale and direction settings. */
    locale?: ICalendarLocaleConfig | undefined

    /** Controlled month. */
    month?: TDate | undefined
    /** Default month for uncontrolled usage. */
    defaultMonth?: TDate | undefined
    /** Controlled selection value. Shape depends on `mode`. */
    selected?: Selection.CalendarValue<TDate, M> | undefined
    /** Called when the selection changes. */
    onSelect?: ((value: Selection.CalendarValue<TDate, M>) => void) | undefined
    /** Called when the displayed month changes. */
    onMonthChange?: ((month: TDate) => void) | undefined

    /** How many months to show side by side. Default `1`. */
    numberOfMonths?: number | undefined
    /** Show days from previous/next month to fill the grid. Default `true`. */
    showOutsideDays?: boolean | undefined
    /** Always show 6 weeks so the grid height doesn't jump. Default `false`. */
    fixedWeeks?: boolean | undefined

    /** Dates that cannot be selected. Array or predicate function. */
    disabled?: TDate[] | ((date: TDate) => boolean) | undefined
    /** Earliest selectable date. */
    fromDate?: TDate | undefined
    /** Latest selectable date. */
    toDate?: TDate | undefined
    /** Dates that stay focusable but cannot be picked, such as a booked day. A range cannot span one. */
    unavailable?: TDate[] | ((date: TDate) => boolean) | undefined
    /** Lets focus move but keeps any day from being picked. */
    readOnly?: boolean | undefined
    /** Marks the selection invalid. It is also invalid while it holds a day that cannot be picked. */
    invalid?: boolean | undefined
    /** How far the nav buttons and PageUp/PageDown move: one month (`'single'`, the default) or every shown month (`'visible'`). */
    pageBehavior?: 'single' | 'visible' | undefined

    /** Called when the user presses Escape. */
    onDismiss?: (() => void) | undefined
  }
}
