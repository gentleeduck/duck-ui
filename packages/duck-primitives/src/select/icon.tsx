import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useSelectContext } from './select'
import type { ISelect } from './select.types'

const ICON_NAME = 'SelectIcon'

export const SelectIcon = React.forwardRef<HTMLSpanElement, ISelect.IIconProps>(
  (props: ISelect.IScoped<ISelect.IIconProps>, forwardedRef) => {
    const { __scopeSelect, children, ...iconProps } = props
    const context = useSelectContext(ICON_NAME, __scopeSelect)
    return (
      <Primitive.span data-slot="select-icon" aria-hidden dir={context.dir} {...iconProps} ref={forwardedRef}>
        {children || '\u25BC'}
      </Primitive.span>
    )
  },
)

SelectIcon.displayName = ICON_NAME
