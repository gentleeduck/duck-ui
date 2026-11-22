'use client'

import { cn } from '@gentleduck/libs/cn'
import { tapScale } from '@gentleduck/motion/presets/content'
import { m } from 'motion/react'
import * as React from 'react'
import { buttonVariants } from '../button'
import { formatDayNumber } from './calendar.libs'
import type { ICalendarDayCellProps } from './calendar.types'

export const MotionCalendarDayCell = React.memo(function MotionCalendarDayCell({
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
    'data-[unavailable=true]:text-muted-foreground data-[unavailable=true]:line-through',
    dayProps['data-invalid'] &&
      'data-[range-end=true]:bg-destructive data-[range-middle=true]:bg-destructive/15 data-[range-start=true]:bg-destructive data-[selected-single=true]:bg-destructive data-[range-middle=true]:text-destructive',
    'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:rounded-md group-data-[focused=true]/day:border group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-1 group-data-[focused=true]/day:ring-ring/50',
    '[&>span]:text-xs [&>span]:opacity-70',
  )
  const btnProps = {
    ...dayProps,
    disabled: day.isDisabled,
    tabIndex: day.isDisabled ? -1 : dayProps.tabIndex,
    onClick: (e: React.MouseEvent) => {
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
        'group/day relative aspect-square size-full select-none p-0 text-center',
        day.isHidden && 'invisible',
        isInRange && 'overflow-hidden',
        day.isRangeStart && 'rounded-s-md bg-accent',
        day.isRangeEnd && 'rounded-e-md bg-accent',
        day.isRangeMiddle && 'bg-accent',
        isInRange && dayProps['data-invalid'] && 'bg-destructive/15',
        isInRange && isFirstInRow && !day.isRangeStart && 'rounded-s-md',
        isInRange && isLastInRow && !day.isRangeEnd && 'rounded-e-md',
        day.isOutside && !day.isHidden && 'text-muted-foreground',
        day.isDisabled && !day.isHidden && 'cursor-not-allowed text-muted-foreground opacity-50',
      )}>
      <m.button type="button" whileTap={tapScale} {...btnProps}>
        {content}
      </m.button>
    </div>
  )
})

MotionCalendarDayCell.displayName = 'MotionCalendarDayCell'
