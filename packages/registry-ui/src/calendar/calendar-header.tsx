'use client'

import { buildCalendarYear, goToMonth, goToYear, NativeAdapter } from '@gentleduck/calendar'
import { cn } from '@gentleduck/libs/cn'
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import * as React from 'react'
import { buttonVariants } from '../button'
import { getCachedNumberFormat } from './calendar.libs'
import type { ICalendarHeaderProps } from './calendar.types'

const defaultAdapter = new NativeAdapter()

const ITEM_HEIGHT = 28
const VISIBLE_ITEMS = 9
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS
const OVERSCAN = 3

function VirtualizedDropdown({
  items,
  activeValue,
  onSelect,
  open,
}: {
  items: { value: string; label: string }[]
  activeValue: string
  onSelect: (value: string) => void
  open: boolean
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(() => {
    const idx = items.findIndex((i) => i.value === activeValue)
    return Math.max(0, idx * ITEM_HEIGHT - LIST_HEIGHT / 2 + ITEM_HEIGHT / 2)
  })

  const totalHeight = items.length * ITEM_HEIGHT

  React.useLayoutEffect(() => {
    if (!open || !scrollRef.current) return
    const idx = items.findIndex((i) => i.value === activeValue)
    const target = Math.max(0, idx * ITEM_HEIGHT - LIST_HEIGHT / 2 + ITEM_HEIGHT / 2)
    scrollRef.current.scrollTop = target
    setScrollTop(target)
  }, [activeValue, items, open])

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + LIST_HEIGHT) / ITEM_HEIGHT) + OVERSCAN)

  const longestLabel = React.useMemo(
    () => items.reduce((a, b) => (b.label.length > a.length ? b.label : a), ''),
    [items],
  )

  return (
    <div
      ref={scrollRef}
      data-state={open ? 'open' : 'closed'}
      className={cn(
        'overflow-y-auto rounded-md border bg-popover p-1 shadow-md',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2 origin-top data-[state=closed]:hidden data-[state=closed]:animate-out data-[state=open]:animate-in',
        'transition-all transition-discrete duration-150 ease-(--gentleduck-motion-ease)',
      )}
      style={{ height: LIST_HEIGHT, scrollBehavior: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      {/* Hidden sizer  -  establishes the intrinsic width from the longest label */}
      <div
        aria-hidden
        className="pointer-events-none invisible flex h-0 items-center gap-2 overflow-hidden ps-6 pe-4 text-sm">
        <CheckIcon className="size-3.5 shrink-0" />
        {longestLabel}
      </div>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items.slice(startIndex, endIndex).map((item, i) => {
          const isActive = item.value === activeValue
          return (
            <button
              key={item.value}
              type="button"
              className={cn(
                'flex w-full cursor-default select-none items-center gap-2 whitespace-nowrap rounded-sm ps-6 pe-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent font-medium text-accent-foreground',
              )}
              style={{
                position: 'absolute',
                top: (startIndex + i) * ITEM_HEIGHT,
                height: ITEM_HEIGHT,
                left: 0,
                right: 0,
              }}
              onClick={() => onSelect(item.value)}>
              {isActive && <CheckIcon className="absolute start-1.5 size-3.5" />}
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DropdownTrigger({ label, open, onClick }: { label: string; open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      dir="ltr"
      aria-expanded={open}
      onClick={onClick}
      className="flex h-7 w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-2 font-medium text-sm shadow-xs">
      <span dir="auto">{label}</span>
      <ChevronDownIcon className="size-3 text-muted-foreground" />
    </button>
  )
}

function NavButton({
  className,
  children,
  onDrag: _d,
  onDragStart: _ds,
  onDragEnd: _de,
  onAnimationStart: _as,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={className} {...props}>
      {children}
    </button>
  )
}

/** Prevents Select portal interactions from dismissing parent Popover. */
function stopPopoverDismiss(e: React.PointerEvent) {
  e.stopPropagation()
}

export function CalendarHeader({
  adapter: adapterProp,
  month,
  title,
  direction,
  locale,
  buttonVariant,
  showDropdowns,
  yearRange,
  getNavProps,
  getHeaderProps,
  onMonthSelect,
}: ICalendarHeaderProps) {
  const adapter = adapterProp ?? defaultAdapter
  const headerProps = getHeaderProps()
  const currentYear = adapter.getYear(month)
  const currentMonth = adapter.getMonth(month)
  const [monthOpen, setMonthOpen] = React.useState(false)
  const [yearOpen, setYearOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Outside-click without a fixed backdrop, which would block parent Popover
  React.useEffect(() => {
    if (!monthOpen && !yearOpen) return
    function handlePointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMonthOpen(false)
        setYearOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [monthOpen, yearOpen])

  const isArabic = locale?.startsWith('ar')
  const formatLocaleTag = isArabic ? `${locale}-u-nu-arab` : locale

  const monthItems = React.useMemo(() => {
    const entries = buildCalendarYear(adapter, month, locale)
    return entries.map((e) => ({
      value: String(e.month),
      label: isArabic ? e.label : e.label.slice(0, 3),
    }))
  }, [adapter, month, locale, isArabic])

  const yearItems = React.useMemo(() => {
    const fmt = formatLocaleTag ? getCachedNumberFormat(formatLocaleTag, { useGrouping: false }) : null
    const result: { value: string; label: string }[] = []
    for (let y = yearRange.from; y <= yearRange.to; y++) {
      result.push({ value: String(y), label: fmt ? fmt.format(y) : String(y) })
    }
    return result
  }, [yearRange.from, yearRange.to, formatLocaleTag])

  return (
    <div className="flex h-(--gentleduck-calendar-cell) w-full items-center justify-center px-(--gentleduck-calendar-cell)">
      <div className="absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1">
        <NavButton
          {...getNavProps('prev')}
          className={cn(
            buttonVariants({ variant: buttonVariant as 'ghost' }),
            'size-(--gentleduck-calendar-cell) select-none p-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
          )}>
          <ChevronLeftIcon className={cn('size-4', direction === 'rtl' && 'rotate-180')} />
        </NavButton>

        {showDropdowns ? (
          <div
            ref={dropdownRef}
            {...headerProps}
            className="flex items-center gap-1.5"
            onPointerDown={stopPopoverDismiss}>
            <div className="relative">
              <DropdownTrigger
                label={adapter.format(month, { month: isArabic ? 'long' : 'short' }, formatLocaleTag)}
                open={monthOpen}
                onClick={() => {
                  setMonthOpen((o) => !o)
                  setYearOpen(false)
                }}
              />
              <div className="absolute start-0 top-full z-50 mt-1">
                <VirtualizedDropdown
                  items={monthItems}
                  activeValue={String(currentMonth)}
                  open={monthOpen}
                  onSelect={(v) => {
                    onMonthSelect(goToMonth(adapter, month, Number(v)))
                    setMonthOpen(false)
                  }}
                />
              </div>
            </div>

            <div className="relative">
              <DropdownTrigger
                label={
                  formatLocaleTag
                    ? getCachedNumberFormat(formatLocaleTag, { useGrouping: false }).format(currentYear)
                    : String(currentYear)
                }
                open={yearOpen}
                onClick={() => {
                  setYearOpen((o) => !o)
                  setMonthOpen(false)
                }}
              />
              <div className="absolute end-0 top-full z-50 mt-1">
                <VirtualizedDropdown
                  items={yearItems}
                  activeValue={String(currentYear)}
                  open={yearOpen}
                  onSelect={(v) => {
                    onMonthSelect(goToYear(adapter, month, Number(v)))
                    setYearOpen(false)
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div {...headerProps} className="select-none font-medium text-sm">
            {title}
          </div>
        )}

        <NavButton
          {...getNavProps('next')}
          className={cn(
            buttonVariants({ variant: buttonVariant as 'ghost' }),
            'size-(--gentleduck-calendar-cell) select-none p-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
          )}>
          <ChevronRightIcon className={cn('size-4', direction === 'rtl' && 'rotate-180')} />
        </NavButton>
      </div>
    </div>
  )
}

CalendarHeader.displayName = 'CalendarHeader'
