import { useCallback, useId, useRef, useState } from 'react'
import { clampTime, incrementField, isValidTime, parseTimeInput } from '../../time/time'
import { formatTimeField, getAmPm, to12Hour, to24Hour } from '../../time/time.libs'
import type { Time } from '../../time/time.types'
import { useControllableState } from '../utils/use-controllable-state'
import type { UseTimePicker } from './use-time-picker.types'

// Pre-computed field orders for all 4 combinations  -  avoids filter() on every digit press.
// Keyed by `${hourCycle}_${showSeconds}` with a template literal type so the lookup
// is exhaustive at compile time and typos surface as TS errors instead of `undefined`.
type FieldOrderKey = `${Time.HourCycle}_${boolean}`
const FIELD_ORDERS: Record<FieldOrderKey, Time.TimeField[]> = {
  '24_false': ['hour', 'minute'],
  '24_true': ['hour', 'minute', 'second'],
  '12_false': ['hour', 'minute', 'ampm'],
  '12_true': ['hour', 'minute', 'second', 'ampm'],
}

const FIELD_LABELS: Record<Time.TimeField, string> = {
  hour: 'Hour',
  minute: 'Minute',
  second: 'Second',
  ampm: 'AM/PM',
}

/** The greatest number `setField` and typing take for a field; a 12-hour hour takes 0 for 12. */
function fieldTop(field: Time.TimeField, hourCycle: Time.HourCycle): number {
  if (field === 'hour') return hourCycle === '12' ? 12 : 23
  return field === 'ampm' ? 1 : 59
}

function getFieldRange(
  field: Time.TimeField,
  hourCycle: '12' | '24',
  value: Time.ITimeValue,
  minTime?: Time.ITimeValue,
  maxTime?: Time.ITimeValue,
): { min: number; max: number } {
  switch (field) {
    case 'hour': {
      // A 12-hour hour runs 12, 1 to 11 in the half of the day the value is in, so its range is that
      // half's hours left by minTime and maxTime, as they are shown.
      const pm = hourCycle === '12' && value.hour >= 12
      const first = pm ? 12 : 0
      const last = hourCycle === '12' && !pm ? 11 : 23
      const lo = Math.max(first, minTime?.hour ?? first)
      const hi = Math.min(last, maxTime?.hour ?? last)
      if (lo > hi) return hourCycle === '12' ? { min: 1, max: 12 } : { min: 0, max: 23 }
      if (hourCycle === '24') return { min: lo, max: hi }
      const shown = Array.from({ length: hi - lo + 1 }, (_, i) => to12Hour(lo + i))
      return { min: Math.min(...shown), max: Math.max(...shown) }
    }
    case 'minute':
      return { min: 0, max: 59 }
    case 'second':
      return { min: 0, max: 59 }
    case 'ampm':
      return { min: 0, max: 1 }
  }
}

function getFieldNow(field: Time.TimeField, value: Time.ITimeValue, hourCycle: '12' | '24'): number {
  switch (field) {
    case 'hour':
      return hourCycle === '12' ? to12Hour(value.hour) : value.hour
    case 'minute':
      return value.minute
    case 'second':
      return value.second ?? 0
    case 'ampm':
      return value.hour < 12 ? 0 : 1
  }
}

function getFieldText(field: Time.TimeField, value: Time.ITimeValue, hourCycle: '12' | '24'): string {
  switch (field) {
    case 'hour':
      return formatTimeField(hourCycle === '12' ? to12Hour(value.hour) : value.hour)
    case 'minute':
      return formatTimeField(value.minute)
    case 'second':
      return formatTimeField(value.second ?? 0)
    case 'ampm':
      return getAmPm(value.hour)
  }
}

