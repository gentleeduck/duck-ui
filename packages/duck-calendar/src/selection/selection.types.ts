export namespace Selection {
  /**
   * The ways a calendar can accept user selection.
   *
   * - `'single'`       -  one date at a time.
   * - `'range'`        -  a start date and an optional end date.
   * - `'multi'`        -  an unordered set of individual dates.
   * - `'multi-range'`  -  multiple contiguous ranges.
   */
  export type SelectionMode = 'single' | 'range' | 'multi' | 'multi-range'

  /**
   * Represents a contiguous date range.
   *
   * `to` is `null` while the user is mid-selection.
   *
   * @typeParam TDate - The adapter's date type.
   */
  export type DateRange<TDate> = {
    /** The inclusive start of the range. Always present once selection begins. */
    from: TDate
    /** The inclusive end of the range, or `null` if not yet chosen. */
    to: TDate | null
  }

  /**
   * Maps a {@link SelectionMode} to its corresponding value shape.
   *
   * @typeParam TDate - The adapter's date type.
   * @typeParam Mode  - The active selection mode.
   */
  export type CalendarValue<TDate, Mode extends SelectionMode> = Mode extends 'single'
    ? TDate | null
    : Mode extends 'range'
      ? DateRange<TDate> | null
      : Mode extends 'multi'
        ? TDate[]
        : Mode extends 'multi-range'
          ? DateRange<TDate>[]
          : never

  /**
   * Constraints that restrict which dates can be selected or navigated to.
   *
   * @typeParam TDate - The adapter's date type.
   */
  export interface ISelectionConstraints<TDate> {
    /** Array of specific disabled dates, or a predicate returning true for disabled dates. */
    disabled?: TDate[] | ((date: TDate) => boolean) | undefined
    /** Minimum selectable date (inclusive). Days before this are disabled. */
    fromDate?: TDate | undefined
    /** Maximum selectable date (inclusive). Days after this are disabled. */
    toDate?: TDate | undefined
    /** Dates that stay focusable but cannot be picked. */
    unavailable?: TDate[] | ((date: TDate) => boolean) | undefined
  }
}
