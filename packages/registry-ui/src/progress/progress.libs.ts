/** The share of the bar to fill, or null while indeterminate, reading `value` and `max` as the primitive does. */
function getProgressPercent(value: number | null | undefined, max: number | undefined, min = 0) {
  const top = max !== undefined && max > min ? max : 100
  return value != null && value >= min && value <= top ? ((value - min) / (top - min)) * 100 : null
}

export { getProgressPercent }
