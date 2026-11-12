import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useSelectContext, useSelectGroupContext } from './select'
import type { ISelect } from './select.types'

const LABEL_NAME = 'SelectLabel'

export const SelectLabel = React.forwardRef<HTMLDivElement, ISelect.ILabelProps>(
  (props: ISelect.IScoped<ISelect.ILabelProps>, forwardedRef) => {
    const { __scopeSelect, ...labelProps } = props
    const context = useSelectContext(LABEL_NAME, __scopeSelect)
    const groupContext = useSelectGroupContext(LABEL_NAME, __scopeSelect)
    return (
      <Primitive.div
        data-slot="select-label"
        id={groupContext.id}
        dir={context.dir}
        {...labelProps}
        ref={forwardedRef}
      />
    )
  },
)

SelectLabel.displayName = LABEL_NAME
