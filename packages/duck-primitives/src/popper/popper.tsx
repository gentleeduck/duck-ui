import * as React from 'react'
import { createContextScope } from '../libs/create-context'
import type { IPopper } from './popper.types'

export const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left'] as const
export const ALIGN_OPTIONS = ['start', 'center', 'end'] as const

const POPPER_NAME = 'Popper'
export const [createPopperContext, createPopperScope] = createContextScope(POPPER_NAME)

const [PopperProvider, usePopperContext] = createPopperContext<IPopper.IContext>(POPPER_NAME)

export { usePopperContext }

export function Popper(props: IPopper.IScoped<IPopper.IProps>) {
  const { __scopePopper, anchor: anchorProp, children } = props
  const [anchor, setAnchor] = React.useState<IPopper.IContext['anchor']>(null)

  return (
    <PopperProvider
      scope={__scopePopper}
      anchor={anchorProp === undefined ? anchor : anchorProp}
      onAnchorChange={setAnchor}>
      {children}
    </PopperProvider>
  )
}

Popper.displayName = POPPER_NAME
