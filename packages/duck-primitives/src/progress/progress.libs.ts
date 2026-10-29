const DEFAULT_MAX = 100

type ProgressState = 'indeterminate' | 'complete' | 'loading'

function defaultGetValueLabel(value: number, max: number, min = 0) {
  return `${Math.round(((value - min) / (max - min)) * 100)}%`
}

function getProgressState(value: number | undefined | null, maxValue: number): ProgressState {
  return value == null ? 'indeterminate' : value === maxValue ? 'complete' : 'loading'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

function isValidMaxNumber(max: unknown, min = 0): max is number {
  return isNumber(max) && !Number.isNaN(max) && max > min
}

function isValidValueNumber(value: unknown, max: number, min = 0): value is number {
  return isNumber(value) && !Number.isNaN(value) && value <= max && value >= min
}

function getInvalidMaxError(propValue: string, componentName: string) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than \`min\` are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`
}

function getInvalidValueError(propValue: string, componentName: string) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - at least the value passed to \`min\` (or 0 if no \`min\` prop is set)
  - at most the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`
}

export type { ProgressState }
export {
  DEFAULT_MAX,
  defaultGetValueLabel,
  getInvalidMaxError,
  getInvalidValueError,
  getProgressState,
  isNumber,
  isValidMaxNumber,
  isValidValueNumber,
}
