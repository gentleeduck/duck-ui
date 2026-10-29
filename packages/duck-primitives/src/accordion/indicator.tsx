import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useAccordionContext } from './accordion'
import type { IAccordion } from './accordion.types'
import { useAccordionItemContext } from './item'

const INDICATOR_NAME = 'AccordionIndicator'

const AccordionIndicator = React.forwardRef<HTMLSpanElement, IAccordion.IIndicatorProps>(
  (props: IAccordion.IScoped<IAccordion.IIndicatorProps>, forwardedRef) => {
    const { __scopeAccordion, ...indicatorProps } = props
    const context = useAccordionContext(INDICATOR_NAME, __scopeAccordion)
    const itemContext = useAccordionItemContext(INDICATOR_NAME, __scopeAccordion)

    return (
      <Primitive.span
        aria-hidden
        data-slot="accordion-indicator"
        data-state={itemContext.open ? 'open' : 'closed'}
        data-disabled={itemContext.disabled ? '' : undefined}
        data-orientation={context.orientation}
        {...indicatorProps}
        ref={forwardedRef}
      />
    )
  },
)

AccordionIndicator.displayName = INDICATOR_NAME

export { AccordionIndicator }
