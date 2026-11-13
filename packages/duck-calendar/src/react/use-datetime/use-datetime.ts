import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Selection } from '../../selection'
import type { Time } from '../../time'
import { useCalendar } from '../use-calendar'
import { useTimePicker } from '../use-time-picker'
import type { UseDateTime } from './use-datetime.types'

const DEFAULT_TIME: Time.ITimeValue = Object.freeze({ hour: 0, minute: 0, second: 0 })

/**
 * Composes `useCalendar` (single mode) and `useTimePicker` into a unified
 * datetime picker hook. Selecting a date preserves the current time, and
 * changing the time preserves the current date.
 */
export function useDateTime<TDate>(
  config: UseDateTime.IUseDateTimeConfig<TDate>,
): UseDateTime.IUseDateTimeReturn<TDate> {
  const {
    adapter,
    locale,
    value: controlledValue,
    defaultValue,
    onChange,
    hourCycle,
    showSeconds = false,
    month,
    defaultMonth,
    onMonthChange,
    disabled,
    fromDate,
    toDate,
    onDismiss,
  } = config

  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState<TDate | null>(defaultValue ?? null)

  const currentValue = isControlled ? controlledValue : internalValue

  // Stable ref for onChange to avoid cascading callback invalidation
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const setDateTime = useCallback(
    (next: TDate) => {
      if (!isControlled) setInternalValue(next)
      onChangeRef.current?.(next)
    },
    [isControlled],
  )

  // The time picked while no date is, shown in the time picker and put on the date picked next.
  const [pendingTime, setPendingTime] = useState<Time.ITimeValue>(DEFAULT_TIME)

  // Memoised to avoid new Time objects each render.
  const timeValue = useMemo(
    () =>
      currentValue == null
        ? pendingTime
        : {
            hour: adapter.getHours(currentValue),
            minute: adapter.getMinutes(currentValue),
            second: adapter.getSeconds(currentValue),
          },
    [adapter, currentValue, pendingTime],
  )

  // Keep a ref of the latest time so calendar selection can read it synchronously
  const timeRef = useRef<Time.ITimeValue>(timeValue)

  // Sync timeRef when the controlled value changes externally
  useEffect(() => {
    timeRef.current = timeValue
  }, [timeValue])

  const currentValueRef = useRef(currentValue)
  useEffect(() => {
    currentValueRef.current = currentValue
  }, [currentValue])

  const handleCalendarSelect = useCallback(
    (selected: Selection.CalendarValue<TDate, 'single'>) => {
      if (selected == null) return
      const date = selected as TDate
      const t = timeRef.current
      setDateTime(adapter.setTime(date, t.hour, t.minute, t.second))
    },
    [adapter, setDateTime],
  )

  const handleTimeChange = useCallback(
    (newTime: Time.ITimeValue) => {
      const time = { hour: newTime.hour, minute: newTime.minute, second: newTime.second ?? 0 }
      timeRef.current = time
      if (currentValueRef.current == null) setPendingTime(time)
      else setDateTime(adapter.setTime(currentValueRef.current, time.hour, time.minute, time.second))
    },
    [adapter, setDateTime],
  )

  const calendar = useCalendar<TDate, 'single'>({
    adapter,
    mode: 'single',
    locale,
    month,
    defaultMonth,
    onMonthChange,
    disabled,
    fromDate,
    toDate,
    onDismiss,
    selected: currentValue ?? undefined,
    onSelect: handleCalendarSelect,
  })

  const timePicker = useTimePicker({
    value: timeValue,
    hourCycle,
    showSeconds,
    onChange: handleTimeChange,
  })

  return {
    calendar,
    timePicker,
    state: {
      value: currentValue,
    },
    actions: {
      setValue: setDateTime,
    },
  }
}
