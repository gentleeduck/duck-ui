import { clamp } from '../libs/clamp'

function getNextSortedValues(prevValues: number[] = [], nextValue: number, atIndex: number) {
  const nextValues = [...prevValues]
  nextValues[atIndex] = nextValue
  return nextValues.sort((a, b) => a - b)
}

function convertValueToPercentage(value: number, min: number, max: number) {
  const maxSteps = max - min
  const percentPerStep = 100 / maxSteps
  const percentage = percentPerStep * (value - min)
  return clamp(percentage, [0, 100])
}

function getLabel(index: number, totalValues: number) {
  if (totalValues > 2) {
    return `Value ${index + 1} of ${totalValues}`
  } else if (totalValues === 2) {
    return ['Minimum', 'Maximum'][index]
  } else {
    return undefined
  }
}

function getClosestValueIndex(values: number[], nextValue: number) {
  if (values.length === 1) return 0
  const distances = values.map((value) => Math.abs(value - nextValue))
  const closestDistance = Math.min(...distances)
  return distances.indexOf(closestDistance)
}

function getThumbInBoundsOffset(width: number, left: number, direction: number) {
  const halfWidth = width / 2
  const halfPercent = 50
  const offset = linearScale([0, halfPercent], [0, halfWidth])
  return (halfWidth - offset(left) * direction) * direction
}

function getStepsBetweenValues(values: number[]) {
  // biome-ignore lint/style/noNonNullAssertion: slice(0,-1) guarantees index+1 is always valid
  return values.slice(0, -1).map((value, index) => values[index + 1]! - value)
}

function hasMinStepsBetweenValues(values: number[], minStepsBetweenValues: number) {
  if (minStepsBetweenValues > 0) {
    const stepsBetweenValues = getStepsBetweenValues(values)
    const actualMinStepsBetweenValues = Math.min(...stepsBetweenValues)
    return actualMinStepsBetweenValues >= minStepsBetweenValues
  }
  return true
}

// https://github.com/tmcw-up-for-adoption/simple-linear-scale/blob/master/index.js
function linearScale(input: readonly [number, number], output: readonly [number, number]) {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0]
    const ratio = (output[1] - output[0]) / (input[1] - input[0])
    return output[0] + ratio * (value - input[0])
  }
}

function getDecimalCount(value: number) {
  // Below 1e-6 a number prints as `1e-7`, so the exponent counts as decimals too.
  const [coefficient, exponent = 0] = String(value).split('e')
  return Math.max(0, (coefficient.split('.')[1] || '').length - Number(exponent))
}

function roundValue(value: number, decimalCount: number) {
  const rounder = 10 ** decimalCount
  return Math.round(value * rounder) / rounder
}

function getNextStepValue(
  value: number,
  { min, step, direction, multiplier }: { min: number; step: number; direction: number; multiplier: number },
) {
  const decimalCount = getDecimalCount(step)
  const steps = (value - min) / step
  const nearest = Math.round(steps)
  const isAligned = roundValue(nearest * step + min, decimalCount) === roundValue(value, decimalCount)
  // Off the grid, the first step lands on the next grid line instead of a full step away.
  const from = isAligned ? nearest : direction > 0 ? Math.ceil(steps) - 1 : Math.floor(steps) + 1
  return roundValue((from + multiplier * direction) * step + min, decimalCount)
}

export {
  convertValueToPercentage,
  getClosestValueIndex,
  getDecimalCount,
  getLabel,
  getNextSortedValues,
  getNextStepValue,
  getThumbInBoundsOffset,
  hasMinStepsBetweenValues,
  linearScale,
  roundValue,
}