export function useTimePicker(config: UseTimePicker.IUseTimePickerConfig = {}): UseTimePicker.IUseTimePickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    hourCycle = '24',
    showSeconds = false,
    minTime,
    maxTime,
    minuteStep,
    secondStep,
  } = config

  const initialValue: Time.ITimeValue = defaultValue ?? { hour: 0, minute: 0 }

  const [value, setValueRaw] = useControllableState<Time.ITimeValue>(controlledValue, initialValue, onChange)

  const [focusedField, setFocusedField] = useState<Time.TimeField>('hour')
  const pickerId = useId()

  // The digits typed into the focused field so far, which a next digit extends.
  const typed = useRef('')

  const displayHour = hourCycle === '12' ? to12Hour(value.hour) : value.hour
  const displayAmPm = getAmPm(value.hour)

  const setValue = useCallback(
    (next: Time.ITimeValue) => {
      if (isValidTime(next)) setValueRaw(clampTime(next, minTime, maxTime))
    },
    [setValueRaw, minTime, maxTime],
  )

  const setField = useCallback(
    (field: Time.TimeField, fieldValue: number) => {
      if (!Number.isInteger(fieldValue) || fieldValue < 0 || fieldValue > fieldTop(field, hourCycle)) return
      const next = { ...value }
      switch (field) {
        case 'hour':
          // In 12h mode, convert displayed hour back to 24h using current AM/PM
          next.hour =
            hourCycle === '12' ? to24Hour(fieldValue === 0 ? 12 : fieldValue, getAmPm(value.hour)) : fieldValue
          break
        case 'minute':
          next.minute = fieldValue
          break
        case 'second':
          next.second = fieldValue
          break
        case 'ampm':
          // 0 = AM, 1 = PM  -  convert current hour accordingly
          next.hour = fieldValue === 0 ? value.hour % 12 : (value.hour % 12) + 12
          break
      }
      setValueRaw(clampTime(next, minTime, maxTime))
    },
    [value, setValueRaw, hourCycle, minTime, maxTime],
  )

  const increment = useCallback(
    (field: Time.TimeField, delta = 1) => {
      const next = incrementField(value, field, delta, { hourCycle, minuteStep, secondStep, minTime, maxTime })
      setValueRaw(next)
    },
    [value, setValueRaw, hourCycle, minuteStep, secondStep, minTime, maxTime],
  )

  const decrement = useCallback(
    (field: Time.TimeField, delta = 1) => {
      const next = incrementField(value, field, -delta, { hourCycle, minuteStep, secondStep, minTime, maxTime })
      setValueRaw(next)
    },
    [value, setValueRaw, hourCycle, minuteStep, secondStep, minTime, maxTime],
  )

  const toggleAmPm = useCallback(() => {
    const currentAmPm = getAmPm(value.hour)
    const hour12 = to12Hour(value.hour)
    const newAmPm = currentAmPm === 'AM' ? 'PM' : 'AM'
    const next = clampTime({ ...value, hour: to24Hour(hour12, newAmPm) }, minTime, maxTime)
    setValueRaw(next)
  }, [value, setValueRaw, minTime, maxTime])

  const focusField = useCallback(
    (field: Time.TimeField) => {
      setFocusedField(field)
      document.querySelector<HTMLElement>(`[data-time-picker="${pickerId}"][data-time-field="${field}"]`)?.focus()
    },
    [pickerId],
  )

  const moveFocus = useCallback(
    (from: Time.TimeField, offset: 1 | -1) => {
      const order = FIELD_ORDERS[`${hourCycle}_${showSeconds}` satisfies FieldOrderKey]
      const next = order[order.indexOf(from) + offset]
      if (next) focusField(next)
    },
    [hourCycle, showSeconds, focusField],
  )

  const typeDigit = useCallback(
    (field: Time.TimeField, digit: string) => {
      // Two digits that make no time start the number over from the second.
      let digits = typed.current + digit
      if (parseTimeInput(digits, field, hourCycle) === null) digits = digit
      const parsed = parseTimeInput(digits, field, hourCycle)
      if (parsed !== null) setField(field, parsed)
      typed.current = digits
      if (digits.length === 2 || Number(digits) * 10 > fieldTop(field, hourCycle)) {
        typed.current = ''
        moveFocus(field, 1)
      }
    },
    [hourCycle, setField, moveFocus],
  )

  const getFieldProps = useCallback(
    (field: Time.TimeField): UseTimePicker.ITimeFieldProps => {
      const range = getFieldRange(field, hourCycle, value, minTime, maxTime)
      const now = getFieldNow(field, value, hourCycle)
      const text = getFieldText(field, value, hourCycle)

      const onKeyDown: React.KeyboardEventHandler = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault()
          moveFocus(field, e.key === 'ArrowRight' ? 1 : -1)
          return
        }

        if (field === 'ampm') {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            toggleAmPm()
            return
          }
          if (e.key === 'a' || e.key === 'A') {
            e.preventDefault()
            if (displayAmPm !== 'AM') toggleAmPm()
            return
          }
          if (e.key === 'p' || e.key === 'P') {
            e.preventDefault()
            if (displayAmPm !== 'PM') toggleAmPm()
            return
          }
          return
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          // A step ends any number being typed, so the next digit starts a new one.
          typed.current = ''
          if (e.key === 'ArrowUp') increment(field)
          else decrement(field)
          return
        }

        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault()
          typeDigit(field, e.key)
        }
      }

      const onFocus = () => {
        setFocusedField(field)
        typed.current = ''
      }

      return {
        role: 'spinbutton',
        'aria-label': FIELD_LABELS[field],
        'aria-valuemin': range.min,
        'aria-valuemax': range.max,
        'aria-valuenow': now,
        'aria-valuetext': text,
        tabIndex: 0,
        'data-slot': 'time-picker-field',
        'data-time-picker': pickerId,
        'data-time-field': field,
        'data-focused': focusedField === field ? 'true' : undefined,
        onKeyDown,
        onFocus,
      }
    },
    [
      value,
      focusedField,
      hourCycle,
      increment,
      decrement,
      toggleAmPm,
      moveFocus,
      typeDigit,
      displayAmPm,
      minTime,
      maxTime,
      pickerId,
    ],
  )

  return {
    state: {
      value,
      focusedField,
      hourCycle,
      displayHour,
      displayAmPm,
    },
    actions: {
      setValue,
      setField,
      increment,
      decrement,
      toggleAmPm,
      focusField,
    },
    getFieldProps,
  }
}
