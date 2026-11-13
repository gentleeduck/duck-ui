import type { Time } from './time.types'

/** Convert a TimeValue to total seconds for comparison. */
function toSeconds(t: Time.ITimeValue): number {
  return t.hour * 3600 + t.minute * 60 + (t.second ?? 0)
}

function isWhole(value: number, max: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= max
}

/** Whether each field is a whole number in its range. */
export function isValidTime(time: Time.ITimeValue): boolean {
  return isWhole(time.hour, 23) && isWhole(time.minute, 59) && (time.second === undefined || isWhole(time.second, 59))
}

/** Clamp a time value within min/max bounds. */
export function clampTime(time: Time.ITimeValue, min?: Time.ITimeValue, max?: Time.ITimeValue): Time.ITimeValue {
  // When min > max, the constraints are contradictory - return time unchanged
  if (min && max && toSeconds(min) > toSeconds(max)) return { ...time }

  const hasSeconds = time.second !== undefined
  let result = { ...time }

  // Normalize bounds to same precision as input for accurate comparison
  const normalizeForCompare = (t: Time.ITimeValue): Time.ITimeValue =>
    hasSeconds ? t : { hour: t.hour, minute: t.minute }

  if (min && toSeconds(normalizeForCompare(result)) < toSeconds(normalizeForCompare(min))) {
    result = { ...min }
  }
  if (max && toSeconds(normalizeForCompare(result)) > toSeconds(normalizeForCompare(max))) {
    result = { ...max }
  }
  // The result has a second field exactly when the original had one
  const { second, ...rest } = result
  return hasSeconds ? { ...rest, second: second ?? 0 } : rest
}

/**
 * `value` moved `delta` steps of `step`, an off-step value first landing on the step in that direction. It wraps on
 * the steps that fit in the field, so a step that does not divide it, as 7 minutes does not, stays on its grid.
 */
function stepWithin(value: number, delta: number, step: number, size: number): number {
  const base = delta > 0 ? Math.floor(value / step) : Math.ceil(value / step)
  const count = Math.floor((size - 1) / step) + 1
  return ((((base + delta) % count) + count) % count) * step
}

/** Increment or decrement a specific field, wrapping at boundaries. */
export function incrementField(
  time: Time.ITimeValue,
  field: Time.TimeField,
  delta: number,
  config: Pick<Time.ITimePickerConfig, 'hourCycle' | 'minuteStep' | 'secondStep' | 'minTime' | 'maxTime'> = {},
): Time.ITimeValue {
  const result = { ...time }

  switch (field) {
    case 'hour': {
      result.hour = stepWithin(result.hour, delta, 1, 24)
      break
    }
    case 'minute': {
      result.minute = stepWithin(result.minute, delta, config.minuteStep ?? 1, 60)
      break
    }
    case 'second': {
      result.second = stepWithin(result.second ?? 0, delta, config.secondStep ?? 1, 60)
      break
    }
    case 'ampm': {
      // Toggle AM/PM by adding/subtracting 12 hours
      result.hour = (result.hour + 12) % 24
      break
    }
  }

  return clampTime(result, config.minTime, config.maxTime)
}

/** Parse a digit string typed by the user into a valid field value. Returns null if invalid. */
export function parseTimeInput(input: string, field: Time.TimeField, hourCycle: Time.HourCycle): number | null {
  if (!/^[0-9]+$/.test(input)) return null
  const num = Number(input)

  switch (field) {
    case 'hour': {
      const max = hourCycle === '12' ? 12 : 23
      const min = hourCycle === '12' ? 1 : 0
      if (num < min || num > max) return null
      return hourCycle === '12' ? (num === 12 ? 0 : num) : num
    }
    case 'minute':
      if (num < 0 || num > 59) return null
      return num
    case 'second':
      if (num < 0 || num > 59) return null
      return num
    default:
      return null
  }
}
