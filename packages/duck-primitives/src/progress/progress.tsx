import * as React from 'react'
import { createContextScope } from '../libs/create-context'
import { Primitive } from '../primitive-elements'
import {
  defaultGetValueLabel,
  getDefaultMax,
  getInvalidMaxError,
  getInvalidValueError,
  getProgressState,
  isNumber,
  isValidMaxNumber,
  isValidValueNumber,
} from './progress.libs'
import type { IProgress } from './progress.types'

const PROGRESS_NAME = 'Progress'

const [createProgressContext, createProgressScope] = createContextScope(PROGRESS_NAME)

const [ProgressProvider, useProgressContext] = createProgressContext<IProgress.IContext>(PROGRESS_NAME)

type ProgressElement = React.ComponentRef<typeof Primitive.div>

const Progress = React.forwardRef<ProgressElement, IProgress.IProps>(
  (props: IProgress.IScoped<IProgress.IProps>, forwardedRef) => {
    const {
      __scopeProgress,
      value: valueProp = null,
      min = 0,
      max: maxProp,
      getValueLabel = defaultGetValueLabel,
      ...progressProps
    } = props

    if (process.env.NODE_ENV !== 'production' && (maxProp || maxProp === 0) && !isValidMaxNumber(maxProp, min)) {
      console.error(getInvalidMaxError(`${maxProp}`, 'Progress', getDefaultMax(min)))
    }

    const max = isValidMaxNumber(maxProp, min) ? maxProp : getDefaultMax(min)

    if (process.env.NODE_ENV !== 'production' && valueProp !== null && !isValidValueNumber(valueProp, max, min)) {
      console.error(getInvalidValueError(`${valueProp}`, 'Progress'))
    }

    const value = isValidValueNumber(valueProp, max, min) ? valueProp : null
    const valueLabel = isNumber(value) ? getValueLabel(value, max, min) : undefined
    const [labelId, setLabelId] = React.useState<string>()

    return (
      <ProgressProvider
        scope={__scopeProgress}
        value={value}
        max={max}
        valueLabel={valueLabel}
        onLabelIdChange={setLabelId}>
        <Primitive.div
          data-slot="progress"
          aria-labelledby={labelId}
          aria-valuemax={max}
          aria-valuemin={min}
          aria-valuenow={isNumber(value) ? value : undefined}
          aria-valuetext={valueLabel}
          role="progressbar"
          data-state={getProgressState(value, max)}
          data-value={value}
          data-max={max}
          {...progressProps}
          ref={forwardedRef}
        />
      </ProgressProvider>
    )
  },
)

Progress.displayName = PROGRESS_NAME

export { createProgressScope, getProgressState, PROGRESS_NAME, Progress, ProgressProvider, useProgressContext }
