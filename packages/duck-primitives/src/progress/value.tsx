import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useProgressContext } from './progress'
import { getProgressState } from './progress.libs'
import type { IProgress } from './progress.types'

const VALUE_NAME = 'ProgressValue'

type ProgressValueElement = React.ComponentRef<typeof Primitive.span>

const ProgressValue = React.forwardRef<ProgressValueElement, IProgress.IValueProps>(
  (props: IProgress.IScoped<IProgress.IValueProps>, forwardedRef) => {
    const { __scopeProgress, children, ...valueProps } = props
    const context = useProgressContext(VALUE_NAME, __scopeProgress)
    return (
      <Primitive.span
        data-slot="progress-value"
        aria-hidden
        data-state={getProgressState(context.value, context.max)}
        {...valueProps}
        ref={forwardedRef}>
        {typeof children === 'function'
          ? children(context.valueLabel, context.value)
          : (children ?? context.valueLabel)}
      </Primitive.span>
    )
  },
)

ProgressValue.displayName = VALUE_NAME

export { ProgressValue }
