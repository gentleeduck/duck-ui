import * as React from 'react'
import * as PopperPrimitive from '../popper'
import { usePopperScope } from './tooltip.libs'
import type { ITooltip } from './tooltip.types'

const ARROW_NAME = 'TooltipArrow'

type TooltipArrowElement = React.ComponentRef<typeof PopperPrimitive.PopperArrow>

export const TooltipArrow = React.forwardRef<TooltipArrowElement, ITooltip.IArrowProps>(
  (props: ITooltip.IScoped<ITooltip.IArrowProps>, forwardedRef) => {
    const { __scopeTooltip, ...arrowProps } = props
    const popperScope = usePopperScope(__scopeTooltip)
    return <PopperPrimitive.PopperArrow data-slot="tooltip-arrow" {...popperScope} {...arrowProps} ref={forwardedRef} />
  },
)

TooltipArrow.displayName = ARROW_NAME
