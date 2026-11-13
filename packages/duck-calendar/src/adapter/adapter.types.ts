export namespace Adapter {
  /** The first day of the week. */
  export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0=Sunday

  /**
   * The core abstraction over any date library.
   *
   * Implement this interface to plug in a date backend  -  native `Date`, dayjs,
   * date-fns, Luxon, or Temporal.
   *
   * **Invariants every implementation must uphold:**
   * - Every method must be pure  -  inputs must never be mutated. Always return a
   *   new instance of `TDate`.
   * - Calendar-aware methods (`getYear`/`getMonth`/`getDate`/`startOfMonth`/
   *   `endOfMonth`/`addMonths`/`addYears`/`isSameMonth`/`create`) operate in the
   *   adapter's *display* calendar, which may not be Gregorian (Persian, Hijri,
   *   Hebrew). Universal day-level operations (`addDays`/`isBefore`/`isAfter`/
   *   `getDayOfWeek`/`startOfWeek`/time accessors) always operate at the
   *   underlying instant level.
   * - When the backend ships as a peer dependency (dayjs, date-fns, Luxon), the
   *   adapter file is the only place that imports it  -  no other module pulls
   *   the dependency in.
   *
   * @typeParam TDate - The opaque date type used by the underlying library.
   *   - Native:   `Date`
   *   - dayjs:    `Dayjs`
   *   - Temporal: `Temporal.PlainDate`
   */
  export interface IDateAdapter<TDate> {
    /**
     * Returns today's date with the time component stripped (midnight local).
     * Equivalent to `startOfDay(new Date())`.
     */
    today(): TDate

    /**
     * Constructs a date from its calendar parts.
     *
     * @param year  - Full four-digit year (e.g. 2026).
     * @param month - **0-indexed** month (0 = January, 11 = December).
     * @param day   - Day of the month (1-31).
     * @returns A valid date, or an invalid sentinel if the parts are out of range.
     */
    create(year: number, month: number, day: number): TDate

    /**
     * Returns `true` when the date represents a real calendar day.
     * Use this to guard against invalid dates returned by `create()`.
     */
    isValid(date: TDate): boolean

    /**
     * Returns `true` when `a` and `b` fall on the same year, month, and day.
     * Time components are ignored.
     */
    isSameDay(a: TDate, b: TDate): boolean

    /**
     * Returns `true` when `a` and `b` share the same year and month.
     * Day is ignored.
     */
    isSameMonth(a: TDate, b: TDate): boolean

    /**
     * Returns `true` when `a` is strictly before `b` (i.e. `a < b`).
     * Equal dates return `false`.
     */
    isBefore(a: TDate, b: TDate): boolean

    /**
     * Returns `true` when `a` is strictly after `b` (i.e. `a > b`).
     * Equal dates return `false`.
     */
    isAfter(a: TDate, b: TDate): boolean

    /**
     * Returns the first day of the month that contains `date`.
     * @example adapter.startOfMonth(May 15) -> May 1
     */
    startOfMonth(date: TDate): TDate

    /**
     * Returns the last day of the month that contains `date`.
     * @example adapter.endOfMonth(May 15) -> May 31
     */
    endOfMonth(date: TDate): TDate

    /**
     * Walks backward from `date` until reaching the target weekday.
     * If `date` is already on that weekday, returns `date` unchanged.
     *
     * @param date         - The reference date.
     * @param weekStartDay - The desired start-of-week day (0 = Sunday, 1 = Monday, ...).
     */
    startOfWeek(date: TDate, weekStartDay: WeekStartDay): TDate

    /**
     * Adds (or subtracts when negative) a number of days to `date`.
     *
     * @param date  - The base date. Not mutated.
     * @param count - Days to add. Use a negative number to go backward.
     */
    addDays(date: TDate, count: number): TDate

    /**
     * Adds (or subtracts when negative) a number of months to `date`.
     * Overflow is clamped to the last valid day of the resulting month.
     *
     * @example adapter.addMonths(Jan 31, 1) -> Feb 28 (or 29 in a leap year)
     *
     * @param date  - The base date. Not mutated.
     * @param count - Months to add. Use a negative number to go backward.
     */
    addMonths(date: TDate, count: number): TDate

    /**
     * Adds (or subtracts when negative) a number of years to `date`.
     * Feb 29 in a leap year is clamped to Feb 28 in non-leap target years.
     *
     * @param date  - The base date. Not mutated.
     * @param count - Years to add. Use a negative number to go backward.
     */
    addYears(date: TDate, count: number): TDate

    /** Full four-digit year. @example adapter.getYear(2026-03-17) -> 2026 */
    getYear(date: TDate): number

    /** 0-indexed month (0 = January). @example adapter.getMonth(2026-03-17) -> 2 */
    getMonth(date: TDate): number

    /**
     * Returns the number of months in the year that contains `date`.
     * Defaults to 12 for Gregorian-based adapters. Hebrew leap years return 13.
     */
    getMonthsInYear?(date: TDate): number

    /** The last year `create` makes a date in, when that is before 9999. The Persian adapter's ends at 3176. */
    readonly maxYear?: number

    /** Day of the month (1-31). @example adapter.getDate(2026-03-17) -> 17 */
    getDate(date: TDate): number

    /** Day of the week (0 = Sunday, 6 = Saturday). @example adapter.getDayOfWeek(2026-03-17) -> 2 */
    getDayOfWeek(date: TDate): 0 | 1 | 2 | 3 | 4 | 5 | 6

    /**
     * Converts the adapter's date type to a native JS `Date`.
     * Used for interop with third-party APIs that expect a `Date`.
     */
    toDate(date: TDate): Date

    /**
     * Constructs an adapter date from a native JS `Date`.
     * Time components are stripped  -  only the calendar date is kept.
     */
    fromDate(date: Date): TDate

    /**
     * Formats a date into a human-readable string using the browser-native
     * `Intl.DateTimeFormat` API.
     *
     * @param date    - The date to format.
     * @param options - `Intl.DateTimeFormatOptions` (e.g. `{ month: 'long', year: 'numeric' }`).
     * @param locale  - Optional BCP 47 locale tag (e.g. `'fr-FR'`).
     *   Falls back to the runtime's default locale when omitted.
     */
    format(date: TDate, options: Intl.DateTimeFormatOptions, locale?: string): string

    /** Extracts the hour (0-23). */
    getHours(date: TDate): number

    /** Extracts the minute (0-59). */
    getMinutes(date: TDate): number

    /** Extracts the second (0-59). */
    getSeconds(date: TDate): number

    /**
     * Returns a new date with the time set to the given hour, minute, and optional second.
     * The date (year/month/day) is preserved from the input.
     */
    setTime(date: TDate, hour: number, minute: number, second?: number): TDate
  }
}
