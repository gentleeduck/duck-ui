import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useSelectContext, useSelectItemContext } from './select'
import type { ISelect } from './select.types'

const ITEM_INDICATOR_NAME = 'SelectItemIndicator'

export const SelectItemIndicator = React.forwardRef<HTMLSpanElement, ISelect.IScoped<ISelect.IItemIndicatorProps>>(
  (props, forwardedRef) => {
    const { __scopeSelect, ...itemIndicatorProps } = props
    const context = useSelectContext(ITEM_INDICATOR_NAME, __scopeSelect)
    const itemContext = useSelectItemContext(ITEM_INDICATOR_NAME, __scopeSelect)
    return itemContext.isSelected ? (
      <Primitive.span
        data-slot="select-item-indicator"
        aria-hidden
        dir={context.dir}
        {...itemIndicatorProps}
        ref={forwardedRef}
      />
    ) : null
  },
)

SelectItemIndicator.displayName = ITEM_INDICATOR_NAME
