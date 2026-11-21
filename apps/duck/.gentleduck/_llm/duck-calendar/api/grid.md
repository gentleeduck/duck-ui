```tsx
import {
  buildCalendarMonth,
  buildMultiMonth,
  buildCalendarYear,
  buildDecadeView,
  getLocalizedWeekdays,
  getLocalizedMonthNames,
  getWeekNumber,
} from '@gentleduck/calendar'
```

## Functions

### `buildCalendarMonth`

Build a single month grid with weeks and day cells.

```tsx
buildCalendarMonth(adapter: Adapter.IDateAdapter<TDate>, viewDate: TDate, config: Pick<Calendar.ICalendarConfig<TDate, any>, 'showOutsideDays' | 'fixedWeeks' | 'locale'>) => Grid.ICalendarMonth<TDate>
```

| Param | Type | Description |
| :--- | :--- | :--- |
| `adapter` | `Adapter.IDateAdapter<TDate>` | Date adapter |
| `viewDate` | `TDate` | Any date in the target month |
| `config` | `Pick<Calendar.ICalendarConfig<TDate, any>, 'showOutsideDays' \| 'fixedWeeks' \| 'locale'>` | Grid options |

**Config properties:**

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showOutsideDays` | `boolean` | `true` | When false, outside days are marked as hidden and disabled |
| `fixedWeeks` | `boolean` | `false` | Always produce 6 weeks |
| `locale` | `Calendar.ICalendarLocaleConfig` | - | Locale config containing `weekStartDay`, `locale`, `direction`, etc. Without `weekStartDay` the week starts on the locale's first day |

**Returns** a `Grid.ICalendarMonth<TDate>`:

| Property | Type | Description |
| :--- | :--- | :--- |
| `month` | `TDate` | The first day of the month |
| `weeks` | `Grid.ICalendarWeek<TDate>[]` | Array of week objects |

Each `Grid.ICalendarWeek<TDate>` has:

| Property | Type | Description |
| :--- | :--- | :--- |
| `weekNumber` | `number` | ISO week number of the row, read from its Thursday, so a row starting on Sunday or Saturday is numbered right |
| `days` | `Grid.ICalendarDay<TDate>[]` | 7 day cells |

Each `Grid.ICalendarDay<TDate>` has:

| Property | Type | Description |
| :--- | :--- | :--- |
| `date` | `TDate` | The date |
| `isToday` | `boolean` | Whether this is today |
| `isOutside` | `boolean` | Whether this day is from an adjacent month |
| `isHidden` | `boolean` | Whether this day should be hidden (outside day when `showOutsideDays` is false) |
| `isWeekend` | `boolean` | Whether this falls on the locale's weekend, Saturday and Sunday with no locale |
| `isSelected` | `boolean` | Whether this day is selected (set by `applySelection`) |
| `isDisabled` | `boolean` | Whether this day is disabled (set by `applySelection`) |
| `isUnavailable` | `boolean` | Whether this day stays focusable but cannot be picked (set by `applySelection`) |
| `isRangeStart` | `boolean` | Whether this day is the start of a range |
| `isRangeEnd` | `boolean` | Whether this day is the end of a range |
| `isRangeMiddle` | `boolean` | Whether this day is in the middle of a range |

***

### `buildMultiMonth`

Build multiple consecutive month grids.

```tsx
buildMultiMonth(adapter: Adapter.IDateAdapter<TDate>, startMonth: TDate, count: number, config: Pick<Calendar.ICalendarConfig<TDate, any>, 'showOutsideDays' | 'fixedWeeks' | 'locale'>) => Grid.ICalendarMonth<TDate>[]
```

| Param | Type | Description |
| :--- | :--- | :--- |
| `adapter` | `Adapter.IDateAdapter<TDate>` | Date adapter |
| `startMonth` | `TDate` | Any date in the first month |
| `count` | `number` | Number of months |
| `config` | `Pick<Calendar.ICalendarConfig<TDate, any>, 'showOutsideDays' \| 'fixedWeeks' \| 'locale'>` | Grid options |

***

### `buildCalendarYear`

Build month entries for year navigation. Queries the adapter for the actual month count to support calendars with variable months (e.g. Hebrew leap years with 13 months).

```tsx
buildCalendarYear(adapter: Adapter.IDateAdapter<TDate>, viewDate: TDate, locale?: string) => Grid.IYearEntry[]
```

| Param | Type | Description |
| :--- | :--- | :--- |
| `adapter` | `Adapter.IDateAdapter<TDate>` | Date adapter |
| `viewDate` | `TDate` | Any date in the target year |
| `locale` | `string` | BCP 47 locale for month names |

Each `Grid.IYearEntry` has:

| Property | Type | Description |
| :--- | :--- | :--- |
| `month` | `number` | Month index (0-based) |
| `label` | `string` | Localized month name |
| `isCurrent` | `boolean` | Whether this is the current month (today's month and year) |

***

### `buildDecadeView`

Build a decade year picker.

```tsx
buildDecadeView(adapter: Adapter.IDateAdapter<TDate>, viewDate: TDate) => Grid.IDecadeEntry[]
```

Each `Grid.IDecadeEntry` has:

| Property | Type | Description |
| :--- | :--- | :--- |
| `year` | `number` | The year |
| `isCurrent` | `boolean` | Whether this is the current year |

***

## Utility Functions

### `getLocaleWeekInfo`

The first day and the weekend of a locale's week, read from `Intl.Locale`. With no locale, or a runtime that cannot describe it, the week starts on Sunday and its weekend is Saturday and Sunday.

```tsx
getLocaleWeekInfo(locale: string | undefined) => Grid.IWeekInfo // { firstDay: WeekStartDay, weekend: number[] }
```

```tsx
getLocaleWeekInfo('de-DE') // { firstDay: 1, weekend: [6, 0] }
```

***

### `getLocalizedWeekdays`

Returns 7 localized weekday names starting from the given week start day.

```tsx
getLocalizedWeekdays(adapter: Adapter.IDateAdapter<TDate>, locale?: string, weekStartDay?: WeekStartDay, format?: 'long' | 'short' | 'narrow') => string[]
```

| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `adapter` | `Adapter.IDateAdapter<TDate>` | - | Date adapter |
| `locale` | `string` | runtime default | BCP 47 locale tag |
| `weekStartDay` | `WeekStartDay` | `0` | Day the week starts on (0 = Sunday) |
| `format` | `'long' \| 'short' \| 'narrow'` | `'short'` | Intl weekday format |

```tsx
const weekdays = getLocalizedWeekdays(adapter, 'en-US', 1) // Monday-first
// ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
```

***

### `getLocalizedMonthNames`

Returns localized month names for a given year. Queries the adapter for the actual month count to support calendar systems with variable months (e.g. Hebrew leap years with 13 months).

```tsx
getLocalizedMonthNames(adapter: Adapter.IDateAdapter<TDate>, year: number, locale?: string, format?: 'long' | 'short' | 'narrow') => string[]
```

| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `adapter` | `Adapter.IDateAdapter<TDate>` | - | Date adapter |
| `year` | `number` | - | Year to query month count for |
| `locale` | `string` | runtime default | BCP 47 locale tag |
| `format` | `'long' \| 'short' \| 'narrow'` | `'long'` | Intl month format |

```tsx
const months = getLocalizedMonthNames(adapter, 2026, 'ar-SA')
// Arabic month names
```

***

### `getWeekNumber`

Computes the ISO 8601 week number for a given date. Week 1 is the week containing the first Thursday of the year.

```tsx
getWeekNumber(adapter: Adapter.IDateAdapter<TDate>, date: TDate) => number
```

| Param | Type | Description |
| :--- | :--- | :--- |
| `adapter` | `Adapter.IDateAdapter<TDate>` | Date adapter |
| `date` | `TDate` | The date to compute the week number for |

```tsx
const week = getWeekNumber(adapter, new Date(2026, 2, 19)) // 12
```