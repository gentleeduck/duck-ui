'use client'

import { cn } from '@gentleduck/libs/cn'
import * as React from 'react'
import { buttonVariants } from '../button'
import { getCachedNumberFormat } from './calendar.libs'
import type { ICalendarDayCellProps } from './calendar.types'

const HEBREW_ONES = [
  '',
  '\u05D0\u05F3',
  '\u05D1\u05F3',
  '\u05D2\u05F3',
  '\u05D3\u05F3',
  '\u05D4\u05F3',
  '\u05D5\u05F3',
  '\u05D6\u05F3',
  '\u05D7\u05F3',
  '\u05D8\u05F3',
]
const HEBREW_TENS = ['', '\u05D9\u05F3', '\u05DB\u05F3', '\u05DC\u05F3']

function toHebrewNumeral(n: number): string {
  if (n === 15) return '\u05D8\u05F4\u05D5'
  if (n === 16) return '\u05D8\u05F4\u05D6'
  const ten = Math.floor(n / 10)
  const one = n % 10
  if (one === 0) return HEBREW_TENS[ten] ?? String(n)
  if (ten === 0) return HEBREW_ONES[one] ?? String(n)
  const t = (HEBREW_TENS[ten] ?? '').replace('\u05F3', '')
  const o = (HEBREW_ONES[one] ?? '').replace('\u05F3', '')
  return `${t}\u05F4${o}`
}

function formatDayNumber(d: number, locale?: string): React.ReactNode {
  if (!locale) return d
  if (locale.startsWith('ar')) return getCachedNumberFormat(`${locale}-u-nu-arab`).format(d)
  if (locale.startsWith('he')) return toHebrewNumeral(d)
  return getCachedNumberFormat(locale).format(d)
}

export const CalendarDayCell = React.memo(function CalendarDayCell({
  day,
  dayProps,
  isFocused,
  isSelectedSingle,
  isFirstInRow,
  isLastInRow,
  locale,
  onFocusDate,
  renderDay,
}: ICalendarDayCellProps) {
  const isInRange = day.isRangeStart || day.isRangeEnd || day.isRangeMiddle
  const dayNum = formatDayNumber(day.date.getDate(), locale)

  const btnCls = cn(
    buttonVariants({ variant: 'ghost', size: 'icon' }),
    'flex aspect-square size-auto w-full min-w-(--gentleduck-calendar-cell) flex-col gap-1 font-normal leading-none focus-visible:ring-0 focus-visible:ring-offset-0',
    'data-[selected-single=true]:rounded-md data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground',
    'data-[range-start=true]:rounded-s-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground',
    'data-[range-end=true]:rounded-e-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground',
    'data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground',
    day.isOutside && 'text-muted-foreground/50',
    'data-[today=true]:font-semibold',
    'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:rounded-md group-data-[focused=true]/day:border group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-1 group-data-[focused=true]/day:ring-ring/50',
    '[&>span]:text-xs [&>span]:opacity-70',
  )
  const btnProps = {
    ...dayProps,
    disabled: day.isDisabled,
    tabIndex: day.isDisabled ? -1 : dayProps.tabIndex,
    onClick: (e: React.MouseEvent) => {
      if (day.isDisabled) return
      dayProps.onClick({ shiftKey: e.shiftKey })
      onFocusDate(day.date)
      ;(e.currentTarget as HTMLElement).blur()
    },
    'data-day': day.date.toLocaleDateString(),
    'data-range-end': day.isRangeEnd || undefined,
    'data-range-middle': day.isRangeMiddle || undefined,
    'data-range-start': day.isRangeStart || undefined,
    'data-selected-single': isSelectedSingle || undefined,
    'data-today': day.isToday || undefined,
    'data-focused': isFocused || undefined,
    className: btnCls,
  }
  const content = renderDay ? renderDay(day, dayNum) : dayNum

  return (
    // biome-ignore lint/a11y/useSemanticElements: gridcell on div per WAI-ARIA grid pattern
    // biome-ignore lint/a11y/useFocusableInteractive: gridcell focus is on the child button
    <div
      role="gridcell"
      aria-selected={day.isSelected}
      data-selected={day.isSelected ? 'true' : undefined}
      data-focused={isFocused ? 'true' : undefined}
      className={cn(
        'group/day relative aspect-square h-full w-full select-none p-0 text-center',
        day.isHidden && 'invisible',
        isInRange && 'overflow-hidden',
        day.isRangeStart && 'rounded-s-md bg-accent',
        day.isRangeEnd && 'rounded-e-md bg-accent',
        day.isRangeMiddle && 'bg-accent',
        isInRange && isFirstInRow && !day.isRangeStart && 'rounded-s-md',
        isInRange && isLastInRow && !day.isRangeEnd && 'rounded-e-md',
        day.isOutside && !day.isHidden && 'text-muted-foreground',
        day.isOutside && !day.isHidden && day.isSelected && 'text-muted-foreground',
        day.isDisabled && !day.isHidden && 'cursor-not-allowed text-muted-foreground opacity-50',
      )}>
      <button type="button" {...btnProps}>
        {content}
      </button>
    </div>
  )
})

CalendarDayCell.displayName = 'CalendarDayCell'
