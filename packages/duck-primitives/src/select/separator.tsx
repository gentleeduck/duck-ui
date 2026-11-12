import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useSelectContext } from './select'
import type { ISelect } from './select.types'

const SEPARATOR_NAME = 'SelectSeparator'

export const SelectSeparator = React.forwardRef<HTMLDivElement, ISelect.ISeparatorProps>(
  (props: ISelect.IScoped<ISelect.ISeparatorProps>, forwardedRef) => {
    const { __scopeSelect, ...separatorProps } = props
    const context = useSelectContext(SEPARATOR_NAME, __scopeSelect)
    return (
      <Primitive.div
        data-slot="select-separator"
        aria-hidden
        dir={context.dir}
        {...separatorProps}
        ref={forwardedRef}
      />
    )
  },
)

SelectSeparator.displayName = SEPARATOR_NAME
