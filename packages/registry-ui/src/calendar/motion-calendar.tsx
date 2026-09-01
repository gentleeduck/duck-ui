'use client'

import { NativeAdapter, useCalendar } from '@gentleduck/calendar'
import { cn } from '@gentleduck/libs/cn'
import { staggerChildren } from '@gentleduck/motion'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { tapScale } from '@gentleduck/motion/presets/content'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { blurLight } from '@gentleduck/motion/transitions/blur'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { tweenExpand } from '@gentleduck/motion/transitions/tweens'
import { useDirection } from '@gentleduck/primitives/direction'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { AnimatePresence, LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { buttonVariants } from '../button'
import { callCalendarSelectHandler } from './calendar.libs'
import type { ICalendarProps } from './calendar.types'
import { MotionCalendarDayCell } from './motion-calendar-day'
import { MotionCalendarHeader } from './motion-calendar-header'

const DEFAULT_ADAPTER = new NativeAdapter()
const BLUR = `blur(${blurLight}px)`

const MotionCalendar = React.forwardRef<HTMLDivElement, ICalendarProps>(
  (
    {
      className,
      adapter = DEFAULT_ADAPTER,
      buttonVariant = 'ghost',
      mode = 'single',
      selected,
      onSelect,
      disabled,
      defaultMonth,
      month: controlledMonth,
      onMonthChange,
      showOutsideDays = true,
      fixedWeeks = false,
      numberOfMonths = 1,
      locale,
      dir,
      fromDate,
      toDate,
      onDismiss,
      showDropdowns = true,
      yearRange,
      renderDay,
      renderHeader,
      renderWeekday,
      renderFooter,
    },
    ref,
  ) => {
    const direction = useDirection(dir)
    const currentYear = new Date().getFullYear()
    const resolvedYearRange = yearRange ?? { from: currentYear - 100, to: currentYear + 10 }
    const formatLocale = locale?.startsWith('ar') ? `${locale}-u-nu-arab` : locale

    const [navDirection, setNavDirection] = React.useState(1)
    const prevMonthRef = React.useRef<number | null>(null)

    const calendar = useCalendar({
      adapter,
      mode,
      locale: locale ? { locale, weekStartDay: 0, direction } : { weekStartDay: 0, direction },
      month: controlledMonth,
      defaultMonth,
      selected,
      onSelect: onSelect ? (value) => callCalendarSelectHandler(mode, onSelect, value) : undefined,
      onMonthChange,
      showOutsideDays,
      fixedWeeks,
      numberOfMonths,
      disabled,
      fromDate,
      toDate,
      onDismiss,
    })

    const { state, getDayProps, getGridProps, getNavProps, getHeaderProps, announcer } = calendar
    const [keyboardActive, setKeyboardActive] = React.useState(false)

    const monthKey = state.months.map((m) => m.month.getTime()).join('-')
    React.useEffect(() => {
      const current = state.month.getTime()
      if (prevMonthRef.current !== null && prevMonthRef.current !== current) {
        setNavDirection(current > prevMonthRef.current ? 1 : -1)
      }
      prevMonthRef.current = current
    }, [state.month])

    const prevNavProps = getNavProps('prev')
    const nextNavProps = getNavProps('next')

    const wrapNavClick = (original: () => void, dir: number) => () => {
      setNavDirection(dir)
      original()
    }

    const calContent = useMotionPreset(scaleIn, { transition: springBouncy })

    return (
      <LazyMotion features={loadDomAnimation}>
        <m.div initial={calContent.initial} animate={calContent.animate} transition={calContent.transition}>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: keyboard/pointer tracking for focus ring management */}
          <div
            ref={ref}
            data-slot="calendar"
            dir={direction}
            onKeyDown={() => {
              if (!keyboardActive) setKeyboardActive(true)
            }}
            onPointerDown={() => {
              if (keyboardActive) setKeyboardActive(false)
            }}
            className={cn(
              'group/calendar w-fit bg-background p-3 [--gentleduck-calendar-cell:--spacing(8)]',
              'rounded-md in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent',
              className,
            )}>
            <div className="relative flex flex-col gap-4">
              {renderHeader ? (
                renderHeader({
                  month: state.month,
                  title: adapter.format(state.month, { month: 'long', year: 'numeric' }, formatLocale),
                  direction,
                  goToPrevMonth: wrapNavClick(prevNavProps.onClick, -1),
                  goToNextMonth: wrapNavClick(nextNavProps.onClick, 1),
                  isPrevDisabled: prevNavProps.disabled,
                  isNextDisabled: nextNavProps.disabled,
                })
              ) : numberOfMonths <= 1 ? (
                <MotionCalendarHeader
                  adapter={adapter}
                  month={state.month}
                  title={adapter.format(state.month, { month: 'long', year: 'numeric' }, formatLocale)}
                  direction={direction}
                  locale={locale}
                  buttonVariant={buttonVariant}
                  showDropdowns={showDropdowns}
                  yearRange={resolvedYearRange}
                  getNavProps={(dir) => {
                    const props = getNavProps(dir)
                    return { ...props, onClick: wrapNavClick(props.onClick, dir === 'prev' ? -1 : 1) }
                  }}
                  getHeaderProps={getHeaderProps}
                  onMonthSelect={calendar.actions.setMonth}
                />
              ) : (
                <div className="relative flex w-full items-center">
                  <m.button
                    type="button"
                    {...prevNavProps}
                    whileTap={tapScale}
                    onClick={wrapNavClick(prevNavProps.onClick, -1)}
                    className={cn(
                      buttonVariants({ variant: buttonVariant as 'ghost' }),
                      'absolute start-0 z-10 size-(--gentleduck-calendar-cell) select-none p-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
                    )}>
                    <ChevronLeftIcon className={cn('size-4', direction === 'rtl' && 'rotate-180')} />
                  </m.button>
                  {state.months.map((mo) => (
                    <span key={mo.month.getTime()} className="flex-1 select-none text-center font-medium text-sm">
                      {adapter.format(mo.month, { month: 'long', year: 'numeric' }, formatLocale)}
                    </span>
                  ))}
                  <m.button
                    type="button"
                    {...nextNavProps}
                    whileTap={tapScale}
                    onClick={wrapNavClick(nextNavProps.onClick, 1)}
                    className={cn(
                      buttonVariants({ variant: buttonVariant as 'ghost' }),
                      'absolute end-0 z-10 size-(--gentleduck-calendar-cell) select-none p-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
                    )}>
                    <ChevronRightIcon className={cn('size-4', direction === 'rtl' && 'rotate-180')} />
                  </m.button>
                </div>
              )}

              <div className="relative">
                <AnimatePresence mode="wait" initial={false} custom={navDirection}>
                  <m.div
                    key={monthKey}
                    custom={navDirection}
                    variants={{
                      enter: (dir: number) => ({
                        opacity: 0,
                        y: dir * 6,
                        filter: BLUR,
                      }),
                      center: { opacity: 1, y: 0, filter: 'blur(0px)' },
                      exit: (dir: number) => ({
                        opacity: 0,
                        y: dir * -6,
                        filter: BLUR,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={tweenExpand}
                    className="flex flex-col gap-4 md:flex-row">
                    {state.months.map((monthGrid) => {
                      const gridProps = getGridProps()
                      return (
                        <div key={monthGrid.month.getTime()} className="flex w-full flex-col gap-4">
                          <div {...gridProps}>
                            {/* biome-ignore lint/a11y/useSemanticElements: role="row" on div per WAI-ARIA grid pattern */}
                            {/* biome-ignore lint/a11y/useFocusableInteractive: weekday header row is not interactive */}
                            <div role="row" className="flex">
                              {state.weekdays.map((day, index) => (
                                // biome-ignore lint/a11y/useSemanticElements: columnheader on div per WAI-ARIA grid pattern
                                // biome-ignore lint/a11y/useFocusableInteractive: weekday headers are not interactive
                                <div
                                  key={day}
                                  role="columnheader"
                                  className="flex-1 select-none rounded-md text-center font-normal text-[0.8rem] text-muted-foreground">
                                  {renderWeekday
                                    ? renderWeekday(day, index)
                                    : locale?.startsWith('ar')
                                      ? day.replace(/^ال/, '')
                                      : locale?.startsWith('fa')
                                        ? day.slice(0, 2)
                                        : locale?.startsWith('he')
                                          ? day.replace(/^יום\s*/, '')
                                          : day}
                                </div>
                              ))}
                            </div>
                            <m.div
                              variants={{
                                hidden: {},
                                visible: { transition: staggerChildren(8, 40) },
                              }}
                              initial="hidden"
                              animate="visible">
                              {monthGrid.weeks.map((week) => (
                                // biome-ignore lint/a11y/useSemanticElements: role="row" on div per WAI-ARIA grid pattern
                                // biome-ignore lint/a11y/useFocusableInteractive: grid rows are not interactive
                                <div key={week.weekNumber} role="row" className="mt-2 flex w-full">
                                  {week.days.map((day, dayIdx) => {
                                    const {
                                      onMouseEnter: _,
                                      role: _role,
                                      'aria-selected': _ariaSel,
                                      ...dayProps
                                    } = getDayProps(day)
                                    const isSelectedSingle =
                                      day.isSelected && !day.isRangeStart && !day.isRangeEnd && !day.isRangeMiddle
                                    const isFocused =
                                      keyboardActive && day.date.getTime() === state.focusedDate.getTime()
                                    return (
                                      <m.div
                                        key={day.date.getTime()}
                                        variants={{
                                          hidden: { opacity: 0, y: 4, filter: 'blur(2px)' },
                                          visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                                        }}
                                        className="flex-1">
                                        <MotionCalendarDayCell
                                          day={day}
                                          dayProps={dayProps}
                                          isFocused={isFocused}
                                          isSelectedSingle={isSelectedSingle}
                                          isFirstInRow={dayIdx === 0}
                                          isLastInRow={dayIdx === 6}
                                          locale={locale}
                                          onFocusDate={(date) => {
                                            setKeyboardActive(false)
                                            calendar.actions.focusDate(date)
                                          }}
                                          renderDay={renderDay}
                                        />
                                      </m.div>
                                    )
                                  })}
                                </div>
                              ))}
                            </m.div>
                          </div>
                        </div>
                      )
                    })}
                  </m.div>
                </AnimatePresence>
              </div>
              {renderFooter?.(state.months)}
            </div>
            <announcer.AnnouncerPortal />
          </div>
        </m.div>
      </LazyMotion>
    )
  },
)
MotionCalendar.displayName = 'MotionCalendar'

export { MotionCalendar }
