import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { Primitive } from '../primitive-elements'
import { useProgressContext } from './progress'
import { getProgressState } from './progress.libs'
import type { IProgress } from './progress.types'

const LABEL_NAME = 'ProgressLabel'

type ProgressLabelElement = React.ComponentRef<typeof Primitive.span>

const ProgressLabel = React.forwardRef<ProgressLabelElement, IProgress.ILabelProps>(
  (props: IProgress.IScoped<IProgress.ILabelProps>, forwardedRef) => {
    const { __scopeProgress, id: idProp, ...labelProps } = props
    const context = useProgressContext(LABEL_NAME, __scopeProgress)
    const generatedId = React.useId()
    const id = idProp ?? generatedId
    const { onLabelIdChange } = context

    useLayoutEffect(() => {
      onLabelIdChange(id)
      return () => onLabelIdChange(undefined)
    }, [id, onLabelIdChange])

    return (
      <Primitive.span
        data-slot="progress-label"
        data-state={getProgressState(context.value, context.max)}
        id={id}
        {...labelProps}
        ref={forwardedRef}
      />
    )
  },
)

ProgressLabel.displayName = LABEL_NAME

export { ProgressLabel }
