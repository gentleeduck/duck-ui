import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useProgressContext } from './progress'
import { getProgressState } from './progress.libs'
import type { IProgress } from './progress.types'

const INDICATOR_NAME = 'ProgressIndicator'

type ProgressIndicatorElement = React.ComponentRef<typeof Primitive.div>

const ProgressIndicator = React.forwardRef<ProgressIndicatorElement, IProgress.IIndicatorProps>(
  (props: IProgress.IScoped<IProgress.IIndicatorProps>, forwardedRef) => {
    const { __scopeProgress, ...indicatorProps } = props
    const context = useProgressContext(INDICATOR_NAME, __scopeProgress)
    return (
      <Primitive.div
        data-slot="progress-indicator"
        data-state={getProgressState(context.value, context.max)}
        data-value={context.value}
        data-max={context.max}
        {...indicatorProps}
        ref={forwardedRef}
      />
    )
  },
)

ProgressIndicator.displayName = INDICATOR_NAME

export { ProgressIndicator }
