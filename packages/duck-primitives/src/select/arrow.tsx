import * as React from 'react'
import * as PopperPrimitive from '../popper'
import { usePopperScope, useSelectContentContext, useSelectOpenContext } from './select'
import type { ISelect } from './select.types'

const ARROW_NAME = 'SelectArrow'

export const SelectArrow = React.forwardRef<SVGSVGElement, ISelect.IArrowProps>(
  (props: ISelect.IScoped<ISelect.IArrowProps>, forwardedRef) => {
    const { __scopeSelect, ...arrowProps } = props
    const popperScope = usePopperScope(__scopeSelect)
    const { open } = useSelectOpenContext(ARROW_NAME, __scopeSelect)
    const contentContext = useSelectContentContext(ARROW_NAME, __scopeSelect)
    return open && contentContext.position === 'popper' ? (
      <PopperPrimitive.Arrow data-slot="select-arrow" {...popperScope} {...arrowProps} ref={forwardedRef} />
    ) : null
  },
)

SelectArrow.displayName = ARROW_NAME
